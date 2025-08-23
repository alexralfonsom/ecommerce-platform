// ===============================
// 🔐 AUTH COMPONENTS
// ===============================
export { AuthGuard } from './components/auth/AuthGuard';
export { default as CreateAccount } from './components/auth/CreateAccount';
export { default as LoginForm } from './components/auth/LoginForm';
export { default as LogoutEnded } from './components/auth/LogoutEnded';
export { default as LogoutSpinner } from './components/auth/LogoutSpinner';
export { default as SocialLogin } from './components/auth/SocialLogin';
export { default as UniversalLoginRedirect } from './components/auth/UniversalLoginRedirect';

// Auth Hooks
export { useAuth } from './components/auth/hooks/useAuth';
export { useAuthToken } from './components/auth/hooks/useAuthToken';
export { useSecureLogout } from './components/auth/hooks/useSecureLogout';

// Auth Schemas & Types
export {
  signInSchema,
  signUpSchema,
  forgotPasswordSchema,
  type SignInFormData,
  type SignUpFormData,
  type ForgotPasswordFormData,
} from './components/auth/schemas/authSchema';

// ===============================
// 🎨 LAYOUT COMPONENTS
// ===============================
export { default as BreadcrumbControl } from './components/layout/BreadcrumbControl';
export { default as HeaderActionsGroup } from './components/layout/HeaderActionsGroup';
export { default as Logo } from './components/layout/Logo';
export { ModeToggleLightDark } from './components/layout/ModeToggleLightDark';

// Dashboard
export { default as DashboardLayout } from './components/layout/dashboard/DashboardLayout';
export { default as DashboardFooter } from './components/layout/dashboard/DashboardFooter';

// Navigation
export { NavMain } from './components/layout/nav-main';
export { NavProjects } from './components/layout/nav-projects';
export { NavSecondary } from './components/layout/nav-secondary';
export { default as LanguageSwitcher } from './components/layout/languageSwitcher/LanguageSwitcher';
export { AdminSidebar } from './components/layout/sidebar/AdminSidebar';

// Layout Hooks
export { useBreadcrumbs } from './components/layout/hooks/useBreadcrumbs';

// ===============================
// 🚫 ERROR COMPONENTS
// ===============================
export { default as NotFoundComponent } from './components/not-found/NotFoundComponent';
export { default as BackButton } from './components/not-found/BackButton';

// ===============================
// 📄 PAGE COMPONENTS
// ===============================
export { PagesHeader, type PagesHeaderProps, type HeaderAction } from './components/pages/pagesHeader/PagesHeader';

// ===============================
// 🌐 PROVIDERS
// ===============================
// QueryProvider and query utilities are now in @repo/shared for better architecture
export { QueryProvider, createEntityQueryKeys, EntityStaleTime, getEntityQueryOptions } from '@repo/shared';
export { SessionWrapper } from './components/providers/SessionWrapper';
export { ThemeProvider } from './components/providers/theme-provider';

// ===============================
// 🎯 BASE UI COMPONENTS (Radix)
// ===============================
export * from './components/ui/accordion';
export * from './components/ui/alert';
export * from './components/ui/avatar';
export * from './components/ui/badge';
export * from './components/ui/breadcrumb';
export * from './components/ui/button';
export * from './components/ui/calendar';
export * from './components/ui/card';
export * from './components/ui/carousel';
// export * from './components/ui/chart'; // Commented out - file is commented
export * from './components/ui/checkbox';
export * from './components/ui/collapsible';
export * from './components/ui/command';
export * from './components/ui/context-menu';
export * from './components/ui/dialog';
export * from './components/ui/dropdown-menu';
export * from './components/ui/form';
export * from './components/ui/hover-card';
export * from './components/ui/input';
export * from './components/ui/label';
export * from './components/ui/menubar';
export * from './components/ui/navigation-menu';
export * from './components/ui/popover';
export * from './components/ui/progress';
export * from './components/ui/radio-group';
export * from './components/ui/resizable';
export * from './components/ui/scroll-area';
export * from './components/ui/select';
export * from './components/ui/separator';
export * from './components/ui/sheet';
export * from './components/ui/sidebar';
export * from './components/ui/skeleton';
export * from './components/ui/slider';
export * from './components/ui/switch';
export * from './components/ui/table';
export * from './components/ui/tabs';
export * from './components/ui/textarea';
export * from './components/ui/toggle';
export * from './components/ui/toggle-group';
export * from './components/ui/tooltip';

// ===============================
// 🎯 FORM COMPONENTS
// ===============================
// Note: Exporting from FormField module only to avoid conflicts with form.tsx
export { FormFieldWrapper, LabelField } from '@components/ui/FormField';

// ===============================
// 📊 DATA COMPONENTS
// ===============================
// Data Table (complete module)
export * from './components/ui/data-table';

// StatCard (complete module)
export * from './components/ui/StatCard';

// Toast (complete module) 
export * from './components/ui/Toast';

// ===============================
// 🔧 UTILITY COMPONENTS
// ===============================
export { default as DeleteConfirmDialog } from './components/ui/DeleteConfirmDialog';
export { ExportDropdown } from './components/ui/ExportDropdown';
export { default as Icon } from './components/ui/Icon';
export { default as Link } from './components/ui/Link';
export { MultilineText } from './components/ui/MultilineText';
export { default as NotificationButton } from './components/ui/NotificationButton';
export * from './components/ui/nav-user';


