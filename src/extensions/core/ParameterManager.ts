import type { ExtensionInstance } from './ExtensionEngine.browser';
// import type { WidgetParameter } from '../types';

/**
 * Parameter manager for handling parameter linking and dependencies
 */
export class ParameterManager {
  private extensions: Map<string, ExtensionInstance> = new Map();
  private parameterValues: Map<string, any> = new Map();
  private parameterLinks: Map<string, Array<{
    target: string;
    transform?: string;
  }>> = new Map();

  /**
   * Adds an extension to the parameter manager
   * @param extension Extension instance
   */
  addExtension(extension: ExtensionInstance): void {
    this.extensions.set(extension.id, extension);
    
    // Register extension-level parameters
    if (extension.manifest.parameters) {
      Object.entries(extension.manifest.parameters).forEach(([paramName, param]) => {
        const fullParamName = `${extension.id}.${paramName}`;
        if (param.value !== undefined) {
          this.parameterValues.set(fullParamName, param.value);
        }
      });
    }

    // Register widget-level parameters
    extension.manifest.widgets.forEach(widget => {
      if (widget.params) {
        widget.params.forEach(param => {
          const fullParamName = `${extension.id}.${widget.id}.${param.paramName}`;
          if (param.value !== undefined) {
            this.parameterValues.set(fullParamName, param.value);
          }
        });
      }
    });

    // Register parameter links
    if (extension.manifest.parameterLinks) {
      extension.manifest.parameterLinks.forEach(link => {
        const source = link.source;
        if (!this.parameterLinks.has(source)) {
          this.parameterLinks.set(source, []);
        }
        this.parameterLinks.get(source)?.push({
          target: link.target,
          transform: link.transform
        });
      });
    }
  }

  /**
   * Removes an extension from the parameter manager
   * @param extensionId Extension ID
   */
  removeExtension(extensionId: string): void {
    const extension = this.extensions.get(extensionId);
    if (!extension) return;

    // Remove extension-level parameters
    if (extension.manifest.parameters) {
      Object.keys(extension.manifest.parameters).forEach(paramName => {
        const fullParamName = `${extensionId}.${paramName}`;
        this.parameterValues.delete(fullParamName);
      });
    }

    // Remove widget-level parameters
    extension.manifest.widgets.forEach(widget => {
      if (widget.params) {
        widget.params.forEach(param => {
          const fullParamName = `${extensionId}.${widget.id}.${param.paramName}`;
          this.parameterValues.delete(fullParamName);
        });
      }
    });

    // Remove parameter links
    if (extension.manifest.parameterLinks) {
      extension.manifest.parameterLinks.forEach(link => {
        const source = link.source;
        const links = this.parameterLinks.get(source);
        if (links) {
          const updatedLinks = links.filter(l => l.target !== link.target);
          if (updatedLinks.length === 0) {
            this.parameterLinks.delete(source);
          } else {
            this.parameterLinks.set(source, updatedLinks);
          }
        }
      });
    }

    this.extensions.delete(extensionId);
  }

  /**
   * Sets a parameter value
   * @param paramName Full parameter name (format: extensionId.widgetId.paramName or extensionId.paramName)
   * @param value Parameter value
   */
  setParameterValue(paramName: string, value: any): void {
    this.parameterValues.set(paramName, value);
    
    // Trigger linked parameters
    const links = this.parameterLinks.get(paramName);
    if (links) {
      links.forEach(link => {
        let transformedValue = value;
        
        // Apply transform if specified
        if (link.transform) {
          try {
            // Simple transform function evaluation
            const transformFn = new Function('value', `return ${link.transform};`);
            transformedValue = transformFn(value);
          } catch (error) {
            console.error(`Error applying transform for link ${paramName} -> ${link.target}:`, error);
          }
        }
        
        this.setParameterValue(link.target, transformedValue);
      });
    }
  }

  /**
   * Gets a parameter value
   * @param paramName Full parameter name
   * @returns Parameter value or undefined
   */
  getParameterValue(paramName: string): any {
    return this.parameterValues.get(paramName);
  }

  /**
   * Gets all parameters for an extension
   * @param extensionId Extension ID
   * @returns Map of parameter names to values
   */
  getExtensionParameters(extensionId: string): Map<string, any> {
    const parameters = new Map<string, any>();
    
    // Get extension-level parameters
    if (this.extensions.has(extensionId)) {
      const extension = this.extensions.get(extensionId)!;
      if (extension.manifest.parameters) {
        Object.keys(extension.manifest.parameters).forEach(paramName => {
          const fullParamName = `${extensionId}.${paramName}`;
          const value = this.parameterValues.get(fullParamName);
          if (value !== undefined) {
            parameters.set(paramName, value);
          }
        });
      }
    }
    
    return parameters;
  }

  /**
   * Gets all parameters for a widget
   * @param extensionId Extension ID
   * @param widgetId Widget ID
   * @returns Map of parameter names to values
   */
  getWidgetParameters(extensionId: string, widgetId: string): Map<string, any> {
    const parameters = new Map<string, any>();
    
    // Get widget-level parameters
    if (this.extensions.has(extensionId)) {
      const extension = this.extensions.get(extensionId)!;
      const widget = extension.manifest.widgets.find(w => w.id === widgetId);
      if (widget && widget.params) {
        widget.params.forEach(param => {
          const fullParamName = `${extensionId}.${widgetId}.${param.paramName}`;
          const value = this.parameterValues.get(fullParamName);
          if (value !== undefined) {
            parameters.set(param.paramName, value);
          } else if (param.value !== undefined) {
            parameters.set(param.paramName, param.value);
          }
        });
      }
    }
    
    return parameters;
  }

  /**
   * Validates parameter dependencies
   * @param extensionId Extension ID
   * @returns Array of validation errors
   */
  validateParameterDependencies(extensionId: string): string[] {
    const errors: string[] = [];
    const extension = this.extensions.get(extensionId);
    if (!extension) return errors;

    // Validate widget parameters
    extension.manifest.widgets.forEach(widget => {
      if (widget.params) {
        widget.params.forEach(param => {
          if (param.dependsOn) {
            param.dependsOn.forEach(dependency => {
              const fullDependencyName = dependency.startsWith(`${extensionId}.`) 
                ? dependency 
                : `${extensionId}.${widget.id}.${dependency}`;
              
              if (!this.parameterValues.has(fullDependencyName)) {
                errors.push(`Widget ${widget.id}: Parameter ${param.paramName} depends on missing parameter ${dependency}`);
              }
            });
          }
        });
      }
    });

    // Validate extension-level parameters
    if (extension.manifest.parameters) {
      Object.entries(extension.manifest.parameters).forEach(([paramName, param]) => {
        if (param.dependsOn) {
          param.dependsOn.forEach(dependency => {
            const fullDependencyName = dependency.startsWith(`${extensionId}.`) 
              ? dependency 
              : `${extensionId}.${dependency}`;
            
            if (!this.parameterValues.has(fullDependencyName)) {
              errors.push(`Extension ${extensionId}: Parameter ${paramName} depends on missing parameter ${dependency}`);
            }
          });
        }
      });
    }

    return errors;
  }

  /**
   * Clears all parameters
   */
  clear(): void {
    this.parameterValues.clear();
    this.parameterLinks.clear();
  }
}

/**
 * Creates a singleton instance of the parameter manager
 */
let parameterManagerInstance: ParameterManager | null = null;

export function getParameterManager(): ParameterManager {
  if (!parameterManagerInstance) {
    parameterManagerInstance = new ParameterManager();
  }
  return parameterManagerInstance;
}
