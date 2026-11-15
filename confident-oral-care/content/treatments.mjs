// Treatment copy from the handoff (reference/content/treatments.md).
// Category and service slugs must match config/clinic-data.json; tests check this.

export const servicesIndex = {
  title: 'Dental and orthodontic services in Belize City',
  intro: 'From a routine cleaning to a conversation about an existing crown or denture, the right place to start depends on what you’d like to address. Explore the care available at ConfiDent Oral Care. If you’re deciding which visit to request, a consultation is a place to talk through your questions.',
  metaDescription: 'Explore dental and orthodontic services at ConfiDent Oral Care, The Boardwalk Belize: consultations, preventive care, retainers, crowns, root canals, extractions, and dentures.',
};

export const categories = [
  {
    slug: 'consultations-diagnostics',
    card: 'Talk through your concerns and learn what information could help your dentist plan the next step.',
    metaDescription: 'Talk to ConfiDent Oral Care about dental consultations, orthodontic consultations, and digital X-rays at The Boardwalk Belize in Belize City.',
    introHeading: 'A place to start',
    intro: 'A consultation gives you time to explain what brought you in and ask the questions you’ve been holding on to. Your dentist can talk through the findings with you and explain whether an exam, images, or a follow-up visit would help clarify the next step.',
    sections: {
      'general-consultations': 'You can use a general consultation to discuss everyday dental care, a change you’ve noticed, or a treatment you’re considering. Bring the questions you want answered, even if you have only one. Your dentist can review your concerns and explain what an examination can establish, what may need a closer look, and how to decide what to address first.',
      'orthodontic-consultations': 'If you have questions about the position of your teeth, how your bite fits together, or orthodontic care you’ve had before, bring those questions to an orthodontic consultation. Dr. Haylock can review your goals and discuss what records or examinations may be useful. It’s also an opportunity to ask how a proposed course of care might fit into your daily routine.',
      'digital-x-rays': 'Dental X-rays can help your dentist see details that are difficult to assess by looking in the mouth alone, such as areas between teeth or around the roots. Your dentist can explain why an image may be useful for your visit and what it adds to the examination. If you have recent images, ask the office how to make them available for review.',
    },
    nextSteps: [
      { label: 'Request a consultation', href: '/appointments' },
      { label: 'Plan your first visit', href: '/first-visit' },
    ],
  },
  {
    slug: 'general-preventive-dentistry',
    card: 'Explore cleanings, preventive care, fillings, and teeth whitening.',
    metaDescription: 'Learn about cleanings, fluoride, sealants, fillings, and teeth whitening at ConfiDent Oral Care in Belize City.',
    introHeading: 'Care for everyday oral health',
    intro: 'Some visits are about keeping up with routine care. Others start with a change you’ve noticed, a filling you want checked, or a question about tooth colour. A visit gives you a chance to understand what’s involved and decide what you want to address.',
    sections: {
      cleanings: 'A professional cleaning removes buildup such as plaque and hardened tartar from areas that can be difficult to keep clean at home. You can use the visit to ask about areas that are hard to reach or changes you have noticed in your gums. If you feel nervous about sensitivity during a cleaning, let the team know so you can talk through your concerns before you begin.',
      'fluoride-treatments': 'Fluoride helps strengthen tooth enamel and reduce the risk of decay. A visit is a chance to ask whether professional fluoride would be useful for you or a family member and how it fits into your regular care. Your dentist can take into account the condition of your teeth and your history of cavities when discussing the options.',
      'dental-sealants': 'Some back teeth have deep grooves on their chewing surfaces. A sealant is a protective coating that covers those grooves and helps prevent decay in them. You can ask the dentist which teeth might benefit from sealants and what the dentist checks over time to see how a sealant is holding up.',
      fillings: 'A filling can restore part of a tooth affected by decay or certain types of damage. Your dentist can examine the area and explain whether a filling is suitable, what material options may apply, and how much of the tooth needs attention. If you’re coming in because an existing filling feels different, mention where it is and when you first noticed the change.',
      'teeth-whitening': 'If you’d like to discuss a brighter appearance, a whitening consultation can help you understand which changes may be possible. The dentist can review the colour of your natural teeth and any visible fillings or crowns, which respond differently from natural enamel. Ask about the approach available at the practice, possible sensitivity, and what a realistic result might look like for you.',
    },
    nextSteps: [
      { label: 'Ask about a visit for general dental care', href: '/appointments' },
    ],
  },
  {
    slug: 'orthodontics-protective-appliances',
    card: 'Find out about mouthguards and fixed or removable retainers.',
    metaDescription: 'Explore mouthguards, fixed retainers, and removable retainers at ConfiDent Oral Care in Belize City.',
    introHeading: 'Support for the way you use your smile',
    intro: 'The right appliance depends on what you need it to do. You might be looking for protection while playing sports, help maintaining tooth position after orthodontic care, or an assessment of a retainer you already wear. Bring your questions and any relevant appliance to discuss with the team.',
    sections: {
      mouthguards: 'A mouthguard cushions the teeth and surrounding areas during activities where there may be an impact to the mouth. If you play a sport and want to discuss a mouthguard, tell the team what you play, how often you wear protection, and whether you have an existing appliance. Those details can help the dentist discuss fit and the options available to you.',
      'fixed-retainers': 'A fixed retainer is bonded to the inside of the teeth to help maintain their position after orthodontic treatment. If you have one, you can ask how to clean around it and when to have it checked. If it feels loose or different, contact the team for an assessment so they can look at the retainer and the teeth it supports.',
      'removable-retainers': 'A removable retainer can be taken out for cleaning and is worn according to the schedule your orthodontist recommends. If an existing retainer has worn down, changed fit, or gone missing, the team can advise how to arrange a review. Bring it if you still have it so the orthodontist can assess its condition and discuss the next step.',
    },
    nextSteps: [
      { label: 'Request an orthodontic consultation', href: '/appointments' },
      { label: 'Explore consultations', href: '/services/consultations-diagnostics' },
    ],
  },
  {
    slug: 'crowns-recementation',
    card: 'Discuss a zirconia crown or have a loose or dislodged crown assessed.',
    metaDescription: 'Discuss zirconia crowns or have a loose or detached crown assessed at ConfiDent Oral Care in Belize City.',
    introHeading: 'A closer look at a tooth or crown',
    intro: 'Sometimes the conversation is about restoring a tooth. Sometimes the concern is a crown you already have. In either case, the dentist can assess the tooth and explain what is possible based on its condition, how it fits in your bite, and what you want to achieve.',
    sections: {
      'zirconia-crowns': 'A crown covers a prepared tooth to restore its shape and help it function. Zirconia is one ceramic material used for crowns. If you’re considering one, you can ask how the dentist evaluates the tooth, how colour and shape are considered, and what is involved from preparation through fitting. The appropriate option depends on the tooth and your examination.',
      'crown-recementation': 'If a crown has loosened or come off, bring it with you if you still have it. At the visit, the dentist can assess the crown, the tooth underneath, and whether the crown still fits well enough to be reattached. That assessment helps determine whether recementation is possible or whether a different visit or treatment is needed.',
    },
    nextSteps: [
      { label: 'Contact the team about a loose crown', href: '/contact' },
      { label: 'Request an assessment', href: '/appointments' },
    ],
  },
  {
    slug: 'root-canal-treatments',
    card: 'Learn about treatment for front and back teeth and assessment for retreatment.',
    metaDescription: 'Learn about front- and back-tooth root canal treatment and endodontic retreatment at ConfiDent Oral Care in Belize City.',
    introHeading: 'A discussion about preserving a tooth',
    intro: 'Root canal treatment addresses a problem in the pulp, the tissue inside a tooth, when the dentist considers the tooth suitable for this approach. An assessment can help you understand what the dentist is evaluating, what treatment would involve, and what restoration the tooth may need afterward.',
    sections: {
      'anterior-and-posterior-root-canal-treatment': 'We offer root canal treatment for anterior teeth at the front of the mouth and posterior teeth toward the back. The shape and number of canals can vary from one tooth to another. Ask the dentist what they have found in the tooth they’re evaluating, what that means for the visit, and how the tooth may be restored afterward.',
      'root-canal-retreatment': 'If a tooth that previously had root canal treatment needs further assessment, the dentist can review the existing work and discuss whether retreatment is an option. Retreatment generally involves reopening the tooth so its canals can be evaluated, cleaned, and resealed. If you have records or images from the earlier treatment, ask the clinic whether you should bring them to the consultation.',
    },
    nextSteps: [
      { label: 'Request an assessment', href: '/appointments' },
      { label: 'Ask the clinic about previous records', href: '/contact' },
    ],
  },
  {
    slug: 'extractions-oral-surgery',
    card: 'Explore tooth extractions, surgical extractions, and assessment for dry socket.',
    metaDescription: 'Learn about tooth extractions, surgical extractions, and dry socket care at ConfiDent Oral Care in Belize City.',
    introHeading: 'Understand the plan before your visit',
    intro: 'If a tooth may need to be removed, you can ask why the dentist advises it, what the appointment could involve, and how to plan for the time afterward. The examination helps the dentist explain which approach is appropriate for that tooth.',
    sections: {
      'tooth-extractions': 'An extraction is the removal of a tooth. The dentist can explain why removal is being considered, what other options may be relevant, and what follow-up the area may need. If an extraction is recommended, ask which steps you can expect at the appointment and how to reach the clinic if you have a question afterward.',
      'surgical-extractions': 'A surgical approach may be considered when the position or condition of a tooth makes it harder to access. Your dentist can explain how the tooth will be assessed, why a surgical approach may be appropriate, and what to plan around recovery. Tell the team about any practical concerns, such as travel or work commitments, when discussing the timing of your visit.',
      'dry-socket-care': 'Dry socket is a complication that can occur after an extraction. If pain increases after a tooth has been removed, call the clinic so the dental team can advise you about being seen. At an assessment, the dentist can look at the area, discuss what might be causing the discomfort, and explain what care or follow-up is appropriate.',
    },
    nextSteps: [
      { label: 'Call the clinic with a post-extraction concern', href: '/contact' },
      { label: 'Request an assessment', href: '/appointments' },
    ],
  },
  {
    slug: 'dentures-prosthodontics',
    card: 'Explore partial, temporary, immediate, and full dentures.',
    metaDescription: 'Explore partial dentures, flippers, immediate dentures, and full dentures at ConfiDent Oral Care in Belize City.',
    introHeading: 'Talk through your tooth replacement options',
    intro: 'When teeth are missing, choosing a denture can involve questions about appearance, comfort, eating, and what will happen during the fitting process. A consultation gives you room to talk through which teeth are being replaced, your preferences, and what follow-up may be needed as you adjust.',
    sections: {
      'partial-dentures': 'A partial denture replaces some missing teeth while you still have natural teeth in the same arch. At a consultation, you can discuss which spaces it would fill, how the denture fits around the teeth you have, and what would be involved in wearing and caring for it. Bring an existing partial denture if you’d like the dentist to look at its fit.',
      flippers: 'A flipper is a removable partial denture often used as a temporary option for one or more missing teeth. If you’re considering an interim replacement, ask how it might fit into your overall plan, how long the dentist expects it to be suitable for your situation, and what you should expect when speaking or eating with it.',
      'immediate-dentures': 'An immediate denture is made in advance so it can be fitted when teeth are removed, if that is part of the planned care. The fit may change as your mouth heals. At the planning visit, ask what needs preparing ahead of time and what adjustment or follow-up appointments may be appropriate for you.',
      'full-dentures': 'A full denture replaces all of the teeth in an upper or lower arch. Use the consultation to talk through the appearance you’d like, questions about fit and comfort, and how the dentist plans to review the denture after it has been fitted. If you already wear dentures, bringing them can help you show the team what you’d like to improve.',
    },
    nextSteps: [
      { label: 'Request a denture consultation', href: '/appointments' },
      { label: 'Read the denture consultation guide', href: '/blog/preparing-for-a-denture-consultation' },
    ],
  },
];
