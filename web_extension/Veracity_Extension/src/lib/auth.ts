/**
 * Auth module contract for Veracity Extension.
 * Runtime implementation lives in auth.js (browser) and is inlined into panel.js by postbuild.
 *
 * - login(): PKCE + chrome.identity.launchWebAuthFlow, then validate access token and persist.
 * - logout(): Clear chrome.storage.local tokens and reset UI state.
 * - getAccessToken(): Return valid access token or null (caller triggers login).
 * - isAuthenticated(): True only if a valid Auth0 ACCESS TOKEN exists (JWT validated with JWKS).
 *
 * Token validation: JWT exists, exp in future, iss === "https://veri-fact.ca.auth0.com/",
 * aud includes "https://veri-fact.ca.auth0.com/api/v2/", RS256 signature verified via JWKS.
 * Storage: only { access_token, expires_at } in chrome.storage.local.
 */

export const AUTH0_DOMAIN = "veri-fact.ca.auth0.com";
export const AUTH0_AUDIENCE = "https://veri-fact.ca.auth0.com/api/v2/";
export const AUTH0_ALGORITHMS = "RS256";
export const AUTH0_ISSUER = "https://veri-fact.ca.auth0.com/";
export const AUTH0_SCOPE = "openid profile email";
export const JWKS_URL = "https://veri-fact.ca.auth0.com/.well-known/jwks.json";
export const TOKEN_STORAGE_KEY = "veracity_tokens";

export interface AuthConfig {
  clientId: string;
}

export interface StoredTokens {
  access_token: string;
  expires_at: number;
}

export interface AuthModule {
  init(config: AuthConfig): void;
  isAuthenticated(): Promise<boolean>;
  getAccessToken(): Promise<string | null>;
  login(): Promise<string>;
  logout(): Promise<void>;
}
