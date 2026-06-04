import { describe, it, expect } from 'vitest';
import { validateExtensionManifest, validateExtensionWidget } from '../validation/validateExtensionManifest';

// Test cases for extension manifest validation
const testCases = {
  validManifest: {
    id: 'test-extension',
    name: 'Test Extension',
    version: '1.0.0',
    publisher: 'Test Publisher',
    description: 'A test extension',
    widgets: [
      {
        id: 'test-widget',
        name: 'Test Widget',
        description: 'A test widget',
        category: 'test',
        version: '1.0.0',
        entryPoint: './widgets/test-widget.js',
        i18n: {
          'en-US': {
            name: 'Test Widget',
            description: 'A test widget'
          },
          'zh-CN': {
            name: '测试组件',
            description: '一个测试组件'
          }
        }
      }
    ],
    i18n: {
      'en-US': {
        name: 'Test Extension',
        description: 'A test extension',
        publisher: 'Test Publisher'
      },
      'zh-CN': {
        name: '测试扩展',
        description: '一个测试扩展',
        publisher: '测试发布者'
      }
    }
  },
  invalidManifestMissingRequired: {
    name: 'Test Extension',
    version: '1.0.0',
    publisher: 'Test Publisher',
    description: 'A test extension',
    widgets: []
  },
  invalidManifestInvalidVersion: {
    id: 'test-extension',
    name: 'Test Extension',
    version: '1.0',
    publisher: 'Test Publisher',
    description: 'A test extension',
    widgets: [
      {
        id: 'test-widget',
        name: 'Test Widget',
        description: 'A test widget',
        category: 'test',
        version: '1.0.0',
        entryPoint: './widgets/test-widget.js'
      }
    ]
  },
  invalidWidgetMissingRequired: {
    name: 'Test Widget',
    description: 'A test widget',
    category: 'test',
    version: '1.0.0',
    entryPoint: './widgets/test-widget.js'
  }
};

describe('Extension Manifest Validation', () => {
  it('should validate a valid manifest', () => {
    const result = validateExtensionManifest(testCases.validManifest);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should invalidate a manifest with missing required fields', () => {
    const result = validateExtensionManifest(testCases.invalidManifestMissingRequired);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Missing required field: id');
    expect(result.errors).toContain('Invalid widgets: array must not be empty');
  });

  it('should invalidate a manifest with invalid version format', () => {
    const result = validateExtensionManifest(testCases.invalidManifestInvalidVersion);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Invalid version: must follow semantic versioning format (x.y.z)');
  });

  it('should validate a valid widget', () => {
    const widget = testCases.validManifest.widgets[0];
    const result = validateExtensionWidget(widget);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should invalidate a widget with missing required fields', () => {
    const result = validateExtensionWidget(testCases.invalidWidgetMissingRequired);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Missing required field: id');
  });
});
