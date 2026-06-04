import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import type { WidgetConfig } from "../../types/widgets";
import { widgetService } from "./widgetService";

export const WIDGETS_QUERY_KEY = "widgets";

export function useWidgets(forceRefresh = false) {
  return useQuery<WidgetConfig[], Error>({
    queryKey: [WIDGETS_QUERY_KEY, { forceRefresh }],
    queryFn: () => widgetService.getWidgets(undefined, forceRefresh),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
}

export function useWidgetsQueryClient() {
  const queryClient = useQueryClient();

  const invalidateWidgets = () => {
    return queryClient.invalidateQueries({ queryKey: [WIDGETS_QUERY_KEY] });
  };

  const setWidgetsData = (widgets: WidgetConfig[]) => {
    queryClient.setQueryData([WIDGETS_QUERY_KEY], widgets);
  };

  return {
    invalidateWidgets,
    setWidgetsData,
  };
}

export function useRefreshWidgets() {
  const { invalidateWidgets } = useWidgetsQueryClient();

  return useMutation({
    mutationFn: async () => {
      await invalidateWidgets();
    },
  });
}
