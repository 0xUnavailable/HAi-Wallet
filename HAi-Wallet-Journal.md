# HAi Wallet Development Journal

---

### Project Kickoff: Getting Started

We kicked things off by laying out the big idea for HAi Wallet. The goal? Make a web3 wallet that feels as easy and smart as using a modern app—no more clunky crypto UX. We want users to create wallets with Google, email, or the old-school way, and manage everything (keys, contacts, etc.) in one place. The real magic is the AI agent that helps with transfers, swaps, and bridges, making crypto feel like magic for everyone, not just the techies.

---

### Tech Stack: What We're Building With

Here’s the stack we picked to make this all happen:
- Frontend: React/Next.js (PWA), Tailwind CSS, Redux Toolkit or Zustand, Ethers.js/Viem
- Backend: Node.js/Express or FastAPI, PostgreSQL, Redis, Firebase/Auth0, OpenAI API or custom LLM
- Security: HSM, AES-256, TLS 1.3
- Everything is modular and plug-in–friendly, so we can swap out parts like Lego blocks

Why this stack? We want something modern, scalable, and easy to hire for. React/Next.js gives us PWA power and SSR, Ethers.js is the gold standard for web3, and the backend is flexible enough to go full JS or Python depending on the team. Security is non-negotiable, so we’re using best-in-class encryption and key storage.

---

### Project Structure: The Lego Block Layout

We set up the project as a monorepo with a super modular structure. Here’s the basic layout:
- `apps/web/` for the frontend PWA
- `apps/api/` for the backend API
- `packages/core/` for shared logic (wallet, agent, etc.)
- `packages/adapters/` for plug-in adapters (blockchains, auth, etc.)
- `packages/ui/` for shared UI components
- `packages/types/` for shared TypeScript types
- `scripts/` for devops and utility scripts
- `.env`, `package.json`, and `README.md` at the root

Everything is set up so we can add, remove, or swap modules without breaking anything else. This is what lets us build features as plug-ins and keep the codebase clean.

---

### Version Control: Git Init!

We got version control rolling with a fresh git repo. Now every change is tracked, and we can collaborate or roll back if needed. No more “final_final_v2” files!

---

### Interface Templates: The Blueprint

We started by designing interface templates for every core part of the system. These are like contracts for how each module (auth, wallet, AI, etc.) should work, so we can build everything as plug-ins. If it fits the interface, it’ll work—no matter who builds it or when. This is what makes the system future-proof and lets us swap out implementations without headaches.

---

### Interface Review: Making Sure the Blueprints Are Solid

We went through each interface section by section, making sure they cover all the use cases, are easy to extend, and don’t leak any sensitive info. If it wasn’t perfect, we fixed it. Now we’ve got a set of rock-solid interfaces for:
- Auth & Wallet Management
- AI Agent Core
- Control System Manager
- Transaction Engine

This means every new feature or integration is just a new plug-in that fits the contract. No more spaghetti code.

---

### Plugin System: The Heart of Modularity

This is where things get really cool. We built a base plugin interface and a PluginManager. Every feature is a plug-in, and the manager handles registration, loading, and unloading. This means we can add new stuff or swap out old stuff without touching the core. The code is type-safe, easy to extend, and ready for hot-swapping in the future.

Here’s what the base plugin interface looks like:
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

And here’s the PluginManager:
```typescript
import { IPlugin } from './IPlugin';

export class PluginManager<T = any> {
  private plugins: Map<string, IPlugin<T>> = new Map();

  register(plugin: IPlugin<T>): void {
    this.plugins.set(plugin.id, plugin);
  }

  async initAll(context: T): Promise<void> {
    for (const plugin of this.plugins.values()) {
      if (plugin.init) await plugin.init(context);
    }
  }

  async disposeAll(): Promise<void> {
    for (const plugin of this.plugins.values()) {
      if (plugin.dispose) await plugin.dispose();
    }
  }

  getPlugin(id: string): IPlugin<T> | undefined {
    return this.plugins.get(id);
  }

  getPluginsByType(type: string): IPlugin<T>[] {
    return Array.from(this.plugins.values()).filter(p => p.type === type);
  }
}
```

How do you use it? Here’s a quick example:
```typescript
import { PluginManager } from './PluginManager';
import { MyCoolPlugin } from './MyCoolPlugin';

const manager = new PluginManager();
manager.register(MyCoolPlugin);
manager.initAll({ appName: 'HAi Wallet' });
// ...
manager.disposeAll();
```

Why do it this way? Because it means every feature is a plug-in, and the core app just manages them. You can add, remove, or update features without ever touching the main codebase. It’s the ultimate in flexibility and keeps things from turning into a mess as the project grows.

---

### Example Plugins: Hello World!

To prove the system works, we made simple HelloWorld plugins for both frontend and backend. They just log messages when loaded or unloaded, but they show that the plugin system is working and ready for real features.

Here’s what a basic plugin looks like:
```typescript
import { IPlugin } from '../../../packages/core/plugin/IPlugin';

export const HelloWorldPlugin: IPlugin = {
  id: 'hello-world',
  name: 'Hello World Plugin',
  version: '1.0.0',
  type: 'demo',
  init: () => {
    console.log('HelloWorldPlugin initialized!');
  },
  dispose: () => {
    console.log('HelloWorldPlugin disposed!');
  },
};
```

---

### Plugin Registration: Plug and Play

We set up scripts to register and initialize plugins in both frontend and backend. You just import your plugin, register it with the manager, and call `initAll()`. It’s dead simple and works the same everywhere. Here’s how you do it:
```typescript
import { PluginManager } from '../../../packages/core/plugin/PluginManager';
import { HelloWorldPlugin } from './HelloWorldPlugin';

const context = { appName: 'HAi Wallet Web', version: '1.0.0' };
const pluginManager = new PluginManager<typeof context>();
pluginManager.register(HelloWorldPlugin);
pluginManager.initAll(context);
// pluginManager.disposeAll(); // To clean up
```

Why this approach? Because it means onboarding a new feature is as easy as dropping in a new file and registering it. No more digging through the codebase to wire things up.

---

### 16. MVP Requirements: What We're Really Building

Alright, here’s the real, no-nonsense breakdown of what the MVP for HAi Wallet’s AI Agent absolutely needs to do. This is the checklist we’ll keep coming back to as we build and demo.

- The AI agent has to nail these demo prompts every single time. We’re talking about stuff like:
  - “Send 100 USDC to Bob”
  - “Transfer 50 ETH to my savings wallet”
  - “Send 100 USDC to Bob and 50 USDC to Alice”
  - “Split 200 USDC between Bob, Alice, and Charlie”
  - “Swap 100 ETH to USDC and send half to Bob”
  - “Bridge 100 USDC to Polygon and send to Alice”
  - “Swap ETH to USDC, bridge to Arbitrum, send to Bob”
  If it can’t handle these, it’s not ready for showtime.

- Every transaction, especially the wild multi-step ones, needs to have a gorgeous, crystal-clear preview. The user should see:
  - Each step (swap, bridge, send) broken down
  - Which route is being used (like “Uniswap V3” or “Hop Protocol”)
  - Estimated gas and time for each step
  - The total gas and time
  - Any savings or optimizations (like “15% cheaper than manual execution”)
  - And most importantly: the user has to approve before anything happens

- The address book isn’t just a list of names. Each contact should have:
  - Multiple addresses (one for each supported chain)
  - An avatar (because why not?)
  - A real transaction history (so you can see what you’ve done with them)
  - A suggested network for sending (based on cost or what you used last)
  - The UI should make all this info super easy to see and use

- When it comes to actually sending or swapping, the AI should:
  - Compare all the available routes (like Uniswap vs. 1inch)
  - Show the output, gas, time, and price impact for each
  - Clearly say which route it recommends and why

- We’re showing off three control modes in the demo:
  - Agent mode: User just says what they want, AI does the rest, user just hits approve
  - Semi mode: AI suggests, user tweaks and approves
  - Manual mode: User does everything the old-school way
  - The UI should make it obvious which mode you’re in and what’s happening

- The backend AI pipeline isn’t just a black box. For every prompt, it should:
  - Figure out what the user wants (intent recognition)
  - Pull out all the details (parameter extraction)
  - Double-check and fill in any blanks (validation and enrichment)
  - Find the best route (route optimization)
  - Check for any risks (risk assessment)
  - Simulate what will happen (simulation)
  - And send back: how confident it is, any risks, and what the outcome will look like

- The UI should feel alive. As the backend does its thing, the user should see:
  - Parsing
  - Validating
  - Routing
  - Simulating
  - Ready for approval
  - Each step should animate or update in real time so it feels smart and transparent

- Security and verification for the MVP is simple:
  - Only verify bridge transactions (and only for bridges we already support)
  - No need for transaction limits, fraud detection, or audit trails right now

---

This is the MVP playbook. If it’s not on this list, it’s not in the MVP. We’ll keep this as our north star as we build, test, and demo. Let’s get to work! 

---

### MVP Features — Explicit, Non-Abstracted Classification (Primary Breakdown)

This is the locked, definitive checklist for the MVP. All planning, code, and documentation will refer to these points directly, without merging, abstracting, or rewording them.

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

---

### Kicking Off the AI Agent Pipeline (Natural Language Prompt Handling)

Alright, we’re moving into the real magic of HAi Wallet: the AI agent pipeline that takes natural language prompts and turns them into flawless, demo-ready crypto actions. This is the heart of what makes the wallet feel smart and easy.

Here’s what we need to nail for the MVP:
- The AI agent has to perfectly understand and process these demo prompts:
  - “Send 100 USDC to Bob”
  - “Transfer 50 ETH to my savings wallet”
  - “Send 100 USDC to Bob and 50 USDC to Alice”
  - “Split 200 USDC between Bob, Alice, and Charlie”
  - “Swap 100 ETH to USDC and send half to Bob”
  - “Bridge 100 USDC to Polygon and send to Alice”
  - “Swap ETH to USDC, bridge to Arbitrum, send to Bob”
- The backend pipeline needs to handle:
  - Intent recognition
  - Parameter extraction
  - Validation and enrichment
  - Route optimization
  - Risk assessment
  - Simulation of the transaction outcome
- The backend should return: AI confidence, risk, and estimated outcome for the UI

How we’re going to tackle it:
- First, we’ll design a clean interface for the pipeline so every step is modular and swappable (just like the rest of the system)
- Then, we’ll scaffold the pipeline as a backend plugin/module, with stubs for each step
- We’ll hardcode or mock the logic for the critical demo prompts to guarantee they work perfectly for the MVP
- As always, we’ll keep the code and docs super clear so anyone can jump in and extend it later

Next up: decide if we want to review the interface and structure first, or just scaffold the files and show the initial code. Let’s make this AI agent the star of the show! 

---

### AI Agent Pipeline: Now a Real Plugin (Ready for OpenAI)

Big step forward! We just scaffolded the AI Agent Pipeline as a proper plugin, following our plugin template. Here’s what’s new:

- We defined a super clear interface (`IAIAgentPipelinePlugin`) in `packages/core/plugin/AIAgentPipelinePlugin.ts`. This spells out exactly what the pipeline needs to do, what types it works with, and how it plugs into the rest of the system.
- The actual plugin lives in `apps/api/modules/AIAgentPipelinePlugin.ts`. It’s got all the right fields (id, name, version, type) and exposes the main `processPrompt` method that will handle real OpenAI-powered prompt processing.
- The plugin is ready to be registered with the PluginManager, just like any other feature. This means the AI agent pipeline is now fully modular and can be swapped, upgraded, or extended without touching the core app.

What’s next? We’ll wire up the real OpenAI integration inside `processPrompt`, so every prompt goes through the full pipeline (intent, params, validation, etc.) and returns structured results for the UI. No mocks, no hardcoding—just real AI.

This is a major milestone for the MVP’s natural language handling. The foundation is set—now it’s time to make the AI agent actually smart! 

---

### Prepping for AI Agent Pipeline Testing (Don’t Forget the Packages!)

Heads up: Before we run the intent recognition tests for the AI Agent Pipeline, we need to make sure the OpenAI SDK (and any other required packages) are installed. No point in running tests if the code can’t talk to OpenAI!

What’s new:
- We expanded the test file to run all the critical demo prompts (plus a complex combo prompt) through the pipeline’s intent recognition step.
- Each prompt’s result will be logged, so we can see exactly how OpenAI is handling our real-world scenarios.

Next up:
- Install the OpenAI SDK (`npm install openai`) and double-check that your `.env` has the right API key.
- Then, run the test file and review the outputs. If everything looks good, we’ll move on to the next pipeline step.

Let’s make sure the plumbing is in place before we turn on the faucet! 

---

### Intent Recognition: Clean, Structured Results (Markdown Fix)

We hit a snag where OpenAI (or OpenRouter) would return the intent as a JSON object inside a markdown code block (```json ... ```), which broke our parser and made the type always 'unknown'.

The fix: Before parsing, we now strip out any markdown code block formatting from the response. This means the intent, description, and confidence fields are now properly extracted and returned as a clean, structured object—just like we want for the MVP.

Now, every demo prompt returns a real, usable intent result, and the pipeline is ready for the next step. No more type: 'unknown' when the model actually gets it right! 