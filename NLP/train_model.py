import spacy
from spacy.training.example import Example
from spacy.tokens import DocBin
import json
import random
import os

def convert_to_spacy(input_file, output_file):
    nlp = spacy.blank("en")  # Create a blank English model
    db = DocBin()  # Store training data in binary format
    
    with open(input_file, "r") as f:
        data = json.load(f)
    
    for item in data:
        text = item["prompt"]
        entities = item["entities"]
        doc = nlp.make_doc(text)
        ents = []
        
        for ent in entities:
            start = ent["start"]
            end = ent["end"]
            label = ent["label"]
            span = doc.char_span(start, end, label=label)
            if span is not None:  # Only add valid spans
                ents.append(span)
        
        doc.ents = ents
        annotations = {"entities": [(ent.start_char, ent.end_char, ent.label_) for ent in ents]}
        example = Example.from_dict(doc, annotations)
        
        # Add the Doc object (example.reference) to DocBin, not the Example object
        db.add(example.reference)
    
    db.to_disk(output_file)

def train_model():
    # Convert training data to spaCy format
    convert_to_spacy("/home/oxunavailable/HAi Wallet/NLP/train_data.json", "/home/oxunavailable/HAi Wallet/NLP/train.spacy")
    
    # Load a blank model
    nlp = spacy.blank("en")
    
    # Add NER pipeline
    if "ner" not in nlp.pipe_names:
        ner = nlp.add_pipe("ner")
    else:
        ner = nlp.get_pipe("ner")
    
    # Add labels to NER
    labels = ["INTENT", "AMOUNT", "TOKEN", "RECIPIENT", "ADDRESS", "SOURCE_NETWORK", "DEST_NETWORK", "TOKEN2", "QUERY_TYPE", "BRIDGE_KEYWORD"]
    for label in labels:
        ner.add_label(label)
    
    # Load training data
    db = DocBin().from_disk("/home/oxunavailable/HAi Wallet/NLP/train.spacy")
    train_data = list(db.get_docs(nlp.vocab))
    
    # Training configuration
    optimizer = nlp.begin_training()
    random.seed(0)
    for i in range(20):  # Number of epochs
        random.shuffle(train_data)
        losses = {}
        for doc in train_data:
            # Create Example object for training
            example = Example.from_dict(doc, {"entities": [(ent.start_char, ent.end_char, ent.label_) for ent in doc.ents]})
            nlp.update([example], drop=0.5, sgd=optimizer, losses=losses)
        print(f"Iteration {i+1}, Losses: {losses}")
    
    # Save the trained model
    output_dir = "/home/oxunavailable/HAi Wallet/NLP/model/model-best"
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
    nlp.to_disk(output_dir)
    print(f"Model saved to {output_dir}")

if __name__ == "__main__":
    train_model()