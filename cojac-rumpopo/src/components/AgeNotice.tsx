import { useEffect, useRef, useState } from 'react';
import { site } from '../content/site';
import { Ornament } from './Art';
import { Logo } from './ui';
import { t } from '../i18n/lang';

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
            <h2 id="age-title">{t('Welcome to rumpopo season', 'Te damos la bienvenida a la temporada de rumpopo')}</h2>
            <p id="age-desc">
              {t(
                `Our rumpopo contains alcohol. Please confirm you are ${site.alcohol.legalAge} or older to continue.`,
                `Nuestro rumpopo contiene alcohol. Confirma que tienes ${site.alcohol.legalAge} años o más para continuar.`,
              )}
            </p>
            <div className="age-actions">
              <button type="button" className="btn" onClick={yes}>
                {t(`I’m ${site.alcohol.legalAge} or older`, `Tengo ${site.alcohol.legalAge} años o más`)}
              </button>
              <button type="button" className="btn btn--ghost-dark" onClick={() => setState('under')}>
                {t(`I’m under ${site.alcohol.legalAge}`, `Tengo menos de ${site.alcohol.legalAge} años`)}
              </button>
            </div>
            <p className="age-fine">{t('Please enjoy responsibly.', 'Disfruta con responsabilidad.')}</p>
          </>
        ) : (
          <>
            <h2 id="age-title">{t('Thanks for visiting', 'Gracias por tu visita')}</h2>
            <p id="age-desc">
              {t(
                'Our rumpopo is only for adults of legal drinking age. We hope you and your family have a very merry Christmas.',
                'Nuestro rumpopo es solo para adultos mayores de edad. Te deseamos a ti y a tu familia una muy feliz Navidad.',
              )}
            </p>
            <button type="button" className="btn btn--ghost-dark" onClick={() => setState('ask')}>
              {t('Go back', 'Volver')}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
