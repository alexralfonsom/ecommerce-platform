'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';
import SocialLogin from '@components/auth/SocialLogin';

export default function CerateAccount() {
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  // ✅ Traducciones client-side
  const tAuth = useTranslations('auth');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
  };

  return (
    <form className="p-4 md:p-6" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-6">
        <div className="grid gap-2">
          <label htmlFor="LoginEmail">{tAuth('login.username')}</label>
          <Input
            id="LoginEmail"
            type="text"
            required
            value={username}
            className="px-3 py-2"
            placeholder={tAuth('login.usernamePlaceHolder')}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg
                className="mr-3 -ml-1 h-5 w-5 animate-spin text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              {tAuth('messages.loadingSignUp')}
            </span>
          ) : (
            tAuth('login.signUpButton')
          )}
        </Button>
        <SocialLogin />
      </div>
    </form>
  );
}
