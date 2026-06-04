import { useEffect, useMemo, useRef } from "react";
import { useWidgetData } from "../../../hooks/useWidgetData";
import type {
  WidgetInstance,
  WidgetInstanceProps,
} from "../../../types/widgets";
import { WidgetWrapper } from "../WidgetWrapper";
import { ErrorDisplay } from "./ErrorDisplay";
import { getComposedUrl } from "./utils";

export interface RenderContext {
  data: unknown;
  widget: WidgetInstance;
  onUpdate?: (params: Record<string, unknown>) => void;
}

interface BaseWidgetProps extends WidgetInstanceProps {
  render: (context: RenderContext) => React.ReactNode;
}

export function BaseWidget({
  widget,
  mode,
  onRefresh,
  onUpdate,
  onParametersChange,
  render,
}: BaseWidgetProps): JSX.Element {
  const { data, isLoading, error } = useWidgetData({
    endpoint: widget.endpoint || "",
    connectionUrl: widget.connectionUrl || "",
    connectionAuthentication: widget.connectionAuthentication || [],
    params: widget.currentParams || {},
    enabled: !!widget.endpoint,
  });

  const fullUrl = useMemo(
    () =>
      getComposedUrl(
        widget.endpoint || "",
        widget.connectionUrl || "",
        widget.currentParams || {},
      ),
    [widget.endpoint, widget.connectionUrl, widget.currentParams],
  );

  const displayData = useMemo(() => {
    let rawData = data;
    
    // If data is from API and widget has dataKey, extract the data
    // Skip dataKey extraction for HTML widgets to preserve the { content, type } structure
    if (data !== undefined && data !== null && widget.type !== 'html') {
      // widget.data contains the full widget config from JSON
      // The dataKey might be in widget.data.data (nested) or widget.data (direct)
      const widgetConfig = widget.data as Record<string, unknown> | undefined;
      const nestedDataConfig = widgetConfig?.data as Record<string, unknown> | undefined;
      
      // Try to find dataKey in nested data first, then in direct data
      const dataKey = (nestedDataConfig?.dataKey as string) || (widgetConfig?.dataKey as string);

      if (dataKey && typeof data === 'object' && data !== null) {
        const dataObj = data as Record<string, unknown>;
        if (dataKey in dataObj) {
          rawData = dataObj[dataKey];
        }
      }
    }
    
    if (rawData !== undefined && rawData !== null) {
      return rawData;
    }
    if (widget.data !== undefined && widget.data !== null) {
      return widget.data;
    }
    if (!widget.endpoint) {
      return { content: "<div>No content available</div>", type: "html" };
    }
    return null;
  }, [data, widget.data, widget.endpoint, widget.type]);

  useEffect(() => {
    if (mode === "debug") {
      console.group(`[Widget Debug] ${widget.id}`);
      console.log("Widget ID:", widget.id);
      console.log("Endpoint:", widget.endpoint || "None");
      console.log("URL:", fullUrl || "None");
      console.log("Parameters:", widget.currentParams || {});
      console.log("Data:", displayData);
      if (error) {
        console.error("Error:", error);
      }
      console.groupEnd();
    }
  }, [
    mode,
    widget.id,
    widget.endpoint,
    widget.currentParams,
    fullUrl,
    displayData,
    error,
  ]);

  const parametersInitializedRef = useRef(false);
  const prevWidgetIdRef = useRef<string | null>(null);

  const widgetParams = widget.params || (widget.data as Record<string, unknown>)?.params as typeof widget.params | undefined;

  useEffect(() => {
    if (prevWidgetIdRef.current !== widget.id) {
      prevWidgetIdRef.current = widget.id;
      parametersInitializedRef.current = false;
    }

    if (onParametersChange && widgetParams && widgetParams.length > 0) {
      if (!parametersInitializedRef.current) {
        const currentValues = widget.currentParams || {};
        const initialValues: Record<string, unknown> = {};

        widgetParams.forEach((param) => {
          const paramName = (param as unknown as { paramName?: string }).paramName || param.name;
          if (!paramName) return;

          // 优先级：当前值 > param.default > param.value
          if (currentValues[paramName] !== undefined) {
            initialValues[paramName] = currentValues[paramName];
          } else if (param.default !== undefined) {
            initialValues[paramName] = param.default;
          } else if ((param as unknown as { value?: unknown }).value !== undefined) {
            initialValues[paramName] = (param as unknown as { value?: unknown }).value;
          }
        });

        parametersInitializedRef.current = true;
        onParametersChange(widgetParams, initialValues);
      }
    }
  }, [onParametersChange, widgetParams, widget.currentParams, widget.id]);

  return (
    <WidgetWrapper isLoading={isLoading} onRefresh={onRefresh}>
      {error && <ErrorDisplay error={error} />}
      {displayData !== null && render({ data: displayData, widget, onUpdate })}
    </WidgetWrapper>
  );
}
