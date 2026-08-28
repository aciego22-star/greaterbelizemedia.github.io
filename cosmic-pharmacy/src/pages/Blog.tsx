import rawArticles from '../data/articles.json';
import type { Article } from '../data/types';
import { ArticleCard } from '../components/ArticleCard';
import { usePageMeta } from '../lib/usePageMeta';

const articles = (rawArticles as Article[]).slice().sort((a, b) => b.date.localeCompare(a.date));

export function Blog() {
  usePageMeta(
    'Health & Wellness Journal | Cosmic Pharmacy',
    'Practical health and wellness reading from Cosmic Pharmacy, Belize City. Pharmacist-reviewed articles on everyday care.'
  );

  return (
    <div className="page">
      <div className="wrap page-stack">
        <section className="panel-section section-pad">
          <span className="eyebrow">Health & Wellness Journal</span>
          <h1 className="section-title">The Cosmic Blog</h1>
          <p className="section-intro">
            Practical, plain-language reading on everyday health and using the pharmacy well. Demo articles shown; published articles are
            reviewed and approved by the pharmacist before going live.
          </p>
          <div className="article-grid">
            {articles.map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
