import fs from "fs";
import path from "path";
import i18n from "../../i18n";
import type { ExtensionManifest } from "../types";
import { validateExtensionManifest } from "../validation/validateExtensionManifest";
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
 */
export class ExtensionEngine {
  private extensions: Map<string, ExtensionInstance> = new Map();
  private extensionsDir: string;
  private maxExtensions: number;

  /**
   * Creates a new extension engine
   * @param options Extension engine options
   */
  constructor(options: ExtensionEngineOptions = {}) {
    this.extensionsDir =
      options.extensionsDir || path.join(process.cwd(), "extensions");
    this.maxExtensions = options.maxExtensions || 50;
  }

  /**
   * Loads all extensions from the extensions directory
   * @returns Promise with loaded extensions count
   */
  async loadAllExtensions(): Promise<number> {
    try {
      // Create extensions directory if it doesn't exist
      if (!fs.existsSync(this.extensionsDir)) {
        fs.mkdirSync(this.extensionsDir, { recursive: true });
      }

      // Read extension directories
      const extensionDirs = fs
        .readdirSync(this.extensionsDir, { withFileTypes: true })
        .filter((dirent) => dirent.isDirectory())
        .map((dirent) => path.join(this.extensionsDir, dirent.name));

      // Load each extension
      let loadedCount = 0;
      for (const extensionPath of extensionDirs) {
        if (loadedCount >= this.maxExtensions) {
          break;
        }

        const result = await this.loadExtension(extensionPath);
        if (result.success) {
          loadedCount++;
        }
      }

      return loadedCount;
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
    extensionPath: string,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Check if extension directory exists
      if (!fs.existsSync(extensionPath)) {
        return { success: false, error: "Extension directory does not exist" };
      }

      // Read manifest file
      const manifestPath = path.join(extensionPath, "manifest.json");
      if (!fs.existsSync(manifestPath)) {
        return { success: false, error: "Manifest file not found" };
      }

      // Parse manifest
      const manifestContent = fs.readFileSync(manifestPath, "utf8");
      const manifest = JSON.parse(manifestContent);

      // Validate manifest
      const validationResult = validateExtensionManifest(manifest);
      if (!validationResult.valid) {
        return {
          success: false,
          error: `Invalid manifest: ${validationResult.errors.join(", ")}`,
        };
      }

      // Check if extension is already loaded
      if (this.extensions.has(manifest.id)) {
        return { success: false, error: "Extension already loaded" };
      }

      // Create extension instance
      const extension: ExtensionInstance = {
        id: manifest.id,
        manifest: manifest as ExtensionManifest,
        path: extensionPath,
        status: "loaded",
        loadedAt: new Date(),
      };

      // Add to extensions map
      this.extensions.set(manifest.id, extension);

      // Register extension with parameter manager
      const parameterManager = getParameterManager();
      parameterManager.addExtension(extension);

      // Validate parameter dependencies
      const dependencyErrors = parameterManager.validateParameterDependencies(
        manifest.id,
      );
      if (dependencyErrors.length > 0) {
        console.warn(
          `Extension ${manifest.id} has parameter dependency issues:`,
          dependencyErrors,
        );
      }

      // Load i18n resources
      this.loadExtensionI18n(extension);

      return { success: true };
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

      // Remove i18n resources
      this.removeExtensionI18n(extension);

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
   * Loads i18n resources from an extension
   * @param extension Extension instance
   */
  private loadExtensionI18n(extension: ExtensionInstance): void {
    try {
      const { manifest } = extension;

      // Check if i18n is available (may not be in test environments)
      if (typeof i18n === "undefined") {
        return;
      }

      // Load extension-level i18n
      if (manifest.i18n) {
        Object.entries(manifest.i18n).forEach(([locale, i18nData]) => {
          if (!i18n.hasResourceBundle(locale, "translation")) {
            i18n.addResourceBundle(locale, "translation", {});
          }

          const extensionI18n = {
            extensions: {
              [manifest.id]: {
                name: i18nData.name,
                description: i18nData.description,
                publisher: i18nData.publisher,
              },
            },
          };

          i18n.addResourceBundle(
            locale,
            "translation",
            extensionI18n,
            true,
            true,
          );
        });
      }

      // Load widget-level i18n
      manifest.widgets.forEach((widget) => {
        if (widget.i18n) {
          Object.entries(widget.i18n).forEach(([locale, i18nData]) => {
            if (!i18n.hasResourceBundle(locale, "translation")) {
              i18n.addResourceBundle(locale, "translation", {});
            }

            const widgetI18n = {
              widgets: {
                [widget.id]: {
                  name: i18nData.name,
                  description: i18nData.description,
                  labels: i18nData.labels,
                },
              },
            };

            i18n.addResourceBundle(
              locale,
              "translation",
              widgetI18n,
              true,
              true,
            );
          });
        }
      });
    } catch (error) {
      console.error(
        `Error loading i18n resources for extension ${extension.id}:`,
        error,
      );
    }
  }

  /**
   * Removes i18n resources from an extension
   * @param extension Extension instance
   */
  private removeExtensionI18n(extension: ExtensionInstance): void {
    try {
      const { manifest } = extension;

      // Check if i18n is available (may not be in test environments)
      if (typeof i18n === "undefined") {
        return;
      }

      // Remove extension-level i18n
      const supportedLocales = ["en", "zh"];
      supportedLocales.forEach((locale) => {
        const resources = i18n.getResourceBundle(locale, "translation");
        if (
          resources &&
          resources.extensions &&
          resources.extensions[manifest.id]
        ) {
          delete resources.extensions[manifest.id];
        }

        // Remove widget-level i18n
        manifest.widgets.forEach((widget) => {
          if (resources && resources.widgets && resources.widgets[widget.id]) {
            delete resources.widgets[widget.id];
          }
        });
      });
    } catch (error) {
      console.error(
        `Error removing i18n resources for extension ${extension.id}:`,
        error,
      );
    }
  }

  /**
   * Clears all extensions
   */
  clearExtensions(): void {
    // Remove i18n resources for all extensions
    this.extensions.forEach((extension) => {
      this.removeExtensionI18n(extension);
    });

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
