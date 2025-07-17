# HAi Wallet Interface Templates

## 1. Authentication & Wallet Management Layer

### 1.1 Auth Service Interfaces

#### 1.1.1 Google OAuth Integration
```typescript
// Interface for Google OAuth Authentication Plugin
export interface IGoogleOAuthAuth {
  signInWithGoogle(): Promise<AuthResult>;
  signOut(): Promise<void>;
  getCurrentUser(): Promise<UserProfile | null>;
}
```

#### 1.1.2 Email/Password Auth
```typescript
// Interface for Email/Password Authentication Plugin
export interface IEmailPasswordAuth {
  signUp(email: string, password: string): Promise<AuthResult>;
  signIn(email: string, password: string): Promise<AuthResult>;
  signOut(): Promise<void>;
  getCurrentUser(): Promise<UserProfile | null>;
}
```

#### 1.1.3 Traditional Wallet Creation
```typescript
// Interface for Traditional Wallet Creation Plugin
export interface IWalletCreation {
  createWallet(options?: WalletOptions): Promise<WalletInfo>;
}
```

#### 1.1.4 Import Wallet (Private Key/Seed)
```typescript
// Interface for Importing Wallets via Private Key or Seed Phrase
export interface IWalletImport {
  importFromPrivateKey(privateKey: string): Promise<WalletInfo>;
  importFromSeedPhrase(seedPhrase: string): Promise<WalletInfo>;
}
```

---

## 1.2 Wallet Factory Interfaces

### 1.2.1 Key Generation
```typescript
// Interface for Wallet Key Generation Plugin
export interface IKeyGeneration {
  generateKeyPair(options?: KeyGenOptions): Promise<KeyPair>;
}
```

### 1.2.2 Multi-signature Support
```typescript
// Interface for Multi-signature Wallet Plugin
export interface IMultiSigWallet {
  createMultiSigWallet(owners: string[], requiredSignatures: number): Promise<MultiSigWalletInfo>;
  proposeTransaction(tx: MultiSigTransaction): Promise<MultiSigProposal>;
  signTransaction(proposalId: string, signer: string): Promise<MultiSigProposal>;
  executeTransaction(proposalId: string): Promise<TransactionReceipt>;
}
```

### 1.2.3 Wallet Recovery
```typescript
// Interface for Wallet Recovery Plugin
export interface IWalletRecovery {
  initiateRecovery(identifier: string): Promise<RecoveryProcess>;
  completeRecovery(recoveryToken: string, newCredentials: RecoveryCredentials): Promise<WalletInfo>;
}
```

---

## 1.3 Profile Management Interfaces

### 1.3.1 Key Storage (Encrypted)
```typescript
// Interface for Encrypted Key Storage Plugin
export interface IKeyStorage {
  storeKey(keyId: string, encryptedKey: string): Promise<void>;
  retrieveKey(keyId: string): Promise<string | null>;
  deleteKey(keyId: string): Promise<void>;
  listKeys(): Promise<string[]>;
}
```

### 1.3.2 Contact Book
```typescript
// Interface for Contact Book Plugin
export interface IContactBook {
  addContact(contact: Contact): Promise<void>;
  getContact(nameOrAddress: string): Promise<Contact | null>;
  removeContact(nameOrAddress: string): Promise<void>;
  listContacts(): Promise<Contact[]>;
}
```

### 1.3.3 Security Settings
```typescript
// Interface for Security Settings Plugin
export interface ISecuritySettings {
  updateSetting(setting: SecuritySetting, value: any): Promise<void>;
  getSetting(setting: SecuritySetting): Promise<any>;
  listSettings(): Promise<SecuritySetting[]>;
}
```

---

// Placeholders for Wallet Factory and Profile Management interfaces will be added in subsequent steps. 

## 2. AI Agent Core Interfaces

### 2.1 Prompt Parser

#### 2.1.1 Intent Recognition
```typescript
// Interface for Intent Recognition Plugin
export interface IIntentRecognizer {
  recognizeIntent(prompt: string, context?: AgentContext): Promise<IntentResult>;
}
```

#### 2.1.2 Parameter Extraction
```typescript
// Interface for Parameter Extraction Plugin
export interface IParameterExtractor {
  extractParameters(prompt: string, intent: IntentResult, context?: AgentContext): Promise<ParameterMap>;
}
```

#### 2.1.3 Context Understanding
```typescript
// Interface for Context Understanding Plugin
export interface IContextUnderstanding {
  updateContext(prompt: string, previousContext: AgentContext): Promise<AgentContext>;
}
```

### 2.2 Transaction Builder

#### 2.2.1 Route Optimization
```typescript
// Interface for Route Optimization Plugin
export interface IRouteOptimizer {
  optimizeRoute(transaction: TransactionRequest, context: AgentContext): Promise<RoutePlan>;
}
```

#### 2.2.2 Gas Estimation
```typescript
// Interface for Gas Estimation Plugin
export interface IGasEstimator {
  estimateGas(transaction: TransactionRequest, network: string): Promise<GasEstimate>;
}
```

#### 2.2.3 Multi-step Chaining
```typescript
// Interface for Multi-step Transaction Chaining Plugin
export interface IMultiStepChainer {
  chainActions(actions: AgentAction[], context: AgentContext): Promise<ChainedActionPlan>;
}
```

### 2.3 Safety Layer

#### 2.3.1 Balance Validation
```typescript
// Interface for Balance Validation Plugin
export interface IBalanceValidator {
  validateBalance(address: string, amount: string, token: string, network: string): Promise<boolean>;
}
```

#### 2.3.2 Address Verification
```typescript
// Interface for Address Verification Plugin
export interface IAddressVerifier {
  verifyAddress(address: string, network: string): Promise<AddressVerificationResult>;
}
```

#### 2.3.3 Transaction Preview
```typescript
// Interface for Transaction Preview Plugin
export interface ITransactionPreview {
  generatePreview(transaction: TransactionRequest, context: AgentContext): Promise<TransactionPreview>;
}
```

--- 

## 3. Control System Manager Interfaces

### 3.1 Control Mode Switcher
```typescript
// Interface for Control Mode Switcher Plugin
export interface IControlModeSwitcher {
  getCurrentMode(): Promise<ControlMode>;
  switchMode(mode: ControlMode): Promise<void>;
  onModeChange(callback: (mode: ControlMode) => void): void;
}
```

### 3.2 Full Control (Traditional UI)
```typescript
// Interface for Full Control (Traditional UI) Plugin
export interface IFullControlUI {
  renderUI(walletInfo: WalletInfo): void;
  onUserAction(callback: (action: UserAction) => void): void;
}
```

### 3.3 Semi Control (AI-Assisted Popups)
```typescript
// Interface for Semi Control (AI-Assisted Popups) Plugin
export interface ISemiControlUI {
  showAIPopup(prompt: string, context: AgentContext): Promise<UserResponse>;
  onPopupAction(callback: (action: UserAction) => void): void;
}
```

### 3.4 Agent Control (Prompt-based)
```typescript
// Interface for Agent Control (Prompt-based) Plugin
export interface IAgentControl {
  handlePrompt(prompt: string, context: AgentContext): Promise<AgentResponse>;
  onAgentAction(callback: (action: AgentAction) => void): void;
}
```

--- 

## 4. Transaction Engine Interfaces

### 4.1 Transfer Module
```typescript
// Interface for Transfer Module Plugin
export interface ITransferModule {
  transfer(params: TransferParams): Promise<TransactionReceipt>;
  estimateTransfer(params: TransferParams): Promise<GasEstimate>;
}
```

### 4.2 Bridge Module
```typescript
// Interface for Bridge Module Plugin
export interface IBridgeModule {
  bridge(params: BridgeParams): Promise<TransactionReceipt>;
  estimateBridge(params: BridgeParams): Promise<GasEstimate>;
}
```

### 4.3 Swap Module
```typescript
// Interface for Swap Module Plugin
export interface ISwapModule {
  swap(params: SwapParams): Promise<TransactionReceipt>;
  estimateSwap(params: SwapParams): Promise<GasEstimate>;
}
```

### 4.4 Multi-chain Support
```typescript
// Interface for Multi-chain Support Plugin
export interface IMultiChainSupport {
  getSupportedChains(): Promise<ChainInfo[]>;
  switchChain(chainId: string): Promise<void>;
  getCurrentChain(): Promise<ChainInfo>;
}
```

--- 