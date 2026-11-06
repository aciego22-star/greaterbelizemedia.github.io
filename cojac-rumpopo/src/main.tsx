import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, HashRouter } from 'react-router-dom';
import '@fontsource-variable/fraunces/full.css';
import '@fontsource-variable/fraunces/full-italic.css';
import '@fontsource-variable/inter';
import './styles/global.css';
import './styles/components.css';
import './styles/pages.css';
import App from './App';
import { CartProvider } from './context/CartContext';

document.documentElement.classList.remove('no-js');

// Hash routing is only for single-file previews; Netlify uses clean URLs.
const Router = import.meta.env.VITE_HASH_ROUTER === 'true' ? HashRouter : BrowserRouter;
const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || undefined;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router basename={import.meta.env.VITE_HASH_ROUTER === 'true' ? undefined : basename}>
      <CartProvider>
        <App />
      </CartProvider>
    </Router>
  </StrictMode>,
);
