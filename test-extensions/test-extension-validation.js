import { getExtensionEngine } from './src/extensions/core/ExtensionEngine.js';
import { getExtensionSandbox } from './src/extensions/core/ExtensionSandbox.js';
import path from 'path';

async function testExtensionSystem() {
  console.log('Testing extension system...');
  
  // Initialize extension engine
  const extensionEngine = getExtensionEngine();
  const sandbox = getExtensionSandbox();
  
  // Test 1: Load test extensions
  console.log('\n1. Loading test extensions...');
  
  const testExtension1Path = path.join(__dirname, 'test-extensions', 'test-extension-1');
  const testExtension2Path = path.join(__dirname, 'test-extensions', 'test-extension-2');
  
  const result1 = await extensionEngine.loadExtension(testExtension1Path);
  console.log('Extension 1 load result:', result1);
  
  const result2 = await extensionEngine.loadExtension(testExtension2Path);
  console.log('Extension 2 load result:', result2);
  
  // Test 2: Get loaded extensions
  console.log('\n2. Getting loaded extensions...');
  const extensions = extensionEngine.getExtensions();
  console.log('Loaded extensions count:', extensions.length);
  console.log('Extensions:', extensions.map(e => ({ id: e.id, status: e.status })));
  
  // Test 3: Test extension sandbox
  console.log('\n3. Testing extension sandbox...');
  
  // Test executing code in sandbox
  const executeResult = sandbox.execute('1 + 1', testExtension1Path);
  console.log('Sandbox execution result:', executeResult);
  
  // Test loading module from extension
  const loadModuleResult = sandbox.loadModule('index.js', testExtension1Path);
  console.log('Module load result:', {
    success: loadModuleResult.success,
    hasHello: loadModuleResult.result?.hello ? 'Yes' : 'No'
  });
  
  // Test 4: Test extension operations
  console.log('\n4. Testing extension operations...');
  
  // Test isExtensionLoaded
  const isLoaded = extensionEngine.isExtensionLoaded('test-extension-1');
  console.log('Is extension 1 loaded:', isLoaded);
  
  // Test getExtension
  const extension = extensionEngine.getExtension('test-extension-1');
  console.log('Extension 1 details:', { id: extension?.id, version: extension?.manifest.version });
  
  // Test 5: Test unloading extension
  console.log('\n5. Testing extension unloading...');
  const unloadResult = extensionEngine.unloadExtension('test-extension-1');
  console.log('Unload result:', unloadResult);
  console.log('Extensions after unload:', extensionEngine.getExtensions().length);
  
  // Test 6: Test loading again
  console.log('\n6. Testing extension reloading...');
  const reloadResult = await extensionEngine.loadExtension(testExtension1Path);
  console.log('Reload result:', reloadResult);
  console.log('Extensions after reload:', extensionEngine.getExtensions().length);
  
  // Test 7: Test security
  console.log('\n7. Testing security...');
  
  // Test sandbox with potentially malicious code
  const securityTest = sandbox.execute('process.exit()', testExtension1Path);
  console.log('Security test result (should fail):', securityTest);
  
  // Test path traversal
  const pathTest = sandbox.loadModule('../package.json', testExtension1Path);
  console.log('Path traversal test result (should fail):', pathTest);
  
  // Test 8: Test performance
  console.log('\n8. Testing performance...');
  
  const startTime = Date.now();
  for (let i = 0; i < 100; i++) {
    sandbox.execute('1 + 1', testExtension1Path);
  }
  const endTime = Date.now();
  console.log('100 sandbox executions took:', endTime - startTime, 'ms');
  
  // Cleanup
  console.log('\n9. Cleaning up...');
  extensionEngine.clearExtensions();
  console.log('Extensions after cleanup:', extensionEngine.getExtensions().length);
  
  console.log('\n✅ Extension system validation completed!');
}

testExtensionSystem().catch(console.error);