import { commandHandler } from './commandHandler';

/**
 * Companion Bridge — browser-side WebSocket connection to the workspace-mcp sidecar.
 *
 * Implements the same protocol as OpenBB Workspace's MCP Companion:
 *   1. POST /bridge/session/start  →  get session + websocket_url
 *   2. Connect WebSocket to websocket_url with session_id & token
 *   3. Handle command_request from sidecar, respond with command_result
 *   4. Handle ping → pong keepalive
 *
 * Usage:
 *   const bridge = new CompanionBridge();
 *   await bridge.connect('http://127.0.0.1:8787');
 *   // bridge.isConnected() === true
 *   bridge.disconnect();
 */

export type BridgeConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export interface BridgeSession {
  sessionId: string;
  token: string;
  clientName: string;
  currentDashboardId?: string;
  currentTabId?: string;
}

export interface CompanionEvent {
  type: string;
  payload: Record<string, unknown>;
}

type CommandRequestHandler = (command: Record<string, unknown>) => Promise<Record<string, unknown>>;

export class CompanionBridge {
  private ws: WebSocket | null = null;
  private baseUrl = '';
  private _session: BridgeSession | null = null;
  private _status: BridgeConnectionStatus = 'disconnected';
  private eventListeners = new Set<(event: CompanionEvent) => void>();
  /** Callers can set this to handle incoming command_request messages */
  onCommandRequest: CommandRequestHandler | null = null;

  get status(): BridgeConnectionStatus {
    return this._status;
  }

  get session(): BridgeSession | null {
    return this._session;
  }

  get connected(): boolean {
    return this._status === 'connected' && this.ws !== null;
  }

  /** Start a bridge session and connect the WebSocket. */
  async connect(sidecarUrl: string): Promise<BridgeSession> {
    this.disconnect();
    this._status = 'connecting';
    this.baseUrl = sidecarUrl.replace(/\/+$/, '');

    try {
      // Step 1: call /bridge/session/start
      const sessionStartResponse = await this.startSession();
      const { session, websocket_url: websocketUrl } = sessionStartResponse;

      // Step 2: connect WebSocket
      this._session = session;
      await this.connectWebSocket(websocketUrl);

      this._status = 'connected';
      this.notify({ type: 'connected', payload: { sessionId: session.sessionId } });
      return session;
    } catch (error) {
      this._status = 'error';
      this._session = null;
      const message = error instanceof Error ? error.message : 'Connection failed';
      this.notify({ type: 'error', payload: { error: message } });
      throw error;
    }
  }

  /** Disconnect the WebSocket and clear the session. */
  disconnect(): void {
    if (this.ws) {
      try { this.ws.close(); } catch { /* ignore */ }
      this.ws = null;
    }
    this._session = null;
    this._status = 'disconnected';
    this.notify({ type: 'disconnected', payload: {} });
  }

  /** Send a session_context_changed message to the sidecar. */
  sendContextChange(context: { currentDashboardId?: string; currentTabId?: string }): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    this.ws.send(JSON.stringify({
      type: 'session_context_changed',
      session: {
        current_dashboard_id: context.currentDashboardId ?? null,
        current_tab_id: context.currentTabId ?? null,
      },
    }));
  }

  /** Subscribe to lifecycle events. Returns unsubscribe function. */
  subscribe(listener: (event: CompanionEvent) => void): () => void {
    this.eventListeners.add(listener);
    return () => this.eventListeners.delete(listener);
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  private async startSession(): Promise<{ session: BridgeSession; websocket_url: string }> {
    const response = await fetch(`${this.baseUrl}/bridge/session/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ client_name: 'finanalyzer-app' }),
    });
    if (!response.ok) {
      const text = await response.text().catch(() => response.statusText);
      throw new Error(`Failed to start bridge session: ${response.status} ${text}`);
    }
    const data = await response.json() as {
      session: {
        session_id: string;
        token: string;
        client_name: string;
        current_dashboard_id?: string;
        current_tab_id?: string;
      };
      websocket_url: string;
    };
    return {
      session: {
        sessionId: data.session.session_id,
        token: data.session.token,
        clientName: data.session.client_name,
        currentDashboardId: data.session.current_dashboard_id,
        currentTabId: data.session.current_tab_id,
      },
      websocket_url: data.websocket_url,
    };
  }

  private connectWebSocket(wsUrl: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const ws = new WebSocket(wsUrl);
        this.ws = ws;

        ws.onopen = () => {
          // Wait for session_ready before resolving
        };

        ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            this.handleServerMessage(message);
          } catch {
            // ignore malformed messages
          }
        };

        ws.onerror = () => {
          reject(new Error('WebSocket connection failed'));
        };

        ws.onclose = () => {
          if (this._status === 'connected') {
            this._status = 'disconnected';
            this.notify({ type: 'disconnected', payload: {} });
          }
        };

        // Listen for session_ready to resolve
        const readyHandler = (event: MessageEvent) => {
          try {
            const msg = JSON.parse(event.data);
            if (msg.type === 'session_ready') {
              ws.removeEventListener('message', readyHandler);
              resolve();
            }
          } catch { /* ignore */ }
        };
        ws.addEventListener('message', readyHandler);

        // Timeout
        setTimeout(() => {
          ws.removeEventListener('message', readyHandler);
          if (ws.readyState !== WebSocket.OPEN) {
            reject(new Error('WebSocket connection timed out'));
          } else {
            resolve();
          }
        }, 10000);
      } catch (error) {
        reject(error);
      }
    });
  }

  private async handleServerMessage(message: { type: string; [key: string]: unknown }): Promise<void> {
    switch (message.type) {
      case 'session_ready':
        // Already handled in connectWebSocket
        break;

      case 'command_request': {
        const command = message.command as Record<string, unknown>;
        const requestId = (command.request_id ?? null) as string | null;
        let result: Record<string, unknown>;

        try {
          if (this.onCommandRequest) {
            const data = await this.onCommandRequest(command);
            result = {
              ok: true,
              command: command.command,
              request_id: requestId,
              message: 'ok',
              data,
              error: null,
            };
          } else {
            result = {
              ok: false,
              command: command.command,
              request_id: requestId,
              message: 'No command handler registered',
              data: null,
              error: {
                code: 'command_failed',
                message: `Command '${String(command.command)}' is not handled by the companion bridge`,
                retryable: false,
              },
            };
          }
        } catch (error) {
          result = {
            ok: false,
            command: command.command,
            request_id: requestId,
            message: error instanceof Error ? error.message : 'Command execution failed',
            data: null,
            error: {
              code: 'command_failed',
              message: error instanceof Error ? error.message : 'Command execution failed',
              retryable: false,
            },
          };
        }

        this.sendCommandResult(result);
        break;
      }

      case 'ping':
        this.sendPong();
        break;

      case 'pong':
        // Ignore pongs from server
        break;

      case 'error':
        this.notify({ type: 'server_error', payload: (message.error ?? {}) as Record<string, unknown> });
        break;

      default:
        this.notify({ type: message.type, payload: message as Record<string, unknown> });
        break;
    }
  }

  private sendCommandResult(result: Record<string, unknown>): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    this.ws.send(JSON.stringify({
      type: 'command_result',
      result,
    }));
  }

  private sendPong(): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    this.ws.send(JSON.stringify({ type: 'pong' }));
  }

  private notify(event: CompanionEvent): void {
    this.eventListeners.forEach((fn) => fn(event));
  }
}

/** Singleton instance for app-wide use. */
export const companionBridge = new CompanionBridge();

/** Connect commandHandler to handle incoming MCP commands */
companionBridge.onCommandRequest = async (command) => {
  const sessionId = companionBridge.session?.sessionId || '';

  // Extract standard fields from command object
  // workspace-mcp sends params directly at top level:
  // { command, request_id, origin, backend_id, widget_id, data_args, ui_args, dashboard_id, ... }
  const { command: cmd, request_id, ...rawArgs } = command as Record<string, unknown>;

  // Strip null/undefined values to avoid downstream issues with null checks
  const args = Object.fromEntries(
    Object.entries(rawArgs).filter(([, v]) => v != null)
  );

  const response = await commandHandler.handleCommand(
    sessionId,
    { id: request_id as string || '', command: cmd as string, args }
  );

  if (!response.ok) {
    throw new Error(response.error?.message || 'Command failed');
  }

  return response.data as Record<string, unknown>;
};
