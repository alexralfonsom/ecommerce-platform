// src/app/api/auth/invalidate-session/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { ExtendedUser } from '@repo/shared/types/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'No active session' }, { status: 401 });
    }

    const body = await request.json();
    const { userId, provider } = body;
    console.log(session);

    if ((session.user as ExtendedUser).id !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Log del logout para auditoría
    console.log(`User ${userId} logged out via ${provider} at ${new Date().toISOString()}`);

    // Invalidar sesión en backend API si es necesario
    if (provider === 'credentials') {
      await invalidateUserSession(userId, provider);
    }

    return NextResponse.json({
      success: true,
      message: 'Session invalidated successfully',
    });
  } catch (error) {
    console.error('Error invalidating session:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Función para invalidar sesión en tu base de datos
async function invalidateUserSession(userId: string, provider: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APIM_BUSINESS_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.API_SERVICE_TOKEN}`,
      },
      body: JSON.stringify({
        userId,
        provider,
        logoutTime: new Date().toISOString(),
        reason: 'user_initiated',
      }),
    });

    if (!response.ok) {
      console.warn('Failed to invalidate session in backend API');
    }
  } catch (error) {
    console.error('Error invalidating backend session:', error);
  }
}
