import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import '@fontsource-variable/fraunces/full.css';
import '@fontsource-variable/fraunces/full-italic.css';
import '@fontsource-variable/inter';
import './styles/global.css';
import './styles/components.css';
import './styles/pages.css';
import App from './App';
import { CartProvider } from './context/CartContext';

document.documentElement.classList.remove('no-js');

// Artifact previews run inside a sandboxed frame, so they keep navigation in memory.
// Netlify (production) uses clean URLs with BrowserRouter.
const isArtifact = import.meta.env.VITE_ARTIFACT === 'true';
const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || undefined;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isArtifact ? (
      <MemoryRouter>
        <CartProvider>
          <App />
        </CartProvider>
      </MemoryRouter>
    ) : (
      <BrowserRouter basename={basename}>
        <CartProvider>
          <App />
        </CartProvider>
      </BrowserRouter>
    )}
  </StrictMode>,
);
