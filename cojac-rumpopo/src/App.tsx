import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import routes from './content/routes.json';
import { buildFlags } from './content/site';
import { Layout } from './components/Layout';
import Home from './pages/Home';

const Story = lazy(() => import('./pages/Story'));
const Flavours = lazy(() => import('./pages/Flavours'));
const Guarantee = lazy(() => import('./pages/Guarantee'));
const Gallery = lazy(() => import('./pages/Gallery'));
const Videos = lazy(() => import('./pages/Videos'));
const Order = lazy(() => import('./pages/Order'));
const Faqs = lazy(() => import('./pages/Faqs'));
const Contact = lazy(() => import('./pages/Contact'));
const Privacy = lazy(() => import('./pages/Privacy'));
const LaunchNotes = lazy(() => import('./pages/LaunchNotes'));
const NotFound = lazy(() => import('./pages/NotFound'));

const strip = (p: string) => p.replace(/^\//, '');

export default function App() {
  return (
    <Suspense fallback={<div className="route-loading" aria-busy="true" />}>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path={strip(routes.story.path)} element={<Story />} />
          <Route path={strip(routes.flavours.path)} element={<Flavours />} />
          <Route path={strip(routes.guarantee.path)} element={<Guarantee />} />
          <Route path={strip(routes.gallery.path)} element={<Gallery />} />
          <Route path={strip(routes.videos.path)} element={<Videos />} />
          <Route path={strip(routes.order.path)} element={<Order />} />
          <Route path={strip(routes.faqs.path)} element={<Faqs />} />
          <Route path={strip(routes.contact.path)} element={<Contact />} />
          <Route path={strip(routes.privacy.path)} element={<Privacy />} />
          {buildFlags.showLaunchNotes && <Route path="launch-notes" element={<LaunchNotes />} />}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
