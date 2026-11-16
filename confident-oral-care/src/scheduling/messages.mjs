// Patient-facing status messages from the confident AI specification. Shared by the form and the assistant.

export function statusMessages(clinic, locale = 'en') {
  const phone = clinic.phone.label;
  if (locale === 'es') {
    return {
      confirmed: ({ dateLabel, timeLabel, bookingRef }) =>
        `Su cita está confirmada para el ${dateLabel}, a las ${timeLabel}, hora de Belice. Su referencia es ${bookingRef}. Estamos en The Boardwalk Belize, Belize City.`,
      staffReviewRecorded: 'Recibimos su solicitud. El equipo le contactará para programar la hora.',
      slotTaken: 'Ese horario acaba de ocuparse. Estas son las próximas opciones disponibles.',
      unavailable: `No puedo confirmar un horario en este momento. Llame al ${phone} o escriba a la clínica por WhatsApp.`,
    };
  }
  return {
    confirmed: ({ dateLabel, timeLabel, bookingRef }) =>
      `Your appointment is confirmed for ${dateLabel}, at ${timeLabel} Belize time. Your booking reference is ${bookingRef}. We’re at The Boardwalk Belize in Belize City.`,
    staffReviewRecorded: 'We received your request. The team will contact you to arrange a time.',
    slotTaken: 'That time has just become unavailable. Here are the next available options.',
    unavailable: `I can’t confirm a time right now. Please call ${phone} or send the practice a message on WhatsApp.`,
  };
}
