import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const returnTo = url.searchParams.get('returnTo') || '/chat';

  const auth0Domain = process.env.AUTH0_DOMAIN!;
  const clientId = process.env.AUTH0_CLIENT_ID!;

  const signupUrl = `https://${auth0Domain}/authorize?` +
    new URLSearchParams({
      client_id: clientId,
      redirect_uri: `${url.origin}${returnTo}`,
      response_type: 'code',
      scope: 'openid profile email',
      screen_hint: 'signup',
    }).toString();

  return NextResponse.redirect(signupUrl);
}
