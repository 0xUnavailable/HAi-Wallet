"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const relayApiClient_1 = require("./modules/relayApiClient");
const app = (0, express_1.default)();
const port = process.env.PORT || 3001;
app.use(express_1.default.json());
const relayClient = new relayApiClient_1.RelayApiClient();
// Example endpoint: Get supported chains
app.get('/api/relay/chains', async (req, res) => {
    try {
        const data = await relayClient.getChains();
        res.json(data);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Start server if run directly
if (require.main === module) {
    app.listen(port, () => {
        console.log(`Relay API server listening on port ${port}`);
    });
}
exports.default = app;
