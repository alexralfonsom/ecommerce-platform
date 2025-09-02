// src/components/layout/DashboardLayout.tsx
'use client';

import { BasicNavigationItem, NavigationItem } from '@repo/shared/types/navigation';
import { mockNotifications as MckNotifications } from '@repo/shared/data/mocks/MockNavigationItems';
import * as React from 'react';
import DashboardFooter from './DashboardFooter';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@components/ui/sidebar';
import BreadcrumbControl from '@components/layout/BreadcrumbControl';
import HeaderActionsGroup from '@components/layout/HeaderActionsGroup';
import { NavMain } from '@components/layout/nav-main';
import { NavProjects } from '@components/layout/nav-projects';
import { NavUser } from '@components/ui/nav-user';
import Icon from '@components/ui/Icon';
import { NavSecondary } from '@components/layout/nav-secondary';
import { ExtendedUser } from '@repo/shared/types/auth';
import { UserMenuEntry } from '@repo/shared/types/userMenuItems';
import LanguageSwitcher from '@components/layout/languageSwitcher/LanguageSwitcher';
import NotificationButton from '@components/ui/NotificationButton';
import { INotification } from '@repo/shared/types/INotification';
import { ModeToggleLightDark } from '@components/layout/ModeToggleLightDark';
import { generalIconsSVG } from '@/configs/DesignSystem';

interface DashboardLayoutProps {
  children: React.ReactNode;
  navigation: NavigationItem[];
  projects?: BasicNavigationItem[];
  userNavigation: UserMenuEntry[];
  navSecondary?: BasicNavigationItem[];
  user?: ExtendedUser;
}

export default function DashboardLayout({
  children,
  navigation,
  projects,
  navSecondary,
  userNavigation,
  user = {
    id: 'default-user',
    name: 'Usuario',
    email: 'example@email.com',
    picture: generalIconsSVG.emptyUser,
  },
}: DashboardLayoutProps) {
  const mockNotifications: INotification[] = MckNotifications;

  const handleNotificationClick = (notification: INotification) => {
    console.log('Notification clicked:', notification);
  };

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild>
                <a href="#">
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg text-sidebar-primary-foreground">
                    <Icon name="Command" size="md" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">Acme Inc</span>
                    <span className="truncate text-xs">Enterprise</span>
                  </div>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <NavMain items={navigation} />
          <NavProjects items={projects} />
          <NavSecondary items={navSecondary} className="mt-auto" />
        </SidebarContent>
        <SidebarFooter>
          <NavUser user={user} menuItems={userNavigation} />
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="flex min-h-screen flex-col">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-2">
          <HeaderActionsGroup showSeparators={true} className="flex-1 px-2">
            <SidebarTrigger className="mr-2" />
            <BreadcrumbControl showIcons={true} separator="chevron" maxItems={5} />
          </HeaderActionsGroup>
          <HeaderActionsGroup showSeparators={true} className="ml-auto px-3">
            <ModeToggleLightDark />
            <NotificationButton
              notifications={mockNotifications}
              onNotificationClick={handleNotificationClick}
              onMarkAsRead={(id) => console.log('Mark as read:', id)}
              onMarkAllAsRead={() => console.log('Mark all as read')}
              onViewAll={() => console.log('View all notifications')}
              showBadge={true}
              maxDisplayCount={5}
            />
            <LanguageSwitcher />
          </HeaderActionsGroup>
        </header>

        <div className="mt-4 flex flex-1 flex-col gap-6 p-6 pt-0">
          <div className="grid auto-rows-min gap-4">{children}</div>
        </div>
        {/* Footer */}
        <DashboardFooter backgroundStyle={'default'} />
      </SidebarInset>
    </SidebarProvider>
  );
}
