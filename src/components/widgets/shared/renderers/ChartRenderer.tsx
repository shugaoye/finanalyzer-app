interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string;
  }[];
}

function transformToChartData(rawData: unknown): ChartData {
  if (!rawData) {
    return { labels: [], datasets: [] };
  }

  const dataObj = rawData as Record<string, unknown>;

  if (dataObj.labels && dataObj.datasets) {
    return rawData as ChartData;
  }

  if (Array.isArray(rawData)) {
    const labels = rawData.map((item, index) =>
      String(
        (item as Record<string, unknown>).label ||
          (item as Record<string, unknown>).date ||
          index,
      ),
    );
    const values = rawData.map((item) =>
      Number(
        (item as Record<string, unknown>).value ||
          (item as Record<string, unknown>).price ||
          0,
      ),
    );
    return {
      labels,
      datasets: [
        {
          label: "Data",
          data: values,
          backgroundColor: "rgba(54, 162, 235, 0.2)",
          borderColor: "rgba(54, 162, 235, 1)",
        },
      ],
    };
  }

  return { labels: [], datasets: [] };
}

interface ChartRendererProps {
  data: unknown;
  chartType?: string;
  timeRange?: string;
}

export function ChartRenderer({
  data,
  chartType = "line",
  timeRange = "1d",
}: ChartRendererProps): JSX.Element {
  const chartData = transformToChartData(data);

  if (!chartData || chartData.labels.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
        No chart data available
      </div>
    );
  }

  return (
    <div className="w-full h-[300px] flex items-center justify-center">
      <div className="text-center p-8">
        <h3 className="text-lg font-medium mb-4">Chart Widget</h3>
        <p className="text-gray-500 dark:text-gray-400 mb-2">
          Type: {chartType}
        </p>
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          Time Range: {timeRange}
        </p>
        <div className="text-sm text-gray-400 dark:text-gray-500">
          <p>Labels: {chartData.labels.length} items</p>
          <p>Datasets: {chartData.datasets.length}</p>
        </div>
      </div>
    </div>
  );
}
