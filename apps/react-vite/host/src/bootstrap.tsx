import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { registerRemotes } from '@module-federation/runtime';
import { router } from './routes';
import './style.css';

interface RemoteManifest {
  [alias: string]: string;
}

async function start() {
  const res = await fetch('/mf-remotes.json', { cache: 'no-store' });
  if (!res.ok) throw new Error(`failed to fetch mf-remotes.json: ${res.status}`);
  const manifest = (await res.json()) as RemoteManifest;

  // The build plugin already created a default ModuleFederation instance
  // (with name 'host' from vite.config.ts). registerRemotes adds remotes
  // to that existing instance — preferred over init() which is deprecated.
  registerRemotes(
    Object.entries(manifest).map(([alias, entry]) => {
      const [name, url] = entry.includes('@') ? entry.split('@') : [alias, entry];
      return { name, alias, entry: url, type: 'module' as const };
    }),
  );

  const container = document.getElementById('root');
  if (!container) throw new Error('#root element not found');
  createRoot(container).render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>,
  );
}

void start();
