import type { CommandMessage, CommandResponse } from './sessionManager';
import { sessionManager } from './sessionManager';
import { snapshotGenerator } from './snapshotGenerator';
import { dashboardService } from './dashboardService';
import { widgetCRUDService } from './widgetCRUDService';

export type CommandType =
  | 'snapshot.get'
  | 'get_workspace_snapshot'
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
  | 'navigation.tabs.rename';

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
}

export const commandHandler = new CommandHandler();