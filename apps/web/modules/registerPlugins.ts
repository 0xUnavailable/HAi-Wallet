import { PluginManager } from '../../../packages/core/plugin/PluginManager';
import { HelloWorldPlugin } from './HelloWorldPlugin';

// Example context for frontend plugins (can be expanded as needed)
const frontendContext = {
  appName: 'HAi Wallet Web',
  version: '1.0.0',
};

const pluginManager = new PluginManager<typeof frontendContext>();

// Register plugins
pluginManager.register(HelloWorldPlugin);

// Initialize all plugins
pluginManager.initAll(frontendContext);

// To dispose all plugins (e.g., on app shutdown)
// pluginManager.disposeAll(); 