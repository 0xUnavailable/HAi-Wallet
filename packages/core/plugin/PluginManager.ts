import { IPlugin } from './IPlugin';

export class PluginManager<T = any> {
  private plugins: Map<string, IPlugin<T>> = new Map();

  /**
   * Register a plugin with the manager.
   * @param plugin The plugin instance to register.
   */
  register(plugin: IPlugin<T>): void {
    this.plugins.set(plugin.id, plugin);
  }

  /**
   * Initialize all registered plugins with the provided context.
   * @param context The context to pass to each plugin's init method.
   */
  async initAll(context: T): Promise<void> {
    for (const plugin of this.plugins.values()) {
      if (plugin.init) await plugin.init(context);
    }
  }

  /**
   * Dispose all registered plugins.
   */
  async disposeAll(): Promise<void> {
    for (const plugin of this.plugins.values()) {
      if (plugin.dispose) await plugin.dispose();
    }
  }

  /**
   * Get a plugin by its unique id.
   * @param id The plugin id.
   */
  getPlugin(id: string): IPlugin<T> | undefined {
    return this.plugins.get(id);
  }

  /**
   * Get all plugins of a certain type.
   * @param type The plugin type/category.
   */
  getPluginsByType(type: string): IPlugin<T>[] {
    return Array.from(this.plugins.values()).filter(p => p.type === type);
  }

  /**
   * (Optional) Discover and register plugins from a source (directory, manifest, etc.)
   * @param source The source to discover plugins from.
   */
  async discoverPlugins(source: string): Promise<void> {
    // Implementation depends on environment (Node.js, browser, etc.)
    // This is a placeholder for future expansion.
  }
}
