import { media } from '../content/media';
import { videosIntro } from '../content/copy';
import { usePageMeta } from '../lib/usePageMeta';
import { PageHero, Reveal } from '../components/ui';
import { FinalCta, VideoCard } from '../components/sections';

export default function Videos() {
  usePageMeta('videos');
  return (
    <>
      <PageHero
        title={
          <>
            Moments from the <em className="italic-gold">Journey</em>
          </>
        }
        lead={videosIntro}
      />
      <section className="section section--paper">
        <div className="container">
          <div className="video-grid video-grid--page">
            {media.map((m, i) => (
              <Reveal key={m.id} delay={(i % 2) * 100}>
                <VideoCard item={m} />
              </Reveal>
            ))}
          </div>
          <p className="media-fine">
            Videos play from YouTube or open on Facebook. YouTube videos load only when you press play, using YouTube’s privacy-enhanced
            mode.
          </p>
        </div>
      </section>
      <FinalCta />
    </>
  );
}
