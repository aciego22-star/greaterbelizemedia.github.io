import { describe, expect, it } from 'vitest';
import { blogCategories, findPost, posts, publishedPosts, readingMinutes, wordCount, formatPostDate, postPath } from '../src/content/blog/posts';
import { contest } from '../src/content/blog/contest';

describe('Holiday Blog content', () => {
  it('publishes the inaugural 2026 article at a stable slug', () => {
    const p = findPost('rumpopo-season-2026-secret-flavour');
    expect(p).toBeTruthy();
    expect(postPath(p!.slug)).toBe('/holiday-blog/rumpopo-season-2026-secret-flavour');
    expect(p!.seoTitle).toBe('Rumpopo Season 2026 Is Back | Cojac’s New Flavour Mystery');
    expect(p!.publishedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(formatPostDate(p!.publishedAt)).toBe('7 November 2026');
  });
  it('lists posts newest first and hides drafts', () => {
    const list = publishedPosts();
    expect(list.every((p) => p.published)).toBe(true);
    expect([...list].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))).toEqual(list);
  });
  it('uses valid categories and slugs', () => {
    const ids = blogCategories.map((c) => c.id);
    for (const p of posts) {
      expect(p.slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
      for (const c of p.categories) expect(ids).toContain(c);
    }
  });
  it('keeps house style: no long dashes in any visible field', () => {
    for (const p of posts) {
      for (const v of [p.title, p.seoTitle, p.metaDescription, p.excerpt, p.dek, p.body, p.image.alt]) expect(v).not.toMatch(/[—–]/);
    }
  });
  it('states the official hint and prize, and keeps entries on Facebook', () => {
    const body = findPost('rumpopo-season-2026-secret-flavour')!.body;
    expect(body).toContain('One of the main ingredients in our newest rumpopo flavour is popular in Belizean cooking.');
    expect(body).toContain('one half liter bottle');
    expect(body).toContain('[[contest]]');
    expect(body).not.toMatch(/deadline is|ends on|closes on/i);
  });
  it('computes a sensible reading time', () => {
    const p = posts[0];
    expect(wordCount(p)).toBeGreaterThan(700);
    expect(readingMinutes(p)).toBeGreaterThanOrEqual(3);
    expect(readingMinutes(p)).toBeLessThanOrEqual(7);
  });
  it('never ships a placeholder contest link', () => {
    expect(['active', 'closed', 'revealed']).toContain(contest.status);
    expect(contest.facebookContestPostUrl).not.toMatch(/TO_BE_SUPPLIED|example|placeholder/i);
    if (contest.facebookContestPostUrl) expect(contest.facebookContestPostUrl).toMatch(/^https:\/\/(www\.)?facebook\.com\//);
  });
});
