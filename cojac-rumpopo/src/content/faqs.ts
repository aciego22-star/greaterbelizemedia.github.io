/**
 * FAQs. Only entries with `published: true` appear on the site.
 * Draft entries are question stubs waiting for an approved answer from the family —
 * write the answer, then switch `published` to true.
 */
import type { FaqItem } from '../types';

export const faqs: FaqItem[] = [
  {
    id: 'how-to-order',
    category: 'ordering',
    published: true,
    question: 'How do I place an order?',
    answer:
      'Choose your flavours on the Find Your Flavour page, select quantities and add them to your order. Review your order request, then tap “Send Order Request on WhatsApp”. WhatsApp opens with your request ready — press Send, and Cojac’s will confirm the details with you directly.',
  },
  {
    id: 'is-order-confirmed',
    category: 'ordering',
    published: true,
    question: 'Is my order confirmed once WhatsApp opens?',
    answer:
      'Not yet. The website prepares your order request; you still need to press Send in WhatsApp. Cojac’s will then confirm availability, the final total, payment arrangements and delivery or pickup details with you.',
  },
  {
    id: 'pay-online',
    category: 'ordering',
    published: true,
    question: 'Can I pay on the website?',
    answer:
      'No. There is no online payment on this website and we will never ask for card details here. Payment arrangements are agreed directly with Cojac’s when your order is confirmed.',
  },
  {
    id: 'no-whatsapp',
    category: 'ordering',
    published: true,
    question: 'What if WhatsApp doesn’t open?',
    answer:
      'Use the “Copy order details” button on the order page and paste your request into a WhatsApp chat with Cojac’s. If you are on a computer without WhatsApp installed, WhatsApp Web will open instead.',
  },
  {
    id: 'flavours-this-season',
    category: 'product',
    published: true,
    question: 'Which flavours are available this season?',
    answer:
      'Classic Vanilla started it all, and customer favourites like Peanut Delight and Pumpkin Spice have joined it over the years, alongside seasonal creations and new releases. Availability can change each season, so Cojac’s will confirm your flavours when you send your request.',
  },
  {
    id: 'contains-alcohol',
    category: 'product',
    published: true,
    question: 'Does rumpopo contain alcohol?',
    answer:
      'Yes. Our rumpopo contains alcohol and is for adults of legal drinking age only. Please enjoy responsibly.',
  },
  {
    id: 'eggy',
    category: 'product',
    published: true,
    question: 'Does it taste eggy?',
    answer: 'Rumpopo may contain eggs, but it should never taste eggy. Ours doesn’t.',
  },
  {
    id: 'allergies',
    category: 'product',
    published: true,
    question: 'I have a food allergy. Is rumpopo safe for me?',
    answer:
      'Rumpopo may contain eggs and dairy, and some flavours may contain other allergens such as nuts. Please ask Cojac’s on WhatsApp about the ingredients of any flavour before ordering.',
  },

  // ── Draft stubs: awaiting approved answers from the family ────────────────
  { id: 'prices', category: 'product', published: false, question: 'How much does a bottle cost?', answer: '' },
  { id: 'sizes', category: 'product', published: false, question: 'What bottle sizes do you offer?', answer: '' },
  { id: 'lead-time', category: 'ordering', published: false, question: 'How far in advance should I order?', answer: '' },
  { id: 'delivery-fees', category: 'delivery', published: false, question: 'How much is delivery or shipping?', answer: '' },
  { id: 'shipping-areas', category: 'delivery', published: false, question: 'Where do you ship?', answer: '' },
  { id: 'pickup', category: 'delivery', published: false, question: 'Can I pick up my order?', answer: '' },
  { id: 'payment-methods', category: 'ordering', published: false, question: 'Which payment methods do you accept?', answer: '' },
  { id: 'storage', category: 'product', published: false, question: 'How should I store my rumpopo, and how long does it keep?', answer: '' },
  { id: 'gifting', category: 'general', published: false, question: 'Do you offer gift packaging or bulk orders?', answer: '' },
  { id: 'refunds', category: 'general', published: false, question: 'What is your policy if something is wrong with my order?', answer: '' },
];

export const publishedFaqs = () => faqs.filter((f) => f.published && f.answer.trim());
