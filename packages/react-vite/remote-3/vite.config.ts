import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { federation } from '@module-federation/vite';

const PORT = 5103;
const NAME = 'remote-3';

export default defineConfig({
  server: {
    port: PORT,
    strictPort: true,
    origin: `http://localhost:${PORT}`,
    fs: { allow: ['.', '..', '../..'] },
    host: '127.0.0.1',
    allowedHosts: true,
  },
  preview: {
    port: PORT,
    strictPort: true,
  },
  build: { target: 'chrome89' },
  plugins: [
    federation({
      name: NAME,
      filename: 'remoteEntry.js',
      exposes: {
        './RoutedApp': './src/RoutedApp.tsx',
      },
      shared: {
        react: { singleton: true },
        'react-dom': { singleton: true },
        'react-router-dom': { singleton: true },
      },
    }),
    react(),
  ],
});
