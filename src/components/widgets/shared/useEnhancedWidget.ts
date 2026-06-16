
import { useState, useEffect, useCallback } from 'react';
import type { WidgetInstanceProps, WidgetParameter, ParameterOption } from '../../../types/widgets';
import { isEndpointParameter, isFormParameter } from '../../../types/widgets';
import { parameterService } from '../../../services/parameters/parameterService';
import { useWidgetData } from '../../../hooks/useWidgetData';

interface UseEnhancedWidgetResult {
  isLoading: boolean;
  error: string | null;
  data: unknown | null;
  paramOptions: Record<string, ParameterOption[]>;
  optionsLoading: Record<string, boolean>;
  optionsError: Record<string, string>;
  formErrors: Record<string, string>;
  loadData: () => Promise<void>;
  handleRefresh: () => void;
  fetchParameterOptions: (parameter: WidgetParameter) => Promise<void>;
  submitFormParameter: (parameter: WidgetParameter, formData: Record<string, unknown>) => Promise<unknown>;
}

export function useEnhancedWidget(
  { widget, onRefresh, onUpdate }: WidgetInstanceProps
): UseEnhancedWidgetResult {
  const { data, isLoading, error, refetch } = useWidgetData({
    endpoint: widget.endpoint || '',
    connectionUrl: widget.connectionUrl || '',
    params: widget.currentParams || {},
    enabled: !!widget.endpoint,
  });
  const [paramOptions, setParamOptions] = useState<Record<string, ParameterOption[]>>(
    widget.paramOptions || {}
  );
  const [optionsLoading, setOptionsLoading] = useState<Record<string, boolean>>(
    widget.optionsLoading || {}
  );
  const [optionsError, setOptionsError] = useState<Record<string, string>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>(
    widget.formErrors || {}
  );

  const loadData = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const handleRefresh = useCallback(() => {
    refetch();
    if (onRefresh) {
      onRefresh();
    }
  }, [refetch, onRefresh]);

  const fetchParameterOptions = useCallback(async (parameter: WidgetParameter) => {
    if (!isEndpointParameter(parameter)) {
      return;
    }

    const paramKey = `${widget.id}:${widget.instanceId}:${parameter.name}`;
    setOptionsLoading(prev => ({ ...prev, [paramKey]: true }));
    setOptionsError(prev => ({ ...prev, [paramKey]: '' }));

    try {
      const options = await parameterService.fetchParamOptions({
        parameter,
        widgetId: widget.id,
        instanceId: widget.instanceId,
        baseUrl: widget.connectionUrl || undefined,
      });

      setParamOptions((prev: Record<string, ParameterOption[]>) => ({
        ...prev,
        [parameter.name]: options,
      }));

      // Update widget state if onUpdate is provided
      if (onUpdate) {
        onUpdate({
          ...widget.currentParams,
          paramOptions: {
            ...widget.paramOptions,
            [parameter.name]: options,
          },
          optionsLoading: {
            ...widget.optionsLoading,
            [paramKey]: false,
          },
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load options';
      setOptionsError(prev => ({ ...prev, [paramKey]: errorMessage }));
    } finally {
      setOptionsLoading(prev => ({ ...prev, [paramKey]: false }));
    }
  }, [widget, onUpdate]);

  const submitFormParameter = useCallback(async (parameter: WidgetParameter, formData: Record<string, unknown>): Promise<unknown> => {
    if (!isFormParameter(parameter)) {
      throw new Error('Not a form parameter');
    }

    try {
      const result = await parameterService.submitFormParameter(parameter, formData, widget.connectionUrl || '');
      setFormErrors({});

      // Update widget state if onUpdate is provided
      if (onUpdate) {
        onUpdate({
          ...widget.currentParams,
          [parameter.name]: formData,
          formErrors: {},
        });
      }

      // Refresh widget data after successful form submission
      handleRefresh();

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit form';
      setFormErrors({ [parameter.name]: errorMessage });
      throw err;
    }
  }, [widget, onUpdate, handleRefresh]);

  // Fetch options for endpoint parameters on widget mount
  useEffect(() => {
    widget.params.forEach(parameter => {
      if (isEndpointParameter(parameter)) {
        fetchParameterOptions(parameter);
      }
    });
  }, [widget.params, fetchParameterOptions]);

  // Load data on widget mount or parameter changes
  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    isLoading,
    error: error ? error.message : null,
    data,
    paramOptions,
    optionsLoading,
    optionsError,
    formErrors,
    loadData,
    handleRefresh,
    fetchParameterOptions,
    submitFormParameter,
  };
}
