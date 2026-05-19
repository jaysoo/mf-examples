import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { ModuleFederationPlugin } from '@module-federation/enhanced/rspack';

export default defineConfig({
  server: {
    port: 3002,
  },
  dev: {
    assetPrefix: true,
    client: { port: 3002 },
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
      config.output.uniqueName = 'remote_2';
      appendPlugins([
        new ModuleFederationPlugin({
          name: 'remote_2',
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
