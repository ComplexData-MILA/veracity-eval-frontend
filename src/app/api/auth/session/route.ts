import { getSession } from '@auth0/nextjs-auth0';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const request = new NextRequest(req.url, {
      headers: new Headers(req.headers),
      method: req.method,
    });

    const response = new NextResponse();

    const session = await getSession(request, response);
    if (!session) {
      return Response.json({ 
        authenticated: false 
      }, { 
        status: 401,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        }
      });
    }

    return Response.json({
      authenticated: true,
      user: {
        sub: session.user.sub,
        email: session.user.email,
        name: session.user.name,
        picture: session.user.picture
      },
      accessToken: session.accessToken
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      }
    });
  } catch (error) {
    console.error('Session error:', error);
    return Response.json({ 
      error: 'Failed to get session' 
    }, { 
      status: 500,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      }
    });
  }
}
