import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// GH Pages SPA routing: restore path stored by 404.html redirect
const spaRedirect = sessionStorage.getItem('spa_redirect');
if (spaRedirect) {
  sessionStorage.removeItem('spa_redirect');
  window.history.replaceState(null, '', spaRedirect);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
