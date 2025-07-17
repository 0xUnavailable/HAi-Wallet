# Plugin System Core

This directory contains the core logic, interfaces, and utilities for the HAi Wallet plugin system. All plugins (backend and frontend) must conform to the base plugin interface and be managed by the PluginManager.

## Structure
- `IPlugin.ts` — Base plugin interface
- `PluginManager.ts` — Plugin loader/manager implementation
- `types.ts` — Shared types for plugins

All plugin modules in the app should be registered and managed through this system for maximum modularity and extensibility. 