import { useQuery } from '@tanstack/react-query';

interface UseWidgetDataOptions {
  endpoint: string;
  connectionUrl?: string;
  connectionAuthentication?: Array<{
    key: string;
    value: string;
    description?: string;
    location: 'header' | 'query';
  }>;
  params?: Record<string, unknown>;
  enabled?: boolean;
  staleTime?: number;
  cacheTime?: number;
  retry?: number;
}

interface UseWidgetDataResult {
  data: unknown | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<unknown>;
  isFetching: boolean;
}

export function useWidgetData({
  endpoint,
  connectionUrl = '',
  connectionAuthentication = [],
  params = {},
  enabled = true,
  staleTime = 30000, // 30 seconds
  cacheTime = 5 * 60 * 1000, // 5 minutes
  retry = 2,
}: UseWidgetDataOptions): UseWidgetDataResult {
  return useQuery({
    queryKey: ['widget-data', endpoint, params],
    queryFn: () => fetchWidgetData(endpoint, connectionUrl, connectionAuthentication, params),
    enabled: !!endpoint && enabled,
    staleTime,
    gcTime: cacheTime,
    retry,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });
}

async function fetchWidgetData(
  endpoint: string,
  connectionUrl: string,
  connectionAuthentication: Array<{
    key: string;
    value: string;
    description?: string;
    location: 'header' | 'query';
  }>,
  params: Record<string, unknown>
): Promise<unknown> {
  // Check if endpoint is a full URL (starts with http:// or https://)
  const isFullUrl = endpoint.startsWith('http://') || endpoint.startsWith('https://');
  
  let url: string;
  
  if (isFullUrl) {
    // If endpoint is a full URL, use it directly without connectionUrl
    url = endpoint;
  } else {
    // Normalize connectionUrl: remove trailing slash
    const normalizedBaseUrl = connectionUrl.endsWith('/')
      ? connectionUrl.slice(0, -1)
      : connectionUrl;
    
    // Ensure endpoint starts with /
    const normalizedEndpoint = endpoint.startsWith('/')
      ? endpoint
      : `/${endpoint}`;
    
    url = `${normalizedBaseUrl}${normalizedEndpoint}`;
  }
  
  // Build headers and query params from authentication
  const headers: HeadersInit = {};
  const authQueryParams = new URLSearchParams();
  
  connectionAuthentication.forEach((auth) => {
    if (auth.location === 'header') {
      headers[auth.key] = auth.value;
    } else {
      authQueryParams.append(auth.key, auth.value);
    }
  });
  
  // Build query params from widget parameters
  const queryParams = new URLSearchParams(authQueryParams.toString());
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      queryParams.append(key, String(value));
    }
  });
  
  const finalUrl = queryParams.toString()
    ? `${url}?${queryParams.toString()}`
    : url;
  
  const response = await fetch(finalUrl, { headers });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch data: ${response.statusText}`);
  }
  
  const contentType = response.headers.get('content-type') || '';
  
  if (contentType.includes('application/json')) {
    return response.json();
  } else if (contentType.includes('text/html')) {
    const htmlContent = await response.text();
    return { content: htmlContent, type: 'html' };
  } else if (contentType.includes('text/')) {
    return response.text();
  }
  
  return response.text();
}
