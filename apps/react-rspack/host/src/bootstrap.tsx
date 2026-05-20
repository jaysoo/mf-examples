import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { init } from '@module-federation/enhanced/runtime';
import { router } from './routes';
import './style.css';

interface RemoteManifest {
  [alias: string]: string;
}

async function start() {
  const res = await fetch('/mf-remotes.json', { cache: 'no-store' });
  if (!res.ok) throw new Error(`failed to fetch mf-remotes.json: ${res.status}`);
  const manifest = (await res.json()) as RemoteManifest;

  init({
    name: 'host',
    remotes: Object.entries(manifest).map(([alias, entry]) => {
      const [name, url] = entry.includes('@') ? entry.split('@') : [alias.replace(/-/g, '_'), entry];
      return { name, alias, entry: url };
    }),
  });

  const container = document.getElementById('root');
  if (!container) throw new Error('#root element not found');
  createRoot(container).render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>,
  );
}

void start();
