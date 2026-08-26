import { Link, useParams } from 'react-router-dom';
import rawArticles from '../data/articles.json';
import type { Article } from '../data/types';
import { ArticleCard } from '../components/ArticleCard';
import { PlaceholderMedia } from '../components/PlaceholderMedia';
import { PharmacistCard } from '../components/PharmacistCard';
import { usePageMeta } from '../lib/usePageMeta';

const articles = rawArticles as Article[];

export function ArticlePage() {
  const { slug } = useParams();
  const article = articles.find((a) => a.slug === slug);
  usePageMeta(article ? `${article.title} | Cosmic Pharmacy` : 'Article not found | Cosmic Pharmacy', article?.summary);

  if (!article) {
    return (
      <div className="page">
        <div className="wrap">
          <section className="panel-section section-pad">
            <h1 className="section-title">Article not found</h1>
            <Link className="btn btn-primary" to="/blog">
              Back to the Journal
            </Link>
          </section>
        </div>
      </div>
    );
  }

  const related = articles.filter((a) => a.id !== article.id).slice(0, 2);

  return (
    <div className="page">
      <div className="wrap page-stack">
        <article className="panel-section section-pad article-body">
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <Link to="/blog">← Health & Wellness Journal</Link>
          </nav>
          <span className="article-kicker">
            {article.category} ·{' '}
            <time dateTime={article.date}>
              {new Date(article.date).toLocaleDateString('en-BZ', { year: 'numeric', month: 'long', day: 'numeric' })}
            </time>
          </span>
          <h1 className="section-title">{article.title}</h1>
          <p className="article-byline">
            By {article.author}
            {article.reviewedBy && <> · Reviewed by: {article.reviewedBy}</>}
          </p>

          <div className="article-hero">
            {article.heroImage ? <img src={article.heroImage} alt={article.heroAlt} /> : <PlaceholderMedia note={article.heroAlt} />}
          </div>

          {article.body.map((block, i) =>
            block.startsWith('## ') ? <h2 key={i}>{block.slice(3)}</h2> : <p key={i}>{block}</p>
          )}

          {article.demo && (
            <p className="notice">
              Demo article for the concept build — final journal content is written for Cosmic and approved by the pharmacist before
              publication.
            </p>
          )}

          <PharmacistCard />
        </article>

        {related.length > 0 && (
          <section className="panel-section cool section-pad">
            <h2>Related reading</h2>
            <div className="article-grid">
              {related.map((a) => (
                <ArticleCard key={a.id} article={a} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
