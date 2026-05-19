import { defineConfig } from '@rspack/cli';
import { rspack } from '@rspack/core';
import { ModuleFederationPlugin } from '@module-federation/enhanced/rspack';
import * as path from 'node:path';

const isDev = process.env.NODE_ENV !== 'production';
const PORT = 3001;
const NAME = 'remote_1';

export default defineConfig({
  context: __dirname,
  entry: { main: './src/index.ts' },
  output: {
    path: path.resolve(__dirname, 'dist'),
    publicPath: 'auto',
    uniqueName: NAME,
    clean: true,
  },
  devServer: {
    port: PORT,
    historyApiFallback: true,
    hot: true,
    headers: { 'Access-Control-Allow-Origin': '*' },
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
    new rspack.HtmlRspackPlugin({ template: './index.html', excludeChunks: [NAME] }),
    new ModuleFederationPlugin({
      name: NAME,
      filename: 'remoteEntry.js',
      exposes: {
        './RoutedApp': './src/RoutedApp.tsx',
      },
      shared: ['react', 'react-dom', 'react-router-dom'],
      dts: true,
    }),
  ],
  experiments: { css: true },
});
