import { Link } from 'react-router-dom';
import routes from '../content/routes.json';
import { blogCategories, postPath, publishedPosts } from '../content/blog/posts';
import { usePageMeta } from '../lib/usePageMeta';
import { PageHero, Reveal, SectionHead } from '../components/ui';
import { PostCard } from '../components/blog';
import { FinalCta } from '../components/sections';
import { Sparkle } from '../components/Art';

export default function BlogIndex() {
  usePageMeta('holidayBlog');
  const posts = publishedPosts();
  const [featured, ...rest] = posts;
  return (
    <>
      <PageHero
        title={
          <>
            Holiday <em className="italic-gold">Blog</em>
          </>
        }
        lead="Rumpopo season stories from Cojac’s kitchen: flavour news, festive announcements and behind the bottle updates."
      />

      <section className="section section--paper blog-index" aria-label="Latest story">
        <div className="container">
          {featured ? (
            <Reveal>
              <PostCard post={featured} variant="featured" />
            </Reveal>
          ) : (
            <div className="blog-empty card">
              <Sparkle size={22} />
              <h2 className="display-m">Stories are on the way</h2>
              <p>The first Holiday Blog story will appear here soon.</p>
              <Link to={routes.flavours.path} className="btn">
                Find Your Flavour
              </Link>
            </div>
          )}

          {rest.length > 0 && (
            <section className="blog-more" aria-labelledby="more-stories">
              <SectionHead title={<span id="more-stories">More stories</span>} />
              <div className="blog-grid">
                {rest.map((p) => (
                  <Reveal key={p.slug}>
                    <PostCard post={p} variant="compact" headingLevel={3} />
                  </Reveal>
                ))}
              </div>
            </section>
          )}
        </div>
      </section>

      <section className="section section--cream" aria-labelledby="blog-topics">
        <div className="container">
          <SectionHead
            title={<span id="blog-topics">What the Holiday Blog covers</span>}
            lead="Follow the season in one place. New stories are added as Cojac’s shares them."
          />
          <ul className="blog-topics">
            {blogCategories.map((c, i) => {
              const inCat = posts.filter((p) => p.categories.includes(c.id));
              return (
                <Reveal as="li" key={c.id} delay={(i % 3) * 80} className="blog-topic">
                  <h3>{c.name}</h3>
                  <p>{c.description}</p>
                  {inCat.length ? (
                    <Link to={postPath(inCat[0].slug)} className="text-link">
                      {inCat.length === 1 ? 'Read the latest story' : `${inCat.length} stories`} →
                    </Link>
                  ) : (
                    <span className="blog-topic__soon">Stories coming soon</span>
                  )}
                </Reveal>
              );
            })}
          </ul>
        </div>
      </section>

      <FinalCta />
    </>
  );
}
