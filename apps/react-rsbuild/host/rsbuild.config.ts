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
          // No build-time `remotes:` — they are registered at runtime in
          // src/bootstrap.tsx after fetching public/mf-remotes.json.
          // Shared deps must still be declared here so federation runtime
          // knows what to negotiate with remotes at load time.
          shared: ['react', 'react-dom', 'react-router-dom'],
        }),
      ]);
    },
  },
});
