import { Link } from 'react-router-dom';
import routes from '../content/routes';
import { usePageMeta } from '../lib/usePageMeta';
import { PageHero } from '../components/ui';
import { t } from '../i18n/lang';

export default function NotFound() {
  usePageMeta({
    title: t('Page not found | Cojac’s Sumptuous Rumpopo', 'Página no encontrada | Cojac’s Sumptuous Rumpopo'),
    description: t('This page could not be found.', 'No encontramos esta página.'),
  });
  return (
    <PageHero
      title={t('This bottle seems to be empty', 'Esta botella parece estar vacía')}
      lead={t('We couldn’t find the page you were looking for. Let’s get you back to the good stuff.', 'No encontramos la página que buscabas. Volvamos a lo bueno.')}
    >
      <div className="btn-row" style={{ marginTop: 28 }}>
        <Link to="/" className="btn btn--gold">
          {t('Back to home', 'Volver al inicio')}
        </Link>
        <Link to={routes.flavours.path} className="btn btn--ghost">
          {routes.flavours.nav}
        </Link>
      </div>
    </PageHero>
  );
}
