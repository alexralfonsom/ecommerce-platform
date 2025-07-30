import Image from 'next/image';
import React from 'react';

export default function Logo() {
  return (
    <div className="flex items-center justify-center">
      <Image
        src="/images/startIA.png"
        width={72}
        height={64}
        placeholder="blur"
        blurDataURL="/images/startIA.png"
        className="mx-auto mb-4"
        alt="Logo"
      />
    </div>
  );
}
