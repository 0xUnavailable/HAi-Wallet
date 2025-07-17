export interface IPlugin<T = any> {
  /** Unique identifier for the plugin */
  id: string;
  /** Human-readable name */
  name: string;
  /** Plugin version (semver) */
  version: string;
  /** Optional: Plugin type/category (e.g., 'auth', 'transaction', 'ui', etc.) */
  type?: string;
  /** Optional: Plugin dependencies (by id or type) */
  dependencies?: string[];
  /** Called when the plugin is loaded/initialized */
  init?(context: T): Promise<void> | void;
  /** Called when the plugin is unloaded/removed */
  dispose?(): Promise<void> | void;
}
