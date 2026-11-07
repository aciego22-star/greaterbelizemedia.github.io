/**
 * MYSTERY FLAVOUR COMPETITION SETTINGS (owner editable)
 *
 * Entries are made ONLY in the comments of Cojac's official Facebook competition
 * post. The website never collects guesses.
 *
 * status
 *   'active'   guesses are open: shows how to enter + the Facebook button
 *   'closed'   guesses have closed: no invitation to guess
 *   'revealed' the flavour has been announced: shows `revealText` / `revealUrl`
 *
 * facebookContestPostUrl
 *   Paste the exact link to the official competition post (open the post on
 *   Facebook, tap Share, Copy link). While empty, the site does NOT show an
 *   "enter" button; it links to the official Facebook page instead and asks
 *   people to find the competition post there.
 */
export const contest = {
  status: 'active' as 'active' | 'closed' | 'revealed',
  facebookContestPostUrl: '',
  /** Only once the owners announce it publicly. */
  revealText: '',
  revealUrl: '',
};
