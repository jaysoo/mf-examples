import { defineConfig } from '@rspack/cli';
import { rspack } from '@rspack/core';
import { ModuleFederationPlugin } from '@module-federation/enhanced/rspack';
import * as path from 'node:path';

const isDev = process.env.NODE_ENV !== 'production';

export default defineConfig({
  context: __dirname,
  entry: { main: './src/index.ts' },
  output: {
    path: path.resolve(__dirname, 'dist'),
    publicPath: 'auto',
    uniqueName: 'host',
    clean: true,
  },
  devServer: {
    port: 3000,
    historyApiFallback: true,
    hot: true,
  },
  resolve: {
    extensions: ['...', '.ts', '.tsx', '.jsx'],
  },
  module: {
    rules: [
      {
        test: /\.(j|t)sx?$/,
        exclude: [/node_modules/],
        use: {
          loader: 'builtin:swc-loader',
          options: {
            jsc: {
              parser: { syntax: 'typescript', tsx: true },
              transform: {
                react: {
                  runtime: 'automatic',
                  development: isDev,
                },
              },
            },
            env: { targets: 'Chrome >= 87, Firefox >= 78, Edge >= 88, Safari >= 14' },
          },
        },
      },
      {
        test: /\.css$/,
        type: 'css',
      },
    ],
  },
  plugins: [
    new rspack.HtmlRspackPlugin({ template: './index.html' }),
    new ModuleFederationPlugin({
      name: 'host',
      remotes: {
        'remote-1': 'remote_1@http://localhost:3001/mf-manifest.json',
        'remote-2': 'remote_2@http://localhost:3002/mf-manifest.json',
        'remote-3': 'remote_3@http://localhost:3003/mf-manifest.json',
      },
      shared: ['react', 'react-dom', 'react-router-dom'],
    }),
  ],
  experiments: { css: true },
});
