import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { federation } from '@module-federation/vite';

export default defineConfig({
  server: {
    port: 5100,
    strictPort: true,
    fs: { allow: ['.', '..', '../..'] },
  },
  preview: {
    port: 5100,
    strictPort: true,
  },
  build: { target: 'chrome89' },
  plugins: [
    federation({
      name: 'host',
      filename: 'remoteEntry.js',
      // No build-time `remotes:` - they are registered at runtime in
      // src/bootstrap.tsx after fetching public/mf-remotes.json.
      shared: {
        react: { singleton: true },
        'react-dom': { singleton: true },
        'react-router-dom': { singleton: true },
      },
    }),
    react(),
  ],
});
