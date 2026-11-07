import { buildFlags, site } from '../content/site';
import { buildWhatsAppUrl, resolveDestination, type DestinationStatus } from './order';
import { t } from '../i18n/lang';

export function getDestination(): DestinationStatus {
  return resolveDestination(site.whatsapp.orderNumber, buildFlags.qaWhatsAppNumber);
}

/** A general "hello" chat link, or null when no number is configured. */
export function generalEnquiryUrl(): string | null {
  const d = getDestination();
  if (!d.ok) return null;
  return buildWhatsAppUrl(
    d.number,
    t(`Hello ${site.brandName}! I have a question about your rumpopo.`, `¡Hola, ${site.brandName}! Tengo una pregunta sobre su rumpopo.`),
  );
}

/** Copies text, with a fallback for older browsers / non-secure contexts. */
export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fall through */
  }
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

export function asset(path: string): string {
  if (!path) return path;
  if (/^https?:/.test(path)) return path;
  return `${import.meta.env.BASE_URL.replace(/\/$/, '')}${path}`;
}
