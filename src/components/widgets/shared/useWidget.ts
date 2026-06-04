import { useCallback } from 'react';
import type { WidgetInstanceProps } from '../../../types/widgets';
import { useWidgetData } from '../../../hooks/useWidgetData';

interface UseWidgetResult {
  isLoading: boolean;
  error: string | null;
  data: unknown | null;
  loadData: () => Promise<void>;
  handleRefresh: () => void;
}

export function useWidget(
  { widget, onRefresh }: WidgetInstanceProps
): UseWidgetResult {
  const { data, isLoading, error, refetch } = useWidgetData({
    endpoint: widget.endpoint || '',
    connectionUrl: widget.connectionUrl || '',
    params: widget.currentParams || {},
    enabled: !!widget.endpoint,
  });

  const loadData = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const handleRefresh = useCallback(() => {
    refetch();
    if (onRefresh) {
      onRefresh();
    }
  }, [refetch, onRefresh]);

  return {
    isLoading,
    error: error ? error.message : null,
    data,
    loadData,
    handleRefresh
  };
}
