/**
 * Browser auth module: PKCE + launchWebAuthFlow, JWT validation with JWKS (RS256).
 * Inlined into panel.js by postbuild. Uses only chrome.storage.local, chrome.identity, fetch, crypto.subtle.
 * Lifecycle: init(clientId) → isAuthenticated() / getAccessToken() / login() / logout().
 */
(function (global) {
  const AUTH0_DOMAIN = "veri-fact.ca.auth0.com";
  const AUTH0_AUDIENCE = "https://veri-fact.ca.auth0.com/api/v2/";
  const AUTH0_ISSUER = "https://veri-fact.ca.auth0.com/";
  const AUTH0_SCOPE = "openid profile email";
  const JWKS_URL = "https://veri-fact.ca.auth0.com/.well-known/jwks.json";
  const TOKEN_STORAGE_KEY = "veracity_tokens";

  let AUTH0_CLIENT_ID = "";
  let loginInProgress = false;

  function base64UrlDecode(str) {
    const base64 = str.replace(/-/g, "+").replace(/_/g, "/");
    const pad = base64.length % 4;
    const padded = pad ? base64 + "=".repeat(4 - pad) : base64;
    try {
      return atob(padded);
    } catch {
      return null;
    }
  }

  function parseJwt(token) {
    if (!token || typeof token !== "string") return null;
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const headerJson = base64UrlDecode(parts[0]);
    const payloadJson = base64UrlDecode(parts[1]);
    if (!headerJson || !payloadJson) return null;
    try {
      return {
        header: JSON.parse(headerJson),
        payload: JSON.parse(payloadJson),
        rawHeaderPayload: parts[0] + "." + parts[1],
        signatureB64: parts[2],
      };
    } catch {
      return null;
    }
  }

  function signatureToArrayBuffer(base64url) {
    const base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");
    const pad = base64.length % 4;
    const padded = pad ? base64 + "=".repeat(4 - pad) : base64;
    const binary = atob(padded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes.buffer;
  }

  let jwksCache = null;
  let jwksCacheTime = 0;
  const JWKS_CACHE_MS = 5 * 60 * 1000;

  /** Fetch Auth0 JWKS (cached) for RS256 signature verification. */
  async function getJwks() {
    if (jwksCache && Date.now() - jwksCacheTime < JWKS_CACHE_MS) return jwksCache;
    const res = await fetch(JWKS_URL);
    if (!res.ok) throw new Error("JWKS fetch failed: " + res.status);
    const data = await res.json();
    jwksCache = data && data.keys ? data.keys : [];
    jwksCacheTime = Date.now();
    return jwksCache;
  }

  async function importJwkToCryptoKey(jwk) {
    const alg = jwk.alg === "RS256" ? "RS256" : "RS256";
    const key = await crypto.subtle.importKey(
      "jwk",
      {
        kty: jwk.kty,
        n: jwk.n,
        e: jwk.e,
        alg: alg,
      },
      { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
      false,
      ["verify"]
    );
    return key;
  }

  async function verifyTokenSignature(token, parsed) {
    if (!parsed || !parsed.rawHeaderPayload || !parsed.signatureB64) return false;
    const kid = parsed.header && parsed.header.kid;
    if (!kid) return false;
    const keys = await getJwks();
    const jwk = keys.find(function (k) {
      return k.kid === kid;
    });
    if (!jwk) return false;
    const cryptoKey = await importJwkToCryptoKey(jwk);
    const signature = signatureToArrayBuffer(parsed.signatureB64);
    const data = new TextEncoder().encode(parsed.rawHeaderPayload);
    return await crypto.subtle.verify(
      { name: "RSASSA-PKCS1-v1_5" },
      cryptoKey,
      signature,
      data
    );
  }

  /** Check exp, iss, aud and RS256 signature via JWKS. */
  async function validateAccessToken(token) {
    const parsed = parseJwt(token);
    if (!parsed || !parsed.payload) return false;
    const exp = parsed.payload.exp;
    const nowSec = Date.now() / 1000;
    if (typeof exp !== "number" || exp - 30 <= nowSec) return false;
    const iss = parsed.payload.iss;
    if (iss !== AUTH0_ISSUER && iss !== AUTH0_ISSUER.replace(/\/$/, "")) return false;
    const aud = parsed.payload.aud;
    const audList = Array.isArray(aud) ? aud : aud ? [aud] : [];
    if (audList.indexOf(AUTH0_AUDIENCE) === -1) return false;
    return await verifyTokenSignature(token, parsed);
  }

  function getStoredTokens() {
    return new Promise(function (resolve) {
      chrome.storage.local.get([TOKEN_STORAGE_KEY], function (res) {
        resolve(res && res[TOKEN_STORAGE_KEY] ? res[TOKEN_STORAGE_KEY] : null);
      });
    });
  }

  function setStoredTokens(tokens) {
    return new Promise(function (resolve) {
      chrome.storage.local.set({ [TOKEN_STORAGE_KEY]: tokens }, resolve);
    });
  }

  function clearStoredTokens() {
    return new Promise(function (resolve) {
      chrome.storage.local.remove([TOKEN_STORAGE_KEY], resolve);
    });
  }

  async function isAuthenticated() {
    const stored = await getStoredTokens();
    if (!stored || !stored.access_token) return false;
    if (stored.expires_at && stored.expires_at * 1000 <= Date.now()) return false;
    return await validateAccessToken(stored.access_token);
  }

  async function getAccessToken() {
    const stored = await getStoredTokens();
    if (!stored || !stored.access_token) return null;
    if (stored.expires_at && stored.expires_at * 1000 <= Date.now()) return null;
    const valid = await validateAccessToken(stored.access_token);
    return valid ? stored.access_token : null;
  }

  function generateCodeVerifier(length) {
    length = length || 43;
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return btoa(String.fromCharCode.apply(null, array))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "")
      .slice(0, length);
  }

  async function sha256Base64Url(input) {
    const enc = new TextEncoder();
    const data = enc.encode(input);
    const hash = await crypto.subtle.digest("SHA-256", data);
    const base64 = btoa(String.fromCharCode.apply(null, new Uint8Array(hash)));
    return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }

  function isCredentialError(error, errorDescription) {
    const err = (error == null ? "" : String(error)).toLowerCase();
    const desc = (errorDescription == null ? "" : String(errorDescription)).toLowerCase();
    if (err === "access_denied" || err === "invalid_grant") return true;
    const credentialPhrases = [
      "wrong email or password",
      "wrong username or password",
      "invalid credentials",
      "invalid user credentials",
      "username or password",
      "login required",
      "incorrect password",
      "invalid password",
    ];
    const combined = (err + " " + desc).toLowerCase();
    for (let i = 0; i < credentialPhrases.length; i++) {
      if (combined.indexOf(credentialPhrases[i]) !== -1) return true;
    }
    return false;
  }

  function responseTextSuggestsCredentialError(text) {
    if (typeof text !== "string") return false;
    const t = text.toLowerCase();
    if (t.indexOf("invalid_grant") !== -1 || t.indexOf("access_denied") !== -1) return true;
    if (t.indexOf("wrong") !== -1 && t.indexOf("password") !== -1) return true;
    if (t.indexOf("invalid credentials") !== -1 || t.indexOf("invalid user credentials") !== -1) return true;
    if (t.indexOf("username or password") !== -1) return true;
    return false;
  }

  function buildAuthorizeUrl(verifier, state) {
    return sha256Base64Url(verifier).then(function (challenge) {
      const redirectUri = chrome.identity.getRedirectURL("auth");
      const url = new URL("https://" + AUTH0_DOMAIN + "/authorize");
      url.searchParams.set("response_type", "code");
      url.searchParams.set("client_id", AUTH0_CLIENT_ID);
      url.searchParams.set("redirect_uri", redirectUri);
      url.searchParams.set("code_challenge", challenge);
      url.searchParams.set("code_challenge_method", "S256");
      url.searchParams.set("scope", AUTH0_SCOPE);
      url.searchParams.set("audience", AUTH0_AUDIENCE);
      url.searchParams.set("prompt", "login");
      url.searchParams.set("max_age", "0");
      url.searchParams.set("state", state || Math.random().toString(36).slice(2));
      return { url: url.toString(), verifier: verifier, redirectUri: redirectUri };
    });
  }

  function exchangeCodeForTokens(code, verifier, redirectUri) {
    const body = {
      grant_type: "authorization_code",
      client_id: AUTH0_CLIENT_ID,
      code: code,
      redirect_uri: redirectUri,
      code_verifier: verifier,
      audience: AUTH0_AUDIENCE,
    };
    return fetch("https://" + AUTH0_DOMAIN + "/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then(function (res) {
      if (!res.ok) {
        return res.text().then(function (t) {
          let credentialError = false;
          try {
            const json = JSON.parse(t);
            const err = json && json.error;
            const errDesc = json && json.error_description;
            credentialError = isCredentialError(err, errDesc);
          } catch {}
          if (!credentialError && responseTextSuggestsCredentialError(t)) credentialError = true;
          const e = new Error("Token exchange failed: " + res.status + " " + t);
          e.isCredentialError = credentialError;
          throw e;
        });
      }
      return res.json();
    });
  }

  /** PKCE: launchWebAuthFlow → exchange code for tokens → validate → store. */
  function login() {
    if (!AUTH0_CLIENT_ID) return Promise.reject(new Error("Auth not configured: missing client ID"));
    loginInProgress = true;
    const verifier = generateCodeVerifier();
    const state = Math.random().toString(36).slice(2);
    return clearStoredTokens().then(function () {
      return buildAuthorizeUrl(verifier, state);
    }).then(function (authParams) {
      return new Promise(function (resolve, reject) {
        chrome.identity.launchWebAuthFlow(
          { url: authParams.url, interactive: true },
          function (redirectUrl) {
            if (chrome.runtime.lastError || !redirectUrl) {
              loginInProgress = false;
              clearStoredTokens().then(function () {
                reject(new Error(chrome.runtime.lastError ? chrome.runtime.lastError.message : "Sign-in was closed or blocked."));
              });
              return;
            }
            try {
              const url = new URL(redirectUrl);
              const err = url.searchParams.get("error");
              const errDesc = url.searchParams.get("error_description");
              if (err || errDesc) {
                loginInProgress = false;
                clearStoredTokens().then(function () {
                  const e = new Error("Auth0: " + (errDesc || err));
                  e.isCredentialError = isCredentialError(err, errDesc);
                  reject(e);
                });
                return;
              }
              const code = url.searchParams.get("code");
              if (!code) {
                loginInProgress = false;
                clearStoredTokens().then(function () {
                  reject(new Error("No authorization code in redirect"));
                });
                return;
              }
              exchangeCodeForTokens(code, authParams.verifier, authParams.redirectUri)
                .then(function (data) {
                  if (!data.access_token) {
                    loginInProgress = false;
                    clearStoredTokens().then(function () {
                      reject(new Error("No access token in response"));
                    });
                    return;
                  }
                  const expires_at = Math.floor(Date.now() / 1000) + (data.expires_in || 3600);
                  return validateAccessToken(data.access_token).then(function (valid) {
                    if (!valid) {
                      loginInProgress = false;
                      clearStoredTokens().then(function () {
                        reject(new Error("Access token failed validation"));
                      });
                      return;
                    }
                    return setStoredTokens({ access_token: data.access_token, expires_at: expires_at }).then(function () {
                      loginInProgress = false;
                      resolve(data.access_token);
                    });
                  });
                })
                .catch(function (e) {
                  loginInProgress = false;
                  clearStoredTokens().then(function () { reject(e); });
                });
            } catch (e) {
              loginInProgress = false;
              clearStoredTokens().then(function () { reject(e); });
            }
          }
        );
      });
    });
  }

  function logout() {
    return clearStoredTokens();
  }

  function init(config) {
    if (config && config.clientId) AUTH0_CLIENT_ID = config.clientId;
  }

  function isLoginInProgress() {
    return loginInProgress;
  }

  global.VeracityAuth = {
    init: init,
    isAuthenticated: isAuthenticated,
    getAccessToken: getAccessToken,
    login: login,
    logout: logout,
    getStoredTokens: getStoredTokens,
    setStoredTokens: setStoredTokens,
    clearStoredTokens: clearStoredTokens,
    validateAccessToken: validateAccessToken,
    isLoginInProgress: isLoginInProgress,
    TOKEN_STORAGE_KEY: TOKEN_STORAGE_KEY,
  };
})(typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : this);
