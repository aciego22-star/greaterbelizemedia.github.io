// Patient-facing status messages from the confident AI specification. Shared by the form and the assistant.

export function statusMessages(clinic) {
  const phone = clinic.phone.label;
  return {
    confirmed: ({ dateLabel, timeLabel, bookingRef }) =>
      `Your appointment is confirmed for ${dateLabel}, at ${timeLabel} Belize time. Your booking reference is ${bookingRef}. We’re at The Boardwalk Belize in Belize City.`,
    staffReviewRecorded: 'We received your request. The team will contact you to arrange a time.',
    slotTaken: 'That time has just become unavailable. Here are the next available options.',
    unavailable: `I can’t confirm a time right now. Please call ${phone} or send the practice a message on Instagram.`,
  };
}
