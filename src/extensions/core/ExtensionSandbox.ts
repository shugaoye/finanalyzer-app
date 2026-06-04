import fs from "fs";
import path from "path";
import vm from "vm";

/**
 * Sandbox options
 */
export interface ExtensionSandboxOptions {
  timeout?: number;
  memoryLimit?: number;
  allowedGlobals?: string[];
  allowedModules?: string[];
}

/**
 * Extension sandbox for secure execution
 */
export class ExtensionSandbox {
  private timeout: number;
  private memoryLimit: number;
  private allowedGlobals: Set<string>;

  /**
   * Creates a new extension sandbox
   * @param options Sandbox options
   */
  constructor(options: ExtensionSandboxOptions = {}) {
    this.timeout = options.timeout || 5000; // 5 seconds timeout
    this.memoryLimit = options.memoryLimit || 100 * 1024 * 1024; // 100MB memory limit
    this.allowedGlobals = new Set(
      options.allowedGlobals || ["console", "Date", "Math", "JSON"],
    );
  }

  /**
   * Creates a sandbox context
   * @param extensionPath Extension path for relative imports
   * @returns Sandbox context
   */
  private createContext(): vm.Context {
    // Base context with limited globals
    const exports: Record<string, any> = {};
    const baseContext: Record<string, any> = {
      console: {
        log: (...args: any[]) => console.log("[Extension]", ...args),
        error: (...args: any[]) => console.error("[Extension]", ...args),
        warn: (...args: any[]) => console.warn("[Extension]", ...args),
        info: (...args: any[]) => console.info("[Extension]", ...args),
      },
      Date: Date,
      Math: Math,
      JSON: JSON,
      module: {
        exports: exports,
      },
      exports: exports,
    };

    // Add allowed globals
    this.allowedGlobals.forEach((globalName) => {
      if (global[globalName as keyof typeof global]) {
        baseContext[globalName] = global[globalName as keyof typeof global];
      }
    });

    // Create sandbox context
    return vm.createContext(baseContext, {
      codeGeneration: {
        strings: true,
        wasm: false, // Disable WebAssembly for security
      },
      microtaskMode: "afterEvaluate",
    });
  }

  /**
   * Executes code in the sandbox
   * @param code Code to execute
   * @param extensionPath Extension path
   * @param filename Filename for error reporting
   * @returns Execution result
   */
  execute(
    code: string,
    _extensionPath: string,
    filename: string = "extension.js",
  ): { success: boolean; result?: any; error?: string } {
    try {
      const context = this.createContext();

      // Set up memory usage tracking
      const startMemory = process.memoryUsage();

      // Execute code with timeout and capture the result
      const result = vm.runInContext(code, context, {
        timeout: this.timeout,
        filename,
        displayErrors: true,
      });

      // Check memory usage
      const endMemory = process.memoryUsage();
      const memoryUsed = endMemory.rss - startMemory.rss;
      if (memoryUsed > this.memoryLimit) {
        return { success: false, error: "Memory limit exceeded" };
      }

      // Check if module.exports has been modified
      const hasExports = Object.keys(context.module.exports).length > 0;

      // Return module.exports for CommonJS modules, otherwise return the direct result
      return {
        success: true,
        result: hasExports ? context.module.exports : result,
      };
    } catch (error) {
      console.error("Error executing code in sandbox:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to execute code",
      };
    }
  }

  /**
   * Loads and executes a module from the extension
   * @param modulePath Module path relative to extension directory
   * @param extensionPath Extension path
   * @returns Execution result
   */
  loadModule(
    modulePath: string,
    extensionPath: string,
  ): { success: boolean; result?: any; error?: string } {
    try {
      // Resolve absolute path
      const absolutePath = path.resolve(extensionPath, modulePath);

      // Check if path is within extension directory
      if (!absolutePath.startsWith(extensionPath)) {
        return {
          success: false,
          error: "Module path outside extension directory",
        };
      }

      // Check if file exists
      if (!fs.existsSync(absolutePath)) {
        return { success: false, error: "Module file not found" };
      }

      // Read file content
      const code = fs.readFileSync(absolutePath, "utf8");

      // Execute in sandbox
      return this.execute(code, extensionPath, absolutePath);
    } catch (error) {
      console.error("Error loading module:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to load module",
      };
    }
  }

  /**
   * Validates and loads an extension entry point
   * @param entryPoint Entry point path relative to extension directory
   * @param extensionPath Extension path
   * @returns Load result
   */
  loadEntryPoint(
    entryPoint: string,
    extensionPath: string,
  ): { success: boolean; result?: any; error?: string } {
    // Validate entry point format
    if (!entryPoint || typeof entryPoint !== "string") {
      return { success: false, error: "Invalid entry point" };
    }

    // Load the entry point
    return this.loadModule(entryPoint, extensionPath);
  }
}

/**
 * Creates a singleton instance of the extension sandbox
 */
let sandboxInstance: ExtensionSandbox | null = null;

export function getExtensionSandbox(
  options?: ExtensionSandboxOptions,
): ExtensionSandbox {
  if (!sandboxInstance) {
    sandboxInstance = new ExtensionSandbox(options);
  }
  return sandboxInstance;
}
