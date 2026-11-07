import type { MouseEvent } from 'react';
import { useLocation } from 'react-router-dom';
import { isArtifactBuild, lang, pathIn, rememberLang, t, type Lang } from '../i18n/lang';

export const ARTIFACT_PATH_KEY = 'cojac-artifact-path';

const options: { id: Lang; label: string; short: string }[] = [
  { id: 'en', label: 'English', short: 'EN' },
  { id: 'es', label: 'Español', short: 'ESP' },
];

/**
 * English / Español switch. One tap loads the same page in the other language
 * (every page exists in both) and remembers the choice for the next visit.
 */
export function LangToggle({ variant = 'header' }: { variant?: 'header' | 'menu' }) {
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
            aria-label={`${o.short}, ${o.label}`}
            title={o.label}
          >
            {o.short}
          </a>
        );
      })}
    </div>
  );
}
