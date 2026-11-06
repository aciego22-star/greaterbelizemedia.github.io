import { Link } from 'react-router-dom';
import routes from '../content/routes.json';
import { usePageMeta } from '../lib/usePageMeta';
import { PageHero } from '../components/ui';

export default function NotFound() {
  usePageMeta({ title: 'Page not found | Cojac’s Sumptuous Rumpopo', description: 'This page could not be found.' });
  return (
    <PageHero eyebrow="404" title="This bottle seems to be empty" lead="We couldn’t find the page you were looking for. Let’s get you back to the good stuff.">
      <div className="btn-row" style={{ marginTop: 28 }}>
        <Link to="/" className="btn btn--gold">
          Back to home
        </Link>
        <Link to={routes.flavours.path} className="btn btn--ghost">
          Find Your Flavour
        </Link>
      </div>
    </PageHero>
  );
}
