import { beforeEach, afterEach, describe, expect, it } from "vitest";
import { ExtensionEngine, getExtensionEngine } from '../core/ExtensionEngine';
import { ExtensionSandbox, getExtensionSandbox } from '../core/ExtensionSandbox';
import fs from 'fs';
import path from 'path';
import { tmpdir } from 'os';

// Create a temporary directory for testing
const createTempExtension = (extensionId: string, manifest: any): string => {
  const tempDir = path.join(tmpdir(), `test-extension-${extensionId}`);
  
  // Create directory structure
  fs.mkdirSync(tempDir, { recursive: true });
  
  // Write manifest.json
  fs.writeFileSync(
    path.join(tempDir, 'manifest.json'),
    JSON.stringify(manifest, null, 2)
  );
  
  // Write a simple entry point
  fs.writeFileSync(
    path.join(tempDir, 'index.js'),
    `module.exports = { hello: () => 'Hello from extension ${extensionId}' };
`
  );
  
  return tempDir;
};

// Clean up temporary extension
const cleanupTempExtension = (extensionPath: string): void => {
  if (fs.existsSync(extensionPath)) {
    fs.rmSync(extensionPath, { recursive: true, force: true });
  }
};

describe('ExtensionEngine', () => {
  let extensionEngine: ExtensionEngine;
  let testExtensionPath: string;
  let testExtensionId: string;

  beforeEach(() => {
    // Create a new extension engine for each test
    extensionEngine = new ExtensionEngine({ maxExtensions: 10 });
    testExtensionId = `test-extension-${Date.now()}`;
    
    // Create a test extension
    testExtensionPath = createTempExtension(testExtensionId, {
      id: testExtensionId,
      name: 'Test Extension',
      version: '1.0.0',
      publisher: 'Test Publisher',
      description: 'Test extension for testing',
      widgets: [
        {
          id: 'test-widget',
          name: 'Test Widget',
          description: 'Test widget',
          category: 'test',
          version: '1.0.0',
          entryPoint: 'index.js'
        }
      ]
    });
  });

  afterEach(() => {
    // Clean up
    extensionEngine.clearExtensions();
    cleanupTempExtension(testExtensionPath);
  });

  it('should create extension engine with default options', () => {
    const defaultEngine = new ExtensionEngine();
    expect(defaultEngine).toBeInstanceOf(ExtensionEngine);
  });

  it('should load an extension successfully', async () => {
    const result = await extensionEngine.loadExtension(testExtensionPath);
    expect(result.success).toBe(true);
    expect(result.error).toBeUndefined();
    
    const extensions = extensionEngine.getExtensions();
    expect(extensions).toHaveLength(1);
    expect(extensions[0].id).toBe(testExtensionId);
    expect(extensions[0].status).toBe('loaded');
  });

  it('should fail to load extension with invalid manifest', async () => {
    // Create extension with invalid manifest
    const invalidExtensionPath = createTempExtension('invalid-extension', {
      id: 'invalid-extension',
      // Missing required fields
    });
    
    const result = await extensionEngine.loadExtension(invalidExtensionPath);
    expect(result.success).toBe(false);
    expect(result.error).toContain('Invalid manifest');
    
    cleanupTempExtension(invalidExtensionPath);
  });

  it('should fail to load non-existent extension', async () => {
    const nonExistentPath = path.join(tmpdir(), 'non-existent-extension');
    const result = await extensionEngine.loadExtension(nonExistentPath);
    expect(result.success).toBe(false);
    expect(result.error).toBe('Extension directory does not exist');
  });

  it('should fail to load extension without manifest', async () => {
    // Create extension without manifest
    const noManifestPath = path.join(tmpdir(), 'no-manifest-extension');
    fs.mkdirSync(noManifestPath, { recursive: true });
    
    const result = await extensionEngine.loadExtension(noManifestPath);
    expect(result.success).toBe(false);
    expect(result.error).toBe('Manifest file not found');
    
    cleanupTempExtension(noManifestPath);
  });

  it('should unload an extension successfully', async () => {
    // Load extension
    await extensionEngine.loadExtension(testExtensionPath);
    expect(extensionEngine.getExtensions()).toHaveLength(1);
    
    // Unload extension
    const result = extensionEngine.unloadExtension(testExtensionId);
    expect(result.success).toBe(true);
    expect(extensionEngine.getExtensions()).toHaveLength(0);
  });

  it('should fail to unload non-existent extension', () => {
    const result = extensionEngine.unloadExtension('non-existent-extension');
    expect(result.success).toBe(false);
    expect(result.error).toBe('Extension not found');
  });

  it('should update an extension successfully', async () => {
    // Load initial extension
    await extensionEngine.loadExtension(testExtensionPath);
    const initialExtension = extensionEngine.getExtension(testExtensionId);
    expect(initialExtension).toBeDefined();
    
    // Create updated extension
    const updatedExtensionPath = createTempExtension(testExtensionId, {
      id: testExtensionId,
      name: 'Updated Test Extension',
      version: '1.1.0',
      publisher: 'Test Publisher',
      description: 'Updated test extension',
      widgets: [
        {
          id: 'test-widget',
          name: 'Test Widget',
          description: 'Test widget',
          category: 'test',
          version: '1.0.0',
          entryPoint: 'index.js'
        }
      ]
    });
    
    // Update extension
    const result = await extensionEngine.updateExtension(testExtensionId, updatedExtensionPath);
    expect(result.success).toBe(true);
    
    const updatedExtension = extensionEngine.getExtension(testExtensionId);
    expect(updatedExtension).toBeDefined();
    expect(updatedExtension?.manifest.version).toBe('1.1.0');
    expect(updatedExtension?.manifest.name).toBe('Updated Test Extension');
    
    cleanupTempExtension(updatedExtensionPath);
  });

  it('should get extension by ID', async () => {
    await extensionEngine.loadExtension(testExtensionPath);
    const extension = extensionEngine.getExtension(testExtensionId);
    expect(extension).toBeDefined();
    expect(extension?.id).toBe(testExtensionId);
  });

  it('should check if extension is loaded', async () => {
    expect(extensionEngine.isExtensionLoaded(testExtensionId)).toBe(false);
    await extensionEngine.loadExtension(testExtensionPath);
    expect(extensionEngine.isExtensionLoaded(testExtensionId)).toBe(true);
  });

  it('should clear all extensions', async () => {
    await extensionEngine.loadExtension(testExtensionPath);
    expect(extensionEngine.getExtensions()).toHaveLength(1);
    extensionEngine.clearExtensions();
    expect(extensionEngine.getExtensions()).toHaveLength(0);
  });

  it('should return singleton instance', () => {
    const instance1 = getExtensionEngine();
    const instance2 = getExtensionEngine();
    expect(instance1).toBe(instance2);
  });
});

describe('ExtensionSandbox', () => {
  let sandbox: ExtensionSandbox;
  let testExtensionPath: string;

  beforeEach(() => {
    sandbox = new ExtensionSandbox();
    testExtensionPath = createTempExtension('sandbox-test', {
      id: 'sandbox-test',
      name: 'Sandbox Test Extension',
      version: '1.0.0',
      publisher: 'Test Publisher',
      description: 'Test extension for sandbox',
      widgets: [
        {
          id: 'sandbox-widget',
          name: 'Sandbox Widget',
          description: 'Sandbox widget',
          category: 'test',
          version: '1.0.0',
          entryPoint: 'index.js'
        }
      ]
    });
  });

  afterEach(() => {
    cleanupTempExtension(testExtensionPath);
  });

  it('should execute code in sandbox', () => {
    const code = '1 + 1';
    const result = sandbox.execute(code, testExtensionPath);
    expect(result.success).toBe(true);
    expect(result.result).toBe(2);
  });

  it('should load module from extension', () => {
    const result = sandbox.loadModule('index.js', testExtensionPath);
    expect(result.success).toBe(true);
    expect(result.result).toHaveProperty('hello');
  });

  it('should fail to load non-existent module', () => {
    const result = sandbox.loadModule('non-existent.js', testExtensionPath);
    expect(result.success).toBe(false);
    expect(result.error).toBe('Module file not found');
  });

  it('should load entry point', () => {
    const result = sandbox.loadEntryPoint('index.js', testExtensionPath);
    expect(result.success).toBe(true);
    expect(result.result).toHaveProperty('hello');
  });

  it('should return singleton instance', () => {
    const instance1 = getExtensionSandbox();
    const instance2 = getExtensionSandbox();
    expect(instance1).toBe(instance2);
  });
});
