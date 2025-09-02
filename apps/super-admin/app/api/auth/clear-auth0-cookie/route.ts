// app/api/auth/clear-auth0-cookie/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { removeAuth0LogoutCookie } from '@lib/auth/auth0-logout-cookie';

export async function POST(request: NextRequest) {
  try {
    // Limpiar la cookie de Auth0 logout
    await removeAuth0LogoutCookie();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error clearing Auth0 logout cookie:', error);
    return NextResponse.json({ error: 'Failed to clear cookie' }, { status: 500 });
  }
}
