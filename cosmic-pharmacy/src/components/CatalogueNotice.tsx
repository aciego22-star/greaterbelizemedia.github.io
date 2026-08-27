/**
 * The catalogue-wide caveat the supplied demo pack requires. Every price in the
 * demo is a provisional estimate, and prescription status, directions and
 * suitability are unconfirmed for every item, so nothing on a product card
 * asserts them. This carries that caveat wherever products are listed.
 */
export function CatalogueNotice() {
  return (
    <p className="notice catalogue-notice">
      <strong>Demo catalogue.</strong> Prices and availability shown are provisional and subject to confirmation by Cosmic Pharmacy.
      Product information here is not medical advice. Please consult the pharmacist and follow the product label.
    </p>
  );
}
