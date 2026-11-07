import { Route, Routes } from 'react-router-dom';
import routes from './content/routes';
import { buildFlags } from './content/site';
import { Layout } from './components/Layout';
import Home from './pages/Home';

import Story from './pages/Story';
import Flavours from './pages/Flavours';
import Guarantee from './pages/Guarantee';
import Gallery from './pages/Gallery';
import Videos from './pages/Videos';
import Order from './pages/Order';
import Faqs from './pages/Faqs';
import Contact from './pages/Contact';
import Privacy from './pages/Privacy';
import LaunchNotes from './pages/LaunchNotes';
import NotFound from './pages/NotFound';
import BlogIndex from './pages/BlogIndex';
import BlogPost from './pages/BlogPost';

const strip = (p: string) => p.replace(/^\//, '');

export default function App() {
  return (
    <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path={strip(routes.story.path)} element={<Story />} />
          <Route path={strip(routes.flavours.path)} element={<Flavours />} />
          <Route path={strip(routes.guarantee.path)} element={<Guarantee />} />
          <Route path={strip(routes.gallery.path)} element={<Gallery />} />
          <Route path={strip(routes.videos.path)} element={<Videos />} />
          <Route path={strip(routes.holidayBlog.path)} element={<BlogIndex />} />
          <Route path={`${strip(routes.holidayBlog.path)}/:slug`} element={<BlogPost />} />
          <Route path={strip(routes.order.path)} element={<Order />} />
          <Route path={strip(routes.faqs.path)} element={<Faqs />} />
          <Route path={strip(routes.contact.path)} element={<Contact />} />
          <Route path={strip(routes.privacy.path)} element={<Privacy />} />
          {buildFlags.showLaunchNotes && <Route path="launch-notes" element={<LaunchNotes />} />}
          <Route path="*" element={<NotFound />} />
        </Route>
    </Routes>
  );
}
