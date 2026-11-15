// Page copy from the handoff (reference/content/website-copy.md).
// Contact details and hours are NOT written here: they come from config/clinic-data.json.

export const home = {
  metaDescription: 'Dental and orthodontic care with Dr. Brittni Haylock, DDS & Orthodontist, at The Boardwalk Belize in Belize City. Explore services or request an appointment.',
  hero: {
    title: 'Where confidence begins',
    location: 'Dental and orthodontic care at The Boardwalk Belize, Belize City.',
    body: 'Meet Dr. Brittni Haylock and find a place to start, whether you’re due for a cleaning, have a question about your teeth, or want to explore orthodontic care.',
  },
  meet: {
    title: 'Meet Dr. Brittni Haylock',
    body: 'There’s value in having time to talk through what brought you in. At ConfiDent Oral Care, you can begin with a consultation, ask about your options, and decide on the next step with your dental team.',
    cta: 'Meet Dr. Haylock',
  },
  services: {
    title: 'Dental care for the questions you have today',
    body: 'If you know what you’re looking for, explore our services. If you’re unsure where to begin, a consultation gives you a place to ask.',
  },
  firstVisit: {
    title: 'Your first visit',
    body: 'Tell us what you’d like to discuss. You can ask about an examination, a treatment you’re considering, or the next step after care you’ve had elsewhere.',
    cta: 'What to expect',
  },
  inside: {
    title: 'Inside ConfiDent',
    body: 'Take a look around our reception and see photos from opening day at The Boardwalk.',
    cta: 'View the gallery',
  },
  blog: {
    title: 'From the dental blog',
    body: 'Find plain-language guides to help you prepare for a visit and ask better questions about your care.',
    cta: 'Read the dental blog',
  },
};

export const about = {
  metaDescription: 'Meet Dr. Brittni Haylock, DDS & Orthodontist, at ConfiDent Oral Care, a dental and orthodontic practice at The Boardwalk Belize in Belize City.',
  title: 'Meet Dr. Brittni Haylock',
  paragraphs: [
    'Dr. Brittni Haylock is a dentist and orthodontist at ConfiDent Oral Care, a practice at The Boardwalk Belize in Belize City.',
    'You might be looking for a place to keep up with routine dental care, get an existing restoration checked, or talk through what orthodontic care could involve. A consultation gives you and your dental team a chance to discuss your priorities and the options that may suit you.',
  ],
};

export const firstVisit = {
  metaDescription: 'Prepare for your first visit to ConfiDent Oral Care in Belize City: what to discuss, what to bring, and how to arrange an appointment.',
  title: 'Your first visit',
  steps: [
    {
      title: 'Start with what you’d like to talk about',
      body: 'When you request a visit, choose a general or orthodontic consultation if that is the kind of appointment you’re looking for. If you’re unsure what to choose, the team can help you find the appropriate starting point.',
    },
    {
      title: 'Bring the questions that matter to you',
      body: 'Write down anything you would like to cover, from a dental concern to questions about comfort, timing, or fees. If you have previous X-rays, records, or an appliance you want checked, call the practice ahead of time to ask what to bring.',
    },
    {
      title: 'Talk through the next step',
      body: 'The dentist can explain the findings from your visit, whether more information is needed, and what follow-up may be appropriate. You can ask which decisions can wait and what to expect at a future appointment.',
    },
  ],
};

export const gallery = {
  metaDescription: 'Photos of the reception and opening day at ConfiDent Oral Care, The Boardwalk Belize, Belize City, plus clinic videos.',
  title: 'A look inside ConfiDent',
  intro: 'Explore the reception and opening-day photos from our practice at The Boardwalk Belize.',
  photos: [
    {
      id: 'reception',
      title: 'Our reception',
      alt: 'White reception desk and gold ConfiDent signage inside the practice',
      landscape: 'reception-desktop',
      portrait: 'reception-mobile',
      landscapeWidths: [768, 1200, 1672],
      portraitWidths: [480, 720, 941],
      size: { landscape: [1672, 941], portrait: [941, 1672] },
    },
    {
      id: 'opening-day',
      title: 'Opening day at The Boardwalk',
      alt: 'Opening-day portrait outside ConfiDent beside white and gold balloons and the welcome sign',
      landscape: 'opening-desktop',
      portrait: 'opening-mobile',
      landscapeWidths: [768, 1200, 1672],
      portraitWidths: [480, 720, 941],
      size: { landscape: [1672, 941], portrait: [941, 1672] },
    },
    {
      id: 'celebration',
      title: 'Celebrating opening day',
      alt: 'Two members of the ConfiDent team holding a tooth-shaped balloon in front of the gold ConfiDent sign',
      single: 'team-celebration',
      widths: [640, 1284],
      size: [1284, 829],
    },
    {
      id: 'reception-desk',
      title: 'At the reception desk',
      alt: 'A member of the ConfiDent team at the reception desk beside white roses, under the gold ConfiDent sign',
      single: 'reception-team',
      widths: [640, 1066],
      size: [1066, 1600],
    },
    {
      id: 'waiting-area',
      title: 'In the waiting area',
      alt: 'Two members of the ConfiDent team seated on the white sofa in the softly lit waiting area',
      single: 'waiting-area',
      widths: [640, 1066],
      size: [1066, 1600],
    },
  ],
  videosTitle: 'Videos',
  videosPlaceholder: 'Our clinic tour, A look around ConfiDent, is on its way. In the meantime, see more from the practice on Instagram.',
  instagramCta: 'See ConfiDent on Instagram',
};

export const appointments = {
  metaDescription: 'Request an appointment at ConfiDent Oral Care in Belize City. Ask confident AI, use the booking form, call +501 628-8233, or send an Instagram DM.',
  title: 'Request an appointment',
  intro: 'Choose a visit type or ask confident AI to help you find a starting point. You can also reach the team by phone or Instagram DM.',
};

export const contact = {
  metaDescription: 'Contact ConfiDent Oral Care at The Boardwalk Belize, Belize City: phone, email, posted hours, directions, Instagram, and Facebook.',
  title: 'Visit us at The Boardwalk',
  arrange: 'Call the clinic or message us on Instagram to arrange a visit. Email is available for general enquiries.',
  hoursNote: 'The clinic’s hours announcement lists 5 p.m. as the last appointment slot and 6 p.m. as closing time. Call the clinic to confirm late appointments.',
};
