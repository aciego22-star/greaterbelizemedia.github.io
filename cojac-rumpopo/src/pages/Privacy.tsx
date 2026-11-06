import { site } from '../content/site';
import { usePageMeta } from '../lib/usePageMeta';
import { PageHero } from '../components/ui';

export default function Privacy() {
  usePageMeta('privacy');
  return (
    <>
      <PageHero eyebrow="The fine print" title="Privacy & Responsible Enjoyment" />
      <section className="section section--paper">
        <div className="container--narrow prose">
          <h2>Your order request</h2>
          <p>
            This website has no accounts, no online checkout and no payment processing. When you build an order request, your selections and
            any details you type (such as your name, area or notes) are kept only in your own browser so they aren’t lost if you refresh the
            page. You can clear them at any time with “Clear order request”.
          </p>
          <p>
            Nothing is sent anywhere until you choose to send it. Pressing “Send Order Request on WhatsApp” opens WhatsApp with your message
            ready; you decide whether to press Send.
          </p>
          <h2>WhatsApp</h2>
          <p>
            WhatsApp is a separate service operated by Meta Platforms and has its own terms and privacy policy. Once you send your message,
            it is handled by WhatsApp and by {site.brandName} to arrange your order. Please never share card numbers or other payment details
            in chat.
          </p>
          <h2>Videos</h2>
          <p>
            YouTube videos load only after you press play and use YouTube’s privacy-enhanced mode. Facebook videos open on Facebook. These
            services have their own privacy policies.
          </p>
          <h2>Analytics &amp; cookies</h2>
          <p>This website does not use analytics, advertising trackers or marketing cookies.</p>
          <h2>Responsible enjoyment</h2>
          <p>
            Rumpopo contains alcohol. Our products are intended only for adults of legal drinking age ({site.alcohol.legalAge}+). We do not
            market to minors. Please enjoy responsibly, and never drink and drive.
          </p>
          <h2>Allergies</h2>
          <p>
            Rumpopo may contain eggs and dairy, and some flavours may contain other allergens such as nuts. Please ask about the ingredients
            of any flavour before ordering.
          </p>
          <h2>Accessibility</h2>
          <p>
            We want everyone to be able to browse and send an order request comfortably. This site supports keyboard navigation, screen
            readers and reduced-motion settings. If anything is difficult to use, please let us know on WhatsApp.
          </p>
        </div>
      </section>
    </>
  );
}
