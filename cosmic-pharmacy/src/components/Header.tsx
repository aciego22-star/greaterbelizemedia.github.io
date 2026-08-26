import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useBasket } from '../basket/BasketProvider';
import { business } from '../data/business';

const productPages = [
  { to: '/products/supplements', label: 'Supplements' },
  { to: '/products/health', label: 'Health Products' },
  { to: '/products/personal-care-beauty', label: 'Personal Care & Beauty' },
  { to: '/products/womens-wellness', label: "Women's Wellness & PMOS" },
  { to: '/products/medical-devices', label: 'Medical Devices & Daily Living' }
];

const mainLinks = [
  { to: '/services', label: 'Services' },
  { to: '/shop', label: 'Shop All' },
  { to: '/blog', label: 'Blog' },
  { to: '/gallery', label: 'Gallery' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' }
];

export function Header() {
  const { summary, openBasket } = useBasket();
  const [menuOpen, setMenuOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef<HTMLLIElement>(null);

  // Close menus on navigation.
  useEffect(() => {
    setMenuOpen(false);
    setProductsOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setProductsOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setProductsOpen(false);
    };
    document.addEventListener('click', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('click', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  return (
    <header className="site-header">
      <div className="wrap header-inner">
        <Link to="/" className="brand" aria-label={`${business.name} — home`}>
          <span className="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 40 40">
              <circle cx="20" cy="20" r="9" fill="none" stroke="currentColor" strokeWidth="2.4" />
              <ellipse cx="20" cy="20" rx="17" ry="6.5" fill="none" stroke="currentColor" strokeWidth="1.6" transform="rotate(-18 20 20)" />
              <circle cx="33.5" cy="14" r="2.4" fill="currentColor" className="brand-moon" />
            </svg>
          </span>
          <span className="brand-text">
            <strong>{business.name}</strong>
            <small>{business.tagline}</small>
          </span>
        </Link>

        <nav className={`main-nav ${menuOpen ? 'open' : ''}`} aria-label="Main navigation">
          <ul className="nav-list">
            <li>
              <NavLink to="/" end className="nav-link">
                Home
              </NavLink>
            </li>
            <li>
              <NavLink to="/services" className="nav-link">
                Services
              </NavLink>
            </li>
            <li className={`nav-dropdown ${productsOpen ? 'open' : ''}`} ref={dropdownRef}>
              <button
                type="button"
                className="nav-link nav-drop-btn"
                aria-expanded={productsOpen}
                aria-haspopup="true"
                onClick={() => setProductsOpen((v) => !v)}
              >
                Products <span aria-hidden="true" className="caret">▾</span>
              </button>
              <ul className="drop-list">
                {productPages.map((p) => (
                  <li key={p.to}>
                    <NavLink to={p.to} className="drop-link">
                      {p.label}
                    </NavLink>
                  </li>
                ))}
                <li>
                  <NavLink to="/prescriptions" className="drop-link drop-link-rx">
                    Prescription & Refills
                  </NavLink>
                </li>
              </ul>
            </li>
            {mainLinks
              .filter((l) => l.to !== '/services')
              .map((l) => (
                <li key={l.to}>
                  <NavLink to={l.to} className="nav-link">
                    {l.label}
                  </NavLink>
                </li>
              ))}
          </ul>
        </nav>

        <div className="header-actions">
          <button
            type="button"
            className="icon-btn header-search"
            aria-label="Search products"
            onClick={() => navigate('/shop?mode=search&focus=1')}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" width="20" height="20">
              <circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" strokeWidth="2" />
              <line x1="15.5" y1="15.5" x2="21" y2="21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
          <button type="button" className="icon-btn basket-btn" aria-label={`Open basket, ${summary.itemCount} items`} onClick={openBasket}>
            <svg viewBox="0 0 24 24" aria-hidden="true" width="20" height="20">
              <path d="M4 7h16l-1.5 12a2 2 0 0 1-2 1.8h-9A2 2 0 0 1 5.5 19L4 7Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
              <path d="M8.5 10V6a3.5 3.5 0 0 1 7 0v4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            {summary.itemCount > 0 && (
              <span className="basket-count num" aria-hidden="true">
                {summary.itemCount}
              </span>
            )}
          </button>
          <button
            type="button"
            className="icon-btn menu-btn"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span className={`burger ${menuOpen ? 'x' : ''}`} aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
