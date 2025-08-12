// app/api/auth/get-auth0-cookie/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAuth0LogoutCookie } from '@lib/auth/auth0-logout-cookie';

export async function GET(request: NextRequest) {
  try {
    // Obtener la cookie de Auth0 logout desde el servidor
    const auth0LogoutData = await getAuth0LogoutCookie();
    
    if (!auth0LogoutData) {
      return NextResponse.json({ error: 'No Auth0 logout data found' }, { status: 404 });
    }
    
    return NextResponse.json(auth0LogoutData);
  } catch (error) {
    console.error('Error getting Auth0 logout cookie:', error);
    return NextResponse.json({ error: 'Failed to get Auth0 logout data' }, { status: 500 });
  }
}