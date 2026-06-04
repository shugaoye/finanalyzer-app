import type { WidgetConfig } from '../../types/widgets';

/**
 * WidgetPackager - Handles packaging and exporting widget code
 */
export class WidgetPackager {
  /**
   * Generate TypeScript code for a widget based on its configuration
   */
  static generateWidgetCode(config: WidgetConfig): string {
    const widgetName = config.type.charAt(0).toUpperCase() + config.type.slice(1) + 'Widget';
    const paramsInterface = this.generateParamsInterface(config);
    const imports = this.generateImports(config);
    const componentCode = this.generateComponentCode(config, widgetName);
    
    return `${imports}

${paramsInterface}

export function ${widgetName}({ widget, onRefresh, onUpdate }: ${widgetName}Props): JSX.Element {
  // Add your widget logic here
  
  ${componentCode}
}

export default ${widgetName};
`;
  }

  /**
   * Generate import statements for the widget
   */
  private static generateImports(config: WidgetConfig): string {
    let imports = `import React from 'react';
import type { WidgetInstanceProps } from '../../types/widgets';
import { WidgetWrapper } from '../components/widgets/WidgetWrapper';`;
    
    // Add specific imports based on widget type
    switch (config.type) {
      case 'chart':
        imports += `
import { ChartWidget } from '../components/widgets/shared/ChartWidget';`;
        break;
      case 'table':
        imports += `
import { TableWidget } from '../components/widgets/shared/TableWidget';`;
        break;
      case 'markdown':
        imports += `
import { MarkdownWidget } from '../components/widgets/MarkdownWidget';`;
        break;
      case 'html':
        imports += `
import { HtmlWidget } from '../components/widgets/HtmlWidget';`;
        break;
    }
    
    return imports;
  }

  /**
   * Generate params interface for the widget
   */
  private static generateParamsInterface(config: WidgetConfig): string {
    const widgetName = config.type.charAt(0).toUpperCase() + config.type.slice(1) + 'Widget';
    
    return `interface ${widgetName}Props extends WidgetInstanceProps {
  // Add any additional props here
}`;
  }

  /**
   * Generate component code for the widget
   */
  private static generateComponentCode(config: WidgetConfig, widgetName: string): string {
    let componentCode = `return (
    <WidgetWrapper isLoading={false} onRefresh={onRefresh}>
      <div className="p-4">
        <h3>${config.name || widgetName}</h3>
        <p>Widget type: ${config.type}</p>
        <p>Endpoint: ${config.endpoint || 'N/A'}</p>`;
    
    // Add parameter display for demonstration
    if (config.params && config.params.length > 0) {
      componentCode += `
        <div className="mt-4">
          <h4>Parameters:</h4>
          <ul className="list-disc pl-5">`;
      
      config.params.forEach(param => {
        componentCode += `
            <li>${param.name}: ${param.default || 'No default'}</li>`;
      });
      
      componentCode += `
          </ul>
        </div>`;
    }
    
    componentCode += `
        {/* Add your widget content here */}
      </div>
    </WidgetWrapper>
  );`;
    
    return componentCode;
  }

  /**
   * Export widget code as a TypeScript file
   */
  static exportWidgetCode(config: WidgetConfig): void {
    const code = this.generateWidgetCode(config);
    const blob = new Blob([code], { type: 'text/typescript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${config.id || 'widget'}.tsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Export widget configuration as a JSON file
   */
  static exportWidgetConfig(config: WidgetConfig): void {
    const configStr = JSON.stringify(config, null, 2);
    const blob = new Blob([configStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${config.id || 'widget-config'}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Generate a complete widget package with all necessary files
   */
  static generateWidgetPackage(config: WidgetConfig): { files: Record<string, string> } {
    const widgetName = config.type.charAt(0).toUpperCase() + config.type.slice(1) + 'Widget';
    const componentFile = `${widgetName}.tsx`;
    const configFile = `${config.id || 'widget'}-config.json`;
    
    return {
      files: {
        [componentFile]: this.generateWidgetCode(config),
        [configFile]: JSON.stringify(config, null, 2)
      }
    };
  }
}
