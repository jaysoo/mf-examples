import { lazy, Suspense } from 'react';
import { createBrowserRouter, Outlet } from 'react-router-dom';
import { Nav } from './components/Nav';
import { Loading } from './components/Loading';
import { RemoteErrorBoundary } from './components/RemoteErrorBoundary';
import { Home } from './pages/Home';

const RemoteOne = lazy(() => import('remote-1/RoutedApp'));
const RemoteTwo = lazy(() => import('remote-2/RoutedApp'));
const RemoteThree = lazy(() => import('remote-3/RoutedApp'));

function remote(Component: React.ComponentType) {
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
