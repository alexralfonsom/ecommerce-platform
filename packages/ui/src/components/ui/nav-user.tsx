'use client';

import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@components/ui/sidebar';
import Icon from '@components/ui/Icon';
import { UserMenuEntry, UserMenuGroup, UserMenuItem } from '@repo/shared/types/userMenuItems';
import { ExtendedUser } from '@repo/shared/types/auth';
import { useRouter } from 'next/navigation';

interface NavUserProps {
  user: ExtendedUser;
  menuItems: UserMenuEntry[];
  className?: string;
}

export function NavUser({ user, menuItems, className }: NavUserProps) {
  const { isMobile } = useSidebar();
  const router = useRouter();
  console.log(user);
  const handleItemClick = (item: UserMenuItem, e: React.MouseEvent) => {
    if (item.href) {
      e.preventDefault();
      router.push(item.href);
    } else if (item.onClick) {
      e.preventDefault();
      item.onClick();
    } else {
      return false;
    }
  };

  const renderUserMenuOption = () => {
    return (
      <SidebarMenuButton
        size="lg"
        className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
      >
        <Avatar className="h-8 w-8 rounded-lg">
          <AvatarImage src={user.image} alt={user.name ?? 'Avatar User'} />
          <AvatarFallback className="rounded-lg">CN</AvatarFallback>
        </Avatar>
        <div className="grid flex-1 text-left text-sm leading-tight">
          <span className="truncate font-semibold">{user.name}</span>
          <span className="truncate text-xs">{user.email}</span>
        </div>
        <Icon name="ChevronsUpDown" className="ml-auto size-4" />
      </SidebarMenuButton>
    );
  };

  const renderUserLabel = () => {
    return (
      <DropdownMenuLabel className="p-0 font-normal">
        <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
          <Avatar className="h-8 w-8 rounded-lg">
            <AvatarImage src={user.picture} alt={user.name ?? 'Avatar User'} />
            <AvatarFallback className="rounded-lg">CN</AvatarFallback>
          </Avatar>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">{user.name}</span>
            <span className="truncate text-xs">{user.email}</span>
          </div>
        </div>
      </DropdownMenuLabel>
    );
  };

  const renderUserItem = (item: UserMenuItem, key: string) => {
    return (
      <DropdownMenuItem key={key} onClick={(e) => handleItemClick(item, e)}>
        <Icon name={item.icon} className="mr-2 h-4 w-4" />
        {item.name}
      </DropdownMenuItem>
    );
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>{renderUserMenuOption()}</DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? 'bottom' : 'right'}
            align="end"
            sideOffset={4}
          >
            {renderUserLabel()}
            <DropdownMenuSeparator />
            {menuItems.map((item, index, array) => {
              const isGroup = 'items' in item;
              const isLastItem = index === array.length - 1;

              return (
                <React.Fragment key={`menu-item-${index}`}>
                  {isGroup
                    ? (item as UserMenuGroup).items.map((subItem, subIndex) =>
                        renderUserItem(subItem, `sub-${subItem.name}-${subIndex}`),
                      )
                    : renderUserItem(item as UserMenuItem, `item-${index}`)}
                  {!isLastItem && <DropdownMenuSeparator />}
                </React.Fragment>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
