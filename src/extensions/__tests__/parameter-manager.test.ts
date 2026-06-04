import { beforeEach, afterEach, describe, expect, it } from "vitest";
import { getParameterManager, ParameterManager } from "../core/ParameterManager";
import type { ExtensionInstance } from '../core/ExtensionEngine';
import type { ExtensionManifest } from '../types';

// Mock extension manifest with parameters
const mockExtensionManifest: ExtensionManifest = {
  id: 'test-extension',
  name: 'Test Extension',
  version: '1.0.0',
  publisher: 'Test Publisher',
  description: 'A test extension',
  widgets: [
    {
      id: 'test-widget-1',
      name: 'Test Widget 1',
      description: 'A test widget',
      category: 'test',
      version: '1.0.0',
      entryPoint: 'index.js',
      params: [
        {
          paramName: 'enable_feature',
          label: 'Enable Feature',
          type: 'boolean',
          value: true
        },
        {
          paramName: 'analysis_type',
          label: 'Analysis Type',
          type: 'text',
          value: 'technical',
          dependsOn: ['enable_feature']
        }
      ]
    }
  ],
  parameters: {
    extension_param: {
      paramName: 'extension_param',
      label: 'Extension Parameter',
      type: 'text',
      value: 'extension_value'
    }
  },
  parameterLinks: [
    {
      source: 'test-extension.test-widget-1.analysis_type',
      target: 'test-extension.extension_param'
    }
  ]
};

// Mock extension instance
const mockExtension: ExtensionInstance = {
  id: 'test-extension',
  manifest: mockExtensionManifest,
  path: '/test/path',
  status: 'loaded',
  loadedAt: new Date()
};

describe('ParameterManager', () => {
  let parameterManager: ParameterManager;

  beforeEach(() => {
    // Create a new parameter manager instance for each test
    parameterManager = new ParameterManager();
  });

  afterEach(() => {
    // Clear the parameter manager after each test
    parameterManager.clear();
  });

  it('should create a singleton instance', () => {
    const instance1 = getParameterManager();
    const instance2 = getParameterManager();
    expect(instance1).toBe(instance2);
  });

  it('should add an extension and register its parameters', () => {
    parameterManager.addExtension(mockExtension);
    
    // Check if extension-level parameter is registered
    const extensionParam = parameterManager.getParameterValue('test-extension.extension_param');
    expect(extensionParam).toBe('extension_value');
    
    // Check if widget-level parameter is registered
    const widgetParam = parameterManager.getParameterValue('test-extension.test-widget-1.enable_feature');
    expect(widgetParam).toBe(true);
  });

  it('should remove an extension and its parameters', () => {
    parameterManager.addExtension(mockExtension);
    
    // Verify parameter exists
    expect(parameterManager.getParameterValue('test-extension.extension_param')).toBe('extension_value');
    
    // Remove extension
    parameterManager.removeExtension('test-extension');
    
    // Verify parameter is removed
    expect(parameterManager.getParameterValue('test-extension.extension_param')).toBeUndefined();
  });

  it('should set and get parameter values', () => {
    parameterManager.addExtension(mockExtension);
    
    // Set a new value
    parameterManager.setParameterValue('test-extension.test-widget-1.analysis_type', 'fundamental');
    
    // Get the updated value
    const updatedValue = parameterManager.getParameterValue('test-extension.test-widget-1.analysis_type');
    expect(updatedValue).toBe('fundamental');
  });

  it('should handle parameter linking', () => {
    parameterManager.addExtension(mockExtension);
    
    // Set the source parameter
    parameterManager.setParameterValue('test-extension.test-widget-1.analysis_type', 'fundamental');
    
    // Check if the target parameter is updated
    const targetValue = parameterManager.getParameterValue('test-extension.extension_param');
    expect(targetValue).toBe('fundamental');
  });

  it('should validate parameter dependencies', () => {
    parameterManager.addExtension(mockExtension);
    
    // Validate dependencies
    const errors = parameterManager.validateParameterDependencies('test-extension');
    expect(errors).toHaveLength(0);
  });

  it('should get extension parameters', () => {
    parameterManager.addExtension(mockExtension);
    
    const extensionParams = parameterManager.getExtensionParameters('test-extension');
    expect(extensionParams.size).toBe(1);
    expect(extensionParams.get('extension_param')).toBe('extension_value');
  });

  it('should get widget parameters', () => {
    parameterManager.addExtension(mockExtension);
    
    const widgetParams = parameterManager.getWidgetParameters('test-extension', 'test-widget-1');
    expect(widgetParams.size).toBe(2);
    expect(widgetParams.get('enable_feature')).toBe(true);
    expect(widgetParams.get('analysis_type')).toBe('technical');
  });

  it('should handle parameter transforms', () => {
    // Create a manifest with a transform
    const manifestWithTransform: ExtensionManifest = {
      ...mockExtensionManifest,
      parameterLinks: [
        {
          source: 'test-extension.test-widget-1.analysis_type',
          target: 'test-extension.extension_param',
          transform: 'value.toUpperCase()'
        }
      ]
    };
    
    const extensionWithTransform: ExtensionInstance = {
      ...mockExtension,
      manifest: manifestWithTransform
    };
    
    parameterManager.addExtension(extensionWithTransform);
    
    // Set the source parameter
    parameterManager.setParameterValue('test-extension.test-widget-1.analysis_type', 'fundamental');
    
    // Check if the target parameter is updated with transform
    const targetValue = parameterManager.getParameterValue('test-extension.extension_param');
    expect(targetValue).toBe('FUNDAMENTAL');
  });
});
