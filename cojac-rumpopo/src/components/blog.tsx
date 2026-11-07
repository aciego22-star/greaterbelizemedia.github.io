import { Fragment, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import routes from '../content/routes.json';
import { site } from '../content/site';
import { contest } from '../content/blog/contest';
import { categoryName, formatPostDate, postPath, readingMinutes, type BlogImage, type BlogPost } from '../content/blog/posts';
import { asset, copyText } from '../lib/whatsapp';
import { ArrowIcon, CheckIcon, CopyIcon, FacebookIcon, WhatsAppIcon } from './Icons';
import { Sparkle } from './Art';

/* ── Images ─────────────────────────────────────────────────────────────── */

/**
 * The two supplied artworks are separate files: portrait for phones, widescreen
 * for larger screens. Each keeps its natural aspect ratio and is never cropped.
 */
export function BlogPicture({ image, eager = false, sizes = '(min-width: 1200px) 1100px, 100vw' }: { image: BlogImage; eager?: boolean; sizes?: string }) {
  return (
    <picture className="blog-picture">
      <source
        media="(max-width: 767px)"
        type="image/webp"
        srcSet={`${asset(image.mobileWebpSmall)} 540w, ${asset(image.mobileWebp)} ${image.mobileWidth}w`}
        sizes="100vw"
        width={image.mobileWidth}
        height={image.mobileHeight}
      />
      <source media="(max-width: 767px)" srcSet={asset(image.mobileJpg)} width={image.mobileWidth} height={image.mobileHeight} />
      <source
        type="image/webp"
        srcSet={`${asset(image.desktopWebpSmall)} 960w, ${asset(image.desktopWebp)} ${image.desktopWidth}w`}
        sizes={sizes}
        width={image.desktopWidth}
        height={image.desktopHeight}
      />
      <img
        src={asset(image.desktopJpg)}
        width={image.desktopWidth}
        height={image.desktopHeight}
        alt={image.alt}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        {...(eager ? { fetchpriority: 'high' } : {})}
      />
    </picture>
  );
}

/* ── Inline Markdown: **bold**, *italic*, [text](url) ───────────────────── */

function inline(text: string, keyBase: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /(\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const t = m[0];
    const k = `${keyBase}-${i++}`;
    if (t.startsWith('**')) out.push(<strong key={k}>{t.slice(2, -2)}</strong>);
    else if (t.startsWith('[')) {
      const [, label, href] = t.match(/^\[([^\]]+)\]\(([^)]+)\)$/)!;
      out.push(
        href.startsWith('/') ? (
          <Link key={k} to={href} className="text-link">
            {label}
          </Link>
        ) : (
          <a key={k} href={href} className="text-link" target="_blank" rel="noopener noreferrer">
            {label}
          </a>
        ),
      );
    } else out.push(<em key={k}>{t.slice(1, -1)}</em>);
    last = m.index + t.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

/** Renders a post body (see the format notes in content/blog/posts.ts). */
export function BlogBody({ post }: { post: BlogPost }) {
  const blocks = post.body.trim().split(/\n\s*\n/);
  return (
    <>
      {blocks.map((raw, i) => {
        const b = raw.trim();
        const k = `b${i}`;
        if (b === '[[contest]]') return <ContestPanel key={k} />;
        if (b === '[[order]]') return <OrderButtons key={k} />;
        if (b === '[[signoff]]')
          return (
            <p key={k} className="blog-signoff">
              <Sparkle size={14} /> Sip Something Sumptuous! <Sparkle size={14} />
            </p>
          );
        if (b.startsWith('## ')) return <h2 key={k}>{inline(b.slice(3), k)}</h2>;
        if (b.startsWith('> '))
          return (
            <blockquote key={k} className="blog-quote">
              <p>{inline(b.replace(/^> ?/gm, ''), k)}</p>
            </blockquote>
          );
        if (/^- /.test(b))
          return (
            <ul key={k}>
              {b.split('\n').map((li, j) => (
                <li key={j}>{inline(li.replace(/^- /, ''), `${k}-${j}`)}</li>
              ))}
            </ul>
          );
        return <p key={k}>{inline(b.replace(/\n/g, ' '), k)}</p>;
      })}
    </>
  );
}

/* ── Competition panel ──────────────────────────────────────────────────── */

export function ContestPanel() {
  const postUrl = contest.facebookContestPostUrl.trim();
  const pageUrl = site.social.facebook;
  if (contest.status === 'revealed') {
    return (
      <aside className="contest-panel" aria-labelledby="contest-title">
        <h3 id="contest-title">The new flavour has been revealed</h3>
        <p>{contest.revealText || 'Thank you to everyone who guessed! The new flavour has been announced on Cojac’s official channels.'}</p>
        {(contest.revealUrl || pageUrl) && (
          <a className="btn btn--gold" href={contest.revealUrl || pageUrl} target="_blank" rel="noopener noreferrer">
            <FacebookIcon size={18} /> See the announcement
          </a>
        )}
      </aside>
    );
  }
  if (contest.status === 'closed') {
    return (
      <aside className="contest-panel" aria-labelledby="contest-title">
        <h3 id="contest-title">The guessing challenge has closed</h3>
        <p>Thank you to everyone who sent in a guess. Entries are no longer being accepted, and the new flavour will be revealed on Cojac’s official channels.</p>
        {(postUrl || pageUrl) && (
          <a className="btn btn--ghost" href={postUrl || pageUrl} target="_blank" rel="noopener noreferrer">
            <FacebookIcon size={18} /> {postUrl ? 'View the competition post' : 'Visit Cojac’s Official Facebook Page'}
          </a>
        )}
      </aside>
    );
  }
  return (
    <aside className="contest-panel" aria-labelledby="contest-title">
      <h3 id="contest-title">How the guessing challenge works</h3>
      <ol className="contest-steps">
        <li>
          Visit Cojac’s Sumptuous Rumpopo’s <strong>official Facebook competition post</strong>.
        </li>
        <li>Leave your flavour guess in the comments on that post.</li>
        <li>
          You may submit multiple guesses, but <strong>only one answer per comment</strong>.
        </li>
        <li>
          The <strong>first three correct answers</strong> win one half liter bottle each.
        </li>
      </ol>
      <p className="contest-note">
        <strong>Important:</strong> Entries belong on the original Facebook post, not on this website. Please check that official post for the
        competition rules and any updates. No deadline or additional entry restrictions have been announced, so none are added here.
      </p>
      {postUrl ? (
        <a className="btn btn--gold" href={postUrl} target="_blank" rel="noopener noreferrer">
          <FacebookIcon size={18} /> See the official mystery flavour competition on Facebook
        </a>
      ) : pageUrl ? (
        <>
          <a className="btn btn--gold" href={pageUrl} target="_blank" rel="noopener noreferrer">
            <FacebookIcon size={18} /> Visit Cojac’s Official Facebook Page
          </a>
          <p className="contest-help">Look for the “Guess our newest rumpopo flavour” post and leave your guess in its comments.</p>
        </>
      ) : null}
    </aside>
  );
}

/* ── Ordering buttons (existing site flow) ──────────────────────────────── */

export function OrderButtons() {
  return (
    <div className="blog-order">
      <Link to={routes.flavours.path} className="btn btn--gold">
        Explore Our Flavours <ArrowIcon size={18} />
      </Link>
      <Link to={routes.order.path} className="btn btn--whatsapp">
        <WhatsAppIcon /> Order Through WhatsApp
      </Link>
    </div>
  );
}

/* ── Share links (real article URL; no counts) ─────────────────────────── */

export function ShareLinks({ post }: { post: BlogPost }) {
  const url = site.siteUrl.replace(/\/$/, '') + postPath(post.slug);
  const [copied, setCopied] = useState(false);
  const enc = encodeURIComponent;
  return (
    <div className="blog-share">
      <p className="blog-share__label">Share this story</p>
      <ul>
        <li>
          <a href={`https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`} target="_blank" rel="noopener noreferrer" className="share-btn share-btn--facebook" aria-label="Share on Facebook (opens in a new tab)">
            <FacebookIcon size={18} /> Facebook
          </a>
        </li>
        <li>
          <a href={`https://wa.me/?text=${enc(`${post.title} ${url}`)}`} target="_blank" rel="noopener noreferrer" className="share-btn share-btn--whatsapp" aria-label="Share on WhatsApp (opens in a new tab)">
            <WhatsAppIcon size={18} /> WhatsApp
          </a>
        </li>
        <li>
          <button
            type="button"
            className="share-btn"
            onClick={async () => {
              if (await copyText(url)) {
                setCopied(true);
                window.setTimeout(() => setCopied(false), 2500);
              }
            }}
          >
            {copied ? <CheckIcon size={18} /> : <CopyIcon size={18} />} {copied ? 'Link copied' : 'Copy link'}
          </button>
        </li>
      </ul>
    </div>
  );
}

/* ── Post meta + cards ──────────────────────────────────────────────────── */

export function PostMeta({ post }: { post: BlogPost }) {
  return (
    <p className="post-meta">
      <span>By {post.author}</span>
      <span aria-hidden="true">·</span>
      <time dateTime={post.publishedAt}>{formatPostDate(post.publishedAt)}</time>
      <span aria-hidden="true">·</span>
      <span>{readingMinutes(post)} min read</span>
    </p>
  );
}

export function CategoryChips({ post }: { post: BlogPost }) {
  return (
    <ul className="post-chips" aria-label="Categories">
      {post.categories.map((c) => (
        <li key={c} className="chip chip--blog">
          {categoryName(c)}
        </li>
      ))}
    </ul>
  );
}

/** Large featured card (blog index) or compact card (homepage). */
export function PostCard({ post, variant = 'featured', headingLevel = 2 }: { post: BlogPost; variant?: 'featured' | 'compact'; headingLevel?: 2 | 3 }) {
  const H = headingLevel === 2 ? 'h2' : 'h3';
  return (
    <article className={`post-card post-card--${variant}`}>
      <Link to={postPath(post.slug)} className="post-card__media" tabIndex={-1} aria-hidden="true">
        <BlogPicture image={post.image} eager={variant === 'featured'} sizes={variant === 'featured' ? '(min-width: 1000px) 640px, 100vw' : '(min-width: 1000px) 420px, 100vw'} />
      </Link>
      <div className="post-card__body">
        <CategoryChips post={post} />
        <H className="post-card__title">
          <Link to={postPath(post.slug)}>{post.title}</Link>
        </H>
        <PostMeta post={post} />
        <p className="post-card__excerpt">{post.excerpt}</p>
        <Link to={postPath(post.slug)} className="btn btn--sm">
          Read the story <ArrowIcon size={16} />
        </Link>
      </div>
    </article>
  );
}

/** Breadcrumb that matches the real navigation (Home › Holiday Blog › Post). */
export function Breadcrumb({ items }: { items: { label: string; to?: string }[] }) {
  return (
    <nav className="breadcrumb" aria-label="Breadcrumb">
      <ol>
        {items.map((it, i) => (
          <Fragment key={it.label}>
            <li>
              {it.to ? (
                <Link to={it.to}>{it.label}</Link>
              ) : (
                <span aria-current="page">{it.label}</span>
              )}
            </li>
            {i < items.length - 1 && (
              <li aria-hidden="true" className="breadcrumb__sep">
                ›
              </li>
            )}
          </Fragment>
        ))}
      </ol>
    </nav>
  );
}
