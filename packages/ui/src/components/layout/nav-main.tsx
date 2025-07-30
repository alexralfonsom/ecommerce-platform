'use client';

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@components/ui/collapsible';
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@components/ui/sidebar';

import { NavigationItem } from '@repo/shared/types/navigation';
import { usePathname } from 'next/navigation';
import { getCurrentLocaleFromPath } from '@repo/shared/lib/utils/i18nUtils';
import Icon from '@components/ui/Icon';
import Link from '@components/ui/Link';

interface NavigationMenuProps {
  items: NavigationItem[];
}

export function NavMain({ items }: NavigationMenuProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    const currentLocale = getCurrentLocaleFromPath(pathname);
    if (currentLocale) {
      const expectedPath = `/${currentLocale}${href}`;
      return pathname === expectedPath;
    }
    return false;
  };

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Admin</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <Collapsible key={item.name} asChild defaultOpen={item.current}>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip={item.name}>
                <Link href={item.href}>
                  <Icon name={item.icon} size="md" />
                  <span>{item.name}</span>
                </Link>
              </SidebarMenuButton>
              {item.children?.length ? (
                <>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuAction className="data-[state=open]:rotate-90">
                      <Icon name="ChevronRight" />
                      <span className="sr-only">Toggle</span>
                    </SidebarMenuAction>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.children?.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.name}>
                          <SidebarMenuSubButton asChild>
                            <Link href={subItem.href}>
                              <Icon name={subItem.icon} size="sm" />
                              <span>{subItem.name}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </>
              ) : null}
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
