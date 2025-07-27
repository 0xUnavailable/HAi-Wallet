import spacy
from spacy.language import Language
from spacy.matcher import Matcher
from spacy.tokens import Doc
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import json
import re
import logging
from datetime import datetime

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI()

# Run startup checks
if __name__ == "__main__":
    import startup
    startup.main()

# Load spaCy model (default or trained model if available)
import os

# Get the current directory and construct the model path
current_dir = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.join(current_dir, "model", "model-best")

try:
    nlp = spacy.load(model_path)
    logger.info(f"Loaded custom spaCy model from {model_path}")
except Exception as e:
    logger.warning(f"Failed to load custom model from {model_path}, using fallback model en_core_web_sm. Error: {str(e)}")
    try:
        nlp = spacy.load("en_core_web_sm")
        logger.info("Successfully loaded fallback model en_core_web_sm")
    except Exception as fallback_error:
        logger.error(f"Failed to load fallback model: {str(fallback_error)}")
        # Create a blank model as last resort
        nlp = spacy.blank("en")
        logger.info("Created blank spaCy model as last resort")

# Register custom attributes on Doc
Doc.set_extension("intent", default=None, force=True)
Doc.set_extension("parameters", default=None, force=True)

# Add custom intent_parameters component to spaCy pipeline
@Language.component("intent_parameters")
def extract_intent_parameters(doc):
    matcher = Matcher(nlp.vocab)
    
    # Patterns for parameters - Updated to handle decimals and new networks/tokens
    amount_pattern = [
        {"TEXT": {"REGEX": r"^\d+(\.\d+)?$"}},  # Matches whole numbers and decimals
        {"TEXT": {"IN": ["ETH", "USDC"]}}
    ]
    token_pattern = [{"TEXT": {"IN": ["ETH", "USDC"]}}]
    
    # Modified recipient pattern - exclude token names and network names to avoid conflicts
    recipient_pattern = [
        {"LOWER": {"IN": ["to", "for"]}},
        {"IS_ALPHA": True, "TEXT": {"NOT_IN": ["ETH", "USDC", "Ethereum", "Base", "Optimism", "on", "from"]}}
    ]
    
    address_pattern = [
        {"LOWER": {"IN": ["to", "for"]}},
        {"TEXT": {"REGEX": "^0x[a-fA-F0-9]{40}$"}}
    ]
    source_network_pattern = [
        {"LOWER": {"IN": ["from", "on"]}},
        {"TEXT": {"IN": ["Ethereum", "Base", "Optimism"]}},
        {"LOWER": {"IN": ["mainnet", "testnet"]}, "OP": "?"}
    ]
    dest_network_pattern = [
        {"LOWER": {"IN": ["on", "to"]}},
        {"TEXT": {"IN": ["Ethereum", "Base", "Optimism"]}},
        {"LOWER": {"IN": ["mainnet", "testnet"]}, "OP": "?"}
    ]
    token2_pattern = [
        {"LOWER": "for"},
        {"TEXT": {"IN": ["ETH", "USDC"]}}
    ]
    query_type_pattern = [
        {"LOWER": {"IN": ["balance", "amount"]}}
    ]
    bridge_keyword_pattern = [
        {"LOWER": {"IN": ["via", "through"]}, "OP": "?"},
        {"LOWER": "bridge"}
    ]
    intent_transfer_pattern = [{"LOWER": {"IN": ["send", "transfer", "move"]}}]
    intent_swap_pattern = [{"LOWER": "swap"}]
    intent_bridge_pattern = [{"LOWER": {"IN": ["bridge", "execute"]}, "OP": "?"}, {"LOWER": "bridge"}]
    intent_query_pattern = [{"LOWER": {"IN": ["check", "get", "query", "show"]}}]
    
    matcher.add("AMOUNT", [amount_pattern])
    matcher.add("TOKEN", [token_pattern])
    matcher.add("RECIPIENT", [recipient_pattern])
    matcher.add("ADDRESS", [address_pattern])
    matcher.add("SOURCE_NETWORK", [source_network_pattern])
    matcher.add("DEST_NETWORK", [dest_network_pattern])
    matcher.add("TOKEN2", [token2_pattern])
    matcher.add("QUERY_TYPE", [query_type_pattern])
    matcher.add("BRIDGE_KEYWORD", [bridge_keyword_pattern])
    matcher.add("INTENT_TRANSFER", [intent_transfer_pattern])
    matcher.add("INTENT_SWAP", [intent_swap_pattern])
    matcher.add("INTENT_BRIDGE", [intent_bridge_pattern])
    matcher.add("INTENT_QUERY", [intent_query_pattern])
    
    # Split into sentences and find clause boundaries
    sentences = list(doc.sents)
    
    # Find all intent keywords and their positions to identify clause boundaries
    intent_positions = []
    for sent in sentences:
        matches = matcher(sent)
        for match_id, start, end in matches:
            match_label = nlp.vocab.strings[match_id]
            if match_label.startswith("INTENT_"):
                # Convert sentence-relative positions to document-relative positions
                doc_start = sent.start + start
                doc_end = sent.start + end
                intent_positions.append({
                    'label': match_label,
                    'start': doc_start,
                    'end': doc_end,
                    'sent_idx': sentences.index(sent)
                })
    
    # If no intents found, return empty result
    if not intent_positions:
        doc._.intent = None
        doc._.parameters = {
            "from": "User",
            "to": None,
            "source_network": None,
            "dest_network": None,
            "tokens": [],
            "token2": None,
            "query_type": None
        }
        return doc
    
    # Process each intent and its associated parameters
    multi_intents = []
    
    for i, intent_pos in enumerate(intent_positions):
        intent_label = intent_pos['label']
        intent_start = intent_pos['start']
        
        # Determine the scope for this intent (from this intent to the next one or end of document)
        if i < len(intent_positions) - 1:
            scope_end = intent_positions[i + 1]['start']
        else:
            scope_end = len(doc)
        
        # Create a span for this intent's scope
        intent_scope = doc[intent_start:scope_end]
        
        # Extract parameters within this scope
        scope_matches = matcher(intent_scope)
        
        intent = None
        parameters = {
            "from": "User",
            "to": None,
            "source_network": None,
            "dest_network": None,
            "tokens": [],
            "token2": None,
            "query_type": None
        }
        
        # Map intent labels to intent names
        if intent_label == "INTENT_TRANSFER":
            intent = "Transfer"
        elif intent_label == "INTENT_SWAP":
            intent = "Swap"
        elif intent_label == "INTENT_BRIDGE":
            intent = "Bridge"
        elif intent_label == "INTENT_QUERY":
            intent = "Query"
        
        # Track processed tokens to avoid duplicates
        processed_tokens = set()
        
        # Process matches within this intent's scope
        for match_id, start, end in scope_matches:
            span = intent_scope[start:end]
            match_label = nlp.vocab.strings[match_id]
            
            if match_label == "AMOUNT":
                amount = span[0].text
                if end < len(intent_scope) and intent_scope[end-1].text in ["ETH", "USDC"]:
                    token = intent_scope[end-1].text
                    if (amount, token) not in processed_tokens:
                        parameters["tokens"].append({"amount": amount, "token": token})
                        processed_tokens.add((amount, token))
            elif match_label == "TOKEN" and span.text not in [t["token"] for t in parameters["tokens"]]:
                # Only add TOKEN if not already captured by AMOUNT
                parameters["tokens"].append({"amount": None, "token": span.text})
            elif match_label == "RECIPIENT":
                # Only process RECIPIENT for Transfer and Query intents
                if intent in ["Transfer", "Query"]:
                    recipient_text = span.text
                    # Clean up the recipient text
                    if recipient_text.lower().startswith("to "):
                        recipient_text = recipient_text[3:]
                    elif recipient_text.lower().startswith("for "):
                        recipient_text = recipient_text[4:]
                    
                    # For recipient, we need to be more careful about network specifications
                    # Check if the recipient contains network information
                    network_keywords = ["Ethereum", "Base", "Optimism"]
                    recipient_parts = recipient_text.split()
                    
                    if len(recipient_parts) > 1:
                        # Check if last part is a network
                        if recipient_parts[-1] in network_keywords:
                            # The recipient includes network info - this might be a parsing issue
                            # For now, take everything as recipient but we should flag this
                            parameters["to"] = recipient_text
                        else:
                            parameters["to"] = recipient_text
                    else:
                        parameters["to"] = recipient_text
                    
            elif match_label == "ADDRESS":
                # Only process ADDRESS for Transfer and Query intents
                if intent in ["Transfer", "Query"]:
                    address_text = span.text
                    if address_text.lower().startswith("to "):
                        address_text = address_text[3:]
                    elif address_text.lower().startswith("for "):
                        address_text = address_text[4:]
                    parameters["to"] = address_text
            elif match_label == "SOURCE_NETWORK":
                parameters["source_network"] = span[1].text
            elif match_label == "DEST_NETWORK":
                parameters["dest_network"] = span[1].text
            elif match_label == "TOKEN2":
                parameters["token2"] = span[1].text
            elif match_label == "QUERY_TYPE":
                parameters["query_type"] = span.text
        
        # Apply intent-specific logic for 'to' field and network handling
        if intent == "Swap":
            # For swaps, 'to' is always "User" (the user receives the swapped tokens)
            parameters["to"] = "User"
            
            # For swaps, source and dest networks should be the same
            if parameters["source_network"] and not parameters["dest_network"]:
                parameters["dest_network"] = parameters["source_network"]
            elif parameters["dest_network"] and not parameters["source_network"]:
                parameters["source_network"] = parameters["dest_network"]
                
        elif intent == "Bridge":
            # For bridges, 'to' is always "User" (the user receives the bridged tokens)
            parameters["to"] = "User"
            
            # For bridges, we need both source and dest networks to be different
            # If only one network is specified, we need to infer the context
            # This might require additional context from the original prompt
            
        elif intent in ["Transfer", "Query"]:
            # For these intents, source and dest should be the same if only one is specified
            if parameters["source_network"] and not parameters["dest_network"]:
                parameters["dest_network"] = parameters["source_network"]
            elif parameters["dest_network"] and not parameters["source_network"]:
                parameters["source_network"] = parameters["dest_network"]
        
        # Only add intent if it has some meaningful parameters (tokens or recipient for Transfer/Query, tokens for Swap/Bridge)
        should_add_intent = False
        if intent in ["Transfer", "Query"]:
            should_add_intent = parameters["tokens"] or parameters["to"] or parameters["query_type"]
        elif intent in ["Swap", "Bridge"]:
            should_add_intent = len(parameters["tokens"]) > 0
            
        if should_add_intent:
            multi_intents.append({"intent": intent, "parameters": parameters})
    
    # Set doc attributes based on number of intents found
    if len(multi_intents) > 1:
        doc._.intent = "Multi"
        doc._.parameters = {"intent_count": len(multi_intents), "intents": multi_intents}
    elif len(multi_intents) == 1:
        doc._.intent = multi_intents[0]["intent"]
        doc._.parameters = multi_intents[0]["parameters"]
    else:
        doc._.intent = None
        doc._.parameters = {
            "from": "User",
            "to": None,
            "source_network": None,
            "dest_network": None,
            "tokens": [],
            "token2": None,
            "query_type": None
        }
    
    return doc

# Add custom component and sentencizer to spaCy pipeline
nlp.add_pipe("intent_parameters", last=True)
logger.info("Added intent_parameters to spaCy pipeline")
if "sentencizer" not in nlp.pipe_names:
    nlp.add_pipe("sentencizer", before="intent_parameters")
    logger.info("Added sentencizer to spaCy pipeline")

# Define input models for FastAPI
class PromptRequest(BaseModel):
    prompt: str

class AnnotatedPrompt(BaseModel):
    prompt: str
    entities: list[dict[str, int | str]]  # e.g., [{"start": 5, "end": 8, "label": "AMOUNT"}]
    intent: str | None

# API endpoint to process prompts
@app.post("/process_prompt")
async def process_prompt(request: PromptRequest):
    try:
        logger.info("Processing prompt: %s", request.prompt)
        doc = nlp(request.prompt)
        result = {
            "status": "success",
            "result": {
                "intent_count": len(doc._.parameters.get("intents", [])) if doc._.intent == "Multi" else 1,
                "intent": doc._.intent,
                "parameters": doc._.parameters
            }
        }
        logger.info("Processed prompt result: %s", json.dumps(result, indent=2))
        return result
    except Exception as e:
        logger.error("Error processing prompt: %s", str(e))
        raise HTTPException(status_code=500, detail=str(e))

# Endpoint to log raw prompts for training data
@app.post("/log_prompt")
async def log_prompt(request: PromptRequest):
    try:
        new_data = {"prompt": request.prompt, "entities": [], "intent": None}
        try:
            with open("/home/oxunavailable/HAi Wallet/NLP/train_data.json", "r") as f:
                data = json.load(f)
        except FileNotFoundError:
            data = []
        data.append(new_data)
        with open("/home/oxunavailable/HAi Wallet/NLP/train_data.json", "w") as f:
            json.dump(data, f, indent=2)
        return {"status": "logged"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Endpoint to add annotated training data
@app.post("/add_annotated_prompt")
async def add_annotated_prompt(request: AnnotatedPrompt):
    try:
        new_data = {
            "prompt": request.prompt,
            "entities": request.entities,
            "intent": request.intent
        }
        try:
            with open("/home/oxunavailable/HAi Wallet/NLP/train_data.json", "r") as f:
                data = json.load(f)
        except FileNotFoundError:
            data = []
        data.append(new_data)
        with open("/home/oxunavailable/HAi Wallet/NLP/train_data.json", "w") as f:
            json.dump(data, f, indent=2)
        return {"status": "annotated prompt added"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Home endpoint
@app.get("/")
async def home():
    """Home endpoint"""
    return {"message": "Hello"}

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    try:
        # Check if model can be loaded
        model_path = os.path.join(os.path.dirname(__file__), "model", "model-best")
        
        if os.path.exists(model_path):
            nlp = spacy.load(model_path)
            model_status = "custom_model"
        else:
            nlp = spacy.load("en_core_web_sm")
            model_status = "fallback_model"
        
        return {
            "status": "healthy",
            "timestamp": datetime.now().isoformat(),
            "model_status": model_status,
            "model_path": model_path if os.path.exists(model_path) else "fallback"
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "timestamp": datetime.now().isoformat(),
            "error": str(e)
        }

# Background task to call main API health endpoint every minute
@app.on_event("startup")
async def start_health_check():
    """Start background health check task"""
    import asyncio
    import aiohttp
    from datetime import datetime
    
    async def health_check_loop():
        while True:
            try:
                # Call the main API home endpoint
                main_api_url = "https://hai-wallet-server.onrender.com/"
                async with aiohttp.ClientSession() as session:
                    async with session.get(main_api_url) as response:
                        if response.status == 200:
                            data = await response.json()
                            print(f"[{datetime.now().isoformat()}] Health check: Main API home endpoint returned: {data}")
                        else:
                            print(f"[{datetime.now().isoformat()}] Health check: Main API home endpoint returned {response.status}")
            except Exception as e:
                print(f"[{datetime.now().isoformat()}] Health check: Main API home endpoint error - {str(e)}")
            
            # Wait for 1 minute
            await asyncio.sleep(60)
    
    # Start the background task
    asyncio.create_task(health_check_loop())

# Run with: uvicorn nlp_service:app --host 0.0.0.0 --port 8000