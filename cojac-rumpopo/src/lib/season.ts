import { site } from '../content/site';

export type SeasonState = 'upcoming' | 'open' | 'closed';

/** Belize is UTC-6 all year (no daylight saving). Returns YYYY-MM-DD in Belize. */
export function belizeDateString(now: Date = new Date()): string {
  const belize = new Date(now.getTime() - 6 * 60 * 60 * 1000);
  return belize.toISOString().slice(0, 10);
}

export interface SeasonConfig {
  isSeasonOpen: boolean;
  acceptOrderRequests: boolean;
  seasonOpensOn: string;
  seasonClosesOn: string;
}

export function getSeasonState(cfg: SeasonConfig = site.season, now: Date = new Date()): SeasonState {
  const today = belizeDateString(now);
  if (!cfg.isSeasonOpen) return today < cfg.seasonOpensOn ? 'upcoming' : 'closed';
  if (today < cfg.seasonOpensOn) return 'upcoming';
  if (today > cfg.seasonClosesOn) return 'closed';
  return 'open';
}

/** Order requests are only accepted while the season is open and the switch is on. */
export function isAcceptingOrders(cfg: SeasonConfig = site.season, now: Date = new Date()): boolean {
  return cfg.acceptOrderRequests && getSeasonState(cfg, now) === 'open';
}

export function shouldShowBanner(now: Date = new Date()): boolean {
  return site.season.showBanner && getSeasonState(site.season, now) === 'open' && !!site.season.bannerText;
}

export function formatLongDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return iso;
  return new Date(Date.UTC(y, m - 1, d, 12)).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}
