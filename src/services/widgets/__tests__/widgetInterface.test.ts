import { describe, expect, it, beforeEach, vi } from "vitest";
import type { WidgetConfig } from "../../../types/widgets";
import { BaseWidget } from "../../../types/widgets";
import { WidgetFactory } from "../widgetFactory";

// Mock fetch for testing
const mockFetch = vi.fn();
global.fetch = mockFetch as any;

describe("Widget Interface Implementation", () => {
  describe("BaseWidget", () => {
    const mockConfig: WidgetConfig = {
      id: "test-widget",
      name: "Test Widget",
      description: "A test widget",
      type: "chart",
      category: "test",
      subcategory: "test",
      endpoint: "https://api.example.com/data",
      gridData: { w: 4, h: 3 },
      params: [
        {
          name: "chartType",
          type: "select",
          label: "Chart Type",
          default: "line",
          options: [
            { value: "line", label: "Line" },
            { value: "bar", label: "Bar" },
          ],
        },
        {
          name: "timeRange",
          type: "select",
          label: "Time Range",
          default: "1d",
          required: true,
        },
      ],
      source: "test",
    };

    class TestWidget extends BaseWidget {
      async fetchData() {
        return {
          data: { test: "data" },
          timestamp: new Date().toISOString(),
          widgetId: this.config.id,
          instanceId: this.instanceId,
        };
      }

      validateParams(): boolean {
        return true;
      }
    }

    it("should create a widget with default parameters", () => {
      const widget = new TestWidget(mockConfig, "test-instance");
      expect(widget.getInstanceId()).toBe("test-instance");
      expect(widget.getConfig()).toEqual(mockConfig);
      expect(widget.getParams()).toEqual({
        chartType: "line",
        timeRange: "1d",
      });
    });

    it("should create a widget with custom parameters", () => {
      const customParams = {
        chartType: "bar",
        timeRange: "1w",
      };
      const widget = new TestWidget(mockConfig, "test-instance", customParams);
      expect(widget.getParams()).toEqual(customParams);
    });

    it("should update parameters correctly", () => {
      const widget = new TestWidget(mockConfig, "test-instance");
      widget.updateParams({ chartType: "bar" });
      expect(widget.getParams()).toEqual({
        chartType: "bar",
        timeRange: "1d",
      });
    });

    it("should get default parameters correctly", () => {
      const widget = new TestWidget(mockConfig, "test-instance");
      const defaultParams = widget.getDefaultParams();
      expect(defaultParams).toEqual({
        chartType: "line",
        timeRange: "1d",
      });
    });
  });

  describe("WidgetFactory", () => {
    it("should register and retrieve widget types", () => {
      const widgetTypes = WidgetFactory.getWidgetTypes();
      expect(widgetTypes.length).toBeGreaterThan(0);

      const chartType = WidgetFactory.getWidgetType("chart");
      expect(chartType).toBeDefined();
      expect(chartType?.type).toBe("chart");
      expect(chartType?.displayName).toBe("Chart");

      const tableType = WidgetFactory.getWidgetType("table");
      expect(tableType).toBeDefined();
      expect(tableType?.type).toBe("table");
      expect(tableType?.displayName).toBe("Table");

      const metricType = WidgetFactory.getWidgetType("metric");
      expect(metricType).toBeDefined();
      expect(metricType?.type).toBe("metric");
      expect(metricType?.displayName).toBe("Metric");
    });

    it("should create a widget instance", () => {
      const mockConfig: WidgetConfig = {
        id: "test-widget",
        name: "Test Widget",
        description: "A test widget",
        type: "chart",
        category: "test",
        subcategory: "test",
        endpoint: "https://api.example.com/data",
        gridData: { w: 4, h: 3 },
        params: [],
        source: "test",
      };

      const widget = WidgetFactory.createWidget(mockConfig, "test-instance");
      expect(widget).toBeInstanceOf(BaseWidget);
      expect(widget.getInstanceId()).toBe("test-instance");
      expect(widget.getConfig()).toEqual(mockConfig);
    });
  });

  describe("GenericWidget", () => {
    const mockConfig: WidgetConfig = {
      id: "test-widget",
      name: "Test Widget",
      description: "A test widget",
      type: "chart",
      category: "test",
      subcategory: "test",
      endpoint: "https://api.example.com/data",
      gridData: { w: 4, h: 3 },
      params: [
        {
          name: "chartType",
          type: "select",
          label: "Chart Type",
          default: "line",
        },
        {
          name: "timeRange",
          type: "select",
          label: "Time Range",
          default: "1d",
          required: true,
        },
      ],
      source: "test",
    };

    beforeEach(() => {
      mockFetch.mockClear();
    });

    it("should validate parameters correctly", async () => {
      const widget = WidgetFactory.createWidget(mockConfig, "test-instance");

      // Valid parameters
      const validParams = { chartType: "line", timeRange: "1d" };
      expect(widget.validateParams(validParams)).toBe(true);

      // Missing required parameter
      const invalidParams = { chartType: "line" };
      expect(widget.validateParams(invalidParams)).toBe(false);
    });

    it("should fetch data correctly", async () => {
      const mockResponse = { data: { value: 100 } };
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const widget = WidgetFactory.createWidget(mockConfig, "test-instance");
      const result = await widget.fetchData();

      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.example.com/data?chartType=line&timeRange=1d",
      );
      expect(result.data).toEqual(mockResponse);
      expect(result.widgetId).toBe("test-widget");
      expect(result.instanceId).toBe("test-instance");
      expect(result.timestamp).toBeDefined();
    });

    it("should handle fetch errors", async () => {
      mockFetch.mockRejectedValue(new Error("Network error"));

      const widget = WidgetFactory.createWidget(mockConfig, "test-instance");

      await expect(widget.fetchData()).rejects.toThrow("Network error");
    });
  });
});
