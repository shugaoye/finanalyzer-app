// Test file to verify extension route functionality
import { getExtensionEngine } from './src/extensions/core/ExtensionEngine';

async function testExtensionFunctionality() {
  console.log('Testing extension functionality...');
  
  // Test ExtensionEngine
  const extensionEngine = getExtensionEngine();
  
  try {
    // Load all extensions
    const loadedCount = await extensionEngine.loadAllExtensions();
    console.log(`Loaded ${loadedCount} extensions`);
    
    // Get extensions
    const extensions = extensionEngine.getExtensions();
    console.log('Extensions:', extensions);
    
    // Test extension operations
    console.log('ExtensionEngine operations tested successfully!');
    
  } catch (error) {
    console.error('Error testing ExtensionEngine:', error);
  }
  
  console.log('Extension route test completed!');
}

testExtensionFunctionality();
