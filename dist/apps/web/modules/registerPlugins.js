"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const PluginManager_1 = require("../../../packages/core/plugin/PluginManager");
const HelloWorldPlugin_1 = require("./HelloWorldPlugin");
// Example context for frontend plugins (can be expanded as needed)
const frontendContext = {
    appName: 'HAi Wallet Web',
    version: '1.0.0',
};
const pluginManager = new PluginManager_1.PluginManager();
// Register plugins
pluginManager.register(HelloWorldPlugin_1.HelloWorldPlugin);
// Initialize all plugins
pluginManager.initAll(frontendContext);
// To dispose all plugins (e.g., on app shutdown)
// pluginManager.disposeAll(); 
