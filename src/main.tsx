import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './demo/App';

const root = document.getElementById('root');
if (!root) throw new Error('Application root element is missing');
createRoot(root).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
