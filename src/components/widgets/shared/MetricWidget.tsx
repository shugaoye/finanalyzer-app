import type { WidgetInstanceProps } from "../../../types/widgets";
import { BaseWidget } from "./BaseWidget";
import { MetricRenderer } from "./renderers";

export function MetricWidget(props: WidgetInstanceProps): JSX.Element {
  return (
    <BaseWidget {...props} render={({ data }) => <MetricRenderer data={data} />} />
  );
}

export default MetricWidget;
