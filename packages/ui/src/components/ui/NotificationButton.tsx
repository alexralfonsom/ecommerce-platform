// src/components/ui/NotificationButton.tsx
'use client';

import { useState } from 'react';
import Icon from '@components/ui/Icon';
import { INotification } from '@repo/shared/types/INotification';
import { cn } from '@repo/shared';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@components/ui/dropdown-menu';
import { Button } from '@components/ui/button';

interface NotificationButtonProps {
  notifications?: INotification[];
  showBadge?: boolean;
  badgeCount?: number;
  maxDisplayCount?: number;
  onNotificationClick?: (notification: INotification) => void;
  onMarkAsRead?: (notificationId: string) => void;
  onMarkAllAsRead?: () => void;
  onViewAll?: () => void;
  emptyMessage?: string;
  className?: string;
}

export default function NotificationButton({
  notifications = [],
  showBadge = true,
  badgeCount,
  maxDisplayCount = 5,
  onNotificationClick,
  onMarkAsRead,
  onMarkAllAsRead,
  onViewAll,
  emptyMessage = 'No hay notificaciones',
  className,
}: NotificationButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const unreadCount = badgeCount ?? notifications.filter((n) => !n.read).length;
  const displayNotifications = notifications.slice(0, maxDisplayCount);
  const hasMore = notifications.length > maxDisplayCount;

  const handleNotificationClick = (notification: INotification) => {
    if (!notification.read && onMarkAsRead) {
      onMarkAsRead(notification.id);
    }

    if (notification.onClick) {
      notification.onClick();
    } else if (onNotificationClick) {
      onNotificationClick(notification);
    }

    setIsOpen(false);
  };

  const getNotificationIcon = (type: INotification['type']) => {
    const icons = {
      info: 'Info',
      success: 'CheckCircle',
      warning: 'AlertTriangle',
      error: 'AlertCircle',
    } as const;

    return icons[type];
  };

  const getNotificationColors = (type: INotification['type']) => {
    const colors = {
      info: 'text-blue-600 dark:text-blue-400',
      success: 'text-green-600 dark:text-green-400',
      warning: 'text-yellow-600 dark:text-yellow-400',
      error: 'text-red-600 dark:text-red-400',
    };

    return colors[type];
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Ahora';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    return `${days}d`;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className={cn('relative', className)}>
        <Button variant="outline">
          <span className="sr-only">Ver notificaciones</span>
          <Icon name="Bell" className="size-4" size={32} />
          {/* Badge */}
          {showBadge && unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs font-medium text-white">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="max-h-dvh">
        <DropdownMenuLabel>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Notificaciones</h3>
            {unreadCount > 0 && onMarkAllAsRead && (
              <Button onClick={onMarkAllAsRead} variant="link" className="text-xs">
                Marcar todas como leídas
              </Button>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup className="right-0 z-10 w-96 origin-top-right rounded-md">
          {displayNotifications.length === 0 ? (
            <DropdownMenuItem>
              <div className="w-full px-4 py-6 text-center text-sm">
                <Icon name="Bell" className="mx-auto mb-2" size={32} />
                <p>{emptyMessage}</p>
              </div>
            </DropdownMenuItem>
          ) : (
            displayNotifications.map((notification) => (
              <DropdownMenuItem key={notification.id}>
                <button
                  onClick={() => handleNotificationClick(notification)}
                  className={cn(
                    'w-full px-4 py-3 text-left transition-colors hover:bg-gray-50 dark:hover:bg-slate-700',
                    !notification.read && 'bg-blue-50 dark:bg-blue-900/20',
                  )}
                >
                  <div className="flex items-start space-x-3">
                    <div className="mt-0.5 flex-shrink-0">
                      <Icon
                        name={getNotificationIcon(notification.type)}
                        className={cn('h-5 w-5', getNotificationColors(notification.type))}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="truncate text-sm font-bold">{notification.title}</p>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs">{formatTimestamp(notification.timestamp)}</span>
                          {!notification.read && (
                            <span className="h-2 w-2 rounded-full bg-blue-600"></span>
                          )}
                        </div>
                      </div>
                      <p className="line-clamp-2 text-sm">{notification.message}</p>
                    </div>
                  </div>
                </button>
              </DropdownMenuItem>
            ))
          )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          {/* Footer */}
          {(hasMore || onViewAll) && (
            <Button onClick={onViewAll} variant="link" type="button" className="w-full text-center">
              {hasMore ? `Ver todas (${notifications.length})` : 'Ver todas las notificaciones'}
            </Button>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
