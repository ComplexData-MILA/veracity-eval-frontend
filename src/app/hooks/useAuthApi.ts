"use client"
import { useUser } from '@auth0/nextjs-auth0/client';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

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

  
  const fetchWithAuth = useCallback(
  async (url: string, options: RequestInit = {}, retry = true) => {
    if (!user && !isLoading) {
      console.log("no user?");
      router.push("/api/auth/login");
      throw new Error("Not authenticated");
    }

    if (isLoading) {
      console.log("Waiting for user to load...");
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    let token = accessToken;

    if (!token) {
      token = await fetchToken();
    }

    const headers = new Headers(options.headers);

    headers.set("Authorization", `Bearer ${token}`);

    const isFormData = options.body instanceof FormData;

    if (isFormData) {
      headers.delete("Content-Type");
    } else if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    const response = await fetch(url, {
      ...options,
      credentials: "include",
      headers,
    });

    if (!response.ok) {
      try {
        if (response.status === 401 && retry) {
          token = await fetchToken();
          return fetchWithAuth(url, options, false);
        }
      } catch {
        router.push("/api/auth/login");
        throw new Error("Authentication expired, please log in again");
      }
    }

    return response;
  },
  [user, isLoading, router, accessToken, fetchToken]
);

  return { fetchWithAuth, fetchToken, user, isLoading, error: userError };
}