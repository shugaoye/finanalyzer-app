export function getComposedUrl(
  endpoint: string,
  connectionUrl: string,
  params: Record<string, unknown>,
): string {
  if (!endpoint) return "";

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
  const queryParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      queryParams.append(key, String(value));
    }
  });

  return queryParams.toString() ? `${url}?${queryParams.toString()}` : url;
}
