'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Icon from "@components/ui/Icon";

interface backButtonProps {
  fallbackUrl: string;
}

export default function BackButton({ fallbackUrl }: backButtonProps) {
  const t = useTranslations('error.404');
  const router = useRouter();

  const handleClick = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackUrl);
    }
  };

  return (
    <button
      onClick={handleClick}
      className="inline-flex items-center gap-3 px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg transition-all duration-200 backdrop-blur-sm border border-white/20"
    >
      <Icon name="ArrowLeft" size="lg" className="text-white" />
      {t('goBack')}
    </button>
  );
}
