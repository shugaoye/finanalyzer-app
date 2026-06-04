// Extension manifest types

/**
 * Form input parameter definition
 */
export interface FormInputParameter {
  paramName: string;
  type: string;
  label: string;
  description?: string;
  value?: string | number;
  options?: Array<{ value: string; label: string }>;
  min?: number;
  max?: number;
  step?: number;
  required?: boolean;
}

/**
 * Parameter definition for widgets
 */
export interface WidgetParameter {
  paramName: string;
  label: string;
  description?: string;
  type: string;
  value?: any;
  required?: boolean;
  options?: Array<{ value: any; label: string }>;
  min?: number;
  max?: number;
  step?: number;
  multiSelect?: boolean;
  // For endpoint type
  optionsEndpoint?: string;
  optionsParams?: Record<string, any>;
  // For form type
  endpoint?: string;
  inputParams?: FormInputParameter[];
  // Common properties
  dependsOn?: string[];
  show?: boolean;
  optional?: boolean;
}

/**
 * Widget definition in extension manifest
 */
export interface ExtensionWidget {
  id: string;
  name: string;
  description: string;
  category: string;
  version: string;
  entryPoint: string;
  dependencies?: string[];
  config?: Record<string, any>;
  params?: WidgetParameter[];
  i18n?: Record<string, WidgetI18n>;
}

/**
 * Widget internationalization
 */
export interface WidgetI18n {
  name: string;
  description: string;
  labels?: Record<string, string>;
}

/**
 * Extension manifest
 */
export interface ExtensionManifest {
  id: string;
  name: string;
  version: string;
  publisher: string;
  description: string;
  homepage?: string;
  repository?: string;
  license?: string;
  widgets: ExtensionWidget[];
  dependencies?: Record<string, string>;
  engines?: Record<string, string>;
  i18n?: Record<string, ExtensionI18n>;
  parameters?: Record<string, WidgetParameter>;
  parameterLinks?: Array<{
    source: string;
    target: string;
    transform?: string;
  }>;
}

/**
 * Extension internationalization
 */
export interface ExtensionI18n {
  name: string;
  description: string;
  publisher?: string;
}

/**
 * Extension validation result
 */
export interface ExtensionValidationResult {
  valid: boolean;
  errors: string[];
}
