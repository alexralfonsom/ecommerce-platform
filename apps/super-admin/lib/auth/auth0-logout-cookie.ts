// lib/auth/auth0-logout-cookie.ts
import { cookies } from 'next/headers';
import { Auth0LogoutData } from '@repo/shared/lib/hooks';

const COOKIE_NAME = 'auth0-logout-data';
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60, // 7 días (igual que la sesión)
  path: '/',
};

export async function setAuth0LogoutCookie(data: Auth0LogoutData) {
  if (typeof window === 'undefined') {
    // Server-side
    const cookieStore = await cookies();
    const encryptedData = Buffer.from(JSON.stringify(data)).toString('base64');

    cookieStore.set(COOKIE_NAME, encryptedData, COOKIE_OPTIONS);
  }
}

export async function getAuth0LogoutCookie(): Promise<Auth0LogoutData | null> {
  if (typeof window !== 'undefined') {
    // Client-side - usar document.cookie
    const cookieList = document.cookie.split(';');
    const cookie = cookieList.find((c) => c.trim().startsWith(`${COOKIE_NAME}=`));

    if (!cookie) return null;

    try {
      const encryptedData = cookie.split('=')[1];
      const decryptedData = Buffer.from(encryptedData, 'base64').toString('utf-8');
      return JSON.parse(decryptedData);
    } catch (error) {
      console.error('Error parsing Auth0 logout cookie:', error);
      return null;
    }
  } else {
    // Server-side
    const cookieStore = await cookies();
    const encryptedData = cookieStore.get(COOKIE_NAME)?.value;

    if (!encryptedData) return null;

    try {
      const decryptedData = Buffer.from(encryptedData, 'base64').toString('utf-8');
      return JSON.parse(decryptedData);
    } catch (error) {
      console.error('Error parsing Auth0 logout cookie:', error);
      return null;
    }
  }
}

export async function removeAuth0LogoutCookie() {
  if (typeof window === 'undefined') {
    // Server-side
    const cookieStore = await cookies();
    cookieStore.delete(COOKIE_NAME);
  } else {
    // Client-side
    document.cookie = `${COOKIE_NAME}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
  }
}
