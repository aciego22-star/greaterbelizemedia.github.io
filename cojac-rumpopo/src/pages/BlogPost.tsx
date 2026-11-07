import { Link, useParams } from 'react-router-dom';
import routes from '../content/routes';
import { site } from '../content/site';
import { findPost, postPath } from '../content/blog/posts';
import { usePageMeta } from '../lib/usePageMeta';
import { BlogBody, BlogPicture, Breadcrumb, CategoryChips, PostMeta, ShareLinks } from '../components/blog';
import { ArrowIcon } from '../components/Icons';
import NotFound from './NotFound';
import { t } from '../i18n/lang';

function Article({ slug }: { slug: string }) {
  const post = findPost(slug)!;
  usePageMeta({ title: post.seoTitle, description: post.metaDescription, path: postPath(post.slug) });
  return (
    <article className="blog-article" aria-labelledby="post-title">
      <header className="blog-article__header grain on-dark">
        <div className="container blog-article__header-inner">
          <Breadcrumb items={[{ label: routes.home.nav, to: '/' }, { label: routes.holidayBlog.nav, to: routes.holidayBlog.path }, { label: post.title }]} />
          <CategoryChips post={post} />
          <h1 id="post-title" className="blog-article__title">
            {post.title}
          </h1>
          <p className="blog-article__dek">{post.dek}</p>
          <PostMeta post={post} />
        </div>
      </header>

      <figure className="blog-article__figure">
        <BlogPicture image={post.image} eager />
      </figure>

      <div className="blog-article__body">
        <BlogBody post={post} />
        <p className="blog-article__responsible">{site.alcohol.responsibleMessage}</p>
        <ShareLinks post={post} />
        <nav className="blog-article__more" aria-label={t('Keep exploring', 'Sigue explorando')}>
          <Link to={routes.holidayBlog.path} className="text-link">
            {t('← All Holiday Blog stories', '← Todas las historias del blog navideño')}
          </Link>
          <Link to={routes.story.path} className="text-link">
            {routes.story.nav} <ArrowIcon size={14} style={{ display: 'inline', verticalAlign: '-2px' }} />
          </Link>
        </nav>
      </div>
    </article>
  );
}

export default function BlogPost() {
  const { slug = '' } = useParams();
  return findPost(slug) ? <Article slug={slug} /> : <NotFound />;
}
