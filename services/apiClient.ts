import { tokenStorage } from './tokenStorage';

export class ApiError extends Error {
    status: number;
    details?: unknown;

    constructor(message: string, status: number, details?: unknown) {
        super(message);
        this.status = status;
        this.details = details;
    }
}

type RequestOptions = {
    auth?: boolean;
    retryOnAuthError?: boolean;
};

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

const buildUrl = (path: string) => {
    if (!API_BASE_URL) {
        throw new Error('API base URL is not configured. Set EXPO_PUBLIC_API_BASE_URL.');
    }

    if (path.startsWith('http://') || path.startsWith('https://')) {
        return path;
    }

    return `${API_BASE_URL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
};

const parseResponse = async (response: Response) => {
    if (response.status === 204) {
        return null;
    }

    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
        return response.json();
    }

    return response.text();
};

const refreshAccessToken = async () => {
    const refreshToken = await tokenStorage.getRefreshToken();
    if (!refreshToken) {
        return null;
    }

    const response = await fetch(buildUrl('/auth/refresh'), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
        await tokenStorage.clearTokens();
        return null;
    }

    const data = (await parseResponse(response)) as {
        accessToken: string;
        refreshToken?: string;
    };

    if (!data?.accessToken) {
        await tokenStorage.clearTokens();
        return null;
    }

    await tokenStorage.setTokens(data.accessToken, data.refreshToken ?? refreshToken);
    return data.accessToken;
};

export const request = async <T>(
    path: string,
    init: RequestInit,
    options?: RequestOptions
): Promise<T> => {
    const shouldAuth = options?.auth !== false;
    const retryOnAuthError = options?.retryOnAuthError !== false;

    const accessToken = shouldAuth ? await tokenStorage.getAccessToken() : null;
    const headers = new Headers(init.headers);
    headers.set('Accept', 'application/json');
    if (!headers.has('Content-Type') && init.body) {
        headers.set('Content-Type', 'application/json');
    }
    if (accessToken) {
        headers.set('Authorization', `Bearer ${accessToken}`);
    }

    const response = await fetch(buildUrl(path), {
        ...init,
        headers,
    });

    if (response.status === 401 && shouldAuth && retryOnAuthError) {
        const refreshed = await refreshAccessToken();
        if (refreshed) {
            return request<T>(path, init, { ...options, retryOnAuthError: false });
        }
    }

    const data = await parseResponse(response);

    if (!response.ok) {
        const message =
            typeof data === 'string'
                ? data
                : (data as { message?: string })?.message || 'Request failed.';
        throw new ApiError(message, response.status, data);
    }

    return data as T;
};

export const requestJson = async <T>(
    path: string,
    method: string,
    body?: unknown,
    options?: RequestOptions
) => {
    const init: RequestInit = { method };
    if (body !== undefined) {
        init.body = JSON.stringify(body);
    }

    return request<T>(path, init, options);
};
