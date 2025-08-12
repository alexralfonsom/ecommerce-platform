// packages/shared/src/lib/hooks/auth/useAuth0LogoutCookie.ts
'use client';

export interface Auth0LogoutData {
  id_token: string;
  client_id: string;
}

const COOKIE_NAME = 'auth0-logout-data';

export async function getAuth0LogoutCookie(): Promise<Auth0LogoutData | null> {
  if (typeof window === 'undefined') {
    // Server-side: no podemos acceder a document.cookie
    return null;
  }
  
  // Client-side - usar document.cookie
  const cookies = document.cookie.split(';');
  const cookie = cookies.find(c => c.trim().startsWith(`${COOKIE_NAME}=`));
  
  if (!cookie) return null;
  
  try {
    const encryptedData = cookie.split('=')[1];
    const decryptedData = atob(encryptedData);
    return JSON.parse(decryptedData);
  } catch (error) {
    console.error('Error parsing Auth0 logout cookie:', error);
    return null;
  }
}

export async function removeAuth0LogoutCookie(): Promise<void> {
  if (typeof window !== 'undefined') {
    // Client-side
    document.cookie = `${COOKIE_NAME}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
  }
}