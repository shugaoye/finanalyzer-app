import type { WidgetInstanceProps } from "../../../types/widgets";
import { BaseWidget } from "./BaseWidget";
import { HtmlRenderer } from "./renderers";

export function HtmlWidget(props: WidgetInstanceProps): JSX.Element {
  return (
    <BaseWidget
      {...props}
      render={({ data, widget, onUpdate }) => (
        <HtmlRenderer
          data={data}
          widgetId={widget.id}
          instanceId={widget.instanceId}
          onUpdate={onUpdate}
        />
      )}
    />
  );
}

export default HtmlWidget;
