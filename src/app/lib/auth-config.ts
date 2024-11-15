export const authConfig = {
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
  baseURL: process.env.AUTH0_BASE_URL,
  clientID: process.env.AUTH0_CLIENT_ID,
  clientSecret: process.env.AUTH0_CLIENT_SECRET,
  secret: process.env.AUTH0_SECRET,
  authorizationParams: {
    audience: process.env.AUTH0_AUDIENCE,
    scope: process.env.AUTH0_SCOPE,
  },
  session: {
    absoluteDuration: 24 * 60 * 60,
    rolling: true,
    rollingDuration: 1 * 60 * 60,
  },
  routes: {
    callback: '/api/auth/callback',
    postLogoutRedirect: process.env.AUTH0_BASE_URL
  },
};