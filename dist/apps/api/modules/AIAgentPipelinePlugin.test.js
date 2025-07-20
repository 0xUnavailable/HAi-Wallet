"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const AIAgentPipelinePlugin_1 = require("./AIAgentPipelinePlugin");
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
            tokens: ['ETH', 'USDC', 'WETH']
        }
    ],
    contacts: [
        { name: 'Bob' },
        { name: 'Alice', address: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8', network: 'Ethereum' }
    ]
};
const prompt = 'Swap 100 USDC to WETH from my wallet (0xa11B86d8cb6D0E9C8cD84d50260E910789194915) on Ethereum';
function resolveWalletAddress(raw, context) {
    if (!raw)
        return context.wallets?.[0]?.address || '';
    const match = raw.match(/0x[a-fA-F0-9]{40}/);
    if (match)
        return match[0];
    if (raw.toLowerCase().includes('my wallet') || raw.toLowerCase().includes('my main wallet')) {
        return context.wallets?.[0]?.address || '';
    }
    return raw; // fallback to whatever was extracted
}
function normalizeSwapParams(params) {
    return {
        ...params,
        fromToken: params.fromToken || params.from_token || params.sourceToken,
        toToken: params.toToken || params.to_token || params.targetToken,
        walletAddress: params.walletAddress || params.wallet_address || params.sender_wallet,
    };
}
async function testSwapQuotePipeline() {
    try {
        // Step 1: Intent recognition
        const intent = await (0, AIAgentPipelinePlugin_1.recognizeIntent)(prompt, testContext);
        console.log('Intent Recognition Result:', JSON.stringify(intent, null, 2));
        // Step 2: Parameter extraction
        const params = await (0, AIAgentPipelinePlugin_1.extractParameters)(prompt, intent, testContext);
        console.log('Parameter Extraction Result:', JSON.stringify(params, null, 2));
        // Check for required fields
        if (!params.fromToken || !params.toToken || !params.amount) {
            console.log('Missing required swap parameters:', {
                fromToken: params.fromToken,
                toToken: params.toToken,
                amount: params.amount,
            });
            return;
        }
        // Step 3: Map token symbols and network to addresses and build 0x Gasless API query
        const network = params.network || 'Ethereum';
        const chainId = SUPPORTED_NETWORKS[network];
        const fromTokenInfo = (0, AIAgentPipelinePlugin_1.getTokenInfo)(params.fromToken, network);
        const toTokenInfo = (0, AIAgentPipelinePlugin_1.getTokenInfo)(params.toToken, network);
        const sellToken = fromTokenInfo?.address || params.fromToken;
        const buyToken = toTokenInfo?.address || params.toToken;
        const decimals = fromTokenInfo?.decimals || 18;
        const sellAmount = (0, AIAgentPipelinePlugin_1.toSmallestUnit)(params.amount, params.fromToken, network);
        // taker is the recipient of the bought tokens, fallback to sender if not specified
        const taker = resolveWalletAddress(params.toAddress, testContext) || resolveWalletAddress(params.fromAddress, testContext);
        const swapRequest = {
            chainId,
            sellToken,
            buyToken,
            sellAmount,
            taker,
        };
        console.log('Swap Quote Query Parameters:', JSON.stringify(swapRequest, null, 2));
        // Import and use the new Gasless DEX API
        const { GaslessDEXAPIPlugin } = await Promise.resolve().then(() => __importStar(require('./GaslessDEXAPIPlugin')));
        const quote = await GaslessDEXAPIPlugin.getSwapQuote(swapRequest);
        console.log('Gasless DEX API Swap Quote:', JSON.stringify(quote, null, 2));
        console.log('---');
    }
    catch (e) {
        if (typeof e === 'object' && e && 'message' in e) {
            // @ts-ignore
            console.log('Error:', e.message);
        }
        else {
            console.log('Error:', e);
        }
        console.log('---');
    }
}
const testPrompts = [
    'Swap 100 USDC to ETH from my wallet 0xa11B86d8cb6D0E9C8cD84d50260E910789194915 on Ethereum',
    'Swap 100 USDC to ETH from my wallet 0xa11B86d8cb6D0E9C8cD84d50260E910789194915 on Arbitrum',
    'Swap 100 USDC to ETH from my wallet 0xa11B86d8cb6D0E9C8cD84d50260E910789194915 on Optimism',
];
async function runAddressValidationTests() {
    const infuraKey = process.env.INFURA_API_KEY || '';
    for (const prompt of testPrompts) {
        console.log(`\n---\nPrompt: ${prompt}`);
        const intent = await (0, AIAgentPipelinePlugin_1.recognizeIntent)(prompt, testContext);
        console.log('Intent Recognition Result:', JSON.stringify(intent, null, 2));
        let params = await (0, AIAgentPipelinePlugin_1.extractParameters)(prompt, intent, testContext);
        params = normalizeSwapParams(params);
        console.log('Parameter Extraction Result:', JSON.stringify(params, null, 2));
        // Risk assessment and ENS/address resolution first
        const risks = await (0, AIAgentPipelinePlugin_1.assessRisks)(params, [], prompt, intent, testContext);
        console.log('Risk Assessment:', JSON.stringify(risks, null, 2));
        // If any high-severity risk about invalid ENS or address, skip further steps
        const hasInvalidRecipient = risks.some((risk) => risk.severity === 'high' &&
            (risk.issue === 'Invalid ENS name' || risk.issue === 'Invalid recipient address'));
        if (hasInvalidRecipient) {
            continue;
        }
        // Route recommendations (no 'Top 2' text)
        const routes = await (0, AIAgentPipelinePlugin_1.optimizeRoutes)(params, prompt, intent, testContext);
        console.log('Route Recommendations:', JSON.stringify(routes, null, 2));
        // DEX API parameters and usage (if swap)
        if (intent.type === 'swap' && params.fromToken && params.toToken && params.amount) {
            const network = params.network || 'Ethereum';
            const chainId = SUPPORTED_NETWORKS[network];
            const fromTokenInfo = (0, AIAgentPipelinePlugin_1.getTokenInfo)(params.fromToken, network);
            const toTokenInfo = (0, AIAgentPipelinePlugin_1.getTokenInfo)(params.toToken, network);
            const sellToken = fromTokenInfo?.address || params.fromToken;
            const buyToken = toTokenInfo?.address || params.toToken;
            const decimals = fromTokenInfo?.decimals || 18;
            const sellAmount = (0, AIAgentPipelinePlugin_1.toSmallestUnit)(params.amount, params.fromToken, network);
            // Only set taker if parsed from prompt
            const swapRequest = {
                chainId,
                sellToken,
                buyToken,
                sellAmount,
            };
            if (params.walletAddress) {
                swapRequest.taker = params.walletAddress;
            }
            console.log('DEX API Parameters:', JSON.stringify(swapRequest, null, 2));
            // Import and use the new Gasless DEX API
            const { GaslessDEXAPIPlugin } = await Promise.resolve().then(() => __importStar(require('./GaslessDEXAPIPlugin')));
            const quote = await GaslessDEXAPIPlugin.getSwapQuote(swapRequest);
            console.log('DEX API Result:', JSON.stringify(quote, null, 2));
        }
        else if (intent.type === 'swap') {
            console.log('DEX API Skipped: Missing required swap parameters:', {
                fromToken: params.fromToken,
                toToken: params.toToken,
                amount: params.amount,
                walletAddress: params.walletAddress,
            });
        }
    }
}
runAddressValidationTests();
