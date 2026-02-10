import crypto from "crypto";

export function generateCodeVerifier(length = 43) {
  const bytes = crypto.randomBytes(length);
  return bytes
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "")
    .slice(0, length);
}

export async function generateCodeChallengeS256(verifier: string) {
  const hash = crypto.createHash("sha256").update(verifier).digest("base64");
  return hash.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function buildAuthorizeUrl(params: {
  domain: string;
  clientId: string;
  redirectUri: string;
  codeChallenge: string;
  audience?: string;
  scope?: string;
}) {
  const { domain, clientId, redirectUri, codeChallenge, audience, scope } = params;
  const url = new URL(`https://${domain}/authorize`);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("code_challenge", codeChallenge);
  url.searchParams.set("code_challenge_method", "S256");
  url.searchParams.set("scope", scope || "openid profile email");
  if (audience) url.searchParams.set("audience", audience);
  url.searchParams.set("state", crypto.randomBytes(16).toString("hex"));
  return url.toString();
}

export async function exchangeCodeForTokens(params: {
  domain: string;
  clientId: string;
  code: string;
  redirectUri: string;
  codeVerifier: string;
  audience?: string;
}) {
  const { domain, clientId, code, redirectUri, codeVerifier, audience } = params;
  const url = `https://${domain}/oauth/token`;
  const body: Record<string, string> = {
    grant_type: "authorization_code",
    client_id: clientId,
    code,
    redirect_uri: redirectUri,
    code_verifier: codeVerifier,
  };
  if (audience) body.audience = audience;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`Token exchange failed: ${res.status} ${await res.text()}`);
  }
  return res.json();
}

