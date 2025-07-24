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
    "prompt": "Transfer 0.0025 ETH to 0x90889C14149Bf930B6824789431B8479aaB8e5ee on Base",
    "entities": [
      {"start": 9, "end": 15, "label": "AMOUNT"},
      {"start": 16, "end": 19, "label": "TOKEN"},
      {"start": 23, "end": 65, "label": "ADDRESS"}
    ],
    "intent": "Transfer"
  },
  {
    "prompt": "Send 0.001 USDC to Alice on Ethereum mainnet",
    "entities": [
      {"start": 5, "end": 10, "label": "AMOUNT"},
      {"start": 11, "end": 15, "label": "TOKEN"},
      {"start": 19, "end": 24, "label": "RECIPIENT"}
    ],
    "intent": "Transfer"
  },
  {
    "prompt": "transfer 0.0075 ETH to Bob",
    "entities": [
      {"start": 9, "end": 15, "label": "AMOUNT"},
      {"start": 16, "end": 19, "label": "TOKEN"},
      {"start": 23, "end": 26, "label": "RECIPIENT"}
    ],
    "intent": "Transfer"
  },
  {
    "prompt": "Move 0.05 USDC to 0x742d35Cc6648C2532C4B3A09c7eAd0c6 on Optimism",
    "entities": [
      {"start": 5, "end": 9, "label": "AMOUNT"},
      {"start": 10, "end": 14, "label": "TOKEN"},
      {"start": 18, "end": 60, "label": "ADDRESS"}
    ],
    "intent": "Transfer"
  },
  {
    "prompt": "Send 0.125 ETH to Charlie on Base testnet",
    "entities": [
      {"start": 5, "end": 10, "label": "AMOUNT"},
      {"start": 11, "end": 14, "label": "TOKEN"},
      {"start": 18, "end": 25, "label": "RECIPIENT"}
    ],
    "intent": "Transfer"
  },
  {
    "prompt": "Transfer 1.5 USDC to David",
    "entities": [
      {"start": 9, "end": 12, "label": "AMOUNT"},
      {"start": 13, "end": 17, "label": "TOKEN"},
      {"start": 21, "end": 26, "label": "RECIPIENT"}
    ],
    "intent": "Transfer"
  },
  {
    "prompt": "send 2.75 ETH to Eve on Ethereum",
    "entities": [
      {"start": 5, "end": 9, "label": "AMOUNT"},
      {"start": 10, "end": 13, "label": "TOKEN"},
      {"start": 17, "end": 20, "label": "RECIPIENT"}
    ],
    "intent": "Transfer"
  },
  {
    "prompt": "Move 5.25 USDC to 0x1234567890123456789012345678901234567890",
    "entities": [
      {"start": 5, "end": 9, "label": "AMOUNT"},
      {"start": 10, "end": 14, "label": "TOKEN"},
      {"start": 18, "end": 60, "label": "ADDRESS"}
    ],
    "intent": "Transfer"
  },
  {
    "prompt": "Transfer 10.5 ETH to Frank on Optimism mainnet",
    "entities": [
      {"start": 9, "end": 13, "label": "AMOUNT"},
      {"start": 14, "end": 17, "label": "TOKEN"},
      {"start": 21, "end": 26, "label": "RECIPIENT"}
    ],
    "intent": "Transfer"
  },
  {
    "prompt": "Send 25.75 USDC to Grace",
    "entities": [
      {"start": 5, "end": 10, "label": "AMOUNT"},
      {"start": 11, "end": 15, "label": "TOKEN"},
      {"start": 19, "end": 24, "label": "RECIPIENT"}
    ],
    "intent": "Transfer"
  },
  {
    "prompt": "transfer 50.25 ETH to Henry on Base",
    "entities": [
      {"start": 9, "end": 14, "label": "AMOUNT"},
      {"start": 15, "end": 18, "label": "TOKEN"},
      {"start": 22, "end": 27, "label": "RECIPIENT"}
    ],
    "intent": "Transfer"
  },
  {
    "prompt": "Move 99.99 USDC to 0xAbCdEf1234567890AbCdEf1234567890AbCdEf12 on Ethereum",
    "entities": [
      {"start": 5, "end": 10, "label": "AMOUNT"},
      {"start": 11, "end": 15, "label": "TOKEN"},
      {"start": 19, "end": 61, "label": "ADDRESS"}
    ],
    "intent": "Transfer"
  },
  {
    "prompt": "Send 125.25 ETH to Isabella",
    "entities": [
      {"start": 5, "end": 11, "label": "AMOUNT"},
      {"start": 12, "end": 15, "label": "TOKEN"},
      {"start": 19, "end": 27, "label": "RECIPIENT"}
    ],
    "intent": "Transfer"
  },
  {
    "prompt": "Transfer 250.5 USDC to Jack on Optimism testnet",
    "entities": [
      {"start": 9, "end": 14, "label": "AMOUNT"},
      {"start": 15, "end": 19, "label": "TOKEN"},
      {"start": 23, "end": 27, "label": "RECIPIENT"}
    ],
    "intent": "Transfer"
  },
  {
    "prompt": "send 500.75 ETH to 0x9876543210987654321098765432109876543210",
    "entities": [
      {"start": 5, "end": 11, "label": "AMOUNT"},
      {"start": 12, "end": 15, "label": "TOKEN"},
      {"start": 19, "end": 61, "label": "ADDRESS"}
    ],
    "intent": "Transfer"
  },
  {
    "prompt": "Move 1000.25 USDC to Kate on Base mainnet",
    "entities": [
      {"start": 5, "end": 12, "label": "AMOUNT"},
      {"start": 13, "end": 17, "label": "TOKEN"},
      {"start": 21, "end": 25, "label": "RECIPIENT"}
    ],
    "intent": "Transfer"
  },
  {
    "prompt": "Transfer 15 ETH to Liam",
    "entities": [
      {"start": 9, "end": 11, "label": "AMOUNT"},
      {"start": 12, "end": 15, "label": "TOKEN"},
      {"start": 19, "end": 23, "label": "RECIPIENT"}
    ],
    "intent": "Transfer"
  },
  {
    "prompt": "Send 75 USDC to Mia on Ethereum",
    "entities": [
      {"start": 5, "end": 7, "label": "AMOUNT"},
      {"start": 8, "end": 12, "label": "TOKEN"},
      {"start": 16, "end": 19, "label": "RECIPIENT"}
    ],
    "intent": "Transfer"
  },
  {
    "prompt": "transfer 150 ETH to Noah on Optimism",
    "entities": [
      {"start": 9, "end": 12, "label": "AMOUNT"},
      {"start": 13, "end": 16, "label": "TOKEN"},
      {"start": 20, "end": 24, "label": "RECIPIENT"}
    ],
    "intent": "Transfer"
  },
  {
    "prompt": "Move 500 USDC to 0xFfFfFfFfFfFfFfFfFfFfFfFfFfFfFfFfFfFfFfFf",
    "entities": [
      {"start": 5, "end": 8, "label": "AMOUNT"},
      {"start": 9, "end": 13, "label": "TOKEN"},
      {"start": 17, "end": 59, "label": "ADDRESS"}
    ],
    "intent": "Transfer"
  },
  {
    "prompt": "Send 2500 ETH to Olivia on Base",
    "entities": [
      {"start": 5, "end": 9, "label": "AMOUNT"},
      {"start": 10, "end": 13, "label": "TOKEN"},
      {"start": 17, "end": 23, "label": "RECIPIENT"}
    ],
    "intent": "Transfer"
  },
  {
    "prompt": "Swap 0.0025 ETH for USDC on Base",
    "entities": [
      {"start": 5, "end": 11, "label": "AMOUNT"},
      {"start": 12, "end": 15, "label": "TOKEN"},
      {"start": 20, "end": 24, "label": "TOKEN2"}
    ],
    "intent": "Swap"
  },
  {
    "prompt": "swap 0.005 USDC for ETH",
    "entities": [
      {"start": 5, "end": 10, "label": "AMOUNT"},
      {"start": 11, "end": 15, "label": "TOKEN"},
      {"start": 20, "end": 23, "label": "TOKEN2"}
    ],
    "intent": "Swap"
  },
  {
    "prompt": "Swap 0.01 ETH for USDC on Ethereum mainnet",
    "entities": [
      {"start": 5, "end": 9, "label": "AMOUNT"},
      {"start": 10, "end": 13, "label": "TOKEN"},
      {"start": 18, "end": 22, "label": "TOKEN2"}
    ],
    "intent": "Swap"
  },
  {
    "prompt": "swap 0.075 USDC for ETH on Optimism",
    "entities": [
      {"start": 5, "end": 10, "label": "AMOUNT"},
      {"start": 11, "end": 15, "label": "TOKEN"},
      {"start": 20, "end": 23, "label": "TOKEN2"}
    ],
    "intent": "Swap"
  },
  {
    "prompt": "Swap 0.5 ETH for USDC",
    "entities": [
      {"start": 5, "end": 8, "label": "AMOUNT"},
      {"start": 9, "end": 12, "label": "TOKEN"},
      {"start": 17, "end": 21, "label": "TOKEN2"}
    ],
    "intent": "Swap"
  },
  {
    "prompt": "swap 1.25 USDC for ETH on Base testnet",
    "entities": [
      {"start": 5, "end": 9, "label": "AMOUNT"},
      {"start": 10, "end": 14, "label": "TOKEN"},
      {"start": 19, "end": 22, "label": "TOKEN2"}
    ],
    "intent": "Swap"
  },
  {
    "prompt": "Swap 5.5 ETH for USDC on Ethereum",
    "entities": [
      {"start": 5, "end": 8, "label": "AMOUNT"},
      {"start": 9, "end": 12, "label": "TOKEN"},
      {"start": 17, "end": 21, "label": "TOKEN2"}
    ],
    "intent": "Swap"
  },
  {
    "prompt": "swap 25.25 USDC for ETH",
    "entities": [
      {"start": 5, "end": 10, "label": "AMOUNT"},
      {"start": 11, "end": 15, "label": "TOKEN"},
      {"start": 20, "end": 23, "label": "TOKEN2"}
    ],
    "intent": "Swap"
  },
  {
    "prompt": "Swap 99.99 ETH for USDC on Optimism mainnet",
    "entities": [
      {"start": 5, "end": 10, "label": "AMOUNT"},
      {"start": 11, "end": 14, "label": "TOKEN"},
      {"start": 19, "end": 23, "label": "TOKEN2"}
    ],
    "intent": "Swap"
  },
  {
    "prompt": "swap 250.5 USDC for ETH on Base",
    "entities": [
      {"start": 5, "end": 10, "label": "AMOUNT"},
      {"start": 11, "end": 15, "label": "TOKEN"},
      {"start": 20, "end": 23, "label": "TOKEN2"}
    ],
    "intent": "Swap"
  },
  {
    "prompt": "Swap 1000 ETH for USDC",
    "entities": [
      {"start": 5, "end": 9, "label": "AMOUNT"},
      {"start": 10, "end": 13, "label": "TOKEN"},
      {"start": 18, "end": 22, "label": "TOKEN2"}
    ],
    "intent": "Swap"
  },
  {
    "prompt": "swap 2500 USDC for ETH on Ethereum testnet",
    "entities": [
      {"start": 5, "end": 9, "label": "AMOUNT"},
      {"start": 10, "end": 14, "label": "TOKEN"},
      {"start": 19, "end": 22, "label": "TOKEN2"}
    ],
    "intent": "Swap"
  },
  {
    "prompt": "Bridge 0.0025 ETH on Ethereum to Base",
    "entities": [
      {"start": 7, "end": 13, "label": "AMOUNT"},
      {"start": 14, "end": 17, "label": "TOKEN"}
    ],
    "intent": "Bridge"
  },
  {
    "prompt": "bridge 0.005 USDC from Base to Optimism",
    "entities": [
      {"start": 7, "end": 12, "label": "AMOUNT"},
      {"start": 13, "end": 17, "label": "TOKEN"}
    ],
    "intent": "Bridge"
  },
  {
    "prompt": "Bridge 0.01 ETH on Ethereum mainnet to Base testnet",
    "entities": [
      {"start": 7, "end": 11, "label": "AMOUNT"},
      {"start": 12, "end": 15, "label": "TOKEN"}
    ],
    "intent": "Bridge"
  },
  {
    "prompt": "bridge 0.075 USDC from Optimism to Ethereum",
    "entities": [
      {"start": 7, "end": 12, "label": "AMOUNT"},
      {"start": 13, "end": 17, "label": "TOKEN"}
    ],
    "intent": "Bridge"
  },
  {
    "prompt": "Bridge 1.5 ETH on Base to Optimism mainnet",
    "entities": [
      {"start": 7, "end": 10, "label": "AMOUNT"},
      {"start": 11, "end": 14, "label": "TOKEN"}
    ],
    "intent": "Bridge"
  },
  {
    "prompt": "bridge 5.25 USDC from Ethereum testnet to Base",
    "entities": [
      {"start": 7, "end": 11, "label": "AMOUNT"},
      {"start": 12, "end": 16, "label": "TOKEN"}
    ],
    "intent": "Bridge"
  },
  {
    "prompt": "Bridge 25.75 ETH on Optimism to Ethereum",
    "entities": [
      {"start": 7, "end": 12, "label": "AMOUNT"},
      {"start": 13, "end": 16, "label": "TOKEN"}
    ],
    "intent": "Bridge"
  },
  {
    "prompt": "bridge 100 USDC from Base mainnet to Optimism testnet",
    "entities": [
      {"start": 7, "end": 10, "label": "AMOUNT"},
      {"start": 11, "end": 15, "label": "TOKEN"}
    ],
    "intent": "Bridge"
  },
  {
    "prompt": "Bridge 500 ETH on Ethereum to Base",
    "entities": [
      {"start": 7, "end": 10, "label": "AMOUNT"},
      {"start": 11, "end": 14, "label": "TOKEN"}
    ],
    "intent": "Bridge"
  },
  {
    "prompt": "bridge 1000 USDC from Optimism mainnet to Ethereum mainnet",
    "entities": [
      {"start": 7, "end": 11, "label": "AMOUNT"},
      {"start": 12, "end": 16, "label": "TOKEN"}
    ],
    "intent": "Bridge"
  },
  {
    "prompt": "Bridge 2500 ETH on Base testnet to Optimism",
    "entities": [
      {"start": 7, "end": 11, "label": "AMOUNT"},
      {"start": 12, "end": 15, "label": "TOKEN"}
    ],
    "intent": "Bridge"
  },
  {
    "prompt": "bridge 5000 USDC from Ethereum to Base testnet",
    "entities": [
      {"start": 7, "end": 11, "label": "AMOUNT"},
      {"start": 12, "end": 16, "label": "TOKEN"}
    ],
    "intent": "Bridge"
  },
  {
    "prompt": "Check balance",
    "entities": [
      {"start": 6, "end": 13, "label": "QUERY_TYPE"}
    ],
    "intent": "Query"
  },
  {
    "prompt": "get balance of ETH",
    "entities": [
      {"start": 4, "end": 11, "label": "QUERY_TYPE"}
    ],
    "intent": "Query"
  },
  {
    "prompt": "Query amount on Base",
    "entities": [
      {"start": 6, "end": 12, "label": "QUERY_TYPE"}
    ],
    "intent": "Query"
  },
  {
    "prompt": "show balance of USDC on Ethereum",
    "entities": [
      {"start": 5, "end": 12, "label": "QUERY_TYPE"}
    ],
    "intent": "Query"
  },
  {
    "prompt": "Check amount for Alice",
    "entities": [
      {"start": 6, "end": 12, "label": "QUERY_TYPE"}
    ],
    "intent": "Query"
  },
  {
    "prompt": "get balance of ETH for Bob",
    "entities": [
      {"start": 4, "end": 11, "label": "QUERY_TYPE"}
    ],
    "intent": "Query"
  },
  {
    "prompt": "Query balance for Charlie on Optimism",
    "entities": [
      {"start": 6, "end": 13, "label": "QUERY_TYPE"}
    ],
    "intent": "Query"
  },
  {
    "prompt": "show amount of USDC for David on Base mainnet",
    "entities": [
      {"start": 5, "end": 11, "label": "QUERY_TYPE"}
    ],
    "intent": "Query"
  },
  {
    "prompt": "check balance of ETH for Eve on Ethereum testnet",
    "entities": [
      {"start": 6, "end": 13, "label": "QUERY_TYPE"}
    ],
    "intent": "Query"
  },
  {
    "prompt": "Get amount for Frank on Optimism mainnet",
    "entities": [
      {"start": 4, "end": 10, "label": "QUERY_TYPE"}
    ],
    "intent": "Query"
  },
  {
    "prompt": "Transfer 0.0035 ETH to Alice and swap 0.025 USDC for ETH",
    "entities": [],
    "intent": "Multi"
  },
  {
    "prompt": "Send 1.5 USDC to Bob and bridge 0.5 ETH from Base to Ethereum",
    "entities": [],
    "intent": "Multi"
  },
  {
    "prompt": "Bridge 5.25 ETH on Optimism to Base and swap 10.5 USDC for ETH",
    "entities": [],
    "intent": "Multi"
  },
  {
    "prompt": "Check balance and transfer 25 ETH to Charlie",
    "entities": [],
    "intent": "Multi"
  },
  {
    "prompt": "Swap 50.25 USDC for ETH and bridge 0.075 ETH from Ethereum to Optimism",
    "entities": [],
    "intent": "Multi"
  },
  {
    "prompt": "Transfer 0.0001 ETH to 0x742d35Cc6648C2532C4B3A09c7eAd0c6 on Ethereum",
    "entities": [
      {"start": 9, "end": 15, "label": "AMOUNT"},
      {"start": 16, "end": 19, "label": "TOKEN"},
      {"start": 23, "end": 65, "label": "ADDRESS"}
    ],
    "intent": "Transfer"
  },
  {
    "prompt": "send 0.0005 USDC to David",
    "entities": [
      {"start": 5, "end": 11, "label": "AMOUNT"},
      {"start": 12, "end": 16, "label": "TOKEN"},
      {"start": 20, "end": 25, "label": "RECIPIENT"}
    ],
    "intent": "Transfer"
  },
  {
    "prompt": "Move 0.015 ETH to Eve on Base",
    "entities": [
      {"start": 5, "end": 10, "label": "AMOUNT"},
      {"start": 11, "end": 14, "label": "TOKEN"},
      {"start": 18, "end": 21, "label": "RECIPIENT"}
    ],
    "intent": "Transfer"
  },
  {
    "prompt": "Transfer 0.035 USDC to 0x90889C14149Bf930B6824789431B8479aaB8e5ee on Optimism testnet",
    "entities": [
      {"start": 9, "end": 14, "label": "AMOUNT"},
      {"start": 15, "end": 19, "label": "TOKEN"},
      {"start": 23, "end": 65, "label": "ADDRESS"}
    ],
    "intent": "Transfer"
  },
  {
    "prompt": "Send 0.125 ETH to Frank",
    "entities": [
      {"start": 5, "end": 10, "label": "AMOUNT"},
      {"start": 11, "end": 14, "label": "TOKEN"},
      {"start": 18, "end": 23, "label": "RECIPIENT"}
    ],
    "intent": "Transfer"
  },
  {
    "prompt": "transfer 0.375 USDC to Grace on Ethereum mainnet",
    "entities": [
      {"start": 9, "end": 14, "label": "AMOUNT"},
      {"start": 15, "end": 19, "label": "TOKEN"},
      {"start": 23, "end": 28, "label": "RECIPIENT"}
    ],
    "intent": "Transfer"
  },
  {
    "prompt": "Move 3.33 ETH to Henry on Base testnet",
    "entities": [
      {"start": 5, "end": 9, "label": "AMOUNT"},
      {"start": 10, "end": 13, "label": "TOKEN"},
      {"start": 17, "end": 22, "label": "RECIPIENT"}
    ],
    "intent": "Transfer"
  },
  {
    "prompt": "Send 12.45 USDC to 0x1234567890123456789012345678901234567890",
    "entities": [
      {"start": 5, "end": 10, "label": "AMOUNT"},
      {"start": 11, "end": 15, "label": "TOKEN"},
      {"start": 19, "end": 61, "label": "ADDRESS"}
    ],
    "intent": "Transfer"
  },
  {
    "prompt": "Transfer 66.66 ETH to Isabella on Optimism",
    "entities": [
      {"start": 9, "end": 14, "label": "AMOUNT"},
      {"start": 15, "end": 18, "label": "TOKEN"},
      {"start": 22, "end": 30, "label": "RECIPIENT"}
    ],
    "intent": "Transfer"
  },
  {
    "prompt": "send 225 USDC to Jack",
    "entities": [
      {"start": 5, "end": 8, "label": "AMOUNT"},
      {"start": 9, "end": 13, "label": "TOKEN"},
      {"start": 17, "end": 21, "label": "RECIPIENT"}
    ],
    "intent": "Transfer"
  },
  {
    "prompt": "Move 1250 ETH to Kate on Ethereum",
    "entities": [
      {"start": 5, "end": 9, "label": "AMOUNT"},
      {"start": 10, "end": 13, "label": "TOKEN"},
      {"start": 17, "end": 21, "label": "RECIPIENT"}
    ],
    "intent": "Transfer"
  },
  {
    "prompt": "Transfer 3500 USDC to 0xAbCdEf1234567890AbCdEf1234567890AbCdEf12 on Base mainnet",
    "entities": [
      {"start": 9, "end": 13, "label": "AMOUNT"},
      {"start": 14, "end": 18, "label": "TOKEN"},
      {"start": 22, "end": 64, "label": "ADDRESS"}
    ],
    "intent": "Transfer"
  },
  {
    "prompt": "Swap 0.0001 ETH for USDC",
    "entities": [
      {"start": 5, "end": 11, "label": "AMOUNT"},
      {"start": 12, "end": 15, "label": "TOKEN"},
      {"start": 20, "end": 24, "label": "TOKEN2"}
    ],
    "intent": "Swap"
  },
  {
    "prompt": "swap 0.0075 USDC for ETH on Base mainnet",
    "entities": [
      {"start": 5, "end": 11, "label": "AMOUNT"},
      {"start": 12, "end": 16, "label": "TOKEN"},
      {"start": 21, "end": 24, "label": "TOKEN2"}
    ],
    "intent": "Swap"
  },
  {
    "prompt": "Swap 0.035 ETH for USDC on Ethereum testnet",
    "entities": [
      {"start": 5, "end": 10, "label": "AMOUNT"},
      {"start": 11, "end": 14, "label": "TOKEN"},
      {"start": 19, "end": 23, "label": "TOKEN2"}
    ],
    "intent": "Swap"
  },
  {
    "prompt": "swap 0.125 USDC for ETH on Optimism",
    "entities": [
      {"start": 5, "end": 10, "label": "AMOUNT"},
      {"start": 11, "end": 15, "label": "TOKEN"},
      {"start": 20, "end": 23, "label": "TOKEN2"}
    ],
    "intent": "Swap"
  },
  {
    "prompt": "Swap 3.33 ETH for USDC",
    "entities": [
      {"start": 5, "end": 9, "label": "AMOUNT"},
      {"start": 10, "end": 13, "label": "TOKEN"},
      {"start": 18, "end": 22, "label": "TOKEN2"}
    ],
    "intent": "Swap"
  },
  {
    "prompt": "swap 12.45 USDC for ETH on Base",
    "entities": [
      {"start": 5, "end": 10, "label": "AMOUNT"},
      {"start": 11, "end": 15, "label": "TOKEN"},
      {"start": 20, "end": 23, "label": "TOKEN2"}
    ],
    "intent": "Swap"
  },
  {
    "prompt": "Swap 66.66 ETH for USDC on Ethereum mainnet",
    "entities": [
      {"start": 5, "end": 10, "label": "AMOUNT"},
      {"start": 11, "end": 14, "label": "TOKEN"},
      {"start": 19, "end": 23, "label": "TOKEN2"}
    ],
    "intent": "Swap"
  },
  {
    "prompt": "swap 175 USDC for ETH on Optimism testnet",
    "entities": [
      {"start": 5, "end": 8, "label": "AMOUNT"},
      {"start": 9, "end": 13, "label": "TOKEN"},
      {"start": 18, "end": 21, "label": "TOKEN2"}
    ],
    "intent": "Swap"
  },
  {
    "prompt": "Swap 750 ETH for USDC",
    "entities": [
      {"start": 5, "end": 8, "label": "AMOUNT"},
      {"start": 9, "end": 12, "label": "TOKEN"},
      {"start": 17, "end": 21, "label": "TOKEN2"}
    ],
    "intent": "Swap"
  },
  {
    "prompt": "swap 3500 USDC for ETH on Base testnet",
    "entities": [
      {"start": 5, "end": 9, "label": "AMOUNT"},
      {"start": 10, "end": 14, "label": "TOKEN"},
      {"start": 19, "end": 22, "label": "TOKEN2"}
    ],
    "intent": "Swap"
  },
  {
    "prompt": "Bridge 0.0001 ETH from Base to Optimism",
    "entities": [
      {"start": 7, "end": 13, "label": "AMOUNT"},
      {"start": 14, "end": 17, "label": "TOKEN"}
    ],
    "intent": "Bridge"
  },
  {
    "prompt": "bridge 0.0035 USDC on Ethereum mainnet to Base testnet",
    "entities": [
      {"start": 7, "end": 13, "label": "AMOUNT"},
      {"start": 14, "end": 18, "label": "TOKEN"}
    ],
    "intent": "Bridge"
  },
  {
    "prompt": "Bridge 0.015 ETH from Optimism to Ethereum",
    "entities": [
      {"start": 7, "end": 12, "label": "AMOUNT"},
      {"start": 13, "end": 16, "label": "TOKEN"}
    ],
    "intent": "Bridge"
  },
  {
    "prompt": "bridge 0.065 USDC on Base testnet to Optimism mainnet",
    "entities": [
      {"start": 7, "end": 12, "label": "AMOUNT"},
      {"start": 13, "end": 17, "label": "TOKEN"}
    ],
    "intent": "Bridge"
  },
  {
    "prompt": "Bridge 0.375 ETH from Ethereum to Base",
    "entities": [
      {"start": 7, "end": 12, "label": "AMOUNT"},
      {"start": 13, "end": 16, "label": "TOKEN"}
    ],
    "intent": "Bridge"
  },
  {
    "prompt": "bridge 7.25 USDC on Optimism mainnet to Ethereum testnet",
    "entities": [
      {"start": 7, "end": 11, "label": "AMOUNT"},
      {"start": 12, "end": 16, "label": "TOKEN"}
    ],
    "intent": "Bridge"
  },
  {
    "prompt": "Bridge 15.75 ETH from Base to Optimism",
    "entities": [
      {"start": 7, "end": 12, "label": "AMOUNT"},
      {"start": 13, "end": 16, "label": "TOKEN"}
    ],
    "intent": "Bridge"
  },
  {
    "prompt": "bridge 33.33 USDC on Ethereum to Base mainnet",
    "entities": [
      {"start": 7, "end": 12, "label": "AMOUNT"},
      {"start": 13, "end": 17, "label": "TOKEN"}
    ],
    "intent": "Bridge"
  },
  {
    "prompt": "Bridge 88.88 ETH from Optimism testnet to Ethereum",
    "entities": [
      {"start": 7, "end": 12, "label": "AMOUNT"},
      {"start": 13, "end": 16, "label": "TOKEN"}
    ],
    "intent": "Bridge"
  },
  {
    "prompt": "bridge 350 USDC on Base to Optimism testnet",
    "entities": [
      {"start": 7, "end": 10, "label": "AMOUNT"},
      {"start": 11, "end": 15, "label": "TOKEN"}
    ],
    "intent": "Bridge"
  },
  {
    "prompt": "Bridge 1250 ETH from Ethereum mainnet to Base",
    "entities": [
      {"start": 7, "end": 11, "label": "AMOUNT"},
      {"start": 12, "end": 15, "label": "TOKEN"}
    ],
    "intent": "Bridge"
  },
  {
    "prompt": "bridge 7500 USDC on Optimism to Ethereum mainnet",
    "entities": [
      {"start": 7, "end": 11, "label": "AMOUNT"},
      {"start": 12, "end": 16, "label": "TOKEN"}
    ],
    "intent": "Bridge"
  },
  {
    "prompt": "Bridge 25000 ETH from Base testnet to Optimism",
    "entities": [
      {"start": 7, "end": 12, "label": "AMOUNT"},
      {"start": 13, "end": 16, "label": "TOKEN"}
    ],
    "intent": "Bridge"
  },
  {
    "prompt": "check amount of ETH",
    "entities": [
      {"start": 6, "end": 12, "label": "QUERY_TYPE"}
    ],
    "intent": "Query"
  },
  {
    "prompt": "Get balance on Optimism",
    "entities": [
      {"start": 4, "end": 11, "label": "QUERY_TYPE"}
    ],
    "intent": "Query"
  },
  {
    "prompt": "query amount of USDC on Base mainnet",
    "entities": [
      {"start": 6, "end": 12, "label": "QUERY_TYPE"}
    ],
    "intent": "Query"
  },
  {
    "prompt": "Show balance for Liam on Ethereum testnet",
    "entities": [
      {"start": 5, "end": 12, "label": "QUERY_TYPE"}
    ],
    "intent": "Query"
  },
  {
    "prompt": "check amount of ETH for Mia",
    "entities": [
      {"start": 6, "end": 12, "label": "QUERY_TYPE"}
    ],
    "intent": "Query"
  },
  {
    "prompt": "Get balance of USDC for Noah on Optimism",
    "entities": [
      {"start": 4, "end": 11, "label": "QUERY_TYPE"}
    ],
    "intent": "Query"
  },
  {
    "prompt": "query balance for Olivia on Base testnet",
    "entities": [
      {"start": 6, "end": 13, "label": "QUERY_TYPE"}
    ],
    "intent": "Query"
  },
  {
    "prompt": "Show amount of ETH for Peter on Ethereum mainnet",
    "entities": [
      {"start": 5, "end": 11, "label": "QUERY_TYPE"}
    ],
    "intent": "Query"
  },
  {
    "prompt": "check balance of USDC for Alice on Optimism testnet",
    "entities": [
      {"start": 6, "end": 13, "label": "QUERY_TYPE"}
    ],
    "intent": "Query"
  },
  {
    "prompt": "Get amount for Bob",
    "entities": [
      {"start": 4, "end": 10, "label": "QUERY_TYPE"}
    ],
    "intent": "Query"
  },
  {
    "prompt": "query balance on Base",
    "entities": [
      {"start": 6, "end": 13, "label": "QUERY_TYPE"}
    ],
    "intent": "Query"
  },
  {
    "prompt": "Show balance of ETH on Ethereum",
    "entities": [
      {"start": 5, "end": 12, "label": "QUERY_TYPE"}
    ],
    "intent": "Query"
  },
  {
    "prompt": "check amount for Charlie",
    "entities": [
      {"start": 6, "end": 12, "label": "QUERY_TYPE"}
    ],
    "intent": "Query"
  },
  {
    "prompt": "Get balance of USDC",
    "entities": [
      {"start": 4, "end": 11, "label": "QUERY_TYPE"}
    ],
    "intent": "Query"
  },
  {
    "prompt": "Transfer 0.0045 ETH to David and swap 0.095 USDC for ETH",
    "entities": [],
    "intent": "Multi"
  },
  {
    "prompt": "Send 2.75 USDC to Eve and bridge 0.25 ETH from Ethereum to Base",
    "entities": [],
    "intent": "Multi"
  },
  {
    "prompt": "Bridge 10.5 ETH on Base to Optimism and swap 25.25 USDC for ETH",
    "entities": [],
    "intent": "Multi"
  },
  {
    "prompt": "Check balance of ETH and transfer 50 ETH to Frank",
    "entities": [],
    "intent": "Multi"
  },
  {
    "prompt": "Swap 99.99 USDC for ETH and bridge 0.375 ETH from Optimism to Ethereum",
    "entities": [],
    "intent": "Multi"
  },
  {
    "prompt": "Transfer 0.0085 ETH to Grace and check balance",
    "entities": [],
    "intent": "Multi"
  },
  {
    "prompt": "Bridge 250.5 USDC from Base mainnet to Optimism testnet and swap 15.75 ETH for USDC",
    "entities": [],
    "intent": "Multi"
  },
  {
    "prompt": "Get balance for Henry and bridge 500 ETH on Ethereum to Base",
    "entities": [],
    "intent": "Multi"
  },
  {
    "prompt": "Swap 1250 USDC for ETH and transfer 0.055 ETH to Isabella",
    "entities": [],
    "intent": "Multi"
  },
  {
    "prompt": "Transfer 0.0095 ETH to Jack and bridge 7.25 USDC from Optimism mainnet to Ethereum testnet",
    "entities": [],
    "intent": "Multi"
  },
  {
    "prompt": "Check amount of USDC and swap 3.33 ETH for USDC",
    "entities": [],
    "intent": "Multi"
  },
  {
    "prompt": "Bridge 88.88 ETH on Base testnet to Optimism and check balance for Kate",
    "entities": [],
    "intent": "Multi"
  },
  {
    "prompt": "Transfer 0.065 USDC to 0x9876543210987654321098765432109876543210 and swap 12.45 ETH for USDC",
    "entities": [],
    "intent": "Multi"
  },
  {
    "prompt": "Swap 66.66 USDC for ETH and check balance on Ethereum mainnet",
    "entities": [],
    "intent": "Multi"
  },
  {
    "prompt": "Bridge 175 ETH from Ethereum to Base and transfer 0.125 USDC to Liam",
    "entities": [],
    "intent": "Multi"
  },
  {
    "prompt": "send 0.0015 ETH to Mia on Base mainnet",
    "entities": [
      {"start": 5, "end": 11, "label": "AMOUNT"},
      {"start": 12, "end": 15, "label": "TOKEN"},
      {"start": 19, "end": 22, "label": "RECIPIENT"}
    ],
    "intent": "Transfer"
  },
  {
    "prompt": "Move 0.0055 USDC to Noah",
    "entities": [
      {"start": 5, "end": 11, "label": "AMOUNT"},
      {"start": 12, "end": 16, "label": "TOKEN"},
      {"start": 20, "end": 24, "label": "RECIPIENT"}
    ],
    "intent": "Transfer"
  },
  {
    "prompt": "Transfer 0.0085 ETH to 0xFfFfFfFfFfFfFfFfFfFfFfFfFfFfFfFfFfFfFfFf on Optimism",
    "entities": [
      {"start": 9, "end": 15, "label": "AMOUNT"},
      {"start": 16, "end": 19, "label": "TOKEN"},
      {"start": 23, "end": 65, "label": "ADDRESS"}
    ],
    "intent": "Transfer"
  },
  {
    "prompt": "Send 0.045 USDC to Olivia on Ethereum testnet",
    "entities": [
      {"start": 5, "end": 10, "label": "AMOUNT"},
      {"start": 11, "end": 15, "label": "TOKEN"},
      {"start": 19, "end": 25, "label": "RECIPIENT"}
    ],
    "intent": "Transfer"
  },
  {
    "prompt": "transfer 0.095 ETH to Peter",
    "entities": [
      {"start": 9, "end": 14, "label": "AMOUNT"},
      {"start": 15, "end": 18, "label": "TOKEN"},
      {"start": 22, "end": 27, "label": "RECIPIENT"}
    ],
    "intent": "Transfer"
  },
  {
    "prompt": "Move 7.77 USDC to Alice on Base testnet",
    "entities": [
      {"start": 5, "end": 9, "label": "AMOUNT"},
      {"start": 10, "end": 14, "label": "TOKEN"},
      {"start": 18, "end": 23, "label": "RECIPIENT"}
    ],
    "intent": "Transfer"
  },
  {
    "prompt": "Send 33.33 ETH to 0x0000000000000000000000000000000000000000",
    "entities": [
      {"start": 5, "end": 10, "label": "AMOUNT"},
      {"start": 11, "end": 14, "label": "TOKEN"},
      {"start": 18, "end": 60, "label": "ADDRESS"}
    ],
    "intent": "Transfer"
  },
  {
    "prompt": "Transfer 88.88 USDC to Bob on Optimism mainnet",
    "entities": [
      {"start": 9, "end": 14, "label": "AMOUNT"},
      {"start": 15, "end": 19, "label": "TOKEN"},
      {"start": 23, "end": 26, "label": "RECIPIENT"}
    ],
    "intent": "Transfer"
  },
  {
    "prompt": "send 350 ETH to Charlie on Ethereum",
    "entities": [
      {"start": 5, "end": 8, "label": "AMOUNT"},
      {"start": 9, "end": 12, "label": "TOKEN"},
      {"start": 16, "end": 23, "label": "RECIPIENT"}
    ],
    "intent": "Transfer"
  },
  {
    "prompt": "Move 7500 USDC to 0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef on Base",
    "entities": [
      {"start": 5, "end": 9, "label": "AMOUNT"},
      {"start": 10, "end": 14, "label": "TOKEN"},
      {"start": 18, "end": 58, "label": "ADDRESS"}
    ],
    "intent": "Transfer"
  },
  {
    "prompt": "Swap 0.0015 ETH for USDC on Optimism testnet",
    "entities": [
      {"start": 5, "end": 11, "label": "AMOUNT"},
      {"start": 12, "end": 15, "label": "TOKEN"},
      {"start": 20, "end": 24, "label": "TOKEN2"}
    ],
    "intent": "Swap"
  },
  {
    "prompt": "swap 0.0095 USDC for ETH",
    "entities": [
      {"start": 5, "end": 11, "label": "AMOUNT"},
      {"start": 12, "end": 16, "label": "TOKEN"},
      {"start": 21, "end": 24, "label": "TOKEN2"}
    ],
    "intent": "Swap"
  },
  {
    "prompt": "Swap 0.055 ETH for USDC on Base",
    "entities": [
      {"start": 5, "end": 10, "label": "AMOUNT"},
      {"start": 11, "end": 14, "label": "TOKEN"},
      {"start": 19, "end": 23, "label": "TOKEN2"}
    ],
    "intent": "Swap"
  },
  {
    "prompt": "swap 0.085 USDC for ETH on Ethereum mainnet",
    "entities": [
      {"start": 5, "end": 10, "label": "AMOUNT"},
      {"start": 11, "end": 15, "label": "TOKEN"},
      {"start": 20, "end": 23, "label": "TOKEN2"}
    ],
    "intent": "Swap"
  },
  {
    "prompt": "Swap 7.77 ETH for USDC on Optimism",
    "entities": [
      {"start": 5, "end": 9, "label": "AMOUNT"},
      {"start": 10, "end": 13, "label": "TOKEN"},
      {"start": 18, "end": 22, "label": "TOKEN2"}
    ],
    "intent": "Swap"
  },
  {
    "prompt": "swap 33.33 USDC for ETH on Base mainnet",
    "entities": [
      {"start": 5, "end": 10, "label": "AMOUNT"},
      {"start": 11, "end": 15, "label": "TOKEN"},
      {"start": 20, "end": 23, "label": "TOKEN2"}
    ],
    "intent": "Swap"
  },
  {
    "prompt": "Swap 88.88 ETH for USDC",
    "entities": [
      {"start": 5, "end": 10, "label": "AMOUNT"},
      {"start": 11, "end": 14, "label": "TOKEN"},
      {"start": 19, "end": 23, "label": "TOKEN2"}
    ],
    "intent": "Swap"
  },
  {
    "prompt": "swap 350 USDC for ETH on Ethereum testnet",
    "entities": [
      {"start": 5, "end": 8, "label": "AMOUNT"},
      {"start": 9, "end": 13, "label": "TOKEN"},
      {"start": 18, "end": 21, "label": "TOKEN2"}
    ],
    "intent": "Swap"
  },
  {
    "prompt": "Swap 1250 ETH for USDC on Optimism mainnet",
    "entities": [
      {"start": 5, "end": 9, "label": "AMOUNT"},
      {"start": 10, "end": 13, "label": "TOKEN"},
      {"start": 18, "end": 22, "label": "TOKEN2"}
    ],
    "intent": "Swap"
  },
  {
    "prompt": "swap 7500 USDC for ETH",
    "entities": [
      {"start": 5, "end": 9, "label": "AMOUNT"},
      {"start": 10, "end": 14, "label": "TOKEN"},
      {"start": 19, "end": 22, "label": "TOKEN2"}
    ],
    "intent": "Swap"
  }
]
# Append new data to existing data
existing_data.extend(new_data)

# Save updated data
with open("/home/oxunavailable/HAi Wallet/NLP/train_data.json", "w") as f:
    json.dump(existing_data, f, indent=2)