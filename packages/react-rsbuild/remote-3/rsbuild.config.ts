import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { ModuleFederationPlugin } from '@module-federation/enhanced/rspack';

export default defineConfig({
  server: {
    port: 3003,
  },
  dev: {
    assetPrefix: true,
    client: { port: 3003 },
  },
  html: {
    template: './index.html',
  },
  source: {
    entry: {
      index: './src/index.ts',
    },
  },
  plugins: [
    pluginReact({
      splitChunks: { react: false, router: false },
    }),
  ],
  tools: {
    rspack: (config, { appendPlugins }) => {
      config.output ??= {};
      config.output.uniqueName = 'remote_3';
      appendPlugins([
        new ModuleFederationPlugin({
          name: 'remote_3',
          filename: 'remoteEntry.js',
          exposes: {
            './RoutedApp': './src/RoutedApp.tsx',
          },
          shared: ['react', 'react-dom', 'react-router-dom'],
          dts: true,
        }),
      ]);
    },
  },
});
