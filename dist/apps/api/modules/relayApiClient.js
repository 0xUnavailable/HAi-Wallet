"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RelayApiClient = void 0;
// relayApiClient.ts
// Centralized client for relay.link API
const node_fetch_1 = __importDefault(require("node-fetch"));
const endpoints_1 = require("./endpoints");
const BASE_URLS = {
    mainnet: 'https://api.relay.link',
    testnet: 'https://api.testnets.relay.link',
};
class RelayApiClient {
    constructor(env = 'mainnet') {
        this.baseUrl = BASE_URLS[env];
    }
    // Get supported chains
    async getChains() {
        const res = await (0, node_fetch_1.default)(this.baseUrl + endpoints_1.ENDPOINT_PATHS.CHAINS);
        if (!res.ok)
            throw new Error(`Failed to fetch chains: ${res.statusText}`);
        return res.json();
    }
    // Get execution status
    async getExecutionStatus(requestId) {
        const url = `${this.baseUrl + endpoints_1.ENDPOINT_PATHS.EXECUTION_STATUS}?requestId=${encodeURIComponent(requestId)}`;
        const res = await (0, node_fetch_1.default)(url);
        if (!res.ok)
            throw new Error(`Failed to fetch execution status: ${res.statusText}`);
        return res.json();
    }
    // Get all requests
    async getRequests(params) {
        const query = new URLSearchParams(params).toString();
        const url = `${this.baseUrl + endpoints_1.ENDPOINT_PATHS.REQUESTS}${query ? '?' + query : ''}`;
        const res = await (0, node_fetch_1.default)(url);
        if (!res.ok)
            throw new Error(`Failed to fetch requests: ${res.statusText}`);
        return res.json();
    }
    // Get token price
    async getTokenPrice(address, chainId) {
        const url = `${this.baseUrl + endpoints_1.ENDPOINT_PATHS.TOKEN_PRICE}?address=${encodeURIComponent(address)}&chainId=${encodeURIComponent(chainId)}`;
        const res = await (0, node_fetch_1.default)(url);
        if (!res.ok)
            throw new Error(`Failed to fetch token price: ${res.statusText}`);
        return res.json();
    }
    // Get currencies metadata
    async getCurrencies(body) {
        const res = await (0, node_fetch_1.default)(this.baseUrl + endpoints_1.ENDPOINT_PATHS.CURRENCIES, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        if (!res.ok)
            throw new Error(`Failed to fetch currencies: ${res.statusText}`);
        return res.json();
    }
    // Get quote for swap/bridge/call
    async getQuote(body) {
        const res = await (0, node_fetch_1.default)(this.baseUrl + endpoints_1.ENDPOINT_PATHS.QUOTE, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        if (!res.ok)
            throw new Error(`Failed to fetch quote: ${res.statusText}`);
        return res.json();
    }
    // Multi-input swap quote
    async getMultiInputQuote(body) {
        const res = await (0, node_fetch_1.default)(this.baseUrl + endpoints_1.ENDPOINT_PATHS.MULTI_INPUT_QUOTE, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        if (!res.ok)
            throw new Error(`Failed to fetch multi-input quote: ${res.statusText}`);
        return res.json();
    }
    // Notify backend to index a transaction
    async indexTransaction(body) {
        const res = await (0, node_fetch_1.default)(this.baseUrl + endpoints_1.ENDPOINT_PATHS.TRANSACTIONS_INDEX, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        if (!res.ok)
            throw new Error(`Failed to index transaction: ${res.statusText}`);
        return res.json();
    }
    // Notify backend to index a single transfer/wrap/unwrap
    async indexSingleTransaction(body) {
        const res = await (0, node_fetch_1.default)(this.baseUrl + endpoints_1.ENDPOINT_PATHS.TRANSACTIONS_SINGLE, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        if (!res.ok)
            throw new Error(`Failed to index single transaction: ${res.statusText}`);
        return res.json();
    }
}
exports.RelayApiClient = RelayApiClient;
