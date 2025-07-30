export interface BreadcrumbProps {
  items?: IBreadcrumbItem[];
  showIcons?: boolean;
  separator?: 'chevron' | 'slash' | 'arrow';
  maxItems?: number;
  showCurrent?: boolean;
}

export interface IBreadcrumbItem {
  name: string;
  href: string;
  current: boolean;
  icon?: string;
  disabled?: boolean;
}