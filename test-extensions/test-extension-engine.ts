// Test file to verify ExtensionEngine functionality
import { getExtensionEngine } from './src/extensions/core/ExtensionEngine';

async function testExtensionEngine() {
  console.log('Testing ExtensionEngine...');
  const extensionEngine = getExtensionEngine();
  
  try {
    const loadedCount = await extensionEngine.loadAllExtensions();
    console.log(`Loaded ${loadedCount} extensions`);
    
    const extensions = extensionEngine.getExtensions();
    console.log('Extensions:', extensions);
    
    console.log('ExtensionEngine test completed successfully!');
  } catch (error) {
    console.error('Error testing ExtensionEngine:', error);
  }
}

testExtensionEngine();
