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
exports.AIAgentPipelinePlugin = exports.getTokenInfo = void 0;
exports.recognizeIntent = recognizeIntent;
exports.extractParameters = extractParameters;
exports.validateAndEnrich = validateAndEnrich;
exports.optimizeRoutes = optimizeRoutes;
exports.assessRisks = assessRisks;
exports.executeTransaction = executeTransaction;
exports.toSmallestUnit = toSmallestUnit;
const openaiClient_1 = require("../utils/openaiClient");
const tokenRegistry_1 = require("./tokenRegistry");
Object.defineProperty(exports, "getTokenInfo", { enumerable: true, get: function () { return tokenRegistry_1.getTokenInfo; } });
const addressValidation_1 = require("../utils/addressValidation");
const walletManager_1 = require("../utils/walletManager");
// Helper: Prompt engineering for intent recognition
function buildIntentPrompt(userPrompt) {
    return `Classify the user's intent from the following crypto wallet prompt. Respond in JSON with fields: type (one of transfer, swap, bridge, multi), description, confidence (0-1), and raw (the original prompt).\nPrompt: "${userPrompt}"`;
}
// Helper: Prompt engineering for parameter extraction
function buildParameterPrompt(userPrompt, intent) {
    return `Extract all actionable parameters from the following crypto wallet prompt, given the intent: ${intent.type}. Respond in JSON with fields for each parameter (amount, token, recipient, network, action, etc.).\nPrompt: "${userPrompt}"`;
}
async function recognizeIntent(prompt, context) {
    const systemPrompt = buildIntentPrompt(prompt);
    const response = await (0, openaiClient_1.getOpenAICompletion)(systemPrompt);
    // Remove markdown formatting if present
    let cleaned = response.trim();
    if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/```json|```/g, '').trim();
    }
    try {
        const parsed = JSON.parse(cleaned);
        return {
            type: parsed.type,
            description: parsed.description,
            confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 1.0,
            raw: prompt,
        };
    }
    catch (e) {
        return {
            type: 'unknown',
            description: cleaned,
            confidence: 0.5,
            raw: prompt,
        };
    }
}
// Helper to find missing fields in a parameter object or array of objects
function findMissingFields(params) {
    const requiredFields = ['amount', 'token', 'recipient', 'network', 'action'];
    let missing = [];
    const check = (obj) => {
        for (const field of requiredFields) {
            if (!(field in obj) || obj[field] === null || obj[field] === undefined || obj[field] === '') {
                if (!missing.includes(field))
                    missing.push(field);
            }
        }
    };
    if (Array.isArray(params)) {
        params.forEach(check);
    }
    else if (typeof params === 'object') {
        check(params);
    }
    return missing;
}
const SUPPORTED_NETWORKS = {
    'Ethereum': 1,
    'Optimism': 10,
    'Arbitrum': 42161,
};
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
// Parameter extraction step
async function extractParameters(prompt, intent, context) {
    const systemPrompt = buildParameterPrompt(prompt, intent);
    const response = await (0, openaiClient_1.getOpenAICompletion)(systemPrompt);
    let cleaned = response.trim();
    if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/```json|```/g, '').trim();
    }
    try {
        const parsed = JSON.parse(cleaned);
        // Check for supported network
        let missing = findMissingFields(parsed);
        let unsupportedNetwork = null;
        if (parsed.network && !SUPPORTED_NETWORKS[parsed.network]) {
            unsupportedNetwork = parsed.network;
            if (!missing.includes('network'))
                missing.push('network');
        }
        return missing.length > 0 || unsupportedNetwork
            ? { ...parsed, missing, unsupportedNetwork }
            : parsed;
    }
    catch (e) {
        const match = cleaned.match(/```json\n([\s\S]*?)```/);
        if (match) {
            try {
                const jsonBlock = match[1].trim();
                const parsed = JSON.parse(jsonBlock);
                let missing = findMissingFields(parsed);
                let unsupportedNetwork = null;
                if (parsed.network && !SUPPORTED_NETWORKS[parsed.network]) {
                    unsupportedNetwork = parsed.network;
                    if (!missing.includes('network'))
                        missing.push('network');
                }
                return missing.length > 0 || unsupportedNetwork
                    ? { ...parsed, missing, unsupportedNetwork, parsingWarning: 'Parsed from markdown block with extra explanation.' }
                    : { ...parsed, parsingWarning: 'Parsed from markdown block with extra explanation.' };
            }
            catch (e2) { }
        }
        const jsonObjMatch = cleaned.match(/\{[\s\S]*?\}|\[[\s\S]*?\]/);
        if (jsonObjMatch) {
            try {
                const parsed = JSON.parse(jsonObjMatch[0]);
                let missing = findMissingFields(parsed);
                let unsupportedNetwork = null;
                if (parsed.network && !SUPPORTED_NETWORKS[parsed.network]) {
                    unsupportedNetwork = parsed.network;
                    if (!missing.includes('network'))
                        missing.push('network');
                }
                return missing.length > 0 || unsupportedNetwork
                    ? { ...parsed, missing, unsupportedNetwork, parsingWarning: 'Parsed from partial response with extra explanation.' }
                    : { ...parsed, parsingWarning: 'Parsed from partial response with extra explanation.' };
            }
            catch (e3) {
                return { error: 'Could not parse JSON, see raw response.', raw: cleaned };
            }
        }
        return { error: 'No JSON found in response.', raw: cleaned };
    }
}
// Validation & Enrichment step
async function validateAndEnrich(params, prompt, intent, context) {
    if (!params.missing || params.missing.length === 0) {
        return params;
    }
    const missingFields = params.missing.join(', ');
    const systemPrompt = `The following crypto transaction parameters are missing or ambiguous: ${missingFields}.\nPrompt: "${prompt}"\nIntent: ${intent.type}\nCurrent parameters: ${JSON.stringify(params)}\n\nSuggest clarifying questions for the user or reasonable defaults for each missing field. Respond in JSON with fields for each missing parameter, using null if you cannot infer a value, and a 'clarification' field with suggested questions if needed.`;
    const response = await (0, openaiClient_1.getOpenAICompletion)(systemPrompt);
    let cleaned = response.trim();
    if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/```json|```/g, '').trim();
    }
    try {
        const parsed = JSON.parse(cleaned);
        return { ...params, ...parsed };
    }
    catch (e) {
        const match = cleaned.match(/```json\n([\s\S]*?)```/);
        if (match) {
            try {
                const jsonBlock = match[1].trim();
                const parsed = JSON.parse(jsonBlock);
                return { ...params, ...parsed, parsingWarning: 'Parsed from markdown block with extra explanation.' };
            }
            catch (e2) { }
        }
        const jsonObjMatch = cleaned.match(/\{[\s\S]*?\}|\[[\s\S]*?\]/);
        if (jsonObjMatch) {
            try {
                const parsed = JSON.parse(jsonObjMatch[0]);
                return { ...params, ...parsed, parsingWarning: 'Parsed from partial response with extra explanation.' };
            }
            catch (e3) {
                return { ...params, enrichmentError: 'Could not parse JSON, see raw response.', raw: cleaned };
            }
        }
        return { ...params, enrichmentError: 'No JSON found in response.', raw: cleaned };
    }
}
// Route Optimization step
async function optimizeRoutes(params, prompt, intent, context) {
    try {
        if (intent.type !== 'swap')
            return [];
        const network = params.network || 'Ethereum';
        const chainId = SUPPORTED_NETWORKS[network];
        const fromTokenInfo = (0, tokenRegistry_1.getTokenInfo)(params.fromToken, network);
        const toTokenInfo = (0, tokenRegistry_1.getTokenInfo)(params.toToken, network);
        const sellToken = fromTokenInfo?.address || params.fromToken;
        const buyToken = toTokenInfo?.address || params.toToken;
        const sellAmount = toSmallestUnit(params.amount, params.fromToken, network);
        const taker = resolveWalletAddress(params.walletAddress, context);
        const swapRequest = {
            chainId,
            sellToken,
            buyToken,
            sellAmount,
            taker,
        };
        // Import the new SWAP DEX API and Gasless DEX API plugins
        const { SwapDEXAPIPlugin } = await Promise.resolve().then(() => __importStar(require('./SwapDEXAPIPlugin')));
        const { GaslessDEXAPIPlugin } = await Promise.resolve().then(() => __importStar(require('./GaslessDEXAPIPlugin')));
        // Get quotes from the new SWAP DEX API and Gasless DEX API
        const quotes = await Promise.all([
            SwapDEXAPIPlugin.getSwapQuote(swapRequest),
            GaslessDEXAPIPlugin.getSwapQuote(swapRequest),
        ]);
        // Flatten and sort by output amount
        const allQuotes = quotes.flat().filter((q) => q.recommended);
        return allQuotes.sort((a, b) => parseFloat(b.output) - parseFloat(a.output));
    }
    catch (error) {
        console.error('Error optimizing routes:', error);
        return [];
    }
}
// Risk Assessment step
async function assessRisks(params, routes, prompt, intent, context) {
    const risks = [];
    // 1. Recipient address validation (ENS or address)
    if (params.toAddress || params.recipient) {
        const recipient = params.toAddress || params.recipient;
        const network = params.network || 'Ethereum';
        const infuraKey = process.env.INFURA_API_KEY || '';
        let resolvedAddress = recipient;
        let isENS = false;
        let ensResolved = null;
        if (typeof recipient === 'string' && recipient.endsWith('.eth')) {
            isENS = true;
            try {
                ensResolved = await (0, addressValidation_1.resolveENS)({ ensName: recipient, network, infuraKey });
                if (!ensResolved) {
                    risks.push({
                        issue: 'Invalid ENS name',
                        severity: 'high',
                        suggestion: `The ENS name ${recipient} could not be resolved on ${network}. Please check for typos or use a valid ENS name.`
                    });
                }
                else {
                    resolvedAddress = ensResolved;
                    risks.push({
                        issue: 'ENS name resolved',
                        severity: 'info',
                        suggestion: `The ENS name ${recipient} resolved to address ${ensResolved}. Please confirm this is the intended recipient.`
                    });
                }
            }
            catch {
                risks.push({
                    issue: 'ENS resolution error',
                    severity: 'high',
                    suggestion: `There was an error resolving ENS name ${recipient} on ${network}. Please try again later or use a direct address.`
                });
            }
        }
        if (!isENS) {
            if (!(0, addressValidation_1.isValidAddress)(resolvedAddress)) {
                risks.push({
                    issue: 'Invalid recipient address',
                    severity: 'high',
                    suggestion: `The recipient address ${resolvedAddress} is not valid for ${network}. Please check for typos or use a valid address.`
                });
            }
            else {
                // Check if contract or EOA
                try {
                    const type = await (0, addressValidation_1.getAddressType)({ address: resolvedAddress, network, infuraKey });
                    if (type === 'CONTRACT') {
                        risks.push({
                            issue: 'Recipient is a contract address',
                            severity: 'medium',
                            suggestion: `You are sending to a contract address (${resolvedAddress}) on ${network}. Make sure this is what you intend. Contract addresses may not accept regular token transfers.`
                        });
                    }
                    else if (type === 'EOA') {
                        risks.push({
                            issue: 'Recipient is a valid wallet address',
                            severity: 'info',
                            suggestion: `The recipient address ${resolvedAddress} is a valid wallet (EOA) on ${network}.`
                        });
                    }
                    else if (type === 'INVALID') {
                        risks.push({
                            issue: 'Invalid recipient address',
                            severity: 'high',
                            suggestion: `The recipient address ${resolvedAddress} could not be validated on ${network}. Please check for typos or use a valid address.`
                        });
                    }
                }
                catch {
                    risks.push({
                        issue: 'Address type check error',
                        severity: 'medium',
                        suggestion: `Could not determine if ${resolvedAddress} is a contract or wallet on ${network}. Please double-check the address.`
                    });
                }
            }
        }
    }
    // 1. Insufficient Balance (if wallet and token info available)
    if (params.amount && params.token && context.wallets && context.wallets.length > 0) {
        const wallet = context.wallets[0]; // For MVP, use the first wallet
        if (wallet.tokens && wallet.tokens.includes(params.token)) {
            // For demo, assume user has 50 of each token (simulate insufficient balance)
            const fakeBalance = 50;
            if (Number(params.amount) > fakeBalance) {
                risks.push({
                    issue: 'Insufficient balance',
                    severity: 'high',
                    suggestion: `Reduce the amount or deposit more ${params.token} (current balance: ${fakeBalance}).`
                });
            }
        }
    }
    // 2. Unknown Sender
    if (!params.sender && (!context.wallets || context.wallets.length === 0)) {
        risks.push({
            issue: 'Unknown sender wallet',
            severity: 'high',
            suggestion: 'Specify a valid sender wallet address from your account.'
        });
    }
    // 3. Missing Transaction Parameters
    if (params.missing && Array.isArray(params.missing) && params.missing.length > 0) {
        for (const field of params.missing) {
            risks.push({
                issue: `Missing transaction parameter: ${field}`,
                severity: 'high',
                suggestion: `Please provide a valid value for ${field}.`
            });
        }
    }
    // 4. Unsupported Network
    if (params.unsupportedNetwork) {
        risks.push({
            issue: `Unsupported network: ${params.unsupportedNetwork}`,
            severity: 'high',
            suggestion: 'Please use one of the supported networks: Ethereum, Optimism, or Arbitrum.'
        });
    }
    // If we already found risks, return them (for MVP, skip OpenAI call if any are found)
    if (risks.length > 0) {
        return risks;
    }
    // Otherwise, call OpenAI for additional risk analysis
    const systemPrompt = `Given the following crypto transaction parameters and route recommendations, flag any potential risks or warnings for the user. Focus on: insufficient balance, high gas fees or slippage, and any other warning or risk relevant to the transaction. Respond in JSON as an array of risk objects, each with fields: issue, severity (low|medium|high), and suggestion.\nPrompt: "${prompt}"\nIntent: ${intent.type}\nParameters: ${JSON.stringify(params)}\nRoutes: ${JSON.stringify(routes)}`;
    const response = await (0, openaiClient_1.getOpenAICompletion)(systemPrompt);
    let cleaned = response.trim();
    if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/```json|```/g, '').trim();
    }
    try {
        const parsed = JSON.parse(cleaned);
        return parsed;
    }
    catch (e) {
        const match = cleaned.match(/```json\n([\s\S]*?)```/);
        if (match) {
            try {
                const jsonBlock = match[1].trim();
                const parsed = JSON.parse(jsonBlock);
                return parsed;
            }
            catch (e2) {
                return { error: cleaned };
            }
        }
        const jsonObjMatch = cleaned.match(/\[.*\]|\{[\s\S]*?\}/);
        if (jsonObjMatch) {
            try {
                const parsed = JSON.parse(jsonObjMatch[0]);
                return parsed;
            }
            catch (e3) {
                return { error: cleaned };
            }
        }
        return { error: cleaned };
    }
}
// Transaction Execution step
async function executeTransaction(params, routes, risks, prompt, intent, context) {
    try {
        // Build transaction preview
        const preview = await walletManager_1.walletManager.buildTransactionPreview(intent, params, routes);
        // Check if any high-severity risks would block execution
        const blockingRisks = risks.filter((risk) => risk.severity === 'high');
        if (blockingRisks.length > 0) {
            return {
                status: 'blocked',
                reason: 'High-severity risks detected',
                risks: blockingRisks,
                preview
            };
        }
        // For demo purposes, auto-confirm if no blocking risks
        // In production, this would require user confirmation
        const userConfirmed = true; // TODO: Implement actual user confirmation UI
        if (!userConfirmed) {
            return {
                status: 'pending_confirmation',
                preview,
                message: 'Transaction pending user confirmation'
            };
        }
        // Build transaction data based on intent type
        let txData;
        if (intent.type === 'transfer') {
            // Use TransferAPIPlugin for transfer execution
            const { TransferAPIPlugin } = await Promise.resolve().then(() => __importStar(require('./TransferAPIPlugin')));
            const transferResult = await TransferAPIPlugin.execute(params, context);
            if (transferResult.status === 'success') {
                return {
                    status: 'success',
                    transactionHash: transferResult.transactionHash,
                    receipt: transferResult.receipt,
                    preview: await walletManager_1.walletManager.buildTransactionPreview(intent, params, routes)
                };
            }
            else if (transferResult.status === 'insufficient_balance') {
                return {
                    status: 'insufficient_balance',
                    error: transferResult.error,
                    currentBalance: transferResult.currentBalance,
                    requiredAmount: transferResult.requiredAmount,
                    preview: await walletManager_1.walletManager.buildTransactionPreview(intent, params, routes)
                };
            }
            else {
                return {
                    status: 'error',
                    error: transferResult.error,
                    preview: await walletManager_1.walletManager.buildTransactionPreview(intent, params, routes)
                };
            }
        }
        else if (intent.type === 'swap') {
            // Use the new SWAP DEX API for swap execution
            if (routes && routes.length > 0 && routes[0].rawQuote) {
                const route = routes[0];
                const rawQuote = route.rawQuote;
                // If we have a complete quote with transaction data, execute it
                if (rawQuote.quoteData?.transaction && rawQuote.executionResult) {
                    console.log('Executing swap transaction from SWAP DEX API...');
                    // The transaction has already been executed by the SWAP DEX API plugin
                    return {
                        status: 'success',
                        transactionHash: rawQuote.executionResult.transactionHash,
                        receipt: rawQuote.executionResult.receipt,
                        preview: await walletManager_1.walletManager.buildTransactionPreview(intent, params, routes)
                    };
                }
                else {
                    // Quote-only mode - no execution
                    return {
                        status: 'quote_only',
                        message: 'Swap quote obtained but not executed',
                        quote: route,
                        preview: await walletManager_1.walletManager.buildTransactionPreview(intent, params, routes)
                    };
                }
            }
            else {
                throw new Error('No valid swap routes found');
            }
        }
        else {
            throw new Error(`Unsupported transaction type: ${intent.type}`);
        }
        // Execute transaction
        const receipt = await walletManager_1.walletManager.executeTransaction(txData, preview);
        return {
            status: 'success',
            transactionHash: receipt.hash,
            receipt,
            preview
        };
    }
    catch (error) {
        return {
            status: 'error',
            error: error.message,
            preview: await walletManager_1.walletManager.buildTransactionPreview(intent, params, routes)
        };
    }
}
function toSmallestUnit(amount, tokenSymbol, network) {
    const tokenInfo = (0, tokenRegistry_1.getTokenInfo)(tokenSymbol, network);
    const decimals = tokenInfo?.decimals || 18;
    return (BigInt(Math.floor(Number(amount) * 10 ** decimals))).toString();
}
exports.AIAgentPipelinePlugin = {
    id: 'ai-agent-pipeline',
    name: 'AI Agent Pipeline',
    version: '1.0.0',
    type: 'ai-pipeline',
    async init(context) {
        // Any setup logic (e.g., load OpenAI config)
    },
    async dispose() {
        // Any cleanup logic
    },
    async processPrompt(prompt, context) {
        // Step 1: Intent Recognition
        const intent = await recognizeIntent(prompt, context);
        // The rest of the pipeline will be implemented next
        throw new Error('Pipeline not fully implemented. Intent recognition result: ' + JSON.stringify(intent));
    }
};
