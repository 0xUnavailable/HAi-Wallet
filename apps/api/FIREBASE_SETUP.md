# Firebase Setup Guide

## Your Firebase Configuration

Based on your provided config, here's what you need to set up:

### 1. Create `.env` file in `apps/api/` directory

```env
# Firebase Configuration
FIREBASE_PROJECT_ID=hai-wallet
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@hai-wallet.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
FIREBASE_DATABASE_URL=https://hai-wallet-default-rtdb.firebaseio.com

# Wallet Server Secret (for deterministic wallet generation)
WALLET_SERVER_SECRET=your-super-secret-key-here

# Google OAuth (for production)
GOOGLE_CLIENT_ID=AIzaSyB7soY4bWLyIU8yrXl_B6bhTsJ38EOZOZE
```

### 2. Get Service Account Credentials

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: `hai-wallet`
3. Go to **Project Settings** (⚙️) → **Service accounts**
4. Click **"Generate new private key"**
5. Download the JSON file
6. Copy the values from the JSON to your `.env` file:
   - `project_id` → `FIREBASE_PROJECT_ID`
   - `client_email` → `FIREBASE_CLIENT_EMAIL`
   - `private_key` → `FIREBASE_PRIVATE_KEY`

### 3. Update Frontend Google Client ID

In `apps/web/index.html`, replace:
```html
data-client_id="YOUR_GOOGLE_CLIENT_ID"
```
with:
```html
data-client_id="AIzaSyB7soY4bWLyIU8yrXl_B6bhTsJ38EOZOZE"
```

### 4. Test the Setup

After setting up the `.env` file, restart your API server:

```bash
cd apps/api
npm run dev
```

You should see: `✅ Firebase initialized successfully`

## Quick Demo Mode

If you want to test without Firebase setup, the app will automatically fall back to demo mode and show:
`⚠️  Firebase credentials not found, using demo mode`

This allows you to test all functionality without Firebase configuration. 