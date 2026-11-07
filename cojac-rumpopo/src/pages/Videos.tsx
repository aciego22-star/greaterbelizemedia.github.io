import { media } from '../content/media';
import { videosIntro } from '../content/copy';
import { usePageMeta } from '../lib/usePageMeta';
import { PageHero, Reveal } from '../components/ui';
import { FinalCta, VideoCard } from '../components/sections';
import { t } from '../i18n/lang';

export default function Videos() {
  usePageMeta('videos');
  return (
    <>
      <PageHero
        title={
          <>
            {t('Moments from the ', 'Momentos del ')}
            <em className="italic-gold">{t('Journey', 'camino')}</em>
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
            {t(
              'Videos play from YouTube or open on Facebook. YouTube videos load only when you press play, using YouTube’s privacy-enhanced mode.',
              'Los videos se reproducen desde YouTube o se abren en Facebook. Los videos de YouTube solo se cargan cuando presionas reproducir, con el modo de privacidad mejorada de YouTube.',
            )}
          </p>
        </div>
      </section>
      <FinalCta />
    </>
  );
}
