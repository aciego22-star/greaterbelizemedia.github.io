import { Link } from 'react-router-dom';
import routes from '../content/routes';
import { blogCategories, postPath, publishedPosts } from '../content/blog/posts';
import { usePageMeta } from '../lib/usePageMeta';
import { PageHero, Reveal, SectionHead } from '../components/ui';
import { PostCard } from '../components/blog';
import { FinalCta } from '../components/sections';
import { Sparkle } from '../components/Art';
import { isEs, t } from '../i18n/lang';

export default function BlogIndex() {
  usePageMeta('holidayBlog');
  const posts = publishedPosts();
  const [featured, ...rest] = posts;
  return (
    <>
      <PageHero
        title={
          <>
            {isEs ? (
              <>
                Blog <em className="italic-gold">navideño</em>
              </>
            ) : (
              <>
                Holiday <em className="italic-gold">Blog</em>
              </>
            )}
          </>
        }
        lead={t(
          'Rumpopo season stories from Cojac’s kitchen: flavour news, festive announcements and behind the bottle updates.',
          'Historias de la temporada de rumpopo desde la cocina de Cojac’s: noticias de sabores, anuncios festivos y novedades desde detrás de la botella.',
        )}
      />

      <section className="section section--paper blog-index" aria-label={t('Latest story', 'Historia más reciente')}>
        <div className="container">
          {featured ? (
            <Reveal>
              <PostCard post={featured} variant="featured" />
            </Reveal>
          ) : (
            <div className="blog-empty card">
              <Sparkle size={22} />
              <h2 className="display-m">{t('Stories are on the way', 'Las historias vienen en camino')}</h2>
              <p>{t('The first Holiday Blog story will appear here soon.', 'La primera historia del blog navideño aparecerá aquí muy pronto.')}</p>
              <Link to={routes.flavours.path} className="btn">
                {routes.flavours.nav}
              </Link>
            </div>
          )}

          {rest.length > 0 && (
            <section className="blog-more" aria-labelledby="more-stories">
              <SectionHead title={<span id="more-stories">{t('More stories', 'Más historias')}</span>} />
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
            title={<span id="blog-topics">{t('What the Holiday Blog covers', 'De qué trata el blog navideño')}</span>}
            lead={t('Follow the season in one place. New stories are added as Cojac’s shares them.', 'Sigue la temporada en un solo lugar. Se añaden nuevas historias a medida que Cojac’s las comparte.')}
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
                      {inCat.length === 1 ? t('Read the latest story', 'Leer la historia más reciente') : `${inCat.length} ${t('stories', 'historias')}`} →
                    </Link>
                  ) : (
                    <span className="blog-topic__soon">{t('Stories coming soon', 'Historias muy pronto')}</span>
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
