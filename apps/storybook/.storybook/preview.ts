import type { Preview } from '@storybook/nextjs-vite';
// Import Tailwind configs and UI styles directly
import '@repo/tailwind-configs/dist';
import '../../packages/ui/dist/index.css';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
      expanded: true,
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo',
    },
  },

};

export default preview;
