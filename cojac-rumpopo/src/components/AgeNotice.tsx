import { useEffect, useRef, useState } from 'react';
import { site } from '../content/site';
import { Ornament } from './Art';
import { Logo } from './ui';

const KEY = 'cojac-age-confirmed-v1';

/**
 * Tasteful age notice shown once per browser. This is a courtesy notice, not age
 * verification — the family confirms the buyer's age when arranging each order.
 */
export function AgeNotice() {
  const [state, setState] = useState<'hidden' | 'ask' | 'under'>('hidden');
  const dialog = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!site.alcohol.showAgeNotice) return;
    try {
      if (localStorage.getItem(KEY) === 'yes') return;
    } catch {
      /* ignore */
    }
    setState('ask');
  }, []);
  useEffect(() => {
    if (state === 'hidden') return;
    document.body.style.overflow = 'hidden';
    dialog.current?.querySelector<HTMLElement>('button')?.focus();
    return () => {
      document.body.style.overflow = '';
    };
  }, [state]);
  if (state === 'hidden') return null;
  const yes = () => {
    try {
      localStorage.setItem(KEY, 'yes');
    } catch {
      /* ignore */
    }
    setState('hidden');
  };
  return (
    <div className="age-root">
      <div className="age-card" role="dialog" aria-modal="true" aria-labelledby="age-title" aria-describedby="age-desc" ref={dialog}>
        <Logo size="feature" />
        <Ornament />
        {state === 'ask' ? (
          <>
            <h2 id="age-title">Welcome to rumpopo season</h2>
            <p id="age-desc">
              Our rumpopo contains alcohol. Please confirm you are {site.alcohol.legalAge} or older to continue.
            </p>
            <div className="age-actions">
              <button type="button" className="btn" onClick={yes}>
                I’m {site.alcohol.legalAge} or older
              </button>
              <button type="button" className="btn btn--ghost-dark" onClick={() => setState('under')}>
                I’m under {site.alcohol.legalAge}
              </button>
            </div>
            <p className="age-fine">Please enjoy responsibly.</p>
          </>
        ) : (
          <>
            <h2 id="age-title">Thanks for visiting</h2>
            <p id="age-desc">
              Our rumpopo is only for adults of legal drinking age. We hope you and your family have a very merry Christmas.
            </p>
            <button type="button" className="btn btn--ghost-dark" onClick={() => setState('ask')}>
              Go back
            </button>
          </>
        )}
      </div>
    </div>
  );
}
