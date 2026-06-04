import type { ExtensionManifest } from "../types";
import { getParameterManager } from "./ParameterManager";

/**
 * Extension instance
 */
export interface ExtensionInstance {
  id: string;
  manifest: ExtensionManifest;
  path: string;
  status: "loaded" | "unloaded" | "error";
  error?: string;
  loadedAt?: Date;
  unloadedAt?: Date;
}

/**
 * Extension engine options
 */
export interface ExtensionEngineOptions {
  extensionsDir?: string;
  sandboxed?: boolean;
  maxExtensions?: number;
}

/**
 * Extension engine for managing extensions
 * This is a browser-compatible version that doesn't use Node.js modules
 */
export class ExtensionEngine {
  private extensions: Map<string, ExtensionInstance> = new Map();

  /**
   * Creates a new extension engine
   * @param options Extension engine options
   */
  constructor(_options: ExtensionEngineOptions = {}) {
    // No-op in browser
  }

  /**
   * Loads all extensions from the extensions directory
   * @returns Promise with loaded extensions count
   */
  async loadAllExtensions(): Promise<number> {
    try {
      // In browser, we can't read from the filesystem
      // Return empty array
      return 0;
    } catch (error) {
      console.error("Error loading extensions:", error);
      return 0;
    }
  }

  /**
   * Loads a single extension from a directory
   * @param extensionPath Path to the extension directory
   * @returns Load result
   */
  async loadExtension(
    _extensionPath: string,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // In browser, we can't read from the filesystem
      // Return error
      return {
        success: false,
        error: "Extension loading not supported in browser",
      };
    } catch (error) {
      console.error("Error loading extension:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to load extension",
      };
    }
  }

  /**
   * Unloads an extension
   * @param extensionId Extension ID
   * @returns Unload result
   */
  unloadExtension(extensionId: string): { success: boolean; error?: string } {
    try {
      const extension = this.extensions.get(extensionId);
      if (!extension) {
        return { success: false, error: "Extension not found" };
      }

      // Update extension status
      extension.status = "unloaded";
      extension.unloadedAt = new Date();

      // Remove from extensions map
      this.extensions.delete(extensionId);

      // Remove extension from parameter manager
      const parameterManager = getParameterManager();
      parameterManager.removeExtension(extensionId);

      return { success: true };
    } catch (error) {
      console.error("Error unloading extension:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to unload extension",
      };
    }
  }

  /**
   * Updates an extension
   * @param extensionId Extension ID
   * @param extensionPath New extension path
   * @returns Update result
   */
  async updateExtension(
    extensionId: string,
    extensionPath: string,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Unload existing extension
      const unloadResult = this.unloadExtension(extensionId);
      if (!unloadResult.success) {
        return unloadResult;
      }

      // Load new extension
      return await this.loadExtension(extensionPath);
    } catch (error) {
      console.error("Error updating extension:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to update extension",
      };
    }
  }

  /**
   * Gets all loaded extensions
   * @returns Array of extension instances
   */
  getExtensions(): ExtensionInstance[] {
    return Array.from(this.extensions.values());
  }

  /**
   * Gets a single extension by ID
   * @param extensionId Extension ID
   * @returns Extension instance or undefined
   */
  getExtension(extensionId: string): ExtensionInstance | undefined {
    return this.extensions.get(extensionId);
  }

  /**
   * Checks if an extension is loaded
   * @param extensionId Extension ID
   * @returns True if extension is loaded
   */
  isExtensionLoaded(extensionId: string): boolean {
    return this.extensions.has(extensionId);
  }

  /**
   * Clears all extensions
   */
  clearExtensions(): void {
    this.extensions.clear();
  }
}

/**
 * Creates a singleton instance of the extension engine
 */
let extensionEngineInstance: ExtensionEngine | null = null;

export function getExtensionEngine(
  options?: ExtensionEngineOptions,
): ExtensionEngine {
  if (!extensionEngineInstance) {
    extensionEngineInstance = new ExtensionEngine(options);
  }
  return extensionEngineInstance;
}
