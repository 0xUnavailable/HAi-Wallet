# HAi Wallet - Web Frontend

A modern, AI-powered crypto wallet with Google authentication, contact management, and natural language transaction execution.

## Features

- **Google Authentication**: Secure login with Google accounts
- **Deterministic Wallet Creation**: Each user gets a unique wallet address based on their Google ID
- **Contact Management**: Save wallet addresses with easy-to-remember names
- **Natural Language Transactions**: Execute transactions using plain English prompts
- **Contact Resolution**: Use contact names in transaction prompts (e.g., "Send 100 ETH to Bob")
- **Session Persistence**: User data persists across sessions
- **Modern UI**: Clean, responsive design with real-time status updates

## Setup Instructions

### Prerequisites

1. **Backend API**: The API server is deployed at `https://hai-wallet-server.onrender.com`
2. **NLP Service**: Ensure the NLP service is running on `http://localhost:8000`
3. **Firebase**: Set up Firebase project and add credentials to environment variables

### Environment Variables

Add these to your `.env` file in the API directory:

```env
# Firebase Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account-email
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_DATABASE_URL=https://your-project.firebaseio.com

# Wallet Server Secret (for deterministic wallet generation)
WALLET_SERVER_SECRET=your-secret-key

# Google OAuth (for production)
GOOGLE_CLIENT_ID=your-google-client-id
```

### Installation

1. **Install Dependencies**:
   ```bash
   cd apps/api
   npm install firebase-admin
   ```

2. **Start the Backend**:
   ```bash
   cd apps/api
   npm run dev
   ```

3. **Start the Web Server**:
   ```bash
   cd apps/web
   python3 -m http.server 8080
   ```

4. **Access the Application**:
   - Production: `http://localhost:8080/index.html`
   - Demo Mode: `http://localhost:8080/demo.html`

## Usage

### Production Mode (with Google Auth)

1. **Login**: Click "Sign in with Google" to authenticate
2. **Wallet Creation**: A deterministic wallet is created based on your Google ID
3. **Add Contacts**: Save wallet addresses with names like "Bob", "Alice", etc.
4. **Execute Transactions**: Use natural language like:
   - "Send 100 ETH to Bob"
   - "Transfer 50 USDC to 0x1234..."
   - "Swap 200 USDC for ETH on Uniswap"

### Demo Mode (for Testing)

1. **Demo Login**: Enter any email to create a demo session
2. **Test Features**: All features work the same as production mode
3. **No Google Auth**: Bypasses Google authentication for testing

## API Endpoints

### Authentication
- `POST /api/auth/google` - Google authentication and wallet creation

### Contact Management
- `POST /api/contacts` - Add a contact
- `GET /api/contacts/:uid` - Get all contacts for a user
- `DELETE /api/contacts/:uid/:name` - Delete a contact
- `GET /api/contacts/:uid/resolve/:name` - Resolve contact name to address

### Transactions
- `POST /api/relay/quote-and-execute` - Execute transaction with contact resolution

## Contact Management Rules

1. **Unique Names**: Each contact name can only map to one address
2. **Unique Addresses**: Each address can only be saved under one name
3. **Valid Addresses**: Only valid Ethereum addresses (0x...) are allowed
4. **User Isolation**: Contacts are user-specific and not shared between users

## Transaction Features

1. **Contact Resolution**: Automatically resolves contact names to addresses
2. **Error Handling**: Clear error messages for invalid contacts or addresses
3. **Natural Language**: Supports various transaction types through NLP
4. **Real-time Status**: Live updates on transaction progress

## Security Features

1. **Deterministic Wallets**: Each user gets a unique, reproducible wallet
2. **Session Isolation**: User data is completely isolated
3. **Input Validation**: All inputs are validated on both frontend and backend
4. **Secure Storage**: User data stored in Firebase with proper authentication

## Testing

### Manual Testing Flow

1. **Login Test**:
   - Use demo mode or Google auth
   - Verify wallet address is displayed
   - Check session persistence

2. **Contact Management Test**:
   - Add a contact with valid address
   - Try adding duplicate name (should fail)
   - Try adding duplicate address (should fail)
   - Try adding invalid address (should fail)
   - Delete a contact

3. **Transaction Test**:
   - Send transaction to contact name
   - Send transaction to direct address
   - Try sending to non-existent contact (should fail)
   - Test various transaction types

4. **Session Test**:
   - Logout and verify data is cleared
   - Login with different user and verify isolation

### Example Test Cases

```bash
# Add contact
curl -X POST https://hai-wallet-server.onrender.com/api/contacts \
  -H "Content-Type: application/json" \
  -d '{"uid":"demo_user","name":"Bob","address":"0x1234567890abcdef1234567890abcdef12345678"}'

# Execute transaction
curl -X POST https://hai-wallet-server.onrender.com/api/relay/quote-and-execute \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Send 100 ETH to Bob","uid":"demo_user"}'
```

## Troubleshooting

### Common Issues

1. **Firebase Connection Error**: Check Firebase credentials and project setup
2. **NLP Service Error**: Ensure NLP service is running on port 8000
3. **CORS Issues**: Check if API server is running and accessible
4. **Contact Resolution Fails**: Verify contact exists and user ID is correct

### Debug Mode

Enable debug logging by checking browser console and API server logs for detailed error information.

## Future Enhancements

- Multi-chain support
- Transaction history
- Advanced contact features (groups, labels)
- Enhanced security features
- Mobile app version
- Integration with more DEX protocols 