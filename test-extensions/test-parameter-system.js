import { getExtensionEngine } from './src/extensions/core/ExtensionEngine.js';
import { getParameterManager } from './src/extensions/core/ParameterManager.js';
import path from 'path';

async function testParameterSystem() {
  console.log('Testing parameter system...');
  
  // Initialize extension engine and parameter manager
  const extensionEngine = getExtensionEngine();
  const parameterManager = getParameterManager();
  
  // Test 1: Load test extension with parameters
  console.log('\n1. Loading test extension with parameters...');
  
  const testExtensionPath = path.join(__dirname, 'test-extensions', 'test-extension-params');
  const result = await extensionEngine.loadExtension(testExtensionPath);
  console.log('Extension load result:', result);
  
  if (!result.success) {
    console.error('Failed to load test extension:', result.error);
    return;
  }
  
  // Test 2: Get extension parameters
  console.log('\n2. Getting extension parameters...');
  const extensionParams = parameterManager.getExtensionParameters('test-extension-params');
  console.log('Extension parameters:', Object.fromEntries(extensionParams));
  
  // Test 3: Get widget parameters
  console.log('\n3. Getting widget parameters...');
  const widget1Params = parameterManager.getWidgetParameters('test-extension-params', 'test-widget-1');
  console.log('Widget 1 parameters:', Object.fromEntries(widget1Params));
  
  const widget2Params = parameterManager.getWidgetParameters('test-extension-params', 'test-widget-2');
  console.log('Widget 2 parameters:', Object.fromEntries(widget2Params));
  
  // Test 4: Test parameter linking
  console.log('\n4. Testing parameter linking...');
  
  // Set widget 1 parameter and check if widget 2 parameter is updated
  console.log('Setting widget 1 analysis_type to "fundamental"');
  parameterManager.setParameterValue('test-extension-params.test-widget-1.analysis_type', 'fundamental');
  
  const updatedWidget2Param = parameterManager.getParameterValue('test-extension-params.test-widget-2.widget2_param');
  console.log('Widget 2 parameter after update:', updatedWidget2Param);
  
  // Test 5: Test parameter transform
  console.log('\n5. Testing parameter transform...');
  
  // Set extension parameter and check if widget 1 parameter is updated with transform
  console.log('Setting extension_param to "test_value"');
  parameterManager.setParameterValue('test-extension-params.extension_param', 'test_value');
  
  const updatedWidget1Param = parameterManager.getParameterValue('test-extension-params.test-widget-1.analysis_type');
  console.log('Widget 1 analysis_type after transform:', updatedWidget1Param);
  
  // Test 6: Test parameter dependencies validation
  console.log('\n6. Testing parameter dependencies validation...');
  const dependencyErrors = parameterManager.validateParameterDependencies('test-extension-params');
  console.log('Dependency validation errors:', dependencyErrors);
  
  // Test 7: Unload extension
  console.log('\n7. Unloading extension...');
  const unloadResult = extensionEngine.unloadExtension('test-extension-params');
  console.log('Extension unload result:', unloadResult);
  
  // Verify parameters are removed
  const paramsAfterUnload = parameterManager.getExtensionParameters('test-extension-params');
  console.log('Extension parameters after unload:', Object.fromEntries(paramsAfterUnload));
  
  console.log('\nParameter system test completed!');
}

testParameterSystem().catch(console.error);
