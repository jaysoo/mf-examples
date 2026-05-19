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
      remotes: {
        'remote-1': {
          type: 'module',
          name: 'remote-1',
          entry: 'http://localhost:5101/remoteEntry.js',
          entryGlobalName: 'remote_1',
          shareScope: 'default',
        },
        'remote-2': {
          type: 'module',
          name: 'remote-2',
          entry: 'http://localhost:5102/remoteEntry.js',
          entryGlobalName: 'remote_2',
          shareScope: 'default',
        },
        'remote-3': {
          type: 'module',
          name: 'remote-3',
          entry: 'http://localhost:5103/remoteEntry.js',
          entryGlobalName: 'remote_3',
          shareScope: 'default',
        },
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
