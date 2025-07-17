# HAi Wallet — Formal Onboarding & Technical Reference Guide

Welcome to the HAi Wallet project. This document provides a comprehensive, formal overview of the project’s vision, architecture, file structure, and development methodology. It is designed to enable any engineer or LLM to understand the project in depth and proceed with development, even without prior exposure to the codebase.

---

## Project Overview

**HAi Wallet** is a next-generation, modular web3 wallet designed to abstract away the complexity of crypto for end users. The system leverages a plugin-based architecture and an AI agent to enable natural language transactions, seamless wallet management, and a highly extensible feature set. The target audience is both non-technical and power users seeking a modern, intuitive crypto experience.

---

## Core Objectives

- Enable wallet creation via Google, email, or traditional crypto methods
- Support wallet import (private key or seed phrase)
- Provide a unified profile for key, contact, and security management
- Integrate an AI agent for natural language-driven transfers, swaps, and bridges
- Demonstrate three control modes: Full (manual), Semi (AI-assisted), Agent (AI-driven, user approves)
- Ensure all features are modular, replaceable, and extensible via plugins

---

## Technology Stack

- **Frontend:** React/Next.js (PWA), Tailwind CSS, Redux Toolkit or Zustand, Ethers.js/Viem
- **Backend:** Node.js/Express or FastAPI, PostgreSQL, Redis, Firebase/Auth0, OpenAI API or custom LLM
- **Security:** Hardware Security Module (HSM), AES-256 encryption, TLS 1.3
- **Architecture:** Monorepo, TypeScript, plugin-based modularity

---

## Repository Structure

The project is organized as a monorepo to maximize code sharing and modularity. Below is the directory structure with context for each major component:

```
hai-wallet/
├── apps/
│   ├── web/                  # Next.js PWA frontend
│   │   ├── components/       # Reusable UI components (buttons, modals, etc.)
│   │   ├── modules/          # Feature modules (each a plugin, e.g., Transfer, Swap, Bridge)
│   │   ├── pages/            # Next.js pages (routes)
│   │   ├── public/           # Static assets (images, icons, etc.)
│   │   ├── styles/           # Tailwind and global styles
│   │   └── utils/            # Frontend utility functions
│   └── api/                  # Backend API (Node.js/Express or FastAPI)
│       ├── modules/          # Backend feature modules (plugins)
│       ├── services/         # Core backend services (auth, wallet, AI, etc.)
│       ├── middlewares/      # API middlewares (auth, logging, etc.)
│       ├── db/               # Database models and connectors
│       └── utils/            # Backend utility functions
├── packages/
│   ├── core/                 # Shared core logic (wallet, agent, plugin system)
│   │   └── plugin/           # Plugin interfaces and manager
│   ├── adapters/             # Blockchain, auth, and other adapters (as plugins)
│   ├── ui/                   # Shared UI component library
│   └── types/                # Shared TypeScript types and interfaces
├── scripts/                  # DevOps, deployment, and utility scripts
├── .env                      # Environment variables
├── package.json              # Monorepo dependencies and scripts
├── README.md                 # Project overview and quickstart
├── HAi-Wallet-Journal.md     # Informal, detailed build log
├── HAi-Wallet-LLM-Onboarding.md # This formal onboarding guide
└── ...                       # Additional config files (tsconfig, lint, etc.)
```

### Directory Context & Usage

- **apps/web/components/**: All reusable UI elements. Each component should be atomic and styled with Tailwind.
- **apps/web/modules/**: Each feature (e.g., Transfer, Swap, Bridge, AddressBook) is implemented as a plugin module. Modules must conform to the relevant interface in `packages/core/plugin`.
- **apps/web/pages/**: Next.js routing. Each page imports and composes modules and components.
- **apps/web/utils/**: Utility functions for the frontend (formatting, validation, etc.).
- **apps/api/modules/**: Backend feature modules (plugins) for transaction processing, AI, etc.
- **apps/api/services/**: Core backend logic (authentication, wallet management, AI agent orchestration).
- **apps/api/db/**: Database models (TypeORM, Prisma, or equivalent) and connection logic.
- **packages/core/plugin/**: The heart of the plugin system. Contains:
  - `IPlugin.ts`: The base plugin interface (see below)
  - `PluginManager.ts`: The plugin loader/manager
  - `types.ts`: Shared plugin types
- **packages/adapters/**: Pluggable adapters for blockchains, authentication, etc.
- **packages/ui/**: Shared UI components for use across frontend modules.
- **packages/types/**: All shared TypeScript types and interfaces for strict type safety.
- **scripts/**: Automation, deployment, and maintenance scripts.

---

## Plugin System: Architecture & Usage

The plugin system is central to HAi Wallet’s modularity. Every feature—whether it’s a transaction type, an AI agent, or a UI module—is implemented as a plugin. This enables hot-swapping, easy upgrades, and maximum extensibility.

### Base Plugin Interface
```typescript
export interface IPlugin<T = any> {
  id: string;
  name: string;
  version: string;
  type?: string;
  dependencies?: string[];
  init?(context: T): Promise<void> | void;
  dispose?(): Promise<void> | void;
}
```
- **id**: Unique identifier for the plugin
- **name**: Human-readable name
- **version**: Semver version
- **type**: Optional category (e.g., 'auth', 'transaction', 'ui')
- **dependencies**: Optional list of required plugins
- **init**: Called when the plugin is loaded (receives context)
- **dispose**: Called when the plugin is unloaded

### Plugin Manager Example
```typescript
import { PluginManager } from './PluginManager';
import { MyCoolPlugin } from './MyCoolPlugin';

const manager = new PluginManager();
manager.register(MyCoolPlugin);
manager.initAll({ appName: 'HAi Wallet' });
// ...
manager.disposeAll();
```
- Register plugins using `register()`
- Initialize all plugins with `initAll(context)`
- Dispose all plugins with `disposeAll()`
- Plugins can be queried by id or type

### Creating a New Plugin
1. Implement the relevant interface from `packages/core/plugin`.
2. Place your plugin in the appropriate `modules/` directory (frontend or backend).
3. Register your plugin in the relevant registration script (e.g., `apps/web/modules/registerPlugins.ts`).
4. Ensure your plugin is type-safe and does not break existing contracts.

---

## MVP Features — Explicit, Non-Abstracted Classification (Primary Breakdown)

This is the locked, definitive checklist for the MVP. All planning, code, and documentation must refer to these points directly, without merging, abstracting, or rewording them.

1. Natural Language Prompt Handling
The AI agent must flawlessly process these demo prompts:
“Send 100 USDC to Bob”
“Transfer 50 ETH to my savings wallet”
“Send 100 USDC to Bob and 50 USDC to Alice”
“Split 200 USDC between Bob, Alice, and Charlie”
“Swap 100 ETH to USDC and send half to Bob”
“Bridge 100 USDC to Polygon and send to Alice”
“Swap ETH to USDC, bridge to Arbitrum, send to Bob”

2. Transaction Preview & Visual Confirmation
Every transaction must show a preview with:
Each step (swap, bridge, send) clearly broken down
Route used for each step (e.g., “Uniswap V3”, “Hop Protocol”)
Estimated gas for each step
Estimated time for each step
Total gas and time
Savings or optimizations (e.g., “15% cheaper than manual execution”)
User must see and approve the preview before execution

3. Address Book Features
Each contact must support:
Multiple addresses (one per supported chain)
Avatar image
Transaction history (list of past transactions with date, amount, network)
Suggested network for sending (based on cost or recent use)
UI must display all of the above for each contact

4. Route Optimization
For every transaction, the system must:
Compare available routes (e.g., Uniswap, 1inch)
Show output, gas, time, price impact for each route
Clearly indicate which route is recommended by the AI and why

5. Control Modes (Demo)
The app must support and demo:
Agent mode: User gives a prompt, AI handles everything, user only approves
Semi mode: AI suggests, user refines and approves
Manual mode: User does everything manually
The UI must make the differences between these modes obvious

6. Backend AI Pipeline
The backend must process prompts through these steps:
Intent recognition
Parameter extraction
Validation and enrichment
Route optimization
Risk assessment
Simulation of transaction outcome
The backend must return: AI confidence, risk, and estimated outcome for the UI

7. Real-time Animated Feedback
The UI must animate through each backend processing step:
Parsing
Validating
Routing
Simulating
Ready for approval

8. Security & Verification (MVP Scope)
Only verification for bridge transactions (using already integrated bridges)
No transaction limits, fraud detection, or audit trail required for MVP

---

## Development Workflow & Best Practices

- All new features must be implemented as plugins and registered via the PluginManager
- Strictly adhere to the interface contracts in `packages/core/plugin` and `packages/types`
- Use TypeScript for all code to ensure type safety and maintainability
- Write unit and integration tests for all plugins and core modules
- Document all new modules and update onboarding docs as needed
- Refer to the MVP feature breakdown for scope—do not add features outside this list for the MVP

---

## Getting Started

1. Clone the repository and install dependencies (`npm install` or `yarn`)
2. Review the directory structure and interface templates
3. To add a new feature, create a plugin in the appropriate `modules/` directory and register it
4. Run the frontend (`apps/web/`) and backend (`apps/api/`) locally for development
5. Use the journal (`HAi-Wallet-Journal.md`) for informal build history and troubleshooting
6. For any questions, refer to this onboarding guide as the single source of truth

---

Welcome to the HAi Wallet team. Build with confidence. 

---

## AI Agent Pipeline Plugin: Natural Language Processing & OpenAI Integration

The AI Agent Pipeline is a core backend plugin responsible for processing user natural language prompts and converting them into structured transaction plans. This pipeline is designed to be modular, extensible, and powered by real OpenAI integration—no mock data or hardcoding.

### Purpose
- To interpret user prompts (e.g., “Send 100 USDC to Bob”) and output actionable, structured transaction instructions for the wallet engine and UI.
- To orchestrate a multi-step pipeline: intent recognition, parameter extraction, validation/enrichment, route optimization, risk assessment, and transaction simulation.

### Key Files & Locations
- **Plugin Interface & Types:** `packages/core/plugin/AIAgentPipelinePlugin.ts`
  - Defines the `IAIAgentPipelinePlugin` interface and all related types (intent, parameters, routes, risks, simulation, etc.).
- **Plugin Implementation:** `apps/api/modules/AIAgentPipelinePlugin.ts`
  - The actual plugin that implements the interface and exposes the `processPrompt` method.

### Interface Overview
```typescript
export interface IAIAgentPipelinePlugin extends IPlugin<AIAgentPipelineContext> {
  processPrompt(prompt: string, context: AIAgentPipelineContext): Promise<AIPipelineResult>;
}
```
- The `processPrompt` method is the main entry point. It takes a user prompt and context, runs it through the full pipeline, and returns a structured result.

### OpenAI Integration
- The plugin is designed to call the OpenAI API for:
  - Intent recognition (classifying the user’s goal)
  - Parameter extraction (pulling out amounts, tokens, recipients, etc.)
  - Optionally, validation, enrichment, risk assessment, and simulation (for reasoning and explanations)
- All OpenAI credentials and configuration should be managed securely via environment variables (`.env`).
- The plugin must parse OpenAI responses into the strict types defined in the interface, ensuring the UI and transaction engine always receive reliable, structured data.

### Extensibility
- Each pipeline step is modular and can be swapped or extended as needed (e.g., to support new transaction types or integrate additional reasoning engines).
- The plugin can be registered, upgraded, or replaced without modifying the core application logic, thanks to the project’s plugin architecture.

### Development Notes
- All prompt handling must use real OpenAI integration—no mock data or hardcoding is permitted for the MVP.
- The plugin should be thoroughly tested with all critical demo prompts listed in the MVP feature breakdown.
- For implementation details, refer to the journal and the code in the files above.

--- 

---

## OpenAI SDK & Dependency Setup

Before running or developing the AI Agent Pipeline plugin, ensure that all required dependencies are installed:

- Install the official OpenAI SDK:
  ```bash
  npm install openai
  ```
- Ensure your `.env` file contains a valid OpenAI API key:
  ```env
  OPENAI_API_KEY=sk-...
  ```
- Additional dependencies may be required for other pipeline steps or integrations. Refer to the package.json and documentation as needed.

The AI Agent Pipeline test suite covers all critical demo prompts and validates OpenAI integration. Always verify your environment is correctly configured before running tests or deploying new features.

--- 

---

## Intent Recognition: Handling Markdown Code Blocks in OpenAI Responses

When using OpenAI or OpenRouter, the model may return JSON results inside markdown code blocks (e.g., ```json ... ```). This can cause JSON parsing to fail if not handled properly.

**Solution:**
- The AI Agent Pipeline now strips any markdown code block formatting from the response before attempting to parse it as JSON.
- This ensures that intent, description, and confidence fields are always extracted as clean, structured data.

**Impact:**
- All demo prompts now return properly formatted intent results, with no more fallback to type: 'unknown' when the model actually provides a valid intent.
- The pipeline is robust against markdown-formatted responses and ready for further development.

For implementation details, see the `recognizeIntent` function in the AI Agent Pipeline plugin.

--- 