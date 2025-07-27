#!/usr/bin/env python3
"""
Startup script for NLP service deployment
This script ensures all dependencies are properly installed and the service starts correctly
"""

import subprocess
import sys
import os

def download_spacy_model():
    """Download the spaCy English model if not already present"""
    try:
        import spacy
        # Try to load the model
        nlp = spacy.load("en_core_web_sm")
        print("✓ spaCy English model already available")
        return True
    except OSError:
        print("Downloading spaCy English model...")
        try:
            subprocess.run([sys.executable, "-m", "spacy", "download", "en_core_web_sm"], 
                         check=True, capture_output=True, text=True)
            print("✓ spaCy English model downloaded successfully")
            return True
        except subprocess.CalledProcessError as e:
            print(f"✗ Failed to download spaCy model: {e}")
            return False

def check_model_files():
    """Check if custom model files are present"""
    current_dir = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(current_dir, "model", "model-best")
    
    if os.path.exists(model_path):
        print(f"✓ Custom model found at: {model_path}")
        return True
    else:
        print(f"⚠ Custom model not found at: {model_path}")
        print("  Will use fallback spaCy model")
        return False

def main():
    """Main startup function"""
    print("🚀 Starting NLP Service...")
    
    # Check and download spaCy model
    if not download_spacy_model():
        print("⚠ Continuing without spaCy model - service may not work properly")
    
    # Check for custom model
    check_model_files()
    
    print("✅ Startup checks completed")
    print("📝 Service will start with uvicorn...")

if __name__ == "__main__":
    main() 