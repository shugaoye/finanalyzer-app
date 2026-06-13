import type { CommandMessage, CommandResponse } from './sessionManager';
import { sessionManager } from './sessionManager';
import { snapshotGenerator } from './snapshotGenerator';
import { dashboardService } from './dashboardService';
import { widgetCRUDService } from './widgetCRUDService';
import { widgetService } from '../widgets/widgetService';
import { connectionService } from '../connections/connectionService';

export type CommandType =
  | 'snapshot.get'
  | 'get_workspace_snapshot'
  | 'list_available_widgets'
  | 'get_widget_schema'
  | 'dashboard.create'
  | 'dashboard.read'
  | 'dashboard.update'
  | 'dashboard.delete'
  | 'widget.create'
  | 'widget.read'
  | 'widget.update'
  | 'widget.delete'
  | 'widget.layout.update'
  | 'navigation.navigate'
  | 'navigation.tabs.add'
  | 'navigation.tabs.remove'
  | 'navigation.tabs.rename'
  | 'manage_backends';

export interface HandlerResult {
  success: boolean;
  data?: unknown;
  error?: string;
}

export class CommandHandler {
  async handleCommand(_sessionId: string, message: CommandMessage): Promise<CommandResponse> {
    const command = message.command as CommandType;
    
    try {
      const result = await this.routeCommand(command, message.args || {});
      
      return {
        id: message.id,
        ok: result.success,
        data: result.data,
        error: result.error ? { code: 'command_failed', message: result.error } : undefined,
      };
    } catch (error) {
      return {
        id: message.id,
        ok: false,
        error: {
          code: 'command_failed',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  private async routeCommand(command: CommandType, args: Record<string, unknown>): Promise<HandlerResult> {
    switch (command) {
      case 'snapshot.get':
      case 'get_workspace_snapshot':
        return this.handleSnapshotGet(args);
      case 'list_available_widgets':
        return this.handleListAvailableWidgets(args);
      case 'get_widget_schema':
        return this.handleGetWidgetSchema(args);
      case 'dashboard.create':
        return this.handleDashboardCreate(args);
      case 'dashboard.read':
        return this.handleDashboardRead(args);
      case 'dashboard.update':
        return this.handleDashboardUpdate(args);
      case 'dashboard.delete':
        return this.handleDashboardDelete(args);
      case 'widget.create':
        return this.handleWidgetCreate(args);
      case 'widget.read':
        return this.handleWidgetRead(args);
      case 'widget.update':
        return this.handleWidgetUpdate(args);
      case 'widget.delete':
        return this.handleWidgetDelete(args);
      case 'widget.layout.update':
        return this.handleWidgetLayoutUpdate(args);
      case 'navigation.navigate':
        return this.handleNavigationNavigate(args);
      case 'navigation.tabs.add':
        return this.handleNavigationTabsAdd(args);
      case 'navigation.tabs.remove':
        return this.handleNavigationTabsRemove(args);
      case 'navigation.tabs.rename':
        return this.handleNavigationTabsRename(args);
      case 'manage_backends':
        return this.handleManageBackends(args);
      default:
        return { success: false, error: `Unknown command: ${command}` };
    }
  }

  private async handleSnapshotGet(_args: Record<string, unknown>): Promise<HandlerResult> {
    try {
      const snapshot = await snapshotGenerator.generateSnapshot();
      return { success: true, data: snapshot };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to generate snapshot' };
    }
  }

  private async handleListAvailableWidgets(args: Record<string, unknown>): Promise<HandlerResult> {
    try {
      const origin = args.origin as string | undefined;
      const backendId = args.backend_id as string | undefined;
      
      const widgets = await widgetService.getWidgets();
      
      let filteredWidgets = widgets;
      
      // Filter by origin if provided (supports empty string filtering)
      if (origin !== undefined && origin !== null) {
        filteredWidgets = filteredWidgets.filter((w) => w.source === origin);
      }
      
      // Filter by backend_id if provided
      if (backendId !== undefined && backendId !== null) {
        filteredWidgets = filteredWidgets.filter((w) => w.connectionId === backendId);
      }
      
      const result = filteredWidgets.map((widget) => ({
        origin: widget.source || '',
        widget_id: widget.id,
        name: widget.name,
        description: widget.description,
        category: widget.category,
      }));
      
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to list available widgets' };
    }
  }

  private async handleGetWidgetSchema(args: Record<string, unknown>): Promise<HandlerResult> {
    try {
      if (typeof args.origin !== 'string') {
        return { success: false, error: 'origin must be a string' };
      }
      if (typeof args.widget_id !== 'string') {
        return { success: false, error: 'widget_id must be a string' };
      }
      
      const origin = args.origin;
      const widgetId = args.widget_id;
      
      const widgets = await widgetService.getWidgets();
      const widget = widgets.find((w) => w.source === origin && w.id === widgetId);
      
      if (!widget) {
        return { success: false, error: `Widget not found: ${origin}/${widgetId}` };
      }
      
      const schema = {
        origin: widget.source,
        widget_id: widget.id,
        name: widget.name,
        description: widget.description,
        category: widget.category,
        params: widget.params || [],
        grid_data: widget.gridData || { w: 4, h: 3 },
      };
      
      return { success: true, data: schema };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to get widget schema' };
    }
  }

  private async handleDashboardCreate(args: Record<string, unknown>): Promise<HandlerResult> {
    try {
      const name = args.name as string;
      const description = args.description as string | undefined;
      const dashboard = await dashboardService.createDashboard(name, description);
      return { success: true, data: dashboard };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to create dashboard' };
    }
  }

  private async handleDashboardRead(args: Record<string, unknown>): Promise<HandlerResult> {
    try {
      const dashboardId = args.dashboardId as string;
      const dashboard = await dashboardService.getDashboardInfo(dashboardId);
      return { success: true, data: dashboard };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to read dashboard' };
    }
  }

  private async handleDashboardUpdate(args: Record<string, unknown>): Promise<HandlerResult> {
    try {
      const dashboardId = args.dashboardId as string;
      const updates = {
        name: args.name as string | undefined,
        description: args.description as string | undefined,
      };
      const dashboard = await dashboardService.updateDashboard(dashboardId, updates);
      return { success: true, data: dashboard };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to update dashboard' };
    }
  }

  private async handleDashboardDelete(args: Record<string, unknown>): Promise<HandlerResult> {
    try {
      const dashboardId = args.dashboardId as string;
      await dashboardService.deleteDashboard(dashboardId);
      return { success: true, data: { deleted: true } };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to delete dashboard' };
    }
  }

  private async handleWidgetCreate(args: Record<string, unknown>): Promise<HandlerResult> {
    try {
      const dashboardId = args.dashboardId as string;
      const widgetData = args.widget as Record<string, unknown>;
      const widget = await widgetCRUDService.createWidget(dashboardId, widgetData);
      return { success: true, data: widget };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to create widget' };
    }
  }

  private async handleWidgetRead(args: Record<string, unknown>): Promise<HandlerResult> {
    try {
      const dashboardId = args.dashboardId as string;
      const widgetId = args.widgetId as string;
      const widget = await widgetCRUDService.readWidget(dashboardId, widgetId);
      return { success: true, data: widget };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to read widget' };
    }
  }

  private async handleWidgetUpdate(args: Record<string, unknown>): Promise<HandlerResult> {
    try {
      const dashboardId = args.dashboardId as string;
      const widgetId = args.widgetId as string;
      const updates = args.updates as Record<string, unknown>;
      const widget = await widgetCRUDService.updateWidget(dashboardId, widgetId, updates);
      return { success: true, data: widget };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to update widget' };
    }
  }

  private async handleWidgetDelete(args: Record<string, unknown>): Promise<HandlerResult> {
    try {
      const dashboardId = args.dashboardId as string;
      const widgetId = args.widgetId as string;
      await widgetCRUDService.deleteWidget(dashboardId, widgetId);
      return { success: true, data: { deleted: true } };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to delete widget' };
    }
  }

  private async handleWidgetLayoutUpdate(args: Record<string, unknown>): Promise<HandlerResult> {
    try {
      const dashboardId = args.dashboardId as string;
      const widgetId = args.widgetId as string;
      const layout = args.layout as Record<string, unknown>;
      const result = await widgetCRUDService.updateWidgetLayout(dashboardId, widgetId, layout);
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to update widget layout' };
    }
  }

  private async handleNavigationNavigate(args: Record<string, unknown>): Promise<HandlerResult> {
    try {
      const dashboardId = args.dashboardId as string;
      const tabId = args.tabId as string | undefined;
      await sessionManager.updateContext(args.sessionId as string, {
        activeDashboard: dashboardId,
        activeTab: tabId,
      });
      return { success: true, data: { dashboardId, tabId } };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to navigate' };
    }
  }

  private async handleNavigationTabsAdd(args: Record<string, unknown>): Promise<HandlerResult> {
    try {
      const dashboardId = args.dashboardId as string;
      const tabName = args.tabName as string;
      const result = await dashboardService.addTab(dashboardId, tabName);
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to add tab' };
    }
  }

  private async handleNavigationTabsRemove(args: Record<string, unknown>): Promise<HandlerResult> {
    try {
      const dashboardId = args.dashboardId as string;
      const tabId = args.tabId as string;
      const result = await dashboardService.removeTab(dashboardId, tabId);
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to remove tab' };
    }
  }

  private async handleNavigationTabsRename(args: Record<string, unknown>): Promise<HandlerResult> {
    try {
      const dashboardId = args.dashboardId as string;
      const tabId = args.tabId as string;
      const newName = args.newName as string;
      const result = await dashboardService.renameTab(dashboardId, tabId, newName);
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to rename tab' };
    }
  }

  private async handleManageBackends(args: Record<string, unknown>): Promise<HandlerResult> {
    try {
      const operation = args.operation as string;

      if (!operation) {
        return { success: false, error: 'operation is required' };
      }

      switch (operation) {
        case 'list':
          return this.handleManageBackendsList();
        case 'add':
          return this.handleManageBackendsAdd(args);
        case 'update':
          return this.handleManageBackendsUpdate(args);
        case 'refresh':
          return this.handleManageBackendsRefresh(args);
        case 'remove':
          return this.handleManageBackendsRemove(args);
        default:
          return { success: false, error: `Invalid operation: ${operation}. Must be one of: list, add, update, refresh, remove` };
      }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to manage backends' };
    }
  }

  private async handleManageBackendsList(): Promise<HandlerResult> {
    try {
      const connections = connectionService.getConnections();
      
      const result = connections.map((conn) => ({
        id: conn.id,
        name: conn.name,
        url: conn.url,
        status: conn.status,
        widget_count: conn.metrics.widgets,
        app_count: conn.metrics.apps,
        agent_count: conn.metrics.agents,
      }));
      
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to list backends' };
    }
  }

  private async handleManageBackendsAdd(args: Record<string, unknown>): Promise<HandlerResult> {
    try {
      const name = args.name as string;
      const url = args.url as string;
      const endpointHeaders = args.endpoint_headers as Array<{ key: string; value: string; location: 'headers' | 'query' }> | undefined;
      const validateWidgets = args.validate_widgets as boolean | undefined;

      if (!name) {
        return { success: false, error: 'name is required' };
      }
      if (!url) {
        return { success: false, error: 'url is required' };
      }

      const authentication: Array<{ key: string; value: string; location: 'header' | 'query' }> = endpointHeaders?.map((header) => ({
        key: header.key,
        value: header.value,
        location: (header.location === 'headers' ? 'header' : header.location) as 'header' | 'query',
      })) || [];

      const connection = connectionService.createConnection({
        name,
        url,
        apiKey: '',
        validateWidgets: validateWidgets !== false,
        authentication,
      });

      if (validateWidgets !== false) {
        await connectionService.testConnection(connection.id);
      }

      const result = {
        id: connection.id,
        name: connection.name,
        url: connection.url,
        status: connection.status,
        widget_count: connection.metrics.widgets,
        app_count: connection.metrics.apps,
        agent_count: connection.metrics.agents,
      };

      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to add backend' };
    }
  }

  private async handleManageBackendsUpdate(args: Record<string, unknown>): Promise<HandlerResult> {
    try {
      const backendId = args.backend_id as string;

      if (!backendId) {
        return { success: false, error: 'backend_id is required' };
      }

      const updates: Record<string, unknown> = {};

      if (args.name !== undefined) {
        updates.name = args.name as string;
      }
      if (args.url !== undefined) {
        updates.url = args.url as string;
      }
      if (args.endpoint_headers != null) {
        updates.authentication = (args.endpoint_headers as Array<{ key: string; value: string; location: 'headers' | 'query' }>).map((header) => ({
          key: header.key,
          value: header.value,
          location: (header.location === 'headers' ? 'header' : header.location) as 'header' | 'query',
        }));
      }

      if (Object.keys(updates).length === 0) {
        return { success: false, error: 'At least one update field is required (name, url, or endpoint_headers)' };
      }

      const connection = connectionService.updateConnection(backendId, updates as any);

      if (!connection) {
        return { success: false, error: `Backend not found: ${backendId}` };
      }

      const result = {
        id: connection.id,
        name: connection.name,
        url: connection.url,
        status: connection.status,
        widget_count: connection.metrics.widgets,
        app_count: connection.metrics.apps,
        agent_count: connection.metrics.agents,
      };

      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to update backend' };
    }
  }

  private async handleManageBackendsRefresh(args: Record<string, unknown>): Promise<HandlerResult> {
    try {
      const backendId = args.backend_id as string;

      if (!backendId) {
        return { success: false, error: 'backend_id is required' };
      }

      const connection = await connectionService.refreshConnection(backendId);

      if (!connection) {
        return { success: false, error: `Backend not found: ${backendId}` };
      }

      const result = {
        id: connection.id,
        name: connection.name,
        url: connection.url,
        status: connection.status,
        widget_count: connection.metrics.widgets,
        app_count: connection.metrics.apps,
        agent_count: connection.metrics.agents,
      };

      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to refresh backend' };
    }
  }

  private async handleManageBackendsRemove(args: Record<string, unknown>): Promise<HandlerResult> {
    try {
      const backendId = args.backend_id as string;

      if (!backendId) {
        return { success: false, error: 'backend_id is required' };
      }

      const deleted = connectionService.deleteConnection(backendId);

      if (!deleted) {
        return { success: false, error: `Backend not found: ${backendId}` };
      }

      return { success: true, data: { deleted: true } };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to remove backend' };
    }
  }
}

export const commandHandler = new CommandHandler();