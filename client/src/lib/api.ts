/**
 * Grocery POS App
 * Copyright (c) 2026 Ameen Al-Sanabani
 * Licensed under PolyForm Noncommercial License 1.0.0
 * https://polyformproject.org/licenses/noncommercial/1.0.0/
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

async function fetchWithRetry(url: string, options: RequestInit, retries = 3, backoff = 300): Promise<Response> {
    try {
        const res = await fetch(url, options);
        // Retry on 5xx server errors or if specifically configured, but mostly just network errors (fetch throws)
        // If we want to retry on 500s:
        if (!res.ok && res.status >= 500 && retries > 0) {
            // We could retry here, but usually fetch doesn't throw on 500. 
            // Let's throw to trigger the catch block if we want to retry on 500s.
            throw new Error(`Server Error: ${res.status}`);
        }
        return res;
    } catch (err: any) {
        if (retries > 0) {
            await new Promise(r => setTimeout(r, backoff));
            return fetchWithRetry(url, options, retries - 1, backoff * 2);
        }
        throw err;
    }
}

async function request<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'GET',
    body?: any
): Promise<T> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    const options: RequestInit = {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: body ? JSON.stringify(body) : undefined,
    };

    // Retry only for idempotent GET requests to avoid double-posting transactions
    // For POST/PUT, we rely on the user to click "Try Again" or the UI to handle it, 
    // unless we implement idempotency keys (Phase 4).
    let response: Response;

    if (method === 'GET') {
        response = await fetchWithRetry(`${API_URL}${endpoint}`, options);
    } else {
        response = await fetch(`${API_URL}${endpoint}`, options);
    }

    let data;
    try {
        data = await response.json();
    } catch (jsonError) {
        // JSON parsing failed, response might be empty
        if (response.ok) {
            throw new Error('Invalid server response: Unable to parse JSON');
        }
        data = null;
    }

    if (!response.ok) {
        const errorMessage = (data && typeof data === 'object' && data.message)
            ? data.message
            : `Server error: ${response.status} ${response.statusText}`;
        throw new Error(errorMessage);
    }

    return data;
}

export const api = {
    get: <T>(endpoint: string) => request<T>(endpoint, 'GET'),
    post: <T>(endpoint: string, body: any) => request<T>(endpoint, 'POST', body),
    put: <T>(endpoint: string, body: any) => request<T>(endpoint, 'PUT', body),
    patch: <T>(endpoint: string, body: any) => request<T>(endpoint, 'PATCH', body),
    delete: <T>(endpoint: string) => request<T>(endpoint, 'DELETE'),
};
