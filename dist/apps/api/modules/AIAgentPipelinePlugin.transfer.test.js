"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AIAgentPipelinePlugin_1 = require("./AIAgentPipelinePlugin");
const TransferAPIPlugin_1 = require("./TransferAPIPlugin");
const SUPPORTED_NETWORKS = {
    'Ethereum': 1,
    'Optimism': 10,
    'Arbitrum': 42161,
};
const testContext = {
    userId: 'test-user',
    wallets: [
        {
            address: '0xa11B86d8cb6D0E9C8cD84d50260E910789194915',
            label: 'My Main Wallet',
            network: 'Ethereum',
            tokens: ['ETH', 'USDC', 'WETH', 'USDT']
        }
    ],
    contacts: [
        { name: 'Bob', address: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC', network: 'Ethereum' },
        { name: 'Alice', address: '0x90F79bf6EB2c4f870365E785982E1f101E93b906', network: 'Ethereum' },
        { name: 'Charlie', address: '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65', network: 'Optimism' },
        { name: 'Diana', address: '0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc', network: 'Arbitrum' }
    ]
};
const testPrompts = [
    'Transfer 0.001 ETH to Bob on Ethereum',
    'Send 50 USDC to 0x1234567890123456789012345678901234567890 on Ethereum',
    'Transfer 0.002 ETH to Charlie on Optimism',
    'Send 100 USDT to Alice on Ethereum mainnet',
    'Transfer 0.005 ETH to Diana on Arbitrum'
];
function normalizeTransferParams(params) {
    return {
        ...params,
        amount: params.amount || params.quantity || params.value,
        token: params.token || params.fromToken || params.currency,
        recipient: params.recipient || params.toAddress || params.destination,
        network: params.network || 'Ethereum',
        walletAddress: params.walletAddress || params.wallet_address || params.sender_wallet,
    };
}
async function runTransferTests() {
    const infuraKey = process.env.INFURA_API_KEY || '';
    for (const prompt of testPrompts) {
        console.log(`\n---\nPrompt: ${prompt}`);
        // Step 1: Intent Recognition
        const intent = await (0, AIAgentPipelinePlugin_1.recognizeIntent)(prompt, testContext);
        console.log('Intent Recognition Result:', JSON.stringify(intent, null, 2));
        if (intent.type !== 'transfer') {
            console.log('Skipping: Not a transfer intent');
            continue;
        }
        // Step 2: Parameter Extraction
        let params = await (0, AIAgentPipelinePlugin_1.extractParameters)(prompt, intent, testContext);
        params = normalizeTransferParams(params);
        console.log('Parameter Extraction Result:', JSON.stringify(params, null, 2));
        // Step 3: Parameter Validation and Enrichment
        const enrichedParams = await (0, AIAgentPipelinePlugin_1.validateAndEnrich)(params, prompt, intent, testContext);
        console.log('Enriched Parameters:', JSON.stringify(enrichedParams, null, 2));
        // Check for missing required parameters
        const requiredParams = ['amount', 'token', 'recipient', 'network'];
        const missingParams = requiredParams.filter(param => !enrichedParams[param]);
        if (missingParams.length > 0) {
            console.log('Transfer Skipped: Missing required parameters:', missingParams);
            continue;
        }
        // Step 4: Risk Assessment
        const risks = await (0, AIAgentPipelinePlugin_1.assessRisks)(enrichedParams, [], prompt, intent, testContext);
        console.log('Risk Assessment:', JSON.stringify(risks, null, 2));
        const hasInvalidRecipient = risks.some((risk) => risk.severity === 'high' &&
            (risk.issue === 'Invalid ENS name' || risk.issue === 'Invalid recipient address'));
        if (hasInvalidRecipient) {
            console.log('Transfer Skipped: Invalid recipient address');
            continue;
        }
        // Step 5: Route Optimization
        const routes = await (0, AIAgentPipelinePlugin_1.optimizeRoutes)(enrichedParams, prompt, intent, testContext);
        console.log('Route Optimization:', JSON.stringify(routes, null, 2));
        // Step 6: Transfer Execution
        if (enrichedParams.amount && enrichedParams.token && enrichedParams.recipient) {
            const network = enrichedParams.network || 'Ethereum';
            const chainId = SUPPORTED_NETWORKS[network];
            console.log('Transfer API Parameters:', JSON.stringify({
                amount: enrichedParams.amount,
                token: enrichedParams.token,
                recipient: enrichedParams.recipient,
                network: network,
                chainId: chainId,
                walletAddress: enrichedParams.walletAddress || testContext.wallets[0].address
            }, null, 2));
            // Execute transfer through Transfer API Plugin
            const transferResult = await TransferAPIPlugin_1.TransferAPIPlugin.execute(enrichedParams, testContext);
            console.log('Transfer API Result:', JSON.stringify(transferResult, null, 2));
            // Show Transfer API specific details if available
            if (transferResult.status === 'success') {
                console.log('Transfer API Details:');
                console.log(`- Transaction Hash: ${transferResult.transactionHash}`);
                console.log(`- From: ${transferResult.details.from}`);
                console.log(`- To: ${transferResult.details.to}`);
                console.log(`- Amount: ${transferResult.details.amount} ${transferResult.details.token}`);
                console.log(`- Network: ${transferResult.details.network}`);
                console.log(`- Gas Used: ${transferResult.details.gasUsed || 'N/A'}`);
                console.log(`- Block Explorer: https://etherscan.io/tx/${transferResult.transactionHash}`);
            }
            else if (transferResult.status === 'insufficient_balance') {
                console.log('Transfer API Details:');
                console.log(`- Status: Insufficient Balance`);
                console.log(`- Required: ${transferResult.requiredAmount}`);
                console.log(`- Available: ${transferResult.currentBalance}`);
            }
            else if (transferResult.status === 'error') {
                console.log('Transfer API Details:');
                console.log(`- Status: Error`);
                console.log(`- Error: ${transferResult.error}`);
            }
            // Step 7: Complete Pipeline Execution Test
            try {
                const pipelineResult = await (0, AIAgentPipelinePlugin_1.executeTransaction)(enrichedParams, routes, risks, prompt, intent, testContext);
                console.log('Pipeline Execution Result:', JSON.stringify(pipelineResult, null, 2));
                if (pipelineResult.status === 'success') {
                    console.log('Pipeline Execution Details:');
                    console.log(`- Transaction Hash: ${pipelineResult.transactionHash}`);
                    console.log(`- Preview: ${JSON.stringify(pipelineResult.preview, null, 2)}`);
                }
                else if (pipelineResult.status === 'insufficient_balance') {
                    console.log('Pipeline Execution Details:');
                    console.log(`- Status: Insufficient Balance`);
                    console.log(`- Required: ${pipelineResult.requiredAmount}`);
                    console.log(`- Available: ${pipelineResult.currentBalance}`);
                }
                else if (pipelineResult.status === 'blocked') {
                    console.log('Pipeline Execution Details:');
                    console.log(`- Status: Blocked`);
                    console.log(`- Reason: ${pipelineResult.reason}`);
                }
                else if (pipelineResult.status === 'error') {
                    console.log('Pipeline Execution Details:');
                    console.log(`- Status: Error`);
                    console.log(`- Error: ${pipelineResult.error}`);
                }
            }
            catch (pipelineError) {
                console.log('Pipeline Execution Failed:', pipelineError.message);
            }
        }
        else {
            console.log('Transfer API Skipped: Missing required transfer parameters:', {
                amount: enrichedParams.amount,
                token: enrichedParams.token,
                recipient: enrichedParams.recipient,
                walletAddress: enrichedParams.walletAddress,
            });
        }
    }
}
runTransferTests();
