import type { WidgetInstanceProps } from "../../../types/widgets";
import { BaseWidget } from "./BaseWidget";
import { MarkdownRenderer } from "./renderers";

export function MarkdownWidget(props: WidgetInstanceProps): JSX.Element {
  return (
    <BaseWidget {...props} render={({ data }) => <MarkdownRenderer data={data} />} />
  );
}

export default MarkdownWidget;
