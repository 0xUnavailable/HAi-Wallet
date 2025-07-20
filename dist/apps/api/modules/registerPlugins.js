"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const PluginManager_1 = require("../../../packages/core/plugin/PluginManager");
const HelloWorldPlugin_1 = require("./HelloWorldPlugin");
// Example context for backend plugins (can be expanded as needed)
const backendContext = {
    serviceName: 'HAi Wallet API',
    version: '1.0.0',
};
const pluginManager = new PluginManager_1.PluginManager();
// Register plugins
pluginManager.register(HelloWorldPlugin_1.HelloWorldPlugin);
// Initialize all plugins
pluginManager.initAll(backendContext);
// To dispose all plugins (e.g., on server shutdown)
// pluginManager.disposeAll(); 
