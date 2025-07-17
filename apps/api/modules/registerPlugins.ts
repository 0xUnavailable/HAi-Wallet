import { PluginManager } from '../../../packages/core/plugin/PluginManager';
import { HelloWorldPlugin } from './HelloWorldPlugin';

// Example context for backend plugins (can be expanded as needed)
const backendContext = {
  serviceName: 'HAi Wallet API',
  version: '1.0.0',
};

const pluginManager = new PluginManager<typeof backendContext>();

// Register plugins
pluginManager.register(HelloWorldPlugin);

// Initialize all plugins
pluginManager.initAll(backendContext);

// To dispose all plugins (e.g., on server shutdown)
// pluginManager.disposeAll(); 