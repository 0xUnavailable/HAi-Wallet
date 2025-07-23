import json

# Load existing data
try:
    with open("/home/oxunavailable/HAi Wallet/NLP/train_data.json", "r") as f:
        existing_data = json.load(f)
except FileNotFoundError:
    existing_data = []

# New training data
new_data =[
  {
    "prompt": "Send 200 ETH to Sophie on Base",
    "entities": [
      {"start": 5, "end": 8, "label": "AMOUNT"},
      {"start": 10, "end": 13, "label": "TOKEN"},
      {"start": 17, "end": 23, "label": "RECIPIENT"},
      {"start": 27, "end": 31, "label": "DEST_NETWORK"}
    ],
    "intent": "Transfer"
  },
  {
    "prompt": "Swap 0.75 USDC to ETH on Ethereum mainnet",
    "entities": [
      {"start": 5, "end": 9, "label": "AMOUNT"},
      {"start": 11, "end": 14, "label": "TOKEN"},
      {"start": 18, "end": 21, "label": "TOKEN2"},
      {"start": 25, "end": 32, "label": "DEST_NETWORK"},
      {"start": 33, "end": 39, "label": "DEST_NETWORK"}
    ],
    "intent": "Swap"
  },
  {
    "prompt": "Bridge 1.5 ETH from Arbitrum to Base",
    "entities": [
      {"start": 7, "end": 10, "label": "AMOUNT"},
      {"start": 12, "end": 15, "label": "TOKEN"},
      {"start": 21, "end": 28, "label": "SOURCE_NETWORK"},
      {"start": 32, "end": 36, "label": "DEST_NETWORK"}
    ],
    "intent": "Bridge"
  },
  {
    "prompt": "Check 0x1234567890abcdef1234567890abcdef12345678 USDT balance on Arbitrum",
    "entities": [
      {"start": 6, "end": 46, "label": "ADDRESS"},
      {"start": 48, "end": 51, "label": "TOKEN"},
      {"start": 52, "end": 59, "label": "QUERY_TYPE"},
      {"start": 63, "end": 70, "label": "DEST_NETWORK"}
    ],
    "intent": "Query"
  },
  {
    "prompt": "Send 0.2 ETH, 50 USDC to Tom on Base, swap 100 USDT to ETH on Ethereum, check balance",
    "entities": [
      {"start": 5, "end": 8, "label": "AMOUNT"},
      {"start": 10, "end": 13, "label": "TOKEN"},
      {"start": 15, "end": 17, "label": "AMOUNT"},
      {"start": 19, "end": 22, "label": "TOKEN"},
      {"start": 26, "end": 29, "label": "RECIPIENT"},
      {"start": 33, "end": 37, "label": "DEST_NETWORK"},
      {"start": 44, "end": 47, "label": "AMOUNT"},
      {"start": 49, "end": 52, "label": "TOKEN"},
      {"start": 56, "end": 59, "label": "TOKEN2"},
      {"start": 63, "end": 70, "label": "DEST_NETWORK"},
      {"start": 72, "end": 79, "label": "QUERY_TYPE"}
    ],
    "intent": "Multi"
  },
  {
    "prompt": "Plz tranfer 100 ETH to 0x234567890abcdef1234567890abcdef123456789 on Arbitrum",
    "entities": [
      {"start": 12, "end": 15, "label": "AMOUNT"},
      {"start": 17, "end": 20, "label": "TOKEN"},
      {"start": 24, "end": 64, "label": "ADDRESS"},
      {"start": 68, "end": 75, "label": "DEST_NETWORK"}
    ],
    "intent": "Transfer"
  },
  {
    "prompt": "Gimme my ETH balance on Base testnet",
    "entities": [
      {"start": 9, "end": 12, "label": "TOKEN"},
      {"start": 13, "end": 20, "label": "QUERY_TYPE"},
      {"start": 24, "end": 28, "label": "DEST_NETWORK"},
      {"start": 29, "end": 35, "label": "DEST_NETWORK"}
    ],
    "intent": "Query"
  },
  {
    "prompt": "Send 0.1 ETH to Luna, bridge 25 USDC from Base to Ethereum, swap 50 USDT to ETH",
    "entities": [
      {"start": 5, "end": 8, "label": "AMOUNT"},
      {"start": 10, "end": 13, "label": "TOKEN"},
      {"start": 17, "end": 21, "label": "RECIPIENT"},
      {"start": 29, "end": 31, "label": "AMOUNT"},
      {"start": 33, "end": 36, "label": "TOKEN"},
      {"start": 42, "end": 46, "label": "SOURCE_NETWORK"},
      {"start": 50, "end": 57, "label": "DEST_NETWORK"},
      {"start": 64, "end": 66, "label": "AMOUNT"},
      {"start": 68, "end": 71, "label": "TOKEN"},
      {"start": 75, "end": 78, "label": "TOKEN2"}
    ],
    "intent": "Multi"
  },
  {
    "prompt": "Swap 1000 USDT for ETH on Arbitrum",
    "entities": [
      {"start": 5, "end": 9, "label": "AMOUNT"},
      {"start": 11, "end": 14, "label": "TOKEN"},
      {"start": 19, "end": 22, "label": "TOKEN2"},
      {"start": 26, "end": 33, "label": "DEST_NETWORK"}
    ],
    "intent": "Swap"
  },
  {
    "prompt": "Transfer 0.5 ETH to 0x34567890abcdef1234567890abcdef1234567890, check USDC balance on Base",
    "entities": [
      {"start": 9, "end": 12, "label": "AMOUNT"},
      {"start": 14, "end": 17, "label": "TOKEN"},
      {"start": 21, "end": 61, "label": "ADDRESS"},
      {"start": 63, "end": 66, "label": "TOKEN"},
      {"start": 67, "end": 74, "label": "QUERY_TYPE"},
      {"start": 78, "end": 82, "label": "DEST_NETWORK"}
    ],
    "intent": "Multi"
  },
  {
    "prompt": "Yo, check 50 USDC balance on Ethereum",
    "entities": [
      {"start": 10, "end": 12, "label": "AMOUNT"},
      {"start": 14, "end": 17, "label": "TOKEN"},
      {"start": 18, "end": 25, "label": "QUERY_TYPE"},
      {"start": 29, "end": 36, "label": "DEST_NETWORK"}
    ],
    "intent": "Query"
  },
  {
    "prompt": "Bridge 0.25 ETH from Ethereum to Base, send 100 USDT to Mia, swap 0.1 ETH to USDC",
    "entities": [
      {"start": 7, "end": 11, "label": "AMOUNT"},
      {"start": 13, "end": 16, "label": "TOKEN"},
      {"start": 22, "end": 29, "label": "SOURCE_NETWORK"},
      {"start": 33, "end": 37, "label": "DEST_NETWORK"},
      {"start": 44, "end": 47, "label": "AMOUNT"},
      {"start": 49, "end": 52, "label": "TOKEN"},
      {"start": 56, "end": 59, "label": "RECIPIENT"},
      {"start": 66, "end": 69, "label": "AMOUNT"},
      {"start": 71, "end": 74, "label": "TOKEN"},
      {"start": 78, "end": 81, "label": "TOKEN2"}
    ],
    "intent": "Multi"
  },
  {
    "prompt": "Check balance for 0x4567890abcdef1234567890abcdef1234567890 on Base",
    "entities": [
      {"start": 6, "end": 13, "label": "QUERY_TYPE"},
      {"start": 18, "end": 58, "label": "ADDRESS"},
      {"start": 62, "end": 66, "label": "DEST_NETWORK"}
    ],
    "intent": "Query"
  },
  {
    "prompt": "Send 25 ETH to Noah on Arbitrum, bridge 0.5 USDC from Base to Ethereum",
    "entities": [
      {"start": 5, "end": 7, "label": "AMOUNT"},
      {"start": 9, "end": 12, "label": "TOKEN"},
      {"start": 16, "end": 20, "label": "RECIPIENT"},
      {"start": 24, "end": 31, "label": "DEST_NETWORK"},
      {"start": 39, "end": 42, "label": "AMOUNT"},
      {"start": 44, "end": 47, "label": "TOKEN"},
      {"start": 53, "end": 57, "label": "SOURCE_NETWORK"},
      {"start": 61, "end": 68, "label": "DEST_NETWORK"}
    ],
    "intent": "Multi"
  },
  {
    "prompt": "Swap 0.1 USDT for ETH on Ethereum",
    "entities": [
      {"start": 5, "end": 8, "label": "AMOUNT"},
      {"start": 10, "end": 13, "label": "TOKEN"},
      {"start": 18, "end": 21, "label": "TOKEN2"},
      {"start": 25, "end": 32, "label": "DEST_NETWORK"}
    ],
    "intent": "Swap"
  },
  {
    "prompt": "Send 15 USDC, 0.2 ETH to 0x567890abcdef1234567890abcdef1234567890ab on Base",
    "entities": [
      {"start": 5, "end": 7, "label": "AMOUNT"},
      {"start": 9, "end": 12, "label": "TOKEN"},
      {"start": 14, "end": 17, "label": "AMOUNT"},
      {"start": 19, "end": 22, "label": "TOKEN"},
      {"start": 26, "end": 66, "label": "ADDRESS"},
      {"start": 70, "end": 74, "label": "DEST_NETWORK"}
    ],
    "intent": "Transfer"
  },
  {
    "prompt": "Query ETH balance on Arbitrum testnet",
    "entities": [
      {"start": 6, "end": 9, "label": "TOKEN"},
      {"start": 10, "end": 17, "label": "QUERY_TYPE"},
      {"start": 21, "end": 28, "label": "DEST_NETWORK"},
      {"start": 29, "end": 35, "label": "DEST_NETWORK"}
    ],
    "intent": "Query"
  },
  {
    "prompt": "Send 0.5 ETH to Riley on Base, swap 50 USDC to ETH, bridge 25 USDT to Arbitrum, check balance",
    "entities": [
      {"start": 5, "end": 8, "label": "AMOUNT"},
      {"start": 10, "end": 13, "label": "TOKEN"},
      {"start": 17, "end": 22, "label": "RECIPIENT"},
      {"start": 26, "end": 30, "label": "DEST_NETWORK"},
      {"start": 37, "end": 39, "label": "AMOUNT"},
      {"start": 41, "end": 44, "label": "TOKEN"},
      {"start": 48, "end": 51, "label": "TOKEN2"},
      {"start": 58, "end": 60, "label": "AMOUNT"},
      {"start": 62, "end": 65, "label": "TOKEN"},
      {"start": 69, "end": 76, "label": "DEST_NETWORK"},
      {"start": 78, "end": 85, "label": "QUERY_TYPE"}
    ],
    "intent": "Multi"
  },
  {
    "prompt": "Bridge 100 USDC from Base to Ethereum mainnet",
    "entities": [
      {"start": 7, "end": 10, "label": "AMOUNT"},
      {"start": 12, "end": 15, "label": "TOKEN"},
      {"start": 21, "end": 25, "label": "SOURCE_NETWORK"},
      {"start": 29, "end": 36, "label": "DEST_NETWORK"},
      {"start": 37, "end": 43, "label": "DEST_NETWORK"}
    ],
    "intent": "Bridge"
  },
  {
    "prompt": "Transfer 0.25 ETH to 0x67890abcdef1234567890abcdef1234567890abc",
    "entities": [
      {"start": 9, "end": 13, "label": "AMOUNT"},
      {"start": 15, "end": 18, "label": "TOKEN"},
      {"start": 22, "end": 62, "label": "ADDRESS"}
    ],
    "intent": "Transfer"
  },
  {
    "prompt": "Check USDT balance for Quinn on Ethereum, send 0.1 ETH to 0x7890abcdef1234567890abcdef1234567890abcd",
    "entities": [
      {"start": 6, "end": 9, "label": "TOKEN"},
      {"start": 10, "end": 17, "label": "QUERY_TYPE"},
      {"start": 22, "end": 27, "label": "RECIPIENT"},
      {"start": 31, "end": 38, "label": "DEST_NETWORK"},
      {"start": 45, "end": 48, "label": "AMOUNT"},
      {"start": 50, "end": 53, "label": "TOKEN"},
      {"start": 57, "end": 97, "label": "ADDRESS"}
    ],
    "intent": "Multi"
  },
  {
    "prompt": "Swap 0.5 USDC to ETH on Base testnet",
    "entities": [
      {"start": 5, "end": 8, "label": "AMOUNT"},
      {"start": 10, "end": 13, "label": "TOKEN"},
      {"start": 17, "end": 20, "label": "TOKEN2"},
      {"start": 24, "end": 28, "label": "DEST_NETWORK"},
      {"start": 29, "end": 35, "label": "DEST_NETWORK"}
    ],
    "intent": "Swap"
  },
  {
    "prompt": "Send 100 ETH, 0.1 USDC to Piper on Ethereum mainnet",
    "entities": [
      {"start": 5, "end": 8, "label": "AMOUNT"},
      {"start": 10, "end": 13, "label": "TOKEN"},
      {"start": 15, "end": 18, "label": "AMOUNT"},
      {"start": 20, "end": 23, "label": "TOKEN"},
      {"start": 27, "end": 32, "label": "RECIPIENT"},
      {"start": 36, "end": 43, "label": "DEST_NETWORK"},
      {"start": 44, "end": 50, "label": "DEST_NETWORK"}
    ],
    "intent": "Transfer"
  },
  {
    "prompt": "Bridge 0.2 USDT from Arbitrum to Base, check ETH balance on Base",
    "entities": [
      {"start": 7, "end": 10, "label": "AMOUNT"},
      {"start": 12, "end": 15, "label": "TOKEN"},
      {"start": 21, "end": 28, "label": "SOURCE_NETWORK"},
      {"start": 32, "end": 36, "label": "DEST_NETWORK"},
      {"start": 38, "end": 41, "label": "TOKEN"},
      {"start": 42, "end": 49, "label": "QUERY_TYPE"},
      {"start": 53, "end": 57, "label": "DEST_NETWORK"}
    ],
    "intent": "Multi"
  },
  {
    "prompt": "Query balance for 0x890abcdef1234567890abcdef1234567890abcde on Ethereum",
    "entities": [
      {"start": 6, "end": 13, "label": "QUERY_TYPE"},
      {"start": 18, "end": 58, "label": "ADDRESS"},
      {"start": 62, "end": 69, "label": "DEST_NETWORK"}
    ],
    "intent": "Query"
  },
  {
    "prompt": "Send 0.3 ETH to Sam on Base, swap 25 USDC to ETH, bridge 15 USDT to Arbitrum",
    "entities": [
      {"start": 5, "end": 8, "label": "AMOUNT"},
      {"start": 10, "end": 13, "label": "TOKEN"},
      {"start": 17, "end": 20, "label": "RECIPIENT"},
      {"start": 24, "end": 28, "label": "DEST_NETWORK"},
      {"start": 35, "end": 37, "label": "AMOUNT"},
      {"start": 39, "end": 42, "label": "TOKEN"},
      {"start": 46, "end": 49, "label": "TOKEN2"},
      {"start": 56, "end": 58, "label": "AMOUNT"},
      {"start": 60, "end": 63, "label": "TOKEN"},
      {"start": 67, "end": 74, "label": "DEST_NETWORK"}
    ],
    "intent": "Multi"
  },
  {
    "prompt": "Transfer 1.5 ETH to 0x9abcdef1234567890abcdef1234567890abcdef1 on Arbitrum",
    "entities": [
      {"start": 9, "end": 12, "label": "AMOUNT"},
      {"start": 14, "end": 17, "label": "TOKEN"},
      {"start": 21, "end": 61, "label": "ADDRESS"},
      {"start": 65, "end": 72, "label": "DEST_NETWORK"}
    ],
    "intent": "Transfer"
  },
  {
    "prompt": "Swap 50 ETH to USDT, send 0.1 USDC to Jack on Base",
    "entities": [
      {"start": 5, "end": 7, "label": "AMOUNT"},
      {"start": 9, "end": 12, "label": "TOKEN"},
      {"start": 16, "end": 19, "label": "TOKEN2"},
      {"start": 26, "end": 29, "label": "AMOUNT"},
      {"start": 31, "end": 34, "label": "TOKEN"},
      {"start": 38, "end": 42, "label": "RECIPIENT"},
      {"start": 46, "end": 50, "label": "DEST_NETWORK"}
    ],
    "intent": "Multi"
  },
  {
    "prompt": "Check USDC balance on Arbitrum testnet",
    "entities": [
      {"start": 6, "end": 9, "label": "TOKEN"},
      {"start": 10, "end": 17, "label": "QUERY_TYPE"},
      {"start": 21, "end": 28, "label": "DEST_NETWORK"},
      {"start": 29, "end": 35, "label": "DEST_NETWORK"}
    ],
    "intent": "Query"
  },
  {
    "prompt": "Send 0.2 ETH to Kate on Base, bridge 10 USDC from Ethereum to Arbitrum",
    "entities": [
      {"start": 5, "end": 8, "label": "AMOUNT"},
      {"start": 10, "end": 13, "label": "TOKEN"},
      {"start": 17, "end": 21, "label": "RECIPIENT"},
      {"start": 25, "end": 29, "label": "DEST_NETWORK"},
      {"start": 36, "end": 38, "label": "AMOUNT"},
      {"start": 40, "end": 43, "label": "TOKEN"},
      {"start": 49, "end": 56, "label": "SOURCE_NETWORK"},
      {"start": 60, "end": 67, "label": "DEST_NETWORK"}
    ],
    "intent": "Multi"
  },
  {
    "prompt": "Swap 0.1 USDC for ETH on Ethereum mainnet",
    "entities": [
      {"start": 5, "end": 8, "label": "AMOUNT"},
      {"start": 10, "end": 13, "label": "TOKEN"},
      {"start": 18, "end": 21, "label": "TOKEN2"},
      {"start": 25, "end": 32, "label": "DEST_NETWORK"},
      {"start": 33, "end": 39, "label": "DEST_NETWORK"}
    ],
    "intent": "Swap"
  },
  {
    "prompt": "Transfer 25 ETH to 0x1234567890abcdef1234567890abcdef12345678 on Base",
    "entities": [
      {"start": 9, "end": 11, "label": "AMOUNT"},
      {"start": 13, "end": 16, "label": "TOKEN"},
      {"start": 20, "end": 60, "label": "ADDRESS"},
      {"start": 64, "end": 68, "label": "DEST_NETWORK"}
    ],
    "intent": "Transfer"
  },
  {
    "prompt": "Bridge 0.5 USDT from Base to Ethereum, check ETH balance",
    "entities": [
      {"start": 7, "end": 10, "label": "AMOUNT"},
      {"start": 12, "end": 15, "label": "TOKEN"},
      {"start": 21, "end": 25, "label": "SOURCE_NETWORK"},
      {"start": 29, "end": 36, "label": "DEST_NETWORK"},
      {"start": 38, "end": 41, "label": "TOKEN"},
      {"start": 42, "end": 49, "label": "QUERY_TYPE"}
    ],
    "intent": "Multi"
  },
  {
    "prompt": "Send 100 USDC to Liam on Base",
    "entities": [
      {"start": 5, "end": 8, "label": "AMOUNT"},
      {"start": 10, "end": 13, "label": "TOKEN"},
      {"start": 17, "end": 21, "label": "RECIPIENT"},
      {"start": 25, "end": 29, "label": "DEST_NETWORK"}
    ],
    "intent": "Transfer"
  },
  {
    "prompt": "Swap 0.25 ETH to USDC, send 10 USDT to Mia on Arbitrum",
    "entities": [
      {"start": 5, "end": 9, "label": "AMOUNT"},
      {"start": 11, "end": 14, "label": "TOKEN"},
      {"start": 18, "end": 21, "label": "TOKEN2"},
      {"start": 28, "end": 30, "label": "AMOUNT"},
      {"start": 32, "end": 35, "label": "TOKEN"},
      {"start": 39, "end": 42, "label": "RECIPIENT"},
      {"start": 46, "end": 53, "label": "DEST_NETWORK"}
    ],
    "intent": "Multi"
  },
  {
    "prompt": "Check USDC balance on Ethereum",
    "entities": [
      {"start": 6, "end": 9, "label": "TOKEN"},
      {"start": 10, "end": 17, "label": "QUERY_TYPE"},
      {"start": 21, "end": 28, "label": "DEST_NETWORK"}
    ],
    "intent": "Query"
  },
  {
    "prompt": "Send 0.1 ETH, 25 USDC to Noah on Base, bridge 15 ETH to Ethereum",
    "entities": [
      {"start": 5, "end": 8, "label": "AMOUNT"},
      {"start": 10, "end": 13, "label": "TOKEN"},
      {"start": 15, "end": 17, "label": "AMOUNT"},
      {"start": 19, "end": 22, "label": "TOKEN"},
      {"start": 26, "end": 30, "label": "RECIPIENT"},
      {"start": 34, "end": 38, "label": "DEST_NETWORK"},
      {"start": 45, "end": 47, "label": "AMOUNT"},
      {"start": 49, "end": 52, "label": "TOKEN"},
      {"start": 56, "end": 63, "label": "DEST_NETWORK"}
    ],
    "intent": "Multi"
  },
  {
    "prompt": "Swap 75 USDT to ETH on Base",
    "entities": [
      {"start": 5, "end": 7, "label": "AMOUNT"},
      {"start": 9, "end": 12, "label": "TOKEN"},
      {"start": 16, "end": 19, "label": "TOKEN2"},
      {"start": 23, "end": 27, "label": "DEST_NETWORK"}
    ],
    "intent": "Swap"
  },
  {
    "prompt": "Transfer 0.2 ETH to 0x234567890abcdef1234567890abcdef123456789 on Ethereum",
    "entities": [
      {"start": 9, "end": 12, "label": "AMOUNT"},
      {"start": 14, "end": 17, "label": "TOKEN"},
      {"start": 21, "end": 61, "label": "ADDRESS"},
      {"start": 65, "end": 72, "label": "DEST_NETWORK"}
    ],
    "intent": "Transfer"
  },
  {
    "prompt": "Bridge 25 USDC from Arbitrum to Base, check balance on Base",
    "entities": [
      {"start": 7, "end": 9, "label": "AMOUNT"},
      {"start": 11, "end": 14, "label": "TOKEN"},
      {"start": 20, "end": 27, "label": "SOURCE_NETWORK"},
      {"start": 31, "end": 35, "label": "DEST_NETWORK"},
      {"start": 37, "end": 44, "label": "QUERY_TYPE"},
      {"start": 48, "end": 52, "label": "DEST_NETWORK"}
    ],
    "intent": "Multi"
  },
  {
    "prompt": "Send 15 ETH to Oliver on Ethereum",
    "entities": [
      {"start": 5, "end": 7, "label": "AMOUNT"},
      {"start": 9, "end": 12, "label": "TOKEN"},
      {"start": 16, "end": 22, "label": "RECIPIENT"},
      {"start": 26, "end": 33, "label": "DEST_NETWORK"}
    ],
    "intent": "Transfer"
  },
  {
    "prompt": "Swap 100 USDC to ETH, send 20 ETH to Piper on Base",
    "entities": [
      {"start": 5, "end": 8, "label": "AMOUNT"},
      {"start": 10, "end": 13, "label": "TOKEN"},
      {"start": 17, "end": 20, "label": "TOKEN2"},
      {"start": 27, "end": 29, "label": "AMOUNT"},
      {"start": 31, "end": 34, "label": "TOKEN"},
      {"start": 38, "end": 43, "label": "RECIPIENT"},
      {"start": 47, "end": 51, "label": "DEST_NETWORK"}
    ],
    "intent": "Multi"
  },
  {
    "prompt": "Check ETH balance on Arbitrum",
    "entities": [
      {"start": 6, "end": 9, "label": "TOKEN"},
      {"start": 10, "end": 17, "label": "QUERY_TYPE"},
      {"start": 21, "end": 28, "label": "DEST_NETWORK"}
    ],
    "intent": "Query"
  },
  {
    "prompt": "Send 50 ETH, 0.5 USDC to Quinn on Base, swap 25 USDT to ETH on Ethereum",
    "entities": [
      {"start": 5, "end": 7, "label": "AMOUNT"},
      {"start": 9, "end": 12, "label": "TOKEN"},
      {"start": 14, "end": 17, "label": "AMOUNT"},
      {"start": 19, "end": 22, "label": "TOKEN"},
      {"start": 26, "end": 31, "label": "RECIPIENT"},
      {"start": 35, "end": 39, "label": "DEST_NETWORK"},
      {"start": 46, "end": 48, "label": "AMOUNT"},
      {"start": 50, "end": 53, "label": "TOKEN"},
      {"start": 57, "end": 60, "label": "TOKEN2"},
      {"start": 64, "end": 71, "label": "DEST_NETWORK"}
    ],
    "intent": "Multi"
  },
  {
    "prompt": "Bridge 0.1 ETH from Ethereum to Arbitrum",
    "entities": [
      {"start": 7, "end": 10, "label": "AMOUNT"},
      {"start": 12, "end": 15, "label": "TOKEN"},
      {"start": 21, "end": 28, "label": "SOURCE_NETWORK"},
      {"start": 32, "end": 39, "label": "DEST_NETWORK"}
    ],
    "intent": "Bridge"
  },
  {
    "prompt": "Transfer 20 USDT to 0x34567890abcdef1234567890abcdef1234567890 on Base",
    "entities": [
      {"start": 9, "end": 11, "label": "AMOUNT"},
      {"start": 13, "end": 16, "label": "TOKEN"},
      {"start": 20, "end": 60, "label": "ADDRESS"},
      {"start": 64, "end": 68, "label": "DEST_NETWORK"}
    ],
    "intent": "Transfer"
  },
  {
    "prompt": "Swap 50 ETH to USDC on Base, check USDT balance",
    "entities": [
      {"start": 5, "end": 7, "label": "AMOUNT"},
      {"start": 9, "end": 12, "label": "TOKEN"},
      {"start": 16, "end": 19, "label": "TOKEN2"},
      {"start": 23, "end": 27, "label": "DEST_NETWORK"},
      {"start": 29, "end": 32, "label": "TOKEN"},
      {"start": 33, "end": 40, "label": "QUERY_TYPE"}
    ],
    "intent": "Multi"
  },
  {
    "prompt": "Send 25 ETH to Riley on Ethereum",
    "entities": [
      {"start": 5, "end": 7, "label": "AMOUNT"},
      {"start": 9, "end": 12, "label": "TOKEN"},
      {"start": 16, "end": 21, "label": "RECIPIENT"},
      {"start": 25, "end": 32, "label": "DEST_NETWORK"}
    ],
    "intent": "Transfer"
  },
  {
    "prompt": "Check balance for 0x4567890abcdef1234567890abcdef1234567890 on Arbitrum",
    "entities": [
      {"start": 6, "end": 13, "label": "QUERY_TYPE"},
      {"start": 18, "end": 58, "label": "ADDRESS"},
      {"start": 62, "end": 69, "label": "DEST_NETWORK"}
    ],
    "intent": "Query"
  },
  {
    "prompt": "Send 10 USDC, 0.5 ETH to Sam on Base, bridge 20 USDT to Ethereum, swap 15 ETH to USDC",
    "entities": [
      {"start": 5, "end": 7, "label": "AMOUNT"},
      {"start": 9, "end": 12, "label": "TOKEN"},
      {"start": 14, "end": 17, "label": "AMOUNT"},
      {"start": 19, "end": 22, "label": "TOKEN"},
      {"start": 26, "end": 29, "label": "RECIPIENT"},
      {"start": 33, "end": 37, "label": "DEST_NETWORK"},
      {"start": 44, "end": 46, "label": "AMOUNT"},
      {"start": 48, "end": 51, "label": "TOKEN"},
      {"start": 55, "end": 62, "label": "DEST_NETWORK"},
      {"start": 69, "end": 71, "label": "AMOUNT"},
      {"start": 73, "end": 76, "label": "TOKEN"},
      {"start": 80, "end": 83, "label": "TOKEN2"}
    ],
    "intent": "Multi"
  },
  {
    "prompt": "Swap 100 USDT to ETH on Arbitrum",
    "entities": [
      {"start": 5, "end": 8, "label": "AMOUNT"},
      {"start": 10, "end": 13, "label": "TOKEN"},
      {"start": 17, "end": 20, "label": "TOKEN2"},
      {"start": 24, "end": 31, "label": "DEST_NETWORK"}
    ],
    "intent": "Swap"
  },
  {
    "prompt": "Transfer 0.3 ETH to 0x567890abcdef1234567890abcdef1234567890ab on Base",
    "entities": [
      {"start": 9, "end": 12, "label": "AMOUNT"},
      {"start": 14, "end": 17, "label": "TOKEN"},
      {"start": 21, "end": 61, "label": "ADDRESS"},
      {"start": 65, "end": 69, "label": "DEST_NETWORK"}
    ],
    "intent": "Transfer"
  },
  {
    "prompt": "Send 50 ETH to Bob on Ethereum, swap 0.1 USDC to ETH, bridge 25 USDT to Base",
    "entities": [
      {"start": 5, "end": 7, "label": "AMOUNT"},
      {"start": 9, "end": 12, "label": "TOKEN"},
      {"start": 16, "end": 19, "label": "RECIPIENT"},
      {"start": 23, "end": 30, "label": "DEST_NETWORK"},
      {"start": 37, "end": 40, "label": "AMOUNT"},
      {"start": 42, "end": 45, "label": "TOKEN"},
      {"start": 49, "end": 52, "label": "TOKEN2"},
      {"start": 59, "end": 61, "label": "AMOUNT"},
      {"start": 63, "end": 66, "label": "TOKEN"},
      {"start": 70, "end": 74, "label": "DEST_NETWORK"}
    ],
    "intent": "Multi"
  },
  {
    "prompt": "Check 0.5 ETH balance on Base",
    "entities": [
      {"start": 6, "end": 9, "label": "AMOUNT"},
      {"start": 11, "end": 14, "label": "TOKEN"},
      {"start": 15, "end": 22, "label": "QUERY_TYPE"},
      {"start": 26, "end": 30, "label": "DEST_NETWORK"}
    ],
    "intent": "Query"
  },
  {
    "prompt": "Send 100 USDC to Alice, bridge 0.2 ETH from Arbitrum to Ethereum",
    "entities": [
      {"start": 5, "end": 8, "label": "AMOUNT"},
      {"start": 10, "end": 13, "label": "TOKEN"},
      {"start": 17, "end": 22, "label": "RECIPIENT"},
      {"start": 30, "end": 33, "label": "AMOUNT"},
      {"start": 35, "end": 38, "label": "TOKEN"},
      {"start": 44, "end": 51, "label": "SOURCE_NETWORK"},
      {"start": 55, "end": 62, "label": "DEST_NETWORK"}
    ],
    "intent": "Multi"
  },
  {
    "prompt": "Swap 25 USDT to ETH on Ethereum, check balance",
    "entities": [
      {"start": 5, "end": 7, "label": "AMOUNT"},
      {"start": 9, "end": 12, "label": "TOKEN"},
      {"start": 16, "end": 19, "label": "TOKEN2"},
      {"start": 23, "end": 30, "label": "DEST_NETWORK"},
      {"start": 32, "end": 39, "label": "QUERY_TYPE"}
    ],
    "intent": "Multi"
  },
  {
    "prompt": "Transfer 0.1 ETH to 0x67890abcdef1234567890abcdef1234567890abc on Arbitrum",
    "entities": [
      {"start": 9, "end": 12, "label": "AMOUNT"},
      {"start": 14, "end": 17, "label": "TOKEN"},
      {"start": 21, "end": 61, "label": "ADDRESS"},
      {"start": 65, "end": 72, "label": "DEST_NETWORK"}
    ],
    "intent": "Transfer"
  },
  {
    "prompt": "Bridge 15 USDC from Base to Ethereum, send 10 ETH to Bob",
    "entities": [
      {"start": 7, "end": 9, "label": "AMOUNT"},
      {"start": 11, "end": 14, "label": "TOKEN"},
      {"start": 20, "end": 24, "label": "SOURCE_NETWORK"},
      {"start": 28, "end": 35, "label": "DEST_NETWORK"},
      {"start": 42, "end": 44, "label": "AMOUNT"},
      {"start": 46, "end": 49, "label": "TOKEN"},
      {"start": 53, "end": 56, "label": "RECIPIENT"}
    ],
    "intent": "Multi"
  },
  {
    "prompt": "Check USDT balance for 0x7890abcdef1234567890abcdef1234567890abcd on Base",
    "entities": [
      {"start": 6, "end": 9, "label": "TOKEN"},
      {"start": 10, "end": 17, "label": "QUERY_TYPE"},
      {"start": 22, "end": 62, "label": "ADDRESS"},
      {"start": 66, "end": 70, "label": "DEST_NETWORK"}
    ],
    "intent": "Query"
  },
  {
    "prompt": "Send 0.5 ETH to Charlie on Ethereum, swap 50 USDC to ETH, bridge 25 USDT to Base",
    "entities": [
      {"start": 5, "end": 8, "label": "AMOUNT"},
      {"start": 10, "end": 13, "label": "TOKEN"},
      {"start": 17, "end": 23, "label": "RECIPIENT"},
      {"start": 27, "end": 34, "label": "DEST_NETWORK"},
      {"start": 41, "end": 43, "label": "AMOUNT"},
      {"start": 45, "end": 48, "label": "TOKEN"},
      {"start": 52, "end": 55, "label": "TOKEN2"},
      {"start": 62, "end": 64, "label": "AMOUNT"},
      {"start": 66, "end": 69, "label": "TOKEN"},
      {"start": 73, "end": 77, "label": "DEST_NETWORK"}
    ],
    "intent": "Multi"
  },
  {
    "prompt": "Swap 0.75 USDC to ETH on Base",
    "entities": [
      {"start": 5, "end": 9, "label": "AMOUNT"},
      {"start": 11, "end": 14, "label": "TOKEN"},
      {"start": 18, "end": 21, "label": "TOKEN2"},
      {"start": 25, "end": 29, "label": "DEST_NETWORK"}
    ],
    "intent": "Swap"
  },
  {
    "prompt": "Transfer 10 ETH to 0x890abcdef1234567890abcdef1234567890abcde on Ethereum",
    "entities": [
      {"start": 9, "end": 11, "label": "AMOUNT"},
      {"start": 13, "end": 16, "label": "TOKEN"},
      {"start": 20, "end": 60, "label": "ADDRESS"},
      {"start": 64, "end": 71, "label": "DEST_NETWORK"}
    ],
    "intent": "Transfer"
  },
  {
    "prompt": "Send 25 USDC to Dave on Base, check ETH balance, swap 0.1 ETH to USDT",
    "entities": [
      {"start": 5, "end": 7, "label": "AMOUNT"},
      {"start": 9, "end": 12, "label": "TOKEN"},
      {"start": 16, "end": 20, "label": "RECIPIENT"},
      {"start": 24, "end": 28, "label": "DEST_NETWORK"},
      {"start": 30, "end": 33, "label": "TOKEN"},
      {"start": 34, "end": 41, "label": "QUERY_TYPE"},
      {"start": 48, "end": 51, "label": "AMOUNT"},
      {"start": 53, "end": 56, "label": "TOKEN"},
      {"start": 60, "end": 63, "label": "TOKEN2"}
    ],
    "intent": "Multi"
  },
  {
    "prompt": "Bridge 0.2 USDT from Arbitrum to Ethereum",
    "entities": [
      {"start": 7, "end": 10, "label": "AMOUNT"},
      {"start": 12, "end": 15, "label": "TOKEN"},
      {"start": 21, "end": 28, "label": "SOURCE_NETWORK"},
      {"start": 32, "end": 39, "label": "DEST_NETWORK"}
    ],
    "intent": "Bridge"
  },
  {
    "prompt": "Check balance for ETH on Base",
    "entities": [
      {"start": 6, "end": 13, "label": "QUERY_TYPE"},
      {"start": 18, "end": 21, "label": "TOKEN"},
      {"start": 25, "end": 29, "label": "DEST_NETWORK"}
    ],
    "intent": "Query"
  },
  {
    "prompt": "Send 50 ETH to Emma on Arbitrum, swap 25 USDC to ETH, bridge 0.5 USDT to Base",
    "entities": [
      {"start": 5, "end": 7, "label": "AMOUNT"},
      {"start": 9, "end": 12, "label": "TOKEN"},
      {"start": 16, "end": 20, "label": "RECIPIENT"},
      {"start": 24, "end": 31, "label": "DEST_NETWORK"},
      {"start": 38, "end": 40, "label": "AMOUNT"},
      {"start": 42, "end": 45, "label": "TOKEN"},
      {"start": 49, "end": 52, "label": "TOKEN2"},
      {"start": 59, "end": 62, "label": "AMOUNT"},
      {"start": 64, "end": 67, "label": "TOKEN"},
      {"start": 71, "end": 75, "label": "DEST_NETWORK"}
    ],
    "intent": "Multi"
  },
  {
    "prompt": "Transfer 0.1 ETH to 0x9abcdef1234567890abcdef1234567890abcdef1 on Base",
    "entities": [
      {"start": 9, "end": 12, "label": "AMOUNT"},
      {"start": 14, "end": 17, "label": "TOKEN"},
      {"start": 21, "end": 61, "label": "ADDRESS"},
      {"start": 65, "end": 69, "label": "DEST_NETWORK"}
    ],
    "intent": "Transfer"
  },
  {
    "prompt": "Swap 100 USDC to ETH on Ethereum, send 20 USDT to Frank",
    "entities": [
      {"start": 5, "end": 8, "label": "AMOUNT"},
      {"start": 10, "end": 13, "label": "TOKEN"},
      {"start": 17, "end": 20, "label": "TOKEN2"},
      {"start": 24, "end": 31, "label": "DEST_NETWORK"},
      {"start": 38, "end": 40, "label": "AMOUNT"},
      {"start": 42, "end": 45, "label": "TOKEN"},
      {"start": 49, "end": 54, "label": "RECIPIENT"}
    ],
    "intent": "Multi"
  },
  {
    "prompt": "Check 0.25 USDC balance on Arbitrum",
    "entities": [
      {"start": 6, "end": 10, "label": "AMOUNT"},
      {"start": 12, "end": 15, "label": "TOKEN"},
      {"start": 16, "end": 23, "label": "QUERY_TYPE"},
      {"start": 27, "end": 34, "label": "DEST_NETWORK"}
    ],
    "intent": "Query"
  },
  {
    "prompt": "Send 0.5 ETH to Grace on Base, bridge 10 USDT from Ethereum to Arbitrum",
    "entities": [
      {"start": 5, "end": 8, "label": "AMOUNT"},
      {"start": 10, "end": 13, "label": "TOKEN"},
      {"start": 17, "end": 22, "label": "RECIPIENT"},
      {"start": 26, "end": 30, "label": "DEST_NETWORK"},
      {"start": 37, "end": 39, "label": "AMOUNT"},
      {"start": 41, "end": 44, "label": "TOKEN"},
      {"start": 50, "end": 57, "label": "SOURCE_NETWORK"},
      {"start": 61, "end": 68, "label": "DEST_NETWORK"}
    ],
    "intent": "Multi"
  },
  {
    "prompt": "Swap 50 USDT to ETH on Base, check balance for 0x1234567890abcdef1234567890abcdef12345678",
    "entities": [
      {"start": 5, "end": 7, "label": "AMOUNT"},
      {"start": 9, "end": 12, "label": "TOKEN"},
      {"start": 16, "end": 19, "label": "TOKEN2"},
      {"start": 23, "end": 27, "label": "DEST_NETWORK"},
      {"start": 29, "end": 36, "label": "QUERY_TYPE"},
      {"start": 41, "end": 81, "label": "ADDRESS"}
    ],
    "intent": "Multi"
  },
  {
    "prompt": "Transfer 25 ETH to Harry on Ethereum",
    "entities": [
      {"start": 9, "end": 11, "label": "AMOUNT"},
      {"start": 13, "end": 16, "label": "TOKEN"},
      {"start": 20, "end": 25, "label": "RECIPIENT"},
      {"start": 29, "end": 36, "label": "DEST_NETWORK"}
    ],
    "intent": "Transfer"
  },
  {
    "prompt": "Bridge 0.1 USDC from Arbitrum to Base, send 10 ETH to Iris",
    "entities": [
      {"start": 7, "end": 10, "label": "AMOUNT"},
      {"start": 12, "end": 15, "label": "TOKEN"},
      {"start": 21, "end": 28, "label": "SOURCE_NETWORK"},
      {"start": 32, "end": 36, "label": "DEST_NETWORK"},
      {"start": 43, "end": 45, "label": "AMOUNT"},
      {"start": 47, "end": 50, "label": "TOKEN"},
      {"start": 54, "end": 58, "label": "RECIPIENT"}
    ],
    "intent": "Multi"
  },
  {
    "prompt": "Check ETH balance for 0x234567890abcdef1234567890abcdef123456789 on Ethereum",
    "entities": [
      {"start": 6, "end": 9, "label": "TOKEN"},
      {"start": 10, "end": 17, "label": "QUERY_TYPE"},
      {"start": 22, "end": 62, "label": "ADDRESS"},
      {"start": 66, "end": 73, "label": "DEST_NETWORK"}
    ],
    "intent": "Query"
  },
  {
    "prompt": "Send 100 ETH to Jack on Base, swap 0.5 USDC to ETH, bridge 25 USDT to Arbitrum, check balance",
    "entities": [
      {"start": 5, "end": 8, "label": "AMOUNT"},
      {"start": 10, "end": 13, "label": "TOKEN"},
      {"start": 17, "end": 21, "label": "RECIPIENT"},
      {"start": 25, "end": 29, "label": "DEST_NETWORK"},
      {"start": 36, "end": 39, "label": "AMOUNT"},
      {"start": 41, "end": 44, "label": "TOKEN"},
      {"start": 48, "end": 51, "label": "TOKEN2"},
      {"start": 58, "end": 60, "label": "AMOUNT"},
      {"start": 62, "end": 65, "label": "TOKEN"},
      {"start": 69, "end": 76, "label": "DEST_NETWORK"},
      {"start": 78, "end": 85, "label": "QUERY_TYPE"}
    ],
    "intent": "Multi"
  }
]
# Append new data to existing data
existing_data.extend(new_data)

# Save updated data
with open("/home/oxunavailable/HAi Wallet/NLP/train_data.json", "w") as f:
    json.dump(existing_data, f, indent=2)