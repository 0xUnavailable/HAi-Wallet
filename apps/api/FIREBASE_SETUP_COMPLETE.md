# Complete Firebase Setup for Production

## 🔥 Step 1: Get Firebase Service Account Credentials

1. **Go to Firebase Console:** https://console.firebase.google.com/
2. **Select project:** `hai-wallet`
3. **Go to Project Settings** (⚙️) → **Service accounts**
4. **Click "Generate new private key"**
5. **Download the JSON file**

## 🔧 Step 2: Update Firebase Config

Replace the placeholder values in `apps/api/firebaseConfig.ts`:

```typescript
// Replace these with your actual values from the JSON file:
clientEmail: "firebase-adminsdk-xxxxx@hai-wallet.iam.gserviceaccount.com", // Your real client_email
privateKey: "-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n", // Your real private_key
```

## 🔑 Step 3: Get Google OAuth Client ID

1. **Go to Google Cloud Console:** https://console.cloud.google.com/
2. **Select project:** `hai-wallet`
3. **Go to APIs & Services** → **Credentials**
4. **Click "Create Credentials"** → **"OAuth 2.0 Client IDs"**
5. **Choose "Web application"**
6. **Add authorized origins:**
   ```
   http://localhost:8080
   http://127.0.0.1:8080
   ```
7. **Add authorized redirect URIs:**
   ```
   http://localhost:8080
   http://127.0.0.1:8080
   ```
8. **Click "Create"**
9. **Copy the Client ID** (looks like: `123456789-abcdefghijklmnop.apps.googleusercontent.com`)

## 🌐 Step 4: Update Frontend

Replace in `apps/web/index.html`:
```html
data-client_id="REPLACE_WITH_YOUR_OAUTH_CLIENT_ID"
```
with your actual OAuth Client ID.

## 🚀 Step 5: Test

1. **Restart API server:**
   ```bash
   cd apps/api && npm run dev
   ```

2. **Restart web server:**
   ```bash
   cd apps/web && python3 -m http.server 8080
   ```

3. **Open:** `http://localhost:8080/index.html`

4. **Test Google Sign-in** - should work now!

## ✅ Expected Results

- ✅ Firebase initialized successfully
- ✅ Google Sign-in popup appears
- ✅ User wallet created from Google ID
- ✅ Contacts persist in Firebase
- ✅ Full production functionality

## 🆘 Troubleshooting

**If Google Sign-in doesn't work:**
- Check OAuth Client ID is correct
- Verify authorized origins include `http://localhost:8080`
- Check browser console for errors

**If Firebase fails:**
- Verify service account credentials
- Check project ID matches
- Ensure Firestore is enabled in Firebase Console 