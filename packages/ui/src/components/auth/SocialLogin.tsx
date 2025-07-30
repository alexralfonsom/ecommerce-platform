'use client';

import { Button } from '@components/ui/button';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { socialMediaIcons } from '@/configs/DesignSystem';

export default function SocialLogin() {
  const tAuth = useTranslations('auth');

  return (
    <>
      <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
        <span className="relative z-10 bg-background px-2 text-muted-foreground">
          {tAuth('login.orContinueWith')}
        </span>
      </div>
      <div className="flex flex-col gap-4">
        <Button variant="outline" className="w-full">
          <Image src={socialMediaIcons.apple} alt="Apple" height={24} width={24} />
          {tAuth('login.loginWirthApple')}
        </Button>
        <Button variant="outline" className="w-full">
          <Image src={socialMediaIcons.google} alt="Google" height={24} width={24} />
          {tAuth('login.loginWithGoogle')}
        </Button>
        <Button variant="outline" className="w-full">
          <Image src={socialMediaIcons.microsoft} alt="Microsoft" height={24} width={24} />
          {tAuth('login.loginWithMicrosoft')}
        </Button>
      </div>
    </>
  );
}
