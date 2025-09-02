// src/components/layout/DashboardFooter.tsx
import Icon from '@components/ui/Icon';
import { cn } from '@repo/shared';

interface DashboardFooterProps {
  backgroundStyle?: 'default' | 'elevated' | 'card';
}

export default function DashboardFooter({ backgroundStyle = 'default' }: DashboardFooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="dark:border-gray-700 dark:bg-slate-900">
      <div className={cn('px-4 py-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16')}>
        <div className="flex flex-col items-center justify-between space-y-4 md:flex-row md:space-y-0">
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <span>© {currentYear} StartIA.</span>
            <span>Desarrollado con</span>
            <Icon name="Heart" className="h-4 w-4 text-red-500" />
            <span>y</span>
            <Icon name="Code" className="h-4 w-4 text-indigo-500" />
          </div>
          <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-500">
            <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 dark:bg-gray-800">
              v2.1.0
            </span>
            <span>
              Build: {process.env.NODE_ENV === 'production' ? 'Production' : 'Development'}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
