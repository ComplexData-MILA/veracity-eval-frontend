"use client"
import { useUser } from '@auth0/nextjs-auth0/client';
import { useRouter } from 'next/navigation';
import { useState, useCallback, useEffect } from 'react';

export function useAuthApi() {
  const { user, error: userError, isLoading } = useUser();
  const router = useRouter();
  const [accessToken, setAccessToken] = useState(null);

  const fetchToken = useCallback(async () => {
    const tokenRes = await fetch('/api/auth/token', {
      credentials: 'same-origin',
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
      },
    });
    const tokenData = await tokenRes.json();
    if (!tokenRes.ok || !tokenData.accessToken) {
      throw new Error(tokenData.error || 'Failed to get access token');
    }
    setAccessToken(tokenData.accessToken);
    return tokenData.accessToken;
  }, []);

  useEffect(() => {
    if (user && !accessToken) {
      fetchToken().catch(console.error);
    }
  }, [user, accessToken, fetchToken]);

  const fetchWithAuth = useCallback(async (url: string, options = {}) => {
    if (!user) {
      router.push('/api/auth/login');
      throw new Error('Not authenticated');
    }

    let token = accessToken;
    if (!token) {
      token = await fetchToken();
    }

    const response = await fetch(url, {
      ...options,
      credentials: 'include',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token might be expired, try to fetch a new one
        token = await fetchToken();
        return fetchWithAuth(url, options); // Retry with new token
      }
      throw new Error('API request failed');
    }

    return response;
  }, [user, router, accessToken, fetchToken]);

  return { fetchWithAuth, fetchToken, user, isLoading, error: userError };
}