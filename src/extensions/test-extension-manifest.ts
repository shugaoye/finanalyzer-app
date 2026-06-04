import { validateExtensionManifest, validateExtensionWidget } from './validation/validateExtensionManifest';

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

// Run tests
console.log('Testing extension manifest validation...');

// Test valid manifest
const validResult = validateExtensionManifest(testCases.validManifest);
console.log('Valid manifest test:', validResult.valid ? 'PASS' : 'FAIL');
if (!validResult.valid) {
  console.log('Errors:', validResult.errors);
}

// Test invalid manifest (missing required fields)
const invalidMissingResult = validateExtensionManifest(testCases.invalidManifestMissingRequired);
console.log('Invalid manifest (missing required) test:', !invalidMissingResult.valid ? 'PASS' : 'FAIL');
if (invalidMissingResult.valid) {
  console.log('Expected errors but none found');
} else {
  console.log('Found errors:', invalidMissingResult.errors);
}

// Test invalid manifest (invalid version)
const invalidVersionResult = validateExtensionManifest(testCases.invalidManifestInvalidVersion);
console.log('Invalid manifest (invalid version) test:', !invalidVersionResult.valid ? 'PASS' : 'FAIL');
if (invalidVersionResult.valid) {
  console.log('Expected errors but none found');
} else {
  console.log('Found errors:', invalidVersionResult.errors);
}

// Test invalid widget (missing required fields)
const invalidWidgetResult = validateExtensionWidget(testCases.invalidWidgetMissingRequired);
console.log('Invalid widget test:', !invalidWidgetResult.valid ? 'PASS' : 'FAIL');
if (invalidWidgetResult.valid) {
  console.log('Expected errors but none found');
} else {
  console.log('Found errors:', invalidWidgetResult.errors);
}

console.log('\nAll tests completed!');
