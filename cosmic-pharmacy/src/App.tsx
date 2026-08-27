import { useEffect } from 'react';
import { HashRouter, Route, Routes, useLocation } from 'react-router-dom';
import { BasketProvider } from './basket/BasketProvider';
import { BasketDrawer } from './basket/BasketDrawer';
import { CosmicCanvas } from './components/CosmicCanvas';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { Services } from './pages/Services';
import { Supplements, HealthProducts, PersonalCareBeauty, WomensWellness, MedicalDevices } from './pages/retailPages';
import { Prescriptions } from './pages/Prescriptions';
import { ShopAll } from './pages/ShopAll';
import { ProductDetail } from './pages/ProductDetail';
import { Blog } from './pages/Blog';
import { ArticlePage } from './pages/ArticlePage';
import { Gallery } from './pages/Gallery';
import { About } from './pages/About';
import { Contact } from './pages/Contact';

/** Scrolls to the top on route changes (but not on in-page filter updates). */
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <HashRouter>
      <BasketProvider>
        <CosmicCanvas />
        <a className="skip-link" href="#main-content">
          Skip to content
        </a>
        <Header />
        <main id="main-content">
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/services" element={<Services />} />
            <Route path="/products/supplements" element={<Supplements />} />
            <Route path="/products/health" element={<HealthProducts />} />
            <Route path="/products/personal-care-beauty" element={<PersonalCareBeauty />} />
            <Route path="/products/womens-wellness" element={<WomensWellness />} />
            <Route path="/products/medical-devices" element={<MedicalDevices />} />
            <Route path="/prescriptions" element={<Prescriptions />} />
            <Route path="/shop" element={<ShopAll />} />
            <Route path="/product/:slug" element={<ProductDetail />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<ArticlePage />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </main>
        <Footer />
        <BasketDrawer />
      </BasketProvider>
    </HashRouter>
  );
}
