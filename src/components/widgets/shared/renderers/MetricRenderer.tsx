interface MetricData {
  value?: number | string;
  label?: string;
  change?: number;
  unit?: string;
}

interface MetricRendererProps {
  data: unknown;
}

export function MetricRenderer({ data }: MetricRendererProps): JSX.Element {
  const widgetData = (data || {}) as MetricData;

  const metricData = {
    value: widgetData.value ?? 0,
    label: widgetData.label ?? "Metric",
    change: widgetData.change,
    unit: widgetData.unit ?? "",
  };

  const isPositive =
    typeof metricData.change === "number" && metricData.change >= 0;

  return (
    <div className="p-4 h-full flex flex-col justify-center">
      <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
        {metricData.value}
        {metricData.unit && (
          <span className="text-xl text-gray-500 dark:text-gray-400 ml-1">
            {metricData.unit}
          </span>
        )}
      </div>
      <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">
        {metricData.label}
      </div>
      {typeof metricData.change === "number" && (
        <div
          className={`text-sm font-medium ${isPositive ? "text-green-500" : "text-red-500"}`}
        >
          <span className="mr-1">{isPositive ? "↑" : "↓"}</span>
          {Math.abs(metricData.change)}%
        </div>
      )}
    </div>
  );
}
