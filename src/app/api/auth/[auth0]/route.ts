import { handleAuth, handleLogin } from '@auth0/nextjs-auth0';
import type { NextApiRequest, NextApiResponse } from 'next';

export default handleAuth({
  login: async (req: NextApiRequest, res: NextApiResponse) => {
    const screenHint = req.query.screen_hint === 'signup' ? 'signup' : undefined;

    await handleLogin(req, res, {
      authorizationParams: {
        screen_hint: screenHint,
      },
    });
  },
});