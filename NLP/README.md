# NLP Service for Wallet App

This project sets up a FastAPI-based NLP service using spaCy to process user prompts for a wallet app (e.g., "Send 100 ETH to Bob on Ethereum network") and extract intents (e.g., Transfer, Swap, CheckBalance) and parameters (e.g., token, recipient, network). It includes tools to collect, annotate, and train a custom NLP model using a JSON file, allowing you to scale to large and complex datasets without code changes.

## Prerequisites

- **Python 3.12** or later
- **pip** for installing dependencies
- A working directory: `/home/oxunavailable/HAi Wallet/NLP/`

## Setup

1. **Install Dependencies**:
   ```bash
   pip install spacy fastapi uvicorn pydantic
   python -m spacy download en_core_web_sm
   ```

2. **Directory Structure**:
   Ensure the following files are in `/home/oxunavailable/HAi Wallet/NLP/`:
   - `nlp_service.py`: FastAPI server for processing prompts and logging data.
   - `train_model.py`: Script to train the spaCy model from `train_data.json`.
   - `train_data.json`: Stores raw and annotated training data (created automatically).
   - `model/` (created after training): Stores the trained model in `model/model-best`.

3. **Save the Scripts**:
   - Copy `nlp_service.py` and `train_model.py` from the provided code into `/home/oxunavailable/HAi Wallet/NLP/`.
   - Ensure file paths in both scripts match your directory (`/home/oxunavailable/HAi Wallet/NLP/`).

## Running the NLP Service

1. **Start the FastAPI Server**:
   ```bash
   cd /home/oxunavailable/HAi Wallet/NLP
   uvicorn nlp_service:app --host 0.0.0.0 --port 8000
   ```
   The server runs at `http://localhost:8000`. It loads the trained model from `/home/oxunavailable/HAi Wallet/NLP/model/model-best` if available, or falls back to `en_core_web_sm`.

2. **Test API Endpoints**:
   Use `curl` to test the following endpoints:

   - **Process a Prompt**:
     ```bash
     curl -X POST http://localhost:8000/process_prompt -H "Content-Type: application/json" -d '{"prompt":"Send 100 ETH to Bob on Ethereum network"}'
     ```
     **Expected Response**:
     ```json
     {
       "status": "success",
       "result": {
         "intent": "Transfer",
         "parameters": {
           "token": "100 ETH",
           "recipient": "Bob",
           "network": "Ethereum",
           "platform": null,
           "token2": null
         }
       }
     }
     ```

   - **Log a Prompt for Training**:
     ```bash
     curl -X POST http://localhost:8000/log_prompt -H "Content-Type: application/json" -d '{"prompt":"Send 100 ETH to Bob on Ethereum network"}'
     ```
     **Expected Response**:
     ```json
     {"status": "logged"}
     ```
     This adds the prompt to `/home/oxunavailable/HAi Wallet/NLP/train_data.json`.

   - **Add an Annotated Prompt**:
     ```bash
     curl -X POST http://localhost:8000/add_annotated_prompt -H "Content-Type: application/json" -d '{"prompt":"Send 100 ETH to Bob on Ethereum network","entities":[{"start":5,"end":11,"label":"TOKEN"},{"start":15,"end":18,"label":"RECIPIENT"},{"start":22,"end":37,"label":"NETWORK"}],"intent":"Transfer"}'
     ```
     **Expected Response**:
     ```json
     {"status": "annotated prompt added"}
     ```

   - **Test Complex Prompts**:
     ```bash
     curl -X POST http://localhost:8000/process_prompt -H "Content-Type: application/json" -d '{"prompt":"Swap 100 USDC for ETH on Uniswap via Ethereum network"}'
     curl -X POST http://localhost:8000/process_prompt -H "Content-Type: application/json" -d '{"prompt":"Check balance of DAI for Alice on Polygon"}'
     ```

## Collecting Training Data

1. **Log Raw Prompts**:
   - Use the `/log_prompt` endpoint to collect user prompts in `train_data.json`.
   - Example entry in `train_data.json`:
     ```json
     [
       {
         "prompt": "Send 100 ETH to Bob on Ethereum network",
         "entities": [],
         "intent": null
       }
     ]
     ```

2. **Annotate Prompts**:
   - **Manual Annotation**:
     Edit `train_data.json` to add entities and intent. Example:
     ```json
     [
       {
         "prompt": "Send 100 ETH to Bob on Ethereum network",
         "entities": [
           {"start": 5, "end": 11, "label": "TOKEN"},
           {"start": 15, "end": 18, "label": "RECIPIENT"},
           {"start": 22, "end": 37, "label": "NETWORK"}
         ],
         "intent": "Transfer"
       },
       {
         "prompt": "Swap 100 USDC for ETH on Uniswap via Ethereum network",
         "entities": [
           {"start": 5, "end": 13, "label": "TOKEN"},
           {"start": 18, "end": 21, "label": "TOKEN2"},
           {"start": 25, "end": 32, "label": "PLATFORM"},
           {"start": 37, "end": 52, "label": "NETWORK"}
         ],
         "intent": "Swap"
       },
       {
         "prompt": "Check balance of DAI for Alice on Polygon",
         "entities": [
           {"start": 17, "end": 20, "label": "TOKEN"},
           {"start": 25, "end": 30, "label": "RECIPIENT"},
           {"start": 34, "end": 40, "label": "NETWORK"}
         ],
         "intent": "CheckBalance"
       }
     ]
     ```

   - **API Annotation**:
     Use the `/add_annotated_prompt` endpoint to add annotated data directly:
     ```bash
     curl -X POST http://localhost:8000/add_annotated_prompt -H "Content-Type: application/json" -d '{"prompt":"Swap 100 USDC for ETH on Uniswap via Ethereum network","entities":[{"start":5,"end":13,"label":"TOKEN"},{"start":18,"end":21,"label":"TOKEN2"},{"start":25,"end":32,"label":"PLATFORM"},{"start":37,"end":52,"label":"NETWORK"}],"intent":"Swap"}'
     ```

   - **Tool-Assisted Annotation** (Optional):
     Use Prodigy for faster annotation:
     ```bash
     pip install prodigy
     prodigy ner.manual wallet_ner en_core_web_sm /home/oxunavailable/HAi Wallet/NLP/train_data.json --label TOKEN,TOKEN2,RECIPIENT,NETWORK,PLATFORM
     ```

## Training the Model

1. **Prepare Training Data**:
   - Ensure `train_data.json` contains at least 10-20 annotated prompts (100+ for better accuracy).
   - Include diverse prompts (e.g., "Send 0.5 BTC to Charlie via Solana", "Check balance of ETH for Bob on Binance").

2. **Run Training**:
   ```bash
   python train_model.py
   ```
   - This converts `train_data.json` to spaCy’s format (`train.spacy`, `dev.spacy`).
   - Trains the model and saves it to `/home/oxunavailable/HAi Wallet/NLP/model/model-best`.
   - Copies the model to `/home/oxunavailable/HAi Wallet/NLP/model-best` for use by `nlp_service.py`.

3. **Restart the Server**:
   ```bash
   uvicorn nlp_service:app --host 0.0.0.0 --port 8000
   ```

4. **No Code Changes Needed**:
   - Add new annotated prompts to `train_data.json` and rerun `python train_model.py`.
   - The script handles large datasets (thousands of prompts) without modification.

## Model Storage

- **Location**: The trained model is stored in `/home/oxunavailable/HAi Wallet/NLP/model/model-best`.
- **Details**: It’s a directory containing spaCy model files (e.g., `config.json`, `model`, `tokenizer`).
- **Ownership**: The model is yours, trained on your `train_data.json` and stored locally.
- **Backup**:
  ```bash
  zip -r model-best.zip /home/oxunavailable/HAi Wallet/NLP/model/model-best
  ```

## Testing the Trained Model

After training, test the model with the same prompts:
```bash
curl -X POST http://localhost:8000/process_prompt -H "Content-Type: application/json" -d '{"prompt":"Send 100 ETH to Bob on Ethereum network"}'
curl -X POST http://localhost:8000/process_prompt -H "Content-Type: application/json" -d '{"prompt":"Swap 100 USDC for ETH on Uniswap via Ethereum network"}'
curl -X POST http://localhost:8000/process_prompt -H "Content-Type: application/json" -d '{"prompt":"Check balance of DAI for Alice on Polygon"}'
```

The trained model should improve accuracy for complex prompts as you add more training data.

## Troubleshooting

- **Server Errors**:
  - Run with debug logs:
    ```bash
    uvicorn nlp_service:app --host 0.0.0.0 --port 8000 --log-level debug
    ```
  - Ensure `/home/oxunavailable/HAi Wallet/NLP/train_data.json` is writable.
- **Training Errors**:
  - Verify `train_data.json` has valid JSON and annotated entities.
  - Ensure enough annotated data (at least 10-20 examples).
- **Model Not Loading**:
  - Check that `/home/oxunavailable/HAi Wallet/NLP/model/model-best` exists after training.
- **Prompt Issues**:
  - If a prompt fails to parse correctly, add similar examples to `train_data.json` and retrain.

## Next Steps

- **Add More Data**: Collect 100+ annotated prompts for better model performance.
- **Complex Prompts**: Include varied phrasings (e.g., "Send ETH to Alice", "Swap DAI for USDC on SushiSwap").
- **Automation**: Schedule training with cron:
  ```bash
  crontab -e
  # Add: 0 0 * * * /usr/bin/python3 /home/oxunavailable/HAi Wallet/NLP/train_model.py
  ```
- **Integration**: When ready, integrate with your TypeScript wallet app by calling the `/process_prompt` endpoint.

For help with errors, complex prompts, or future integration, contact the developer or refer to the spaCy documentation: https://spacy.io/usage/training.