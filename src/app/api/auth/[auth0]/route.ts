import { handleAuth, handleLogin } from '@auth0/nextjs-auth0';

export const GET = handleAuth({
  // keep default login
  login: handleLogin(), 

  // add a signup handler
  signup: handleLogin({
    authorizationParams: {
      screen_hint: 'signup',  // tell Auth0 to show signup form
    },
  }),
});