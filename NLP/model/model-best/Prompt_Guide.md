# HAi Wallet NLP Prompt Guide

## Overview
This guide provides the exact rules for creating prompts that will be correctly parsed by the HAi Wallet NLP system. The system recognizes four main intents: Transfer, Swap, Bridge, and Query.

## Supported Networks
- **Ethereum** (mainnet/testnet)
- **Base** (mainnet/testnet)
- **Arbitrum** (mainnet/testnet)

## Supported Tokens
- **ETH**
- **USDC**
- **USDT**

---

## Intent Types and Rules

### 1. TRANSFER Intent

**Trigger Words:** `send`, `transfer`, `move`

**Required Parameters:**
- Amount and token (e.g., "100 ETH")
- Recipient (name or address)

**Optional Parameters:**
- Network specification

**Format Rules:**
```
[TRIGGER] [AMOUNT] [TOKEN] to [RECIPIENT] (on [NETWORK])
```

**Examples:**
```
✅ Send 50 USDC to Alice
✅ Transfer 100 ETH to 0x742d35Cc6648C2532C4B3A09c7eAd0c6
✅ Move 25 USDT to Bob on Ethereum
✅ Send 10 ETH to Charlie on Base mainnet
```

**Parameter Extraction:**
- `intent`: "Transfer"
- `from`: "User"
- `to`: [recipient name or address]
- `source_network`: [specified network or null]
- `dest_network`: [same as source_network]
- `tokens`: [{"amount": "X", "token": "Y"}]

---

### 2. SWAP Intent

**Trigger Words:** `swap`

**Required Parameters:**
- Source token with amount
- Destination token

**Optional Parameters:**
- Network specification

**Format Rules:**
```
Swap [AMOUNT] [TOKEN1] for [TOKEN2] (on [NETWORK])
```

**Examples:**
```
✅ Swap 100 ETH for USDC
✅ Swap 50 USDC for ETH on Base
✅ Swap 25 USDT for USDC on Ethereum mainnet
```

**Parameter Extraction:**
- `intent`: "Swap"
- `from`: "User"
- `to`: "User" (always - user receives swapped tokens)
- `source_network`: [specified network or null]
- `dest_network`: [same as source_network]
- `tokens`: [{"amount": "X", "token": "SOURCE_TOKEN"}, {"amount": null, "token": "DEST_TOKEN"}]
- `token2`: [destination token]

**Important Notes:**
- The `to` field is ALWAYS "User" for swaps
- Do NOT use recipient names in swap commands
- Source and destination networks are the same for swaps

---

### 3. BRIDGE Intent

**Trigger Words:** `bridge`

**Required Parameters:**
- Amount and token
- Source network (using "on" or "from")
- Destination network (using "to")

**Format Rules:**
```
Bridge [AMOUNT] [TOKEN] (on|from) [SOURCE_NETWORK] to [DEST_NETWORK]
```

**Examples:**
```
✅ Bridge 100 ETH on Ethereum to Base
✅ Bridge 50 USDC from Base to Arbitrum
✅ Bridge 25 USDT on Ethereum mainnet to Base testnet
```

**Parameter Extraction:**
- `intent`: "Bridge"
- `from`: "User"
- `to`: "User" (always - user receives bridged tokens)
- `source_network`: [source network]
- `dest_network`: [destination network]
- `tokens`: [{"amount": "X", "token": "Y"}]

**Important Notes:**
- The `to` field is ALWAYS "User" for bridges
- Source and destination networks should be different
- Use "on" or "from" to specify source network
- Use "to" to specify destination network

---

### 4. QUERY Intent

**Trigger Words:** `check`, `get`, `query`, `show`

**Required Parameters:**
- Query type ("balance" or "amount")

**Optional Parameters:**
- Token specification
- Network specification
- Recipient/address

**Format Rules:**
```
[TRIGGER] [QUERY_TYPE] (of [TOKEN]) (for [RECIPIENT]) (on [NETWORK])
```

**Examples:**
```
✅ Check balance
✅ Get balance of ETH
✅ Show amount of USDC for Alice
✅ Query balance on Ethereum
✅ Check balance of ETH for 0x742d35Cc6648C2532C4B3A09c7eAd0c6 on Base
```

**Parameter Extraction:**
- `intent`: "Query"
- `from`: "User"
- `to`: [recipient/address or null]
- `source_network`: [specified network or null]
- `dest_network`: [same as source_network]
- `tokens`: [token specifications if provided]
- `query_type`: [balance/amount]

---

## Multi-Intent Commands

The system can handle multiple intents in a single prompt by detecting multiple trigger words.

**Example:**
```
✅ Transfer 50 ETH to Alice and swap 100 USDC for ETH
```

**Result:**
- `intent`: "Multi"
- `parameters.intent_count`: 2
- `parameters.intents`: [array of individual intent objects]

---

## Common Patterns and Keywords

### Network Specification
- **Source Network:** "on [NETWORK]", "from [NETWORK]"
- **Destination Network:** "to [NETWORK]"

### Recipient Specification
- **Names:** "to Alice", "for Bob"
- **Addresses:** "to 0x742d35Cc6648C2532C4B3A09c7eAd0c6"

### Token and Amount
- **With Amount:** "100 ETH", "50 USDC", "25 USDT"
- **Token Only:** "ETH", "USDC", "USDT"

### Query Types
- **Supported:** "balance", "amount"

---

## Best Practices

### ✅ DO:
- Use exact trigger words (send, transfer, move, swap, bridge, check, get, query, show)
- Specify amounts with tokens (e.g., "100 ETH")
- Use clear network specifications ("on Ethereum", "to Base")
- Use "to" for recipients in transfers
- Use "for" for destination tokens in swaps
- Keep commands clear and unambiguous

### ❌ DON'T:
- Mix recipient names with token names in swaps/bridges
- Use ambiguous prepositions
- Omit required parameters
- Use unsupported tokens or networks
- Create overly complex nested commands

---

## Troubleshooting Common Issues

### Issue: Swap shows recipient instead of "User"
**Problem:** Using "to" instead of "for" with destination token
```
❌ Swap 100 ETH to USDC  # "USDC" becomes recipient
✅ Swap 100 ETH for USDC  # Correctly parsed
```

### Issue: Bridge missing source network
**Problem:** Not using "on" or "from" for source network
```
❌ Bridge 100 ETH Ethereum to Base  # Source network missed
✅ Bridge 100 ETH on Ethereum to Base  # Correctly parsed
```

### Issue: Transfer missing recipient
**Problem:** All transfers need a recipient
```
❌ Transfer 100 ETH  # No recipient specified
✅ Transfer 100 ETH to Alice  # Correctly parsed
```

### Issue: Query not recognized
**Problem:** Missing query type keywords
```
❌ ETH balance  # No trigger word
✅ Check ETH balance  # Correctly parsed
```

---

## Parameter Summary by Intent

| Intent | from | to | source_network | dest_network | tokens | token2 | query_type |
|--------|------|----|--------------|--------------|---------| -------|------------|
| Transfer | "User" | [recipient] | [network] | [same as source] | [amount+token] | null | null |
| Swap | "User" | "User" | [network] | [same as source] | [source+dest tokens] | [dest token] | null |
| Bridge | "User" | "User" | [source network] | [dest network] | [amount+token] | null | null |
| Query | "User" | [recipient/null] | [network] | [same as source] | [tokens if specified] | null | [balance/amount] |

---

## Example Command Templates

### Transfer Templates
```
Send [AMOUNT] [TOKEN] to [RECIPIENT]
Transfer [AMOUNT] [TOKEN] to [RECIPIENT] on [NETWORK]
Move [AMOUNT] [TOKEN] to [ADDRESS]
```

### Swap Templates
```
Swap [AMOUNT] [TOKEN1] for [TOKEN2]
Swap [AMOUNT] [TOKEN1] for [TOKEN2] on [NETWORK]
```

### Bridge Templates
```
Bridge [AMOUNT] [TOKEN] on [SOURCE_NETWORK] to [DEST_NETWORK]
Bridge [AMOUNT] [TOKEN] from [SOURCE_NETWORK] to [DEST_NETWORK]
```

### Query Templates
```
Check balance
Get balance of [TOKEN]
Show balance for [RECIPIENT]
Query balance of [TOKEN] on [NETWORK]
Check amount of [TOKEN] for [RECIPIENT] on [NETWORK]
```