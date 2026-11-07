import { useEffect } from 'react';
import routes from '../content/routes';
import { site } from '../content/site';
import { localPath } from '../i18n/lang';

type Key = keyof typeof routes;

function setMeta(selector: string, attr: string, value: string) {
  const el = document.head.querySelector(selector);
  if (el) el.setAttribute(attr, value);
}

/** Keeps title, description and canonical in sync on client-side navigation. */
export function usePageMeta(key: Key | { title: string; description: string; path?: string }) {
  useEffect(() => {
    const r = typeof key === 'string' ? routes[key] : key;
    document.title = r.title;
    setMeta('meta[name="description"]', 'content', r.description);
    setMeta('meta[property="og:title"]', 'content', r.title);
    setMeta('meta[property="og:description"]', 'content', r.description);
    if (r.path) {
      const url = site.siteUrl.replace(/\/$/, '') + localPath(r.path);
      setMeta('link[rel="canonical"]', 'href', url);
      setMeta('meta[property="og:url"]', 'content', url);
    }
  }, [key]);
}
