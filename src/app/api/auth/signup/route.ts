import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const returnTo = url.searchParams.get('returnTo') || '/chat';

//   const origin = process.env.NEXT_PUBLIC_API_URL
  const auth0Domain = process.env.AUTH0_BASE_URL!;
  const clientId = process.env.AUTH0_CLIENT_ID!;

  const signupUrl = `${auth0Domain}/authorize?` +
    new URLSearchParams({
      client_id: clientId,
      redirect_uri: `${auth0Domain}/api/auth/callback${returnTo}`,
      response_type: 'code',
      scope: 'openid profile email',
      screen_hint: 'signup',
    }).toString();

  return NextResponse.redirect(signupUrl);
}
