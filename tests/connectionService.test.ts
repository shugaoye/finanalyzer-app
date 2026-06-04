import { beforeEach, describe, expect, it, vi } from "vitest";
import { connectionService } from "../src/services/connections/connectionService";

// Mock window and localStorage
global.window = {} as any;

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

describe("connectionService", () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  describe("testConnectionWithDetails", () => {
    it("should validate widgets.json correctly and return connected true with count", async () => {
      const mockWidgets = {
        "portfolio/stocks": {
          widgetId: "portfolio/stocks",
          name: "自选股",
          type: "table",
          category: "Equity",
          endpoint: "/api/v1/portfolio/stocks",
        },
        "portfolio/transactions": {
          widgetId: "portfolio/transactions",
          name: "交易记录管理",
          type: "table",
          category: "Equity",
          endpoint: "/api/v1/portfolio/transactions",
        },
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockWidgets),
      });

      const result = await connectionService.testConnectionWithDetails({
        url: "http://localhost:8001",
        authentication: [],
      });

      expect(result.connected).toBe(true);
      expect(result.widgetsCount).toBe(2);
      expect(result.message).toBeUndefined();
    });

    it("should return error if widgets.json is an array", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([]),
      });

      const result = await connectionService.testConnectionWithDetails({
        url: "http://localhost:8001",
        authentication: [],
      });

      expect(result.connected).toBe(false);
      expect(result.message).toBe(
        "Invalid widgets.json format: expected an object",
      );
    });

    it("should return error if widgets.json is null", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(null),
      });

      const result = await connectionService.testConnectionWithDetails({
        url: "http://localhost:8001",
        authentication: [],
      });

      expect(result.connected).toBe(false);
      expect(result.message).toBe(
        "Invalid widgets.json format: expected an object",
      );
    });

    it("should return error if a widget is missing required fields", async () => {
      const mockWidgets = {
        "portfolio/stocks": {
          widgetId: "portfolio/stocks",
        },
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockWidgets),
      });

      const result = await connectionService.testConnectionWithDetails({
        url: "http://localhost:8001",
        authentication: [],
      });

      expect(result.connected).toBe(false);
      expect(result.message).toContain("Missing or invalid name");
    });
  });
});
