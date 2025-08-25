# HAi Wallet
 HAI Wallet is an NLP powered cryptocurrency wallet that abstracts the complexities in performing transactions such as transferring, bridging, swapping 
 
 # Why did I do this ?
 It all started with MCP, I was really intrigued when I saw claude's functionality could be extended with MCP, essentially i saw it as APIs claude could call to perform actions its base model couldn't do, then I was like this looks nice, then I came across a Relay Protocol MCP Integration by Waren Gonzaga, then I tried building a wallet around this then i hit a road block
turns out Claude sends message via stdin/stdout and i needed to build a wallet a web app and that communicates via HTTP, I went about looking for ways to convert stdin/stdout to http responses
I found how to do it but damn, the complexity was already compiling, this was supposed to be for fun
then i decided to just leverage an LLM via Openrouter, the initial idea was a wallet whereby you prompt, just like ChatGPT and Grok then transactions will be performed
so I used an LLM to parse a prompt "Send 100 usdc to Bob"
The LLM was able to breakdown the prompt into its individual components
After 19 API KEYS I REALIZED 
1. AN LLM IS OVER KILL
2. LLM RESPONSES WERE NOT CONSISTENT 
3. 19 API KEYS WERE ENOUGH 

After much delibration, then it hit me how are computers able to understand human text and all
NLP
SO I devised a plan to create an NLP powered wallet where by sending tokens can be as done easily as  "Send 100 ETH to 0x......"
To create this i needed to create my own model and I used Spacy for that (very light weight stuff)
Pretrained it with some existing prompts
 then performed annotations on the data
 A user prompt falls within the following intent categories (SWAP/TRANSFER/BRDIGE)
 Synonymn for Swap was also put in place
 so what it does to a user prompt is 
 Take this prompt for example "Send 0.001 ETH to 0X....."
 This prompt is very vague
 the model is adequately trained enough to realize 
 Sender --- is the active user address
 Receiver is ---- 0X.....
 Token Amount is -- 0.001
 Token Network not specified

 An example of a well formed prompt is in this format
 INTENT + TOKEN AMOUNT + DESTINATION + TOKEN NETWORK
 ie
 SEND 0.00012 ETH TO 0x.... on Base

 ITS JUST FOR PLAYING AROUND, I USED THE RELAY PROTOCOL API FOR THE BLOVKCHAIN TRANSACTIONS
 Upon Signup a persistent wallet address is created from your email address, so you will always have the same wallet address if you login with the same email

 # FEATURES
 1. Wallet addresses can be saved with easy to remember names such as bob so this "SEND 0.00012 ETH TO 0x.... on Base" can be turned to  "SEND 0.00012 ETH TO Bob on Base"
 2. Wallet Balance check across supported networks (BASE, SEPOLIA, OPTIMISM)
 3. Error message when sending to an invalid address
 4. Can be installed as a PWA as well

 # NOTE
 NO ACTUAL FUNDS ARE BEING USED ITS ALL ON TESTNET 
 The wallet is limited, can perform transfers, bridging and swaps, testnet capabilities are limited cause of little liquidty in testnet pools

 # VISIT
- The deployed service here `https://hai-wallet-ui.onrender.com`
