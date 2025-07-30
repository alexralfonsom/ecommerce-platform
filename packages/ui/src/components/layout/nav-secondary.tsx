import * as React from 'react';

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@components/ui/sidebar';
import { BasicNavigationItem } from '@repo/shared/types/navigation';
import Link from '@components/ui/Link';
import Icon from '@components/ui/Icon';

interface NavSecondaryProps {
  items?: BasicNavigationItem[];
}

export function NavSecondary({
  items,
  ...props
}: NavSecondaryProps & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
  return (
    items &&
    items.length > 0 && (
      <SidebarGroup {...props}>
        <SidebarGroupContent>
          <SidebarMenu>
            {items.map((item) => (
              <SidebarMenuItem key={item.name}>
                <SidebarMenuButton asChild size="sm">
                  <Link href={item.href}>
                    <Icon name={item.icon} size="md" aria-hidden="true" />
                    <span>{item.name}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    )
  );
}
