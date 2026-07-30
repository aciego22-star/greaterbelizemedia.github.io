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
      'Duke Marine kitted out our lodge skiff and had us back on the water in days. The gear was spot on and everything worked from day one.',
    name: 'Fishing Lodge Owner',
    role: 'Placencia',
  },
  {
    quote:
      'The only shop I trust for tackle. They actually fish, so the advice is real, matched me to the right leader and lures for permit.',
    name: 'Flats Guide',
    role: 'Ambergris Caye',
  },
  {
    quote:
      'We gear up our tour boats at Duke Marine. Reliable stock, fair pricing and a team that actually knows the gear. That keeps our boats running.',
    name: 'Tour Operations Manager',
    role: 'Belize City',
  },
];
