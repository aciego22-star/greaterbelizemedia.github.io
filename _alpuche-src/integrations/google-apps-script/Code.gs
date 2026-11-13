/**
 * Alpuche AI: enquiry delivery by email (Google Apps Script web app).
 *
 * Free: runs on Google's servers and sends from the Gmail account that deploys it.
 * Each enquiry sends one email to LEAD_INBOX and, if the visitor gave an email address,
 * one confirmation to the visitor. A personal Gmail account can send to roughly 100
 * recipients a day this way (Google Workspace: about 1,500), so DAILY_LIMIT defaults to 40.
 *
 * Setup: see SETUP-EMAIL.md next to this file.
 */

var CONFIG = {
  // Where enquiries are delivered. During the demo use your own inbox; switch to the
  // firm's address only after the firm approves the workflow and privacy notice.
  LEAD_INBOX: 'you@example.com',
  // Display name on both emails.
  SENDER_NAME: 'Alpuche AI (demo)',
  // Shown at the start of both subjects. Set to '' when the firm goes live.
  SUBJECT_PREFIX: '[Demo] ',
  FIRM_NAME: 'José M. Alpuche, Attorney-at-Law',
  OFFICE_PHONE: '+501 223-1194',
  OFFICE_EMAIL: 'contact@alpuchelaw.com',
  SEND_CONFIRMATION: true,
  // Maximum enquiries accepted per day (Belize time). Each can use 2 of the daily email quota.
  DAILY_LIMIT: 40,
  // The same email address or phone number can send one enquiry per this many minutes.
  COOLDOWN_MINUTES: 30,
  TIME_ZONE: 'America/Belize',
};

var AREAS = {
  'real-estate': 'Real Estate',
  'corporate-commercial': 'Corporate & Commercial',
  'banking-finance-tax-regulatory': 'Banking, Finance, Tax & Regulatory',
  'dispute-resolution': 'Dispute Resolution',
  'intellectual-property': 'Intellectual Property',
  'family-law': 'Family Law',
  'qualified-retired-persons': 'Qualified Retired Persons Programme',
  'other': 'Not sure / other',
};
var CHANNELS = { email: 'Email', phone: 'Phone call', whatsapp: 'WhatsApp' };
var DATES = { yes: 'Yes', no: 'No', unsure: 'Not sure' };

function doGet() {
  return json_({ ok: true, service: 'Alpuche AI enquiry endpoint' });
}

function doPost(e) {
  try {
    var body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    var lead = validate_(body);
    // Honeypot: the real assistant always sends this empty. Pretend success, send nothing.
    if (body.website) return json_({ ok: true, ref: lead.ref });

    var lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      checkLimits_(lead);
    } finally {
      lock.releaseLock();
    }

    var needed = lead.email && CONFIG.SEND_CONFIRMATION ? 2 : 1;
    if (MailApp.getRemainingDailyQuota() < needed) return json_({ ok: false, error: 'quota' });

    MailApp.sendEmail(officeEmail_(lead));
    if (CONFIG.SEND_CONFIRMATION && lead.email) MailApp.sendEmail(confirmationEmail_(lead));
    return json_({ ok: true, ref: lead.ref });
  } catch (err) {
    return json_({ ok: false, error: String((err && err.message) || err).slice(0, 60) });
  }
}

// ---------------------------------------------------------------------------
// Validation: accept only the fields the assistant collects, in the shapes it sends.
// ---------------------------------------------------------------------------
function validate_(b) {
  var name = String(b.name || '').replace(/[^A-Za-zÀ-ÖØ-öø-ÿĀ-žḀ-ỿ' -]/g, ' ').replace(/\s+/g, ' ').trim();
  if (name.length < 2 || name.length > 60) throw new Error('name');

  var channel = String(b.channel || '');
  if (!CHANNELS[channel]) throw new Error('channel');

  var email = String(b.email || '').trim();
  if (email && (email.length > 120 || !/^[^\s@<>()[\],;:"]+@[^\s@<>()[\],;:"]+\.[A-Za-z]{2,}$/.test(email))) throw new Error('email');
  if (channel === 'email' && !email) throw new Error('email');

  var phone = String(b.phone || '').replace(/[^\d+]/g, '');
  var digits = phone.replace(/\D/g, '');
  if (phone && (digits.length < 7 || digits.length > 15)) throw new Error('phone');
  if ((channel === 'phone' || channel === 'whatsapp') && !phone) throw new Error('phone');

  var area = AREAS[b.area] ? b.area : 'other';
  var upcomingDate = DATES[b.upcomingDate] ? b.upcomingDate : 'unsure';

  var description = String(b.description || '').replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim();
  if (description.length < 5 || description.length > 500) throw new Error('description');

  var ref = /^JMA-[A-Z0-9]{5}$/.test(String(b.ref || '')) ? b.ref : 'JMA-' + Utilities.getUuid().replace(/-/g, '').slice(0, 5).toUpperCase();
  var page = /^\/[a-z0-9\/-]{0,100}$/.test(String(b.page || '')) ? b.page : '/';

  return { ref: ref, name: name, channel: channel, email: email, phone: phone, area: area, upcomingDate: upcomingDate, description: description, page: page };
}

function checkLimits_(lead) {
  var props = PropertiesService.getScriptProperties();
  var key = 'count-' + Utilities.formatDate(new Date(), CONFIG.TIME_ZONE, 'yyyy-MM-dd');
  var count = Number(props.getProperty(key) || 0);
  if (count >= CONFIG.DAILY_LIMIT) throw new Error('daily-limit');

  var cache = CacheService.getScriptCache();
  var ids = [lead.email && 'e:' + lead.email.toLowerCase(), lead.phone && 'p:' + lead.phone].filter(Boolean);
  for (var i = 0; i < ids.length; i++) if (cache.get(ids[i])) throw new Error('cooldown');

  props.setProperty(key, String(count + 1));
  for (var j = 0; j < ids.length; j++) cache.put(ids[j], '1', Math.min(21600, CONFIG.COOLDOWN_MINUTES * 60));
}

// ---------------------------------------------------------------------------
// Emails
// ---------------------------------------------------------------------------
function rows_(lead) {
  var r = [
    ['Reference', lead.ref],
    ['Matter', AREAS[lead.area]],
    ['Name', lead.name],
    ['Contact by', CHANNELS[lead.channel]],
  ];
  if (lead.email) r.push(['Email', lead.email]);
  if (lead.phone) r.push(['Phone', lead.phone]);
  r.push(['Date coming up', DATES[lead.upcomingDate]]);
  r.push(['Message', lead.description]);
  r.push(['Sent from page', lead.page]);
  return r;
}

function officeEmail_(lead) {
  var rows = rows_(lead);
  var text = 'New enquiry from Alpuche AI\n\n' + rows.map(function (x) { return x[0] + ': ' + x[1]; }).join('\n') +
    '\n\nCheck for conflicts before discussing details. The visitor was told that sending an enquiry does not create an attorney–client relationship.' +
    (lead.upcomingDate === 'yes' ? '\n\nThe visitor says a hearing, deadline or closing date is coming up. They were asked to call the office as well.' : '');
  var html = '<p><strong>New enquiry from Alpuche AI</strong></p><table cellpadding="4" style="border-collapse:collapse">' +
    rows.map(function (x) { return '<tr><td style="color:#555;vertical-align:top">' + esc_(x[0]) + '</td><td>' + esc_(x[1]) + '</td></tr>'; }).join('') +
    '</table><p style="color:#555">Check for conflicts before discussing details. The visitor was told that sending an enquiry does not create an attorney–client relationship.</p>' +
    (lead.upcomingDate === 'yes' ? '<p><strong>A hearing, deadline or closing date is coming up.</strong> The visitor was asked to call the office as well.</p>' : '');
  var msg = {
    to: CONFIG.LEAD_INBOX,
    subject: CONFIG.SUBJECT_PREFIX + 'New enquiry: ' + AREAS[lead.area] + ' (' + lead.ref + ')',
    body: text,
    htmlBody: html,
    name: CONFIG.SENDER_NAME,
  };
  if (lead.email) msg.replyTo = lead.email;
  return msg;
}

// The confirmation never repeats the visitor's own message, so the endpoint can't be used
// to send arbitrary text to arbitrary addresses.
function confirmationEmail_(lead) {
  var how = { email: 'email', phone: 'phone', whatsapp: 'WhatsApp' }[lead.channel];
  var text = 'Dear ' + lead.name + ',\n\n' +
    'Thank you for contacting the office of ' + CONFIG.FIRM_NAME + ' about ' + AREAS[lead.area] + '. ' +
    'Your enquiry (reference ' + lead.ref + ') has been passed to the office, which will contact you by ' + how + '.\n\n' +
    'If a hearing, deadline or closing date is close, please call ' + CONFIG.OFFICE_PHONE + '. ' +
    'Please do not send confidential documents by email until the office tells you how to share them.\n\n' +
    'This is an automated confirmation from Alpuche AI, the firm\'s website assistant. ' +
    'Sending an enquiry does not create an attorney–client relationship.';
  var html = '<p>Dear ' + esc_(lead.name) + ',</p><p>Thank you for contacting the office of ' + esc_(CONFIG.FIRM_NAME) + ' about ' + esc_(AREAS[lead.area]) +
    '. Your enquiry (reference <strong>' + esc_(lead.ref) + '</strong>) has been passed to the office, which will contact you by ' + esc_(how) + '.</p>' +
    '<p>If a hearing, deadline or closing date is close, please call ' + esc_(CONFIG.OFFICE_PHONE) + '. Please do not send confidential documents by email until the office tells you how to share them.</p>' +
    '<p style="color:#555">This is an automated confirmation from Alpuche AI, the firm\'s website assistant. Sending an enquiry does not create an attorney–client relationship.</p>';
  return {
    to: lead.email,
    subject: CONFIG.SUBJECT_PREFIX + 'We received your enquiry (' + lead.ref + ')',
    body: text,
    htmlBody: html,
    name: CONFIG.SENDER_NAME,
    replyTo: CONFIG.LEAD_INBOX,
  };
}

function esc_(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Run this once from the editor (select testSend, press Run) to grant Gmail permission and
 * send yourself a sample enquiry and confirmation. It does not count towards DAILY_LIMIT.
 */
function testSend() {
  var lead = validate_({
    name: 'Test Visitor', channel: 'email', email: CONFIG.LEAD_INBOX, area: 'real-estate', upcomingDate: 'no',
    description: 'Test enquiry: buying land near Placencia.', page: '/practice-areas/real-estate/',
  });
  MailApp.sendEmail(officeEmail_(lead));
  if (CONFIG.SEND_CONFIRMATION) MailApp.sendEmail(confirmationEmail_(lead));
  Logger.log('Sent test enquiry ' + lead.ref + ' to ' + CONFIG.LEAD_INBOX + '. Remaining daily quota: ' + MailApp.getRemainingDailyQuota());
}
