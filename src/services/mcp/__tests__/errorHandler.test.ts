import { describe, it, expect } from 'vitest';
import { mcpErrorHandler } from '../errorHandler';

describe('MCP Error Handler', () => {
  describe('Error Creation', () => {
    it('should create invalid_request error', () => {
      const error = mcpErrorHandler.invalidRequest('Missing parameter', { param: 'widget_id' });
      expect(error.code).toBe('invalid_request');
      expect(error.message).toBe('Missing parameter');
      expect(error.details).toEqual({ param: 'widget_id' });
      expect(error.retryable).toBe(false);
    });

    it('should create unauthorized error', () => {
      const error = mcpErrorHandler.unauthorized('Invalid API key');
      expect(error.code).toBe('unauthorized');
      expect(error.message).toBe('Invalid API key');
      expect(error.retryable).toBe(false);
    });

    it('should create unavailable error', () => {
      const error = mcpErrorHandler.unavailable('Service temporarily unavailable');
      expect(error.code).toBe('unavailable');
      expect(error.message).toBe('Service temporarily unavailable');
      expect(error.retryable).toBe(true);
    });

    it('should create timeout error', () => {
      const error = mcpErrorHandler.timeout('Request timed out after 10s');
      expect(error.code).toBe('timeout');
      expect(error.message).toBe('Request timed out after 10s');
      expect(error.retryable).toBe(true);
    });

    it('should create command_failed error', () => {
      const error = mcpErrorHandler.commandFailed('Widget creation failed');
      expect(error.code).toBe('command_failed');
      expect(error.message).toBe('Widget creation failed');
      expect(error.retryable).toBe(false);
    });

    it('should create unknown error', () => {
      const error = mcpErrorHandler.unknown('Unexpected error');
      expect(error.code).toBe('unknown');
      expect(error.message).toBe('Unexpected error');
      expect(error.retryable).toBe(false);
    });
  });

  describe('Error from Generic Error', () => {
    it('should convert timeout error to BridgeError', () => {
      const error = mcpErrorHandler.fromError(new Error('Request timeout'));
      expect(error.code).toBe('timeout');
      expect(error.message).toBe('Request timeout');
    });

    it('should convert unauthorized error to BridgeError', () => {
      const error = mcpErrorHandler.fromError(new Error('Unauthorized access'));
      expect(error.code).toBe('unauthorized');
    });

    it('should convert permission error to unauthorized', () => {
      const error = mcpErrorHandler.fromError(new Error('Permission denied'));
      expect(error.code).toBe('unauthorized');
    });

    it('should convert invalid error to invalid_request', () => {
      const error = mcpErrorHandler.fromError(new Error('Invalid parameters'));
      expect(error.code).toBe('invalid_request');
    });

    it('should convert unknown error to unknown', () => {
      const error = mcpErrorHandler.fromError(new Error('Something went wrong'));
      expect(error.code).toBe('unknown');
    });
  });

  describe('Error Formatting', () => {
    it('should format error with code and message', () => {
      const error = mcpErrorHandler.invalidRequest('Missing param');
      const formatted = mcpErrorHandler.formatError(error);
      expect(formatted).toBe('[invalid_request] Missing param');
    });

    it('should format error with details', () => {
      const error = mcpErrorHandler.invalidRequest('Missing param', { param: 'id' });
      const formatted = mcpErrorHandler.formatError(error);
      expect(formatted).toContain('[invalid_request] Missing param');
      expect(formatted).toContain('Details: {"param":"id"}');
    });

    it('should mark retryable errors', () => {
      const error = mcpErrorHandler.unavailable('Service down');
      const formatted = mcpErrorHandler.formatError(error);
      expect(formatted).toContain('(retryable)');
    });

    it('should not mark non-retryable errors', () => {
      const error = mcpErrorHandler.invalidRequest('Bad request');
      const formatted = mcpErrorHandler.formatError(error);
      expect(formatted).not.toContain('(retryable)');
    });
  });

  describe('Retryable Check', () => {
    it('should identify retryable errors', () => {
      expect(mcpErrorHandler.isRetryable(mcpErrorHandler.timeout('timeout'))).toBe(true);
      expect(mcpErrorHandler.isRetryable(mcpErrorHandler.unavailable('unavailable'))).toBe(true);
    });

    it('should identify non-retryable errors', () => {
      expect(mcpErrorHandler.isRetryable(mcpErrorHandler.invalidRequest('invalid'))).toBe(false);
      expect(mcpErrorHandler.isRetryable(mcpErrorHandler.unauthorized('unauthorized'))).toBe(false);
      expect(mcpErrorHandler.isRetryable(mcpErrorHandler.commandFailed('failed'))).toBe(false);
    });
  });
});
