import axios from 'axios';

/**
 * Image processor utility for handling base64 encoding
 */
export class ImageProcessor {
  /**
   * Converts a local file to base64
   * @param file File object to convert
   * @returns Promise with base64 encoded string
   */
  static async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        reject(new Error('Image size exceeds 5MB limit'));
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result;
        if (typeof result === 'string') {
          resolve(result);
        } else {
          reject(new Error('Failed to convert file to base64'));
        }
      };
      reader.onerror = () => {
        reject(new Error('Error reading file'));
      };
      reader.readAsDataURL(file);
    });
  }

  /**
   * Fetches a remote image and converts it to base64
   * @param url Remote image URL
   * @returns Promise with base64 encoded string
   */
  static async urlToBase64(url: string): Promise<string> {
    try {
      const response = await axios.get(url, {
        responseType: 'arraybuffer',
        timeout: 10000, // 10 second timeout
      });

      const buffer = Buffer.from(response.data);
      const base64 = buffer.toString('base64');
      const contentType = response.headers['content-type'] || 'image/jpeg';

      return `data:${contentType};base64,${base64}`;
    } catch (error) {
      console.error('Error fetching remote image:', error);
      throw new Error('Failed to fetch and convert remote image');
    }
  }

  /**
   * Processes an image source (file, URL, or base64) and returns base64
   * @param source Image source (File, URL string, or base64 string)
   * @returns Promise with base64 encoded string
   */
  static async processImage(source: File | string): Promise<string> {
    if (source instanceof File) {
      return this.fileToBase64(source);
    } else if (typeof source === 'string') {
      if (source.startsWith('data:')) {
        // Already base64
        return source;
      } else if (source.startsWith('http://') || source.startsWith('https://')) {
        // Remote URL
        return this.urlToBase64(source);
      } else {
        // Local file path (not supported in browser)
        throw new Error('Local file paths are not supported in browser environment');
      }
    } else {
      throw new Error('Invalid image source');
    }
  }

  /**
   * Validates a base64 image string
   * @param base64 Base64 string to validate
   * @returns True if valid base64 image
   */
  static isValidBase64Image(base64: string): boolean {
    try {
      if (!base64.startsWith('data:image/')) {
        return false;
      }
      const data = base64.split(',')[1];
      if (!data) {
        return false;
      }
      // Try to decode
      atob(data);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Gets image dimensions from base64
   * @param base64 Base64 encoded image
   * @returns Promise with width and height
   */
  static async getImageDimensions(base64: string): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
      img.src = base64;
    });
  }
}
