import type { MouseEvent } from 'react';
import { useLocation } from 'react-router-dom';
import { isArtifactBuild, lang, pathIn, rememberLang, t, type Lang } from '../i18n/lang';

export const ARTIFACT_PATH_KEY = 'cojac-artifact-path';

const options: { id: Lang; label: string }[] = [
  { id: 'en', label: 'English' },
  { id: 'es', label: 'Español' },
];

/**
 * English / Español switch. One tap loads the same page in the other language
 * (every page exists in both) and remembers the choice for the next visit.
 */
export function LangToggle({ variant = 'bar' }: { variant?: 'bar' | 'menu' | 'footer' }) {
  const { pathname, search, hash } = useLocation();
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');

  const onPick = (l: Lang) => (e: MouseEvent<HTMLAnchorElement>) => {
    rememberLang(l);
    if (l === lang) {
      e.preventDefault();
      return;
    }
    if (isArtifactBuild) {
      // The artifact preview keeps pages in memory: reload in the new language on the same page.
      e.preventDefault();
      try {
        sessionStorage.setItem(ARTIFACT_PATH_KEY, pathname + search);
      } catch {
        /* storage blocked */
      }
      location.reload();
    }
  };

  return (
    <div className={`lang-toggle lang-toggle--${variant}`} role="group" aria-label={t('Language', 'Idioma')}>
      <svg className="lang-toggle__globe" width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <path d="M3 12h18M12 3c2.6 2.6 3.8 5.6 3.8 9s-1.2 6.4-3.8 9c-2.6-2.6-3.8-5.6-3.8-9S9.4 5.6 12 3Z" fill="none" stroke="currentColor" strokeWidth="1.6" />
      </svg>
      {options.map((o) => {
        const active = o.id === lang;
        return (
          <a
            key={o.id}
            href={isArtifactBuild ? '#' : `${base}${pathIn(o.id, pathname)}${search}${hash}`}
            hrefLang={o.id}
            lang={o.id}
            className={`lang-toggle__opt ${active ? 'is-active' : ''}`}
            aria-current={active ? 'true' : undefined}
            onClick={onPick(o.id)}
          >
            {o.label}
          </a>
        );
      })}
    </div>
  );
}
