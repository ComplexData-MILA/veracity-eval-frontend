import { initAuth0 } from '@auth0/nextjs-auth0';
import { authConfig } from './auth-config';

export const auth0 = initAuth0(authConfig);

export default auth0;

