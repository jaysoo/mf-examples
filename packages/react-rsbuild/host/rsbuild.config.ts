import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { ModuleFederationPlugin } from '@module-federation/enhanced/rspack';

export default defineConfig({
  server: {
    port: 3000,
  },
  html: {
    template: './index.html',
  },
  source: {
    entry: {
      index: './src/index.ts',
    },
  },
  plugins: [pluginReact()],
  tools: {
    rspack: (_config, { appendPlugins }) => {
      appendPlugins([
        new ModuleFederationPlugin({
          name: 'host',
          remotes: {
            'remote-1': 'remote_1@http://localhost:3001/mf-manifest.json',
            'remote-2': 'remote_2@http://localhost:3002/mf-manifest.json',
            'remote-3': 'remote_3@http://localhost:3003/mf-manifest.json',
          },
          shared: ['react', 'react-dom', 'react-router-dom'],
        }),
      ]);
    },
  },
});
