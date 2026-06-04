import type { WidgetInstanceProps } from "../../../types/widgets";
import { BaseWidget } from "./BaseWidget";
import { TableRenderer } from "./renderers";

export function TableWidget(props: WidgetInstanceProps): JSX.Element {
  return (
    <BaseWidget
      {...props}
      render={({ data, widget, onUpdate }) => <TableRenderer data={data} widget={widget} onUpdate={onUpdate} />}
    />
  );
}

export default TableWidget;
