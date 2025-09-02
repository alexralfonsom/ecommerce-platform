import type { StorybookConfig } from '@storybook/nextjs-vite';
import path from 'path';

const config: StorybookConfig = {
  stories: [
    '../src/**/*.mdx',
    '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)',
    // Específicamente el Toast story que acabamos de arreglar
    //"../../../packages/ui/src/components/ui/Toast/*.stories.@(js|jsx|mjs|ts|tsx)",
  ],
  addons: [
    '@chromatic-com/storybook',
    '@storybook/addon-docs',
    '@storybook/addon-onboarding',
    '@storybook/addon-a11y',
    '@storybook/addon-vitest',
  ],
  framework: {
    name: '@storybook/nextjs-vite',
    options: {},
  },
  typescript: {
    check: false,
    reactDocgen: 'react-docgen-typescript',
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      propFilter: (prop) => (prop.parent ? !/node_modules/.test(prop.parent.fileName) : true),
    },
  },
  viteFinal: async (config) => {
    // Configurar path aliases para Vite
    if (config.resolve) {
      config.resolve.alias = {
        ...config.resolve.alias,
        '@': path.resolve(__dirname, '../src'),
        // Alias @ para resolver imports desde @repo/ui package
        '@libs': path.resolve(__dirname, '../src/lib'),
        '@data': path.resolve(__dirname, '../src/data'),
        '@configs': path.resolve(__dirname, '../src/configs'),
        // Aliases para el monorepo
        '@repo/ui': path.resolve(__dirname, '../../../packages/ui/src'),
        '@repo/shared': path.resolve(__dirname, '../../../packages/shared/src'),
        // Alias específico para resolver imports de @repo/ui
        '@components/ui': path.resolve(__dirname, '../../../packages/ui/src/components/ui'),
        '@components/layout': path.resolve(__dirname, '../../../packages/ui/src/components/layout'),
        '@components/auth': path.resolve(__dirname, '../../../packages/ui/src/components/auth'),
        '@components/not-found': path.resolve(
          __dirname,
          '../../../packages/ui/src/components/not-found',
        ),
        '@/configs/DesignSystem': path.resolve(
          __dirname,
          '../../../packages/ui/src/configs/DesignSystem',
        ),
        '@configs/i18n': path.resolve(__dirname, '../../../packages/shared/src/configs/i18n'),
      };
    }

    // Optimizaciones de Vite
    config.optimizeDeps = {
      ...config.optimizeDeps,
      include: [
        ...(config.optimizeDeps?.include || []),
        'lucide-react',
        'clsx',
        'tailwind-merge',
        '@repo/ui',
        '@repo/shared',
      ],
    };

    return config;
  },
  staticDirs: ['../public'],
};
export default config;
