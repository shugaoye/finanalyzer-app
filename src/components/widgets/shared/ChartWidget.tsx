import type { WidgetInstanceProps } from "../../../types/widgets";
import { BaseWidget } from "./BaseWidget";
import { ChartRenderer } from "./renderers";

export function ChartWidget(props: WidgetInstanceProps): JSX.Element {
  return (
    <BaseWidget
      {...props}
      render={({ data, widget }) => (
        <ChartRenderer
          data={data}
          chartType={String(widget.currentParams?.chartType || "line")}
          timeRange={String(widget.currentParams?.timeRange || "1d")}
        />
      )}
    />
  );
}

export default ChartWidget;
