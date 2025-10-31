/**
 * Proxy utility to forward API requests to the backend server
 * Used in production when API routes should be handled by EC2 backend
 */
export async function proxyToBackend(
  request: Request,
  path: string
): Promise<Response> {
  const backendUrl = process.env.NEXT_PUBLIC_APP_BASE_URL || 'https://api.businessorbit.org';
  const targetUrl = `${backendUrl}${path}`;

  // Get the original request method, headers, and body
  const method = request.method;
  const headers = new Headers(request.headers);
  
  // Forward important headers but update host
  headers.set('host', new URL(targetUrl).host);
  headers.set('x-forwarded-host', request.headers.get('host') || '');
  headers.set('x-forwarded-proto', 'https');

  // Clone the request to read body if needed
  let body: BodyInit | null = null;
  
  try {
    if (method !== 'GET' && method !== 'HEAD') {
      const contentType = request.headers.get('content-type') || '';
      
      // For form data, read as form data and forward
      if (contentType.includes('multipart/form-data') || contentType.includes('application/x-www-form-urlencoded')) {
        const formData = await request.formData();
        body = formData;
        // Don't set content-type, let fetch set it automatically for FormData
        headers.delete('content-type');
      } else {
        // For JSON or other types, read the body as text
        body = await request.text();
        // Keep original content-type for JSON
        if (!contentType) {
          headers.set('content-type', 'application/json');
        }
      }
    }
  } catch (error) {
    console.error('Error reading request body for proxy:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: 'Failed to read request body',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  try {
    // Forward cookies from original request
    const cookieHeader = request.headers.get('cookie');
    if (cookieHeader) {
      headers.set('cookie', cookieHeader);
    }

    const response = await fetch(targetUrl, {
      method,
      headers: headers as HeadersInit,
      body,
      // Note: credentials: 'include' is for client-side fetch, not server-side
      // Cookies are forwarded via the cookie header above
    });

    // Create a new response with the backend's response
    const responseHeaders = new Headers(response.headers);
    
    // Forward CORS headers if present
    responseHeaders.set('Access-Control-Allow-Origin', request.headers.get('origin') || '*');
    responseHeaders.set('Access-Control-Allow-Credentials', 'true');

    const responseBody = await response.arrayBuffer();

    return new Response(responseBody, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (error: any) {
    console.error('Proxy error:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: 'Failed to connect to backend server',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}

