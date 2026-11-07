import { site } from '../content/site';
import { usePageMeta } from '../lib/usePageMeta';
import { PageHero } from '../components/ui';
import { isEs, t } from '../i18n/lang';

export default function Privacy() {
  usePageMeta('privacy');
  return (
    <>
      <PageHero title={t('Privacy & Responsible Enjoyment', 'Privacidad y consumo responsable')} />
      <section className="section section--paper">
        {isEs ? (
        <div className="container--narrow prose">
            <h2>Tu pedido</h2>
            <p>
              Este sitio web no tiene cuentas, ni caja en línea, ni procesamiento de pagos. Cuando armas un pedido, tus selecciones y los datos que
              escribes (como tu nombre, zona o notas) se guardan solo en tu propio navegador para que no se pierdan si recargas la página. Puedes
              borrarlos en cualquier momento con “Vaciar pedido”.
            </p>
            <p>
              No se envía nada hasta que tú decides enviarlo. Al presionar “Enviar pedido por WhatsApp” se abre WhatsApp con tu mensaje listo;
              tú decides si presionas Enviar.
            </p>
            <h2>WhatsApp</h2>
            <p>
              WhatsApp es un servicio independiente operado por Meta Platforms y tiene sus propios términos y política de privacidad. Una vez que
              envías tu mensaje, lo manejan WhatsApp y {site.brandName} para coordinar tu pedido. Nunca compartas números de tarjeta ni otros datos
              de pago en el chat.
            </p>
            <h2>Videos</h2>
            <p>
              Los videos de YouTube solo se cargan cuando presionas reproducir y usan el modo de privacidad mejorada de YouTube. Los videos de
              Facebook se abren en Facebook. Estos servicios tienen sus propias políticas de privacidad.
            </p>
            <h2>Mapas</h2>
            <p>
              El mapa de Google en nuestra página Conecta con nosotros solo se carga cuando tocas “Mostrar mapa”. A partir de ese momento se aplica
              la política de privacidad de Google al mapa.
            </p>
            <h2>Analítica y cookies</h2>
            <p>Este sitio web no usa analítica, rastreadores publicitarios ni cookies de marketing.</p>
            <h2>Consumo responsable</h2>
            <p>
              El rumpopo contiene alcohol. Nuestros productos son solo para adultos mayores de edad ({site.alcohol.legalAge}+). No hacemos
              publicidad dirigida a menores. Disfrútalo con responsabilidad y nunca manejes después de beber.
            </p>
            <h2>Alergias</h2>
            <p>
              El rumpopo puede contener huevo y lácteos, y algunos sabores pueden contener otros alérgenos, como nueces o maní. Pregunta por los
              ingredientes de cualquier sabor antes de pedir.
            </p>
            <h2>Accesibilidad</h2>
            <p>
              Queremos que todas las personas puedan navegar y enviar un pedido con comodidad. Este sitio funciona con teclado, lectores de
              pantalla y la opción de reducir el movimiento. Si algo te resulta difícil de usar, avísanos por WhatsApp.
            </p>
          </div>
        ) : (
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
            <h2>Maps</h2>
            <p>
              The Google Map on our Connect With Us page loads only after you tap “Show map”. Google’s privacy policy then applies to the
              map.
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
        )}
      </section>
    </>
  );
}
