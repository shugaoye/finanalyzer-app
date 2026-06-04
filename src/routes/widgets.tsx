import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import AddDataModal from "../components/widgets/AddDataModal";
import AddWidgetModal from "../components/widgets/AddWidgetModal";
import {
  addWidget as addWidgetApi,
  getDashboards,
  type Dashboard as ApiDashboard,
} from "../services/dashboardApi";
import { useWidgets } from "../services/widgets/widgetQueries";
import type { WidgetConfig } from "../services/widgets/widgetService";

export const Route = createFileRoute("/widgets")({
  component: RouteComponent,
});

function RouteComponent() {
  return <WidgetsPage />;
}

function WidgetsPage() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedWidgets, setSelectedWidgets] = useState<Set<string>>(
    new Set(),
  );
  const [isDashboardModalOpen, setIsDashboardModalOpen] = useState(false);
  const [isAddDataModalOpen, setIsAddDataModalOpen] = useState(false);
  const [isBackendExpanded, setIsBackendExpanded] = useState(true);
  const [isBuiltInExpanded, setIsBuiltInExpanded] = useState(true);
  const [expandedConnections, setExpandedConnections] = useState<Set<string>>(
    new Set(),
  );
  const [hoveredWidgetId, setHoveredWidgetId] = useState<string | null>(null);

  const { data: widgets = [], isLoading, error } = useWidgets();

  const {
    data: apiDashboards = [],
    isLoading: isDashboardsLoading,
    error: dashboardsError,
  } = useQuery({
    queryKey: ["dashboards"],
    queryFn: getDashboards,
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });

  const dashboards = apiDashboards.map((d: ApiDashboard) => ({
    id: d.id,
    name: d.name,
    description: d.description || undefined,
  }));

  const handleWidgetSelect = (widgetId: string) => {
    setSelectedWidgets((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(widgetId)) {
        newSet.delete(widgetId);
      } else {
        newSet.add(widgetId);
      }
      return newSet;
    });
  };

  const filteredWidgets = widgets.filter(
    (widget) =>
      widget.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      widget.description.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const backendWidgets = filteredWidgets.filter(
    (widget) => widget.source === "backend",
  );

  const builtInWidgets = filteredWidgets.filter(
    (widget) => widget.source === "built-in",
  );

  const uniqueConnections = useMemo(
    () =>
      Array.from(
        new Map(
          backendWidgets
            .filter((w) => w.connectionId)
            .map((w) => [
              w.connectionId,
              {
                id: w.connectionId,
                name: w.connectionName || "Unknown",
                url: w.connectionUrl || "",
                status: w.connectionStatus || "disconnected",
              },
            ]),
        ).values(),
      ),
    [backendWidgets],
  );

  const getConnectionWidgets = (connectionId: string) => {
    const result = backendWidgets.filter(
      (widget) => widget.connectionId === connectionId,
    );
    return result;
  };

  const isAllConnectionWidgetsSelected = (connectionId: string) => {
    const connectionWidgets = getConnectionWidgets(connectionId);
    return (
      connectionWidgets.length > 0 &&
      connectionWidgets.every((widget) => selectedWidgets.has(widget.id))
    );
  };

  const isSomeConnectionWidgetsSelected = (connectionId: string) => {
    const connectionWidgets = getConnectionWidgets(connectionId);
    const selectedCount = connectionWidgets.filter((widget) =>
      selectedWidgets.has(widget.id),
    ).length;
    return selectedCount > 0 && selectedCount < connectionWidgets.length;
  };

  const handleSelectAllConnectionWidgets = (connectionId: string) => {
    setSelectedWidgets((prev) => {
      const newSet = new Set(prev);
      const connectionWidgets = getConnectionWidgets(connectionId);

      if (connectionWidgets.every((widget) => newSet.has(widget.id))) {
        connectionWidgets.forEach((widget) => newSet.delete(widget.id));
      } else {
        connectionWidgets.forEach((widget) => newSet.add(widget.id));
      }

      return newSet;
    });
  };

  const toggleConnectionExpanded = (connectionId: string) => {
    setExpandedConnections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(connectionId)) {
        newSet.delete(connectionId);
      } else {
        newSet.add(connectionId);
      }
      return newSet;
    });
  };

  const getSelectedWidgetObjects = (): WidgetConfig[] => {
    return widgets.filter((widget) => selectedWidgets.has(widget.id));
  };

  const handleOpenDashboardModal = () => {
    setIsDashboardModalOpen(true);
  };

  const handleCloseDashboardModal = () => {
    setIsDashboardModalOpen(false);
  };

  const handleAddWidgetsToDashboard = async (
    dashboardId: string,
    widgetsToAdd: WidgetConfig[],
  ) => {
    try {
      for (const widget of widgetsToAdd) {
        const uniqueId = `${widget.id}-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
        await addWidgetApi(dashboardId, {
          id: uniqueId,
          type: widget.type,
          title: widget.name,
          position: { x: 0, y: 0, w: 2, h: 2 },
          data: { widgetId: widget.id, widgetConfig: widget },
        });
      }
      setSelectedWidgets(new Set());
    } catch (err) {
      console.error("Failed to add widgets:", err);
      throw err;
    }
  };

  const handleOpenAddDataModal = () => {
    setIsAddDataModalOpen(true);
  };

  const handleCloseAddDataModal = () => {
    setIsAddDataModalOpen(false);
  };

  const handleDeleteSelected = () => {
    console.log("Deleting selected widgets:", getSelectedWidgetObjects());
    setSelectedWidgets(new Set());
  };

  if (isLoading) {
    return (
      <div className="h-full flex flex-col bg-light-50 dark:bg-black">
        <div className="bg-white dark:bg-dark-900 border-b border-light-200 dark:border-dark-500">
          <div className="text-base pt-6 px-6 font-bold mb-4">
            {t("widgets.title")}
          </div>
        </div>
        <div className="flex items-center justify-center h-full">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-main-100"></div>
            <p className="text-light-500 dark:text-dark-50">
              {t("widgets.loading")}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex flex-col bg-light-50 dark:bg-black">
        <div className="bg-white dark:bg-dark-900 border-b border-light-200 dark:border-dark-500">
          <div className="text-base pt-6 px-6 font-bold mb-4">
            {t("widgets.title")}
          </div>
        </div>
        <div className="flex items-center justify-center h-full">
          <div className="flex flex-col items-center gap-4">
            <svg
              id="alert-triangle"
              className="w-12 h-12 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <p className="text-light-500 dark:text-dark-50">
              {t("common.error")}: {error.message}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-light-50 dark:bg-black">
      <div className="bg-white dark:bg-dark-900 border-b border-light-200 dark:border-dark-500">
        <div className="text-base pt-6 px-6 font-bold mb-4">
          {t("widgets.title")}
        </div>
      </div>

      <div className="flex flex-col gap-4 p-6 text-xs h-full overflow-y-auto">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="group">
              <div className="BB-Input group body-xs-regular flex items-center rounded-sm border disabled:cursor-not-allowed transition bg-input-field-bg border-general-border-primary text-ds-text-body hover:data-enabled:bg-input-field-bg-hover hover:data-enabled:border-general-border-primary data-focused:text-general-label-hover group-aria-disabled:border-general-border-disabled group-aria-disabled:bg-input-field-bg-disabled group-aria-disabled:text-general-label-disabled gap-2 pr-3 pl-3 [&_button]:max-h-6 h-8 w-[243px]">
                <div className="inline-flex flex-0">
                  <svg
                    id="search"
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <div className="relative h-full min-w-[3rem] flex-1">
                  <input
                    type="text"
                    className="peer BB-Input flex w-full border-none bg-transparent file:border-0 file:bg-transparent file:font-medium file:text-sm disabled:cursor-not-allowed disabled:bg-transparent focus-visible:outline-hidden transition text-general-label-hover placeholder:text-ds-text-caption focus:placeholder:text-ds-text-caption disabled:text-general-label-disabled disabled:placeholder:text-general-label-disabled py-2 only-sm:text-base pl-0"
                    placeholder={t("widgets.search")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ fontSize: "inherit", lineHeight: "inherit" }}
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-2 items-center flex-wrap">
              <div className="flex p-1 items-center rounded bg-white border-light-200 dark:bg-dark-850 border dark:border-dark-750 h-8">
                <button
                  className="obb-small-navbar-btn rounded flex items-center justify-center size-7"
                  disabled={selectedWidgets.size === 0}
                  onClick={handleDeleteSelected}
                  title={t("common.delete")}
                >
                  <svg
                    id="trash-04"
                    className="size-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
                <div className="w-px h-5 mx-1 bg-light-200 dark:bg-dark-400"></div>
                <button
                  type="button"
                  className="obb-small-navbar-btn rounded flex items-center justify-center size-7"
                  onClick={handleOpenDashboardModal}
                  disabled={selectedWidgets.size === 0}
                  title={t("widgets.addToDashboard")}
                >
                  <svg
                    id="add-to-dashboard"
                    className="w-[25px] h-[14px]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                </button>
              </div>
              <button
                className="BB-Button inline-flex items-center justify-center gap-2 ring-offset-background focus-visible:outline-hidden focus-visible:ring-2 disabled:pointer-events-none transition cursor-pointer whitespace-nowrap bg-btn-primary-bg text-btn-primary-label hover:bg-btn-primary-bg-hover focus-visible:ring-alert-informative disabled:bg-btn-primary-bg-disabled disabled:text-btn-primary-label-disabled data-[loading=true]:bg-btn-primary-bg data-[loading=true]:text-btn-primary-label data-[loading=true]:cursor-default body-xs-medium h-8 rounded-sm px-3"
                data-loading="false"
                onClick={handleOpenAddDataModal}
              >
                {t("widgets.addData")}
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-y-auto only-sm:max-h-[calc(40vh)]">
          <div className="flex flex-col gap-2.5">
            <hr className="border-light-200 dark:border-dark-750 mt-4 mb-2.5" />

            <div>
              <div
                role="button"
                tabIndex={0}
                aria-expanded={isBackendExpanded}
                aria-disabled="false"
                onClick={() => setIsBackendExpanded(!isBackendExpanded)}
              >
                <div className="group flex items-center justify-between gap-2 cursor-pointer select-none">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div
                      className="flex-shrink-0"
                      style={{
                        transform: isBackendExpanded
                          ? "rotate(90deg)"
                          : "rotate(0deg)",
                      }}
                    >
                      <svg
                        id="chevron-right"
                        className="size-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="body-xs-regular whitespace-nowrap">
                        {t("widgets.categoryBackend")}
                      </span>
                      <span className="text-xs text-light-500 dark:text-dark-50">
                        ({backendWidgets.length})
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="mr-2" data-state="closed">
                      <svg
                        id="lock-01"
                        className="size-[18px] dark:text-light-500 text-light-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                    </span>
                  </div>
                </div>
              </div>

              {isBackendExpanded && (
                <div className="mt-2.5 space-y-2.5">
                  {uniqueConnections.map((connection) => {
                    const connectionId = connection.id;
                    if (!connectionId) return null;

                    return (
                      <div key={connection.id}>
                        <div className="p-2.5 w-full">
                          <div
                            className="group flex items-center justify-between gap-2 cursor-pointer select-none"
                            role="button"
                            tabIndex={0}
                            onClick={() =>
                              toggleConnectionExpanded(connectionId)
                            }
                          >
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              <div
                                className="flex-shrink-0"
                                style={{
                                  transform: expandedConnections.has(
                                    connectionId,
                                  )
                                    ? "rotate(90deg)"
                                    : "rotate(0deg)",
                                }}
                              >
                                <svg
                                  id="chevron-right"
                                  className="size-4"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 5l7 7-7 7"
                                  />
                                </svg>
                              </div>
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  role="checkbox"
                                  aria-checked={
                                    isAllConnectionWidgetsSelected(connectionId)
                                      ? "true"
                                      : isSomeConnectionWidgetsSelected(
                                            connectionId,
                                          )
                                        ? "mixed"
                                        : "false"
                                  }
                                  data-state={
                                    isAllConnectionWidgetsSelected(connectionId)
                                      ? "checked"
                                      : isSomeConnectionWidgetsSelected(
                                            connectionId,
                                          )
                                        ? "indeterminate"
                                        : "unchecked"
                                  }
                                  value="on"
                                  className="BB-Checkbox group peer h-4 w-4 shrink-0 rounded-sm border transition disabled:cursor-not-allowed bg-general-bg-primary border-general-border-primary focus-visible:outline-hidden focus-visible:border-alert-informative disabled:bg-general-bg-primary-disabled disabled:border-general-border-primary data-[state=checked]:bg-main-100 data-[state=checked]:border-main-100 data-[state=checked]:text-base-0 data-[state=checked]:focus-visible:border-alert-informative data-[state=checked]:disabled:bg-general-bg-primary-disabled data-[state=checked]:disabled:border-general-border-primary data-[state=checked]:disabled:text-general-label-disabled data-[state=indeterminate]:bg-main-100 data-[state=indeterminate]:border-main-100 data-[state=indeterminate]:text-base-0 data-[state=indeterminate]:focus-visible:border-alert-informative data-[state=indeterminate]:disabled:bg-general-bg-primary-disabled data-[state=indeterminate]:disabled:border-general-border-primary data-[state=indeterminate]:disabled:text-general-label-disabled"
                                  id={`connection-${connectionId}-select-all`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSelectAllConnectionWidgets(
                                      connectionId,
                                    );
                                  }}
                                >
                                  <span
                                    data-state={
                                      isAllConnectionWidgetsSelected(
                                        connectionId,
                                      )
                                        ? "checked"
                                        : isSomeConnectionWidgetsSelected(
                                              connectionId,
                                            )
                                          ? "indeterminate"
                                          : "unchecked"
                                    }
                                    className="flex items-center justify-center text-current"
                                    style={{ pointerEvents: "none" }}
                                  >
                                    <svg
                                      id="check"
                                      className={`hidden size-[12px] stroke-2 ${isAllConnectionWidgetsSelected(connectionId) ? "block" : ""}`}
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M5 13l4 4L19 7"
                                      />
                                    </svg>
                                    <svg
                                      id="minus-icon"
                                      className={`hidden size-[12px] stroke-2 ${isSomeConnectionWidgetsSelected(connectionId) ? "block" : ""}`}
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M20 12H4"
                                      />
                                    </svg>
                                  </span>
                                </button>
                              </div>
                              <div className="flex items-center gap-2.5 min-w-0">
                                <span className="text-xs text-light-900 dark:text-white whitespace-nowrap">
                                  {connection.name}
                                </span>
                                <span className="text-xs text-light-500 dark:text-dark-50 truncate min-w-0">
                                  {connection.url}
                                </span>
                                <span className="text-xs text-light-500 dark:text-dark-50">
                                  ({getConnectionWidgets(connectionId).length})
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <div className="flex gap-2 items-center">
                                <span
                                  className={`size-3 shrink-0 rounded-full ${
                                    connection.status === "connected"
                                      ? "bg-green-500"
                                      : connection.status === "testing"
                                        ? "bg-yellow-500"
                                        : "bg-red-500"
                                  }`}
                                  data-state={connection.status}
                                  title={
                                    connection.status === "connected"
                                      ? t("connections.connected")
                                      : connection.status === "testing"
                                        ? t("connections.testing")
                                        : t("connections.disconnected")
                                  }
                                ></span>
                              </div>
                            </div>
                          </div>

                          {expandedConnections.has(connectionId) && (
                            <div className="space-y-2.5 pl-6 mt-3">
                              <div
                                className="min-w-32"
                                style={{ maxHeight: "320px", overflow: "auto" }}
                              >
                                {getConnectionWidgets(connectionId).map(
                                  (widget) => (
                                    <div key={widget.id} className="pb-2">
                                      <div
                                        className="w-full bg-general-bg-primary border border-general-border-secondary rounded-md px-3.5 py-[11px]"
                                        onMouseEnter={() =>
                                          setHoveredWidgetId(widget.id)
                                        }
                                        onMouseLeave={() =>
                                          setHoveredWidgetId(null)
                                        }
                                      >
                                        <div className="group flex items-center justify-between gap-2">
                                          <div className="flex items-center gap-2 min-w-0 flex-1">
                                            <div className="flex items-center gap-1">
                                              <button
                                                type="button"
                                                role="checkbox"
                                                title={`Select ${widget.name}`}
                                                aria-checked={
                                                  selectedWidgets.has(widget.id)
                                                    ? "true"
                                                    : "false"
                                                }
                                                data-state={
                                                  selectedWidgets.has(widget.id)
                                                    ? "checked"
                                                    : "unchecked"
                                                }
                                                value="on"
                                                className="BB-Checkbox group peer h-4 w-4 shrink-0 rounded-sm border transition disabled:cursor-not-allowed bg-general-bg-primary border-general-border-primary focus-visible:outline-hidden focus-visible:border-alert-informative disabled:bg-general-bg-primary-disabled disabled:border-general-border-primary data-[state=checked]:bg-main-100 data-[state=checked]:border-main-100 data-[state=checked]:text-base-0 data-[state=checked]:focus-visible:border-alert-informative data-[state=checked]:disabled:bg-general-bg-primary-disabled data-[state=checked]:disabled:border-general-border-primary data-[state=checked]:disabled:text-general-label-disabled"
                                                id={`widget-${widget.id}`}
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  handleWidgetSelect(widget.id);
                                                }}
                                              >
                                                <span
                                                  data-state={
                                                    selectedWidgets.has(
                                                      widget.id,
                                                    )
                                                      ? "checked"
                                                      : "unchecked"
                                                  }
                                                  className="flex items-center justify-center text-current"
                                                  style={{
                                                    pointerEvents: "none",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                  }}
                                                >
                                                  {selectedWidgets.has(
                                                    widget.id,
                                                  ) && (
                                                    <svg
                                                      id="check"
                                                      className="size-[12px] stroke-2"
                                                      fill="none"
                                                      viewBox="0 0 24 24"
                                                      stroke="currentColor"
                                                      strokeWidth={2}
                                                    >
                                                      <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M5 13l4 4L19 7"
                                                      />
                                                    </svg>
                                                  )}
                                                </span>
                                              </button>
                                            </div>
                                            <div className="flex items-center gap-2.5 min-w-0">
                                              <span className="text-xs text-light-900 dark:text-white whitespace-nowrap">
                                                {widget.name}
                                              </span>
                                              <span className="text-xs text-light-500 dark:text-dark-50 truncate min-w-0">
                                                <div className="inline-flex gap-2.5 overflow-hidden items-center min-w-0">
                                                  <span className="text-light-500 dark:text-dark-50 truncate">
                                                    {widget.description}
                                                  </span>
                                                </div>
                                              </span>
                                            </div>
                                          </div>
                                          <div className="flex items-center gap-1 shrink-0">
                                            <div
                                              className={`flex items-center gap-2 shrink-0 transition-opacity duration-200 ${hoveredWidgetId === widget.id ? "opacity-100" : "opacity-0"}`}
                                            >
                                              <button
                                                type="button"
                                                className="obb-small-navbar-btn rounded flex items-center justify-center size-7"
                                                onClick={() =>
                                                  handleWidgetSelect(widget.id)
                                                }
                                                title={t(
                                                  "widgets.addToDashboard",
                                                )}
                                              >
                                                <svg
                                                  id="add-to-dashboard"
                                                  className="w-[25px] h-[14px]"
                                                  fill="none"
                                                  viewBox="0 0 24 24"
                                                  stroke="currentColor"
                                                >
                                                  <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                                  />
                                                </svg>
                                              </button>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  ),
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {builtInWidgets.length > 0 && (
              <div>
                <div
                  role="button"
                  tabIndex={0}
                  aria-expanded={isBuiltInExpanded}
                  aria-disabled="false"
                  onClick={() => setIsBuiltInExpanded(!isBuiltInExpanded)}
                >
                  <div className="group flex items-center justify-between gap-2 cursor-pointer select-none">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <div
                        className="flex-shrink-0"
                        style={{
                          transform: isBuiltInExpanded
                            ? "rotate(90deg)"
                            : "rotate(0deg)",
                        }}
                      >
                        <svg
                          id="chevron-right"
                          className="size-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="body-xs-regular whitespace-nowrap">
                          {t("widgets.categoryBuiltIn")}
                        </span>
                        <span className="text-xs text-light-500 dark:text-dark-50">
                          ({builtInWidgets.length})
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <span className="mr-2" data-state="closed">
                        <svg
                          id="unlock"
                          className="size-[18px] dark:text-light-500 text-light-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                          />
                        </svg>
                      </span>
                    </div>
                  </div>
                </div>

                {isBuiltInExpanded && (
                  <div className="mt-2.5 space-y-2.5">
                    <div className="p-2.5 w-full">
                      <div className="group flex items-center justify-between gap-2 cursor-pointer select-none mb-2.5">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <button
                            type="button"
                            role="checkbox"
                            aria-checked={
                              builtInWidgets.every((w) =>
                                selectedWidgets.has(w.id),
                              )
                                ? "true"
                                : builtInWidgets.some((w) =>
                                      selectedWidgets.has(w.id),
                                    )
                                  ? "mixed"
                                  : "false"
                            }
                            data-state={
                              builtInWidgets.every((w) =>
                                selectedWidgets.has(w.id),
                              )
                                ? "checked"
                                : builtInWidgets.some((w) =>
                                      selectedWidgets.has(w.id),
                                    )
                                  ? "indeterminate"
                                  : "unchecked"
                            }
                            value="on"
                            className="BB-Checkbox group peer h-4 w-4 shrink-0 rounded-sm border transition disabled:cursor-not-allowed bg-general-bg-primary border-general-border-primary focus-visible:outline-hidden focus-visible:border-alert-informative disabled:bg-general-bg-primary-disabled disabled:border-general-border-primary data-[state=checked]:bg-main-100 data-[state=checked]:border-main-100 data-[state=checked]:text-base-0 data-[state=checked]:focus-visible:border-alert-informative data-[state=checked]:disabled:bg-general-bg-primary-disabled data-[state=checked]:disabled:border-general-border-primary data-[state=checked]:disabled:text-general-label-disabled data-[state=indeterminate]:bg-main-100 data-[state=indeterminate]:border-main-100 data-[state=indeterminate]:text-base-0 data-[state=indeterminate]:focus-visible:border-alert-informative data-[state=indeterminate]:disabled:bg-general-bg-primary-disabled data-[state=indeterminate]:disabled:border-general-border-primary data-[state=indeterminate]:disabled:text-general-label-disabled"
                            id="built-in-select-all"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedWidgets((prev) => {
                                const newSet = new Set(prev);
                                if (
                                  builtInWidgets.every((w) => newSet.has(w.id))
                                ) {
                                  builtInWidgets.forEach((w) =>
                                    newSet.delete(w.id),
                                  );
                                } else {
                                  builtInWidgets.forEach((w) =>
                                    newSet.add(w.id),
                                  );
                                }
                                return newSet;
                              });
                            }}
                          >
                            <span
                              data-state={
                                builtInWidgets.every((w) =>
                                  selectedWidgets.has(w.id),
                                )
                                  ? "checked"
                                  : builtInWidgets.some((w) =>
                                        selectedWidgets.has(w.id),
                                      )
                                    ? "indeterminate"
                                    : "unchecked"
                              }
                              className="flex items-center justify-center text-current"
                              style={{
                                pointerEvents: "none",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              {builtInWidgets.every((w) =>
                                selectedWidgets.has(w.id),
                              ) && (
                                <svg
                                  id="check"
                                  className="size-[12px] stroke-2"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                  strokeWidth={2}
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              )}
                              {builtInWidgets.some((w) =>
                                selectedWidgets.has(w.id),
                              ) &&
                                !builtInWidgets.every((w) =>
                                  selectedWidgets.has(w.id),
                                ) && (
                                  <div className="w-[10px] h-[2px] bg-current" />
                                )}
                            </span>
                          </button>
                          <span className="body-xs-medium text-light-900 dark:text-white ml-1">
                            {t("widgets.selectAll")}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2.5">
                        {builtInWidgets.map((widget) => (
                          <div
                            key={widget.id}
                            className="p-2.5 rounded hover:bg-light-100 dark:hover:bg-dark-800"
                            onMouseEnter={() => setHoveredWidgetId(widget.id)}
                            onMouseLeave={() => setHoveredWidgetId(null)}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2 min-w-0 flex-1">
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    role="checkbox"
                                    title={`Select ${widget.name}`}
                                    aria-checked={
                                      selectedWidgets.has(widget.id)
                                        ? "true"
                                        : "false"
                                    }
                                    data-state={
                                      selectedWidgets.has(widget.id)
                                        ? "checked"
                                        : "unchecked"
                                    }
                                    value="on"
                                    className="BB-Checkbox group peer h-4 w-4 shrink-0 rounded-sm border transition disabled:cursor-not-allowed bg-general-bg-primary border-general-border-primary focus-visible:outline-hidden focus-visible:border-alert-informative disabled:bg-general-bg-primary-disabled disabled:border-general-border-primary data-[state=checked]:bg-main-100 data-[state=checked]:border-main-100 data-[state=checked]:text-base-0 data-[state=checked]:focus-visible:border-alert-informative data-[state=checked]:disabled:bg-general-bg-primary-disabled data-[state=checked]:disabled:border-general-border-primary data-[state=checked]:disabled:text-general-label-disabled"
                                    id={`widget-${widget.id}`}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleWidgetSelect(widget.id);
                                    }}
                                  >
                                    <span
                                      data-state={
                                        selectedWidgets.has(widget.id)
                                          ? "checked"
                                          : "unchecked"
                                      }
                                      className="flex items-center justify-center text-current"
                                      style={{
                                        pointerEvents: "none",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                      }}
                                    >
                                      {selectedWidgets.has(widget.id) && (
                                        <svg
                                          id="check"
                                          className="size-[12px] stroke-2"
                                          fill="none"
                                          viewBox="0 0 24 24"
                                          stroke="currentColor"
                                          strokeWidth={2}
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M5 13l4 4L19 7"
                                          />
                                        </svg>
                                      )}
                                    </span>
                                  </button>
                                </div>
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <span className="text-xs text-light-900 dark:text-white whitespace-nowrap">
                                    {widget.name}
                                  </span>
                                  <span className="text-xs text-light-500 dark:text-dark-50 truncate min-w-0">
                                    <div className="inline-flex gap-2.5 overflow-hidden items-center min-w-0">
                                      <span className="text-light-500 dark:text-dark-50 truncate">
                                        {widget.description}
                                      </span>
                                    </div>
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                <div
                                  className={`flex items-center gap-2 shrink-0 transition-opacity duration-200 ${hoveredWidgetId === widget.id ? "opacity-100" : "opacity-0"}`}
                                >
                                  <button
                                    type="button"
                                    className="obb-small-navbar-btn rounded flex items-center justify-center size-7"
                                    onClick={() =>
                                      handleWidgetSelect(widget.id)
                                    }
                                    title={t("widgets.addToDashboard")}
                                  >
                                    <svg
                                      id="add-to-dashboard"
                                      className="w-[25px] h-[14px]"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                      />
                                    </svg>
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {filteredWidgets.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <svg
                  id="search"
                  className="w-12 h-12 text-light-400 dark:text-dark-400 mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <p className="text-light-500 dark:text-dark-50 text-sm">
                  {t("widgets.noResults")}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <AddWidgetModal
        isOpen={isDashboardModalOpen}
        onClose={handleCloseDashboardModal}
        dashboards={dashboards}
        selectedWidgets={getSelectedWidgetObjects()}
        onAdd={handleAddWidgetsToDashboard}
        loading={isDashboardsLoading}
        error={dashboardsError ? dashboardsError.message : undefined}
      />

      <AddDataModal
        isOpen={isAddDataModalOpen}
        onClose={handleCloseAddDataModal}
      />
    </div>
  );
}

export default WidgetsPage;
