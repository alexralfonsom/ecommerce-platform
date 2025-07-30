// Global type declarations for NextAuth
// This file makes the shared auth types globally available

import { ExtendedUser, ExtendedSession, ExtendedJWT } from '@repo/shared/types/auth';

declare module 'next-auth' {
  interface User extends ExtendedUser {}
  interface Session extends ExtendedSession {}
}

declare module 'next-auth/jwt' {
  interface JWT extends ExtendedJWT {}
}