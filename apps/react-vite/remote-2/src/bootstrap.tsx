import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import RoutedApp from './RoutedApp';
import './style.css';

const container = document.getElementById('root');
if (!container) throw new Error('#root element not found');
createRoot(container).render(
  <StrictMode>
    <RoutedApp />
  </StrictMode>,
);
