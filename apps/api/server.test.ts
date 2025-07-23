import axios from 'axios';
import 'dotenv/config';

async function main() {

  const quoteParams = {
    user: '0x18cBCfA9eB0265C9C916327B10e78f7Ac070220A',
    originChainId: 84532,
    destinationChainId: 11155420,
    originCurrency: '0x0000000000000000000000000000000000000000',
    destinationCurrency: '0x0000000000000000000000000000000000000000',
    amount: '100000000000000',
    tradeType: 'EXACT_INPUT',
  };

  try {
    // Step 1: Get the quote
    const quoteRes = await axios.post('http://localhost:3001/api/relay/quote', quoteParams);
    const quote = quoteRes.data;
    console.log('Quote response:', quote);

    // Step 2: Execute the quote
    const execRes = await axios.post('http://localhost:3001/api/relay/execute-quote', { quote });
    console.log('Execution response:', execRes.data);
  } catch (error: any) {
    if (error.response) {
      console.error('Execution error:', error.response.status, error.response.data);
    } else {
      console.error('Execution error:', error.message);
    }
  }
}

main(); 