export class ApiError<T = unknown> extends Error {
  public status: number;
  public data: T;
  public requestId?: string;
  public response: { status: number; data: T; requestId?: string };

  constructor(status: number, data: T, message?: string, requestId?: string) {
    const errorMsg =
      message ||
      (typeof data === 'object' && data !== null && 'message' in (data as Record<string, unknown>)
        ? String((data as Record<string, unknown>).message)
        : `HTTP Error ${status}`);
    super(errorMsg);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
    this.requestId = requestId;
    this.response = { status, data, requestId };
  }
}

export interface RequestOptions extends Omit<RequestInit, 'body'> {
  params?: Record<string, unknown> | object | URLSearchParams;
  body?: unknown;
  responseType?: 'json' | 'blob' | 'text';
}

export interface ApiResponseContainer<T> {
  data: T;
  status: number;
  headers: Headers;
  requestId?: string;
}

const BASE_URL = '/api';

function generateRequestId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'req-' + Math.random().toString(36).substring(2, 11) + '-' + Date.now();
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<ApiResponseContainer<T>> {
  const { params, body, responseType = 'json', headers: customHeaders, ...customConfig } = options;

  let url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  if (params) {
    const searchParams = new URLSearchParams();
    if (params instanceof URLSearchParams) {
      params.forEach((value, key) => searchParams.append(key, value));
    } else {
      Object.entries(params as Record<string, unknown>).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          searchParams.append(key, String(val));
        }
      });
    }
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes('?') ? '&' : '?') + queryString;
    }
  }

  const headers = new Headers(customHeaders);

  // End-to-end Correlation ID (X-Request-ID)
  if (!headers.has('X-Request-ID')) {
    headers.set('X-Request-ID', generateRequestId());
  }

  let formattedBody: BodyInit | null = null;
  if (body !== undefined && body !== null) {
    if (body instanceof FormData || body instanceof Blob || typeof body === 'string') {
      formattedBody = body;
    } else {
      if (!headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
      }
      formattedBody = JSON.stringify(body);
    }
  }

  const config: RequestInit = {
    ...customConfig,
    headers,
    credentials: 'include',
    body: formattedBody,
  };

  const response = await fetch(url, config);
  const responseRequestId = response.headers.get('X-Request-ID') || headers.get('X-Request-ID') || undefined;

  if (!response.ok) {
    let errorData: unknown = null;
    try {
      errorData = await response.json();
    } catch {
      try {
        errorData = await response.text();
      } catch {
        errorData = null;
      }
    }

    if (response.status === 401) {
      if (typeof window !== 'undefined' && window.location.pathname !== '/auth' && window.location.pathname !== '/login') {
        // Handled reactively by AuthProvider/ProtectedRoute
      }
    }

    throw new ApiError(response.status, errorData, undefined, responseRequestId);
  }

  if (response.status === 204) {
    return { data: null as unknown as T, status: response.status, headers: response.headers, requestId: responseRequestId };
  }

  let data: T;
  if (responseType === 'blob') {
    data = (await response.blob()) as unknown as T;
  } else if (responseType === 'text') {
    data = (await response.text()) as unknown as T;
  } else {
    data = (await response.json()) as T;
  }

  return {
    data,
    status: response.status,
    headers: response.headers,
  };
}

export const apiClient = {
  request,
  get: <T = unknown>(url: string, config?: RequestOptions): Promise<ApiResponseContainer<T>> =>
    request<T>(url, { ...config, method: 'GET' }),
  post: <T = unknown>(url: string, data?: unknown, config?: RequestOptions): Promise<ApiResponseContainer<T>> =>
    request<T>(url, { ...config, method: 'POST', body: data }),
  put: <T = unknown>(url: string, data?: unknown, config?: RequestOptions): Promise<ApiResponseContainer<T>> =>
    request<T>(url, { ...config, method: 'PUT', body: data }),
  patch: <T = unknown>(url: string, data?: unknown, config?: RequestOptions): Promise<ApiResponseContainer<T>> =>
    request<T>(url, { ...config, method: 'PATCH', body: data }),
  delete: <T = unknown>(url: string, config?: RequestOptions): Promise<ApiResponseContainer<T>> =>
    request<T>(url, { ...config, method: 'DELETE' }),
};

