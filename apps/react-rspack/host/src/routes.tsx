import { lazy, Suspense, type ComponentType } from 'react';
import { createBrowserRouter, Outlet } from 'react-router-dom';
import { registerRemotes, loadRemote } from '@module-federation/enhanced/runtime';
import { Nav } from './components/Nav';
import { Loading } from './components/Loading';
import { RemoteErrorBoundary } from './components/RemoteErrorBoundary';
import { Home } from './pages/Home';

interface RemoteManifest {
  [alias: string]: string;
}

// Truly lazy: the manifest itself is fetched only when the first remote
// route is navigated to. The Promise is cached so subsequent navigations
// reuse it without re-fetching.
let manifestPromise: Promise<RemoteManifest> | undefined;
function fetchManifestOnce(): Promise<RemoteManifest> {
  manifestPromise ??= fetch('/mf-remotes.json', { cache: 'no-store' }).then((r) => {
    if (!r.ok) throw new Error(`failed to fetch mf-remotes.json: ${r.status}`);
    return r.json() as Promise<RemoteManifest>;
  });
  return manifestPromise;
}

// Track which aliases have already been registered to avoid duplicate work.
const registered = new Set<string>();

function lazyRemote(alias: string, exposeName: string) {
  return lazy(async () => {
    if (!registered.has(alias)) {
      const manifest = await fetchManifestOnce();
      const entry = manifest[alias];
      if (!entry) throw new Error(`remote ${alias} not in manifest`);
      const [name, url] = entry.includes('@') ? entry.split('@') : [alias.replace(/-/g, '_'), entry];
      registerRemotes([{ name, alias, entry: url }]);
      registered.add(alias);
    }
    const mod = await loadRemote<{ default: ComponentType }>(`${alias}/${exposeName}`);
    if (!mod?.default) throw new Error(`remote module ${alias}/${exposeName} has no default export`);
    return { default: mod.default };
  });
}

const RemoteOne = lazyRemote('remote-1', 'RoutedApp');
const RemoteTwo = lazyRemote('remote-2', 'RoutedApp');
const RemoteThree = lazyRemote('remote-3', 'RoutedApp');

function remote(Component: ComponentType) {
  return (
    <RemoteErrorBoundary>
      <Suspense fallback={<Loading />}>
        <Component />
      </Suspense>
    </RemoteErrorBoundary>
  );
}

function Layout() {
  return (
    <>
      <Nav />
      <main className="container">
        <Outlet />
      </main>
    </>
  );
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'remote-1', element: remote(RemoteOne) },
      { path: 'remote-2', element: remote(RemoteTwo) },
      { path: 'remote-3', element: remote(RemoteThree) },
    ],
  },
]);
