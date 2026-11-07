import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import routes from '../content/routes';
import { buildFlags, site } from '../content/site';
import { homeCopy } from '../content/copy';
import { useCart } from '../context/CartContext';
import { shouldShowBanner } from '../lib/season';
import { BagIcon, ChevronIcon, CloseIcon, MenuIcon, PhoneIcon, PinIcon, WhatsAppIcon } from './Icons';
import { Sparkle } from './Art';
import { Logo, SocialIcons } from './ui';
import { CartDrawer } from './CartDrawer';
import { AgeNotice } from './AgeNotice';
import { LangToggle } from './LangToggle';
import { t } from '../i18n/lang';

const discover = [routes.story, routes.guarantee, routes.gallery, routes.videos];

function SeasonBanner() {
  if (!shouldShowBanner()) return null;
  return (
    <div className="season-banner" role="region" aria-label={t('Season announcement', 'Anuncio de temporada')}>
      <Sparkle size={12} className="season-banner__spark" />
      <p>{site.season.bannerText}</p>
      <Sparkle size={12} className="season-banner__spark" />
    </div>
  );
}

function DiscoverMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { pathname } = useLocation();
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        ref.current?.querySelector('button')?.focus();
      }
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);
  const active = discover.some((r) => pathname.startsWith(r.path));
  return (
    <div className={`nav-dropdown ${open ? 'is-open' : ''}`} ref={ref}>
      <button
        type="button"
        className={`nav-link ${active ? 'is-active' : ''}`}
        aria-expanded={open}
        aria-controls="discover-menu"
        onClick={() => setOpen((o) => !o)}
      >
        {t('Discover', 'Descubre')} <ChevronIcon size={16} />
      </button>
      <div className="nav-dropdown__panel" id="discover-menu" hidden={!open}>
        <ul>
          {discover.map((r) => (
            <li key={r.path}>
              <NavLink to={r.path} className="nav-dropdown__link">
                {r.nav}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    const first = ref.current?.querySelector<HTMLElement>('a, button');
    first?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);
  if (!open) return null;
  const all = [routes.home, routes.story, routes.flavours, routes.guarantee, routes.gallery, routes.videos, routes.holidayBlog, routes.order, routes.faqs, routes.contact];
  return (
    <div className="mobile-menu" role="dialog" aria-modal="true" aria-label={t('Site menu', 'Menú del sitio')} ref={ref}>
      <div className="mobile-menu__top">
        <Logo size="menu" />
        <button type="button" className="icon-btn icon-btn--light" onClick={onClose} aria-label={t('Close menu', 'Cerrar menú')}>
          <CloseIcon size={24} />
        </button>
      </div>
      <LangToggle variant="menu" />
      <nav aria-label={t('Mobile', 'Móvil')}>
        <ul className="mobile-menu__list">
          {all.map((r, i) => (
            <li key={r.path} style={{ animationDelay: `${60 + i * 35}ms` }}>
              <NavLink to={r.path} end={r.path === '/'} onClick={onClose}>
                {r.nav}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className="mobile-menu__foot">
        <Link to={routes.order.path} className="btn btn--whatsapp btn--block" onClick={onClose}>
          <WhatsAppIcon /> {t('Order on WhatsApp', 'Pedir por WhatsApp')}
        </Link>
        <SocialIcons light />
        <p>{site.alcohol.responsibleMessage}</p>
      </div>
    </div>
  );
}

function Header() {
  const { totals, openDrawer } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  useEffect(() => setMenuOpen(false), [pathname]);
  const count = totals.itemCount;
  return (
    <>
      <header className={`site-header ${scrolled ? 'is-scrolled' : ''}`}>
        <div className="container site-header__inner">
          <Link to="/" className="site-header__logo" aria-label={`${site.brandName}, ${t('home', 'inicio')}`}>
            <Logo size="header" />
          </Link>
          <nav className="site-nav" aria-label={t('Main', 'Principal')}>
            <NavLink to={routes.flavours.path} className="nav-link">
              {routes.flavours.nav}
            </NavLink>
            <DiscoverMenu />
            <NavLink to={routes.holidayBlog.path} className="nav-link">
              {routes.holidayBlog.nav}
            </NavLink>
            <NavLink to={routes.faqs.path} className="nav-link">
              {t('FAQs', 'Preguntas')}
            </NavLink>
            <NavLink to={routes.contact.path} className="nav-link">
              {routes.contact.nav}
            </NavLink>
          </nav>
          <div className="site-header__actions">
            <button type="button" className="cart-btn" onClick={openDrawer} aria-label={t(
                `Your order request, ${count} ${count === 1 ? 'bottle' : 'bottles'}`,
                `Tu pedido, ${count} ${count === 1 ? 'botella' : 'botellas'}`,
              )}>
              <BagIcon size={22} />
              {count > 0 && <span className="cart-btn__count">{count > 99 ? '99+' : count}</span>}
            </button>
            <Link to={routes.order.path} className="btn btn--gold btn--sm site-header__cta">
              {routes.order.nav}
            </Link>
            <button
              type="button"
              className="icon-btn menu-btn"
              onClick={() => setMenuOpen(true)}
              aria-label={t('Open menu', 'Abrir menú')}
              aria-expanded={menuOpen}
            >
              <MenuIcon size={24} />
            </button>
          </div>
        </div>
      </header>
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}

function Footer() {
  const { contact } = site;
  return (
    <footer className="site-footer grain">
      <div className="container">
        <div className="site-footer__brand">
          <Logo size="footer" />
          <p className="site-footer__line">
            {homeCopy.closingLead} <em>{homeCopy.closingWord}</em>
          </p>
          <Link to={routes.order.path} className="btn btn--whatsapp">
            <WhatsAppIcon /> {t('Order on WhatsApp', 'Pedir por WhatsApp')}
          </Link>
        </div>
        <div className="site-footer__cols">
          <nav aria-label={t('Explore', 'Explora')}>
            <h2>{t('Explore', 'Explora')}</h2>
            <ul>
              <li><Link to="/">{routes.home.nav}</Link></li>
              <li><Link to={routes.story.path}>{routes.story.short}</Link></li>
              <li><Link to={routes.flavours.path}>{routes.flavours.short}</Link></li>
              <li><Link to={routes.guarantee.path}>{routes.guarantee.short}</Link></li>
              <li><Link to={routes.gallery.path}>{routes.gallery.short}</Link></li>
              <li><Link to={routes.videos.path}>{routes.videos.short}</Link></li>
              <li><Link to={routes.holidayBlog.path}>{routes.holidayBlog.nav}</Link></li>
            </ul>
          </nav>
          <nav aria-label={t('Order and support', 'Pedidos y ayuda')}>
            <h2>{t('Order & Support', 'Pedidos y ayuda')}</h2>
            <ul>
              <li><Link to={routes.order.path}>{routes.order.nav}</Link></li>
              <li><Link to={routes.faqs.path}>{routes.faqs.nav}</Link></li>
              <li><Link to={routes.contact.path}>{t('Connect with Us', 'Conecta con nosotros')}</Link></li>
              <li><Link to={routes.privacy.path}>{routes.privacy.nav}</Link></li>
            </ul>
          </nav>
          <div>
            <h2>{t('Connect', 'Conecta')}</h2>
            <SocialIcons light />
            <ul className="site-footer__connect">
              {contact.phoneDisplay && contact.phoneDial && (
                <li><a href={`tel:+${contact.phoneDial}`}><PhoneIcon size={18} /> {contact.phoneDisplay}</a></li>
              )}
              {contact.addressLine && (
                <li>
                  {contact.mapUrl ? (
                    <a href={contact.mapUrl} target="_blank" rel="noopener noreferrer" aria-label={`${contact.addressLine}, ${t('open in Google Maps', 'abrir en Google Maps')}`}>
                      <PinIcon size={18} /> {contact.addressLine}
                    </a>
                  ) : (
                    <span><PinIcon size={18} /> {contact.addressLine}</span>
                  )}
                </li>
              )}
            </ul>
          </div>
        </div>
        <div className="site-footer__legal">
          <LangToggle variant="footer" />
          <a href={site.credit.url} target="_blank" rel="noopener" className="site-footer__credit">
            {site.credit.label}
          </a>
          {buildFlags.showLaunchNotes && (
            <p>
              <Link to="/launch-notes" className="site-footer__preview">
                {t('Internal preview: launch notes', 'Vista interna: notas de lanzamiento')}
              </Link>
            </p>
          )}
        </div>
      </div>
    </footer>
  );
}

function StickyOrderBar() {
  const { totals, openDrawer } = useCart();
  const { pathname } = useLocation();
  if (totals.itemCount === 0 || pathname.replace(/\/+$/, '') === routes.order.path) return null;
  return (
    <div className="sticky-order">
      <button type="button" className="sticky-order__summary" onClick={openDrawer}>
        <BagIcon size={20} />
        <span>
          {totals.itemCount} {totals.itemCount === 1 ? t('bottle', 'botella') : t('bottles', 'botellas')}
        </span>
      </button>
      <Link to={routes.order.path} className="btn btn--whatsapp btn--sm">
        {t('Review & send', 'Revisar y enviar')}
      </Link>
    </div>
  );
}

function Toast() {
  const { toast } = useCart();
  return (
    <div className={`toast ${toast ? 'is-visible' : ''}`} role="status" aria-live="polite">
      {toast}
    </div>
  );
}


export function Layout() {
  const { pathname } = useLocation();
  const mainRef = useRef<HTMLElement>(null);
  const first = useRef(true);
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    if (first.current) {
      first.current = false;
      return;
    }
    mainRef.current?.focus({ preventScroll: true });
  }, [pathname]);
  return (
    <>
      <a href="#main" className="skip-link">
        {t('Skip to content', 'Ir al contenido')}
      </a>
      <div className="lang-bar">
        <div className="container lang-bar__inner">
          <LangToggle variant="bar" />
        </div>
      </div>
      <SeasonBanner />
      <Header />
      <main id="main" ref={mainRef} tabIndex={-1}>
        <Outlet />
      </main>
      <Footer />
      <StickyOrderBar />
      <CartDrawer />
      <Toast />
      <AgeNotice />
    </>
  );
}
