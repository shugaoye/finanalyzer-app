import type { BridgeError, BridgeErrorCode } from '../../types/mcp/models';

export class McpErrorHandler {
  createError(code: BridgeErrorCode, message: string, details?: Record<string, unknown>, retryable = false): BridgeError {
    return {
      code,
      message,
      details,
      retryable,
    };
  }

  invalidRequest(message: string, details?: Record<string, unknown>): BridgeError {
    return this.createError('invalid_request', message, details, false);
  }

  unauthorized(message: string, details?: Record<string, unknown>): BridgeError {
    return this.createError('unauthorized', message, details, false);
  }

  unavailable(message: string, details?: Record<string, unknown>): BridgeError {
    return this.createError('unavailable', message, details, true);
  }

  timeout(message: string, details?: Record<string, unknown>): BridgeError {
    return this.createError('timeout', message, details, true);
  }

  commandFailed(message: string, details?: Record<string, unknown>): BridgeError {
    return this.createError('command_failed', message, details, false);
  }

  unknown(message: string, details?: Record<string, unknown>): BridgeError {
    return this.createError('unknown', message, details, false);
  }

  fromError(error: Error): BridgeError {
    const message = error.message.toLowerCase();
    if (message.includes('timeout')) {
      return this.timeout(error.message);
    }
    if (message.includes('unauthorized') || message.includes('permission')) {
      return this.unauthorized(error.message);
    }
    if (message.includes('invalid')) {
      return this.invalidRequest(error.message);
    }
    return this.unknown(error.message);
  }

  formatError(error: BridgeError): string {
    const parts = [`[${error.code}] ${error.message}`];
    if (error.details) {
      parts.push(`Details: ${JSON.stringify(error.details)}`);
    }
    if (error.retryable) {
      parts.push('(retryable)');
    }
    return parts.join(' ');
  }

  isRetryable(error: BridgeError): boolean {
    return error.retryable;
  }
}

export const mcpErrorHandler = new McpErrorHandler();
