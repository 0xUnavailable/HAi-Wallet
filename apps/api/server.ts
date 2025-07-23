import express from 'express';
import { RelayApiClient } from './modules/relayApiClient';

const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());

const relayClient = new RelayApiClient();

// Example endpoint: Get supported chains
app.get('/api/relay/chains', async (req, res) => {
  try {
    const data = await relayClient.getChains();
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Start server if run directly
if (require.main === module) {
  app.listen(port, () => {
    console.log(`Relay API server listening on port ${port}`);
  });
}

export default app; 