import { Link } from 'react-router-dom';
import type { Article } from '../data/types';
import { PlaceholderMedia } from './PlaceholderMedia';

export function ArticleCard({ article }: { article: Article }) {
  return (
    <article className="article-card">
      <Link to={`/blog/${article.slug}`} className="article-card-media" aria-hidden="true" tabIndex={-1}>
        {article.heroImage ? <img src={article.heroImage} alt="" loading="lazy" /> : <PlaceholderMedia note={article.heroAlt} compact />}
      </Link>
      <div className="article-card-body">
        <span className="article-kicker">
          {article.category} · <time dateTime={article.date}>{new Date(article.date).toLocaleDateString('en-BZ', { year: 'numeric', month: 'long', day: 'numeric' })}</time>
        </span>
        <h3>
          <Link to={`/blog/${article.slug}`}>{article.title}</Link>
        </h3>
        <p>{article.summary}</p>
      </div>
    </article>
  );
}
