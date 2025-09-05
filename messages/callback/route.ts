import { NextApiRequest, NextApiResponse } from 'next';
import { handleCallback } from '@auth0/nextjs-auth0';

export default async function callback(req: NextApiRequest, res: NextApiResponse) {
  try {
    await handleCallback(req, res, {
      redirectUri: '/chat', // where you want the user to go after login/signup
    });
  } catch (error) {
    console.error(error);
    res.status(500).end("you lost");
  }
}