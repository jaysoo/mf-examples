import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import './style.css';

// Truly dynamic federation: this bootstrap knows NOTHING about remotes.
// The manifest fetch + registerRemotes happens lazily, per-route, the
// first time a remote-N route is navigated to. See ./routes.tsx.
const container = document.getElementById('root');
if (!container) throw new Error('#root element not found');
createRoot(container).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
