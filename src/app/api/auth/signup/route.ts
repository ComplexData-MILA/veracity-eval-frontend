import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const returnTo = url.searchParams.get('returnTo') || '/chat';

  const session = await getSession(req, NextResponse.next());

  const origin = process.env.AUTH0_BASE_URL ||
  "https://veracity-eval-frontend-git-g0frontend-complex-data-lab.vercel.app";
  const auth0Domain = process.env.AUTH0_ISSUER_BASE_URL!;
  const clientId = process.env.AUTH0_CLIENT_ID!;

  if (session?.user) {
    // Already logged in → just redirect them where they want to go
    console.log("already logged in")
    return NextResponse.redirect(new URL(origin));
  }

  const signupUrl = `${auth0Domain}authorize?` +
    new URLSearchParams({
      client_id: clientId,
      redirect_uri: `${origin}api/auth/login`,
      response_type: 'code',
      scope: 'openid profile email',
      screen_hint: 'signup',
      state: returnTo,
    }).toString();

  return NextResponse.redirect(signupUrl);
}
