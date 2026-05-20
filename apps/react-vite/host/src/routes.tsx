import { lazy, Suspense, type ComponentType } from 'react';
import { createBrowserRouter, Outlet } from 'react-router-dom';
import { loadRemote } from '@module-federation/runtime';
import { Nav } from './components/Nav';
import { Loading } from './components/Loading';
import { RemoteErrorBoundary } from './components/RemoteErrorBoundary';
import { Home } from './pages/Home';

function lazyRemote(specifier: string) {
  return lazy(async () => {
    const mod = await loadRemote<{ default: ComponentType }>(specifier);
    if (!mod?.default) throw new Error(`remote module ${specifier} has no default export`);
    return { default: mod.default };
  });
}

const RemoteOne = lazyRemote('remote-1/RoutedApp');
const RemoteTwo = lazyRemote('remote-2/RoutedApp');
const RemoteThree = lazyRemote('remote-3/RoutedApp');

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
