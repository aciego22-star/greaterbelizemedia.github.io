import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import '@fontsource-variable/fraunces/full.css';
import '@fontsource-variable/fraunces/full-italic.css';
import '@fontsource-variable/inter';
import './styles/global.css';
import './styles/components.css';
import './styles/pages.css';
import App from './App';
import { CartProvider } from './context/CartContext';
import { lang, routerBasename } from './i18n/lang';
import { ARTIFACT_PATH_KEY } from './components/LangToggle';

document.documentElement.classList.remove('no-js');
document.documentElement.lang = lang === 'es' ? 'es-BZ' : 'en-BZ';

// Artifact previews run inside a sandboxed frame, so they keep navigation in memory.
// Netlify (production) uses clean URLs with BrowserRouter.
const isArtifact = import.meta.env.VITE_ARTIFACT === 'true';
// Spanish pages live under /es: the router treats that prefix as its base, so every
// internal link stays in the visitor's language.
const basename = routerBasename();

// After switching language in the artifact preview, reopen the same page.
let artifactStart = '/';
if (isArtifact) {
  try {
    artifactStart = sessionStorage.getItem(ARTIFACT_PATH_KEY) || '/';
    sessionStorage.removeItem(ARTIFACT_PATH_KEY);
  } catch {
    /* storage blocked */
  }
}

const container = document.getElementById('root')!;
const app = (
  <StrictMode>
    {isArtifact ? (
      <MemoryRouter initialEntries={[artifactStart]}>
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
  </StrictMode>
);

// Pages are pre-rendered to HTML at build time (see scripts/prerender-routes.mjs).
// Hydrate that HTML when present; otherwise (dev server, artifact preview) render fresh.
if (container.firstElementChild && !isArtifact) {
  hydrateRoot(container, app, {
    // If build-time content differs (e.g. the season closed since the last deploy),
    // React quietly re-renders on the client — no need to alarm the console.
    onRecoverableError: () => {},
  });
} else {
  createRoot(container).render(app);
}
