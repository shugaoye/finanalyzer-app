import { describe, it, expect } from 'vitest';
import type { WidgetConfig } from '../../../types/widgets';

function findWidgetDefinition(
  widgetId: string,
  definitions: WidgetConfig[],
  widgetData?: Record<string, unknown>,
): WidgetConfig | undefined {
  const standardMatch = definitions.find(
    (def) =>
      def.id === widgetId ||
      def.id === `built-in-${widgetId}` ||
      widgetId.startsWith(`${def.id}-`),
  );

  if (standardMatch) return standardMatch;

  if (widgetData && typeof widgetData.widgetId === 'string') {
    const dataWidgetId = widgetData.widgetId as string;
    return definitions.find(
      (def) =>
        def.id === dataWidgetId ||
        def.id === `built-in-${dataWidgetId}` ||
        dataWidgetId.startsWith(`${def.id}-`),
    );
  }

  return undefined;
}

describe('Widget Definition Lookup', () => {
  const mockDefinitions: WidgetConfig[] = [
    {
      id: 'cn/quote',
      name: 'Stock Quote',
      type: 'metric',
      endpoint: '/api/quote',
      category: 'Finance',
      subcategory: 'Stocks',
      gridData: { w: 2, h: 2 },
      params: [],
      source: 'backend',
      description: 'Stock quote widget',
    } as WidgetConfig,
    {
      id: 'cn/screener',
      name: 'Stock Screener',
      type: 'table',
      endpoint: '/api/screener',
      category: 'Finance',
      subcategory: 'Stocks',
      gridData: { w: 4, h: 3 },
      params: [],
      source: 'backend',
      description: 'Stock screener widget',
    } as WidgetConfig,
    {
      id: 'built-in-metric',
      name: 'Metric',
      type: 'metric',
      endpoint: '',
      category: 'Core',
      subcategory: 'Built-in',
      gridData: { w: 2, h: 2 },
      params: [],
      source: 'built-in',
      description: 'Built-in metric widget',
    } as WidgetConfig,
  ];

  it('should find definition by exact ID match', () => {
    const result = findWidgetDefinition('cn/quote', mockDefinitions);
    expect(result?.id).toBe('cn/quote');
    expect(result?.type).toBe('metric');
  });

  it('should find definition by widgetId in data when standard lookup fails', () => {
    const widgetData = { widgetId: 'cn/quote' };
    const result = findWidgetDefinition('cn/quote-1620000000000', mockDefinitions, widgetData);
    expect(result?.id).toBe('cn/quote');
    expect(result?.type).toBe('metric');
  });

  it('should find definition when widgetId starts with definition ID', () => {
    const widgetData = { widgetId: 'cn/quote-custom' };
    const result = findWidgetDefinition('cn/quote-custom-1620000000000', mockDefinitions, widgetData);
    expect(result?.id).toBe('cn/quote');
  });

  it('should find built-in definition by widgetId', () => {
    const widgetData = { widgetId: 'metric' };
    const result = findWidgetDefinition('metric-1620000000000', mockDefinitions, widgetData);
    expect(result?.id).toBe('built-in-metric');
    expect(result?.type).toBe('metric');
  });

  it('should return undefined for non-existent widget ID', () => {
    const result = findWidgetDefinition('cn/nonexistent', mockDefinitions);
    expect(result).toBeUndefined();
  });

  it('should return undefined when widgetId references non-existent definition', () => {
    const widgetData = { widgetId: 'cn/nonexistent' };
    const result = findWidgetDefinition('cn/nonexistent-1620000000000', mockDefinitions, widgetData);
    expect(result).toBeUndefined();
  });

  it('should prioritize standard lookup over widgetId lookup', () => {
    const widgetData = { widgetId: 'cn/screener' };
    const result = findWidgetDefinition('cn/quote', mockDefinitions, widgetData);
    expect(result?.id).toBe('cn/quote');
    expect(result?.type).toBe('metric');
  });

  it('should handle missing widgetData parameter', () => {
    const result = findWidgetDefinition('cn/quote', mockDefinitions);
    expect(result?.id).toBe('cn/quote');
  });

  it('should handle widgetData without widgetId', () => {
    const widgetData = { someOtherField: 'value' };
    const result = findWidgetDefinition('some-unknown-widget-1620000000000', mockDefinitions, widgetData);
    expect(result).toBeUndefined();
  });

  it('should handle widgetData with non-string widgetId', () => {
    const widgetData = { widgetId: 123 };
    const result = findWidgetDefinition('some-unknown-widget-1620000000000', mockDefinitions, widgetData);
    expect(result).toBeUndefined();
  });
});

describe('Widget ID Generation', () => {
  it('should generate consistent ID format for manual addition', () => {
    const widgetConfigId = 'cn/quote';
    const timestamp = Date.now();
    const generatedId = `${widgetConfigId}-${timestamp}`;
    
    expect(generatedId).toMatch(/^cn\/quote-\d+$/);
  });

  it('should generate consistent ID format for apps.json', () => {
    const baseWidgetId = 'cn/quote';
    const timestamp = Date.now();
    const firstWidgetId = `${baseWidgetId}-${timestamp}`;
    const secondWidgetId = `${baseWidgetId}-${timestamp}-1`;
    
    expect(firstWidgetId).toMatch(/^cn\/quote-\d+$/);
    expect(secondWidgetId).toMatch(/^cn\/quote-\d+-1$/);
  });

  it('should handle duplicate widget IDs with counter', () => {
    const baseWidgetId = 'cn/quote';
    const timestamp = Date.now();
    const widgetIdSet = new Set<string>();
    
    let uniqueWidgetId = `${baseWidgetId}-${timestamp}`;
    let counter = 1;
    
    while (widgetIdSet.has(uniqueWidgetId)) {
      uniqueWidgetId = `${baseWidgetId}-${timestamp}-${counter}`;
      counter++;
    }
    widgetIdSet.add(uniqueWidgetId);
    
    expect(widgetIdSet.has(`${baseWidgetId}-${timestamp}`)).toBe(true);
    
    // Simulate duplicate
    let uniqueWidgetId2 = `${baseWidgetId}-${timestamp}`;
    counter = 1;
    while (widgetIdSet.has(uniqueWidgetId2)) {
      uniqueWidgetId2 = `${baseWidgetId}-${timestamp}-${counter}`;
      counter++;
    }
    
    expect(uniqueWidgetId2).toBe(`${baseWidgetId}-${timestamp}-1`);
  });
});
