'use client';
import { forwardRef } from 'react';
import type { ComponentProps, ForwardedRef, MouseEvent } from 'react';
import type { UrlObject } from 'url';
import NextLink from 'next/link';

type Props = Omit<ComponentProps<typeof NextLink>, 'href' | 'onClick'> & {
  href?: string | UrlObject;
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
};

const Link = (props: Props, ref: ForwardedRef<HTMLAnchorElement>) => {
  const { href, onClick, ...rest } = props;

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (onClick) {
      onClick(event);
    } else if (!href) {
      event.preventDefault();
    }
  };

  return <NextLink ref={ref} href={href || '/'} onClick={handleClick} {...rest} />;
};

export default forwardRef(Link);
