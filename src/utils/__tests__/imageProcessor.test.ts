import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import { ImageProcessor } from '../imageProcessor';

const mockAxios = axios as any;

describe('ImageProcessor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock FileReader
    global.FileReader = class MockFileReader {
      result: any = null;
      onload: any = null;
      onerror: any = null;

      readAsDataURL(file: File) {
        setTimeout(() => {
          this.result = `data:${file.type};base64,dGVzdA==`;
          this.onload?.();
        }, 0);
      }
    } as any;

    // Mock Image
    global.Image = class MockImage {
      width = 100;
      height = 200;
      private _src = '';
      onload: any = null;
      onerror: any = null;

      constructor() {
        this.width = 100;
        this.height = 200;
      }

      set src(value: string) {
        this._src = value;
        // Trigger onload immediately
        setTimeout(() => {
          this.onload?.();
        }, 0);
      }

      get src() {
        return this._src;
      }
    } as any;
  });

  afterEach(() => {
    (global as any).FileReader = undefined;
    (global as any).Image = undefined;
  });

  describe('fileToBase64', () => {
    it('should convert a file to base64', async () => {
      const mockFile = new File(['test content'], 'test.png', { type: 'image/png' });
      
      const result = await ImageProcessor.fileToBase64(mockFile);
      
      expect(result).toMatch(/^data:image\/png;base64,/);
    });

    it('should throw error for files larger than 5MB', async () => {
      const largeFile = new File(new Array(6 * 1024 * 1024).fill('a'), 'large.png', { type: 'image/png' });
      
      await expect(ImageProcessor.fileToBase64(largeFile)).rejects.toThrow('Image size exceeds 5MB limit');
    });
  });

  describe('urlToBase64', () => {
    it('should convert a remote image URL to base64', async () => {
      const mockResponse = {
        data: Buffer.from('test image data'),
        headers: {
          'content-type': 'image/jpeg'
        }
      };
      
      mockAxios.get.mockResolvedValue(mockResponse as any);
      
      const result = await ImageProcessor.urlToBase64('https://example.com/image.jpg');
      
      expect(result).toMatch(/^data:image\/jpeg;base64,/);
      expect(mockAxios.get).toHaveBeenCalledWith('https://example.com/image.jpg', {
        responseType: 'arraybuffer',
        timeout: 10000
      });
    });

    it('should throw error for failed requests', async () => {
      mockAxios.get.mockRejectedValue(new Error('Network error'));
      
      await expect(ImageProcessor.urlToBase64('https://example.com/image.jpg')).rejects.toThrow('Failed to fetch and convert remote image');
    });
  });

  describe('processImage', () => {
    it('should process a File object', async () => {
      const mockFile = new File(['test content'], 'test.png', { type: 'image/png' });
      
      const result = await ImageProcessor.processImage(mockFile);
      
      expect(result).toMatch(/^data:image\/png;base64,/);
    });

    it('should return base64 string as is', async () => {
      const base64String = 'data:image/png;base64,test';
      
      const result = await ImageProcessor.processImage(base64String);
      
      expect(result).toBe(base64String);
    });

    it('should process a remote URL', async () => {
      const mockResponse = {
        data: Buffer.from('test image data'),
        headers: {
          'content-type': 'image/jpeg'
        }
      };
      
      mockAxios.get.mockResolvedValue(mockResponse as any);
      
      const result = await ImageProcessor.processImage('https://example.com/image.jpg');
      
      expect(result).toMatch(/^data:image\/jpeg;base64,/);
    });

    it('should throw error for local file paths', async () => {
      await expect(ImageProcessor.processImage('/local/path/to/image.png')).rejects.toThrow('Local file paths are not supported in browser environment');
    });

    it('should throw error for invalid source', async () => {
      await expect(ImageProcessor.processImage(123 as any)).rejects.toThrow('Invalid image source');
    });
  });

  describe('isValidBase64Image', () => {
    it('should return true for valid base64 image', () => {
      const validBase64 = 'data:image/png;base64,dGVzdA==';
      
      const result = ImageProcessor.isValidBase64Image(validBase64);
      
      expect(result).toBe(true);
    });

    it('should return false for invalid base64 image', () => {
      const invalidBase64 = 'invalid-base64';
      
      const result = ImageProcessor.isValidBase64Image(invalidBase64);
      
      expect(result).toBe(false);
    });

    it('should return false for base64 without data URL prefix', () => {
      const base64WithoutPrefix = 'dGVzdA==';
      
      const result = ImageProcessor.isValidBase64Image(base64WithoutPrefix);
      
      expect(result).toBe(false);
    });
  });

  describe('getImageDimensions', () => {
    it('should get image dimensions from base64', async () => {
      const base64Image = 'data:image/png;base64,dGVzdA==';
      const result = await ImageProcessor.getImageDimensions(base64Image);
      
      expect(result).toEqual({ width: 100, height: 200 });
    });
  });
});
