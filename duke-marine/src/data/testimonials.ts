/**
 * Customer testimonials (placeholder).
 * TODO (client): replace with real, permissioned customer quotes.
 */
export type Testimonial = {
  quote: string;
  name: string;
  role: string;
};

export const testimonials: Testimonial[] = [
  {
    quote:
      'Duke Marine repowered our lodge skiff and had us back on the water in days. The rigging was clean and the engine ran perfect from the first start.',
    name: 'Fishing Lodge Owner',
    role: 'Placencia',
  },
  {
    quote:
      'The only shop I trust for tackle. They actually fish, so the advice is real — matched me to the right leader and lures for permit.',
    name: 'Flats Guide',
    role: 'Ambergris Caye',
  },
  {
    quote:
      'We supply our whole tour fleet through Duke Marine. Reliable stock, fair wholesale pricing, and they deliver. That keeps our boats running.',
    name: 'Tour Operations Manager',
    role: 'Belize City',
  },
];
