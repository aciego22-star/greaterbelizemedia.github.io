# Open questions for ICB

Things the build is waiting on that are ICB's to decide, not ours. Each
one says what was assumed in the meantime, and what changes when the
answer comes back, so nobody has to re-derive it.

Recorded 27 Oct 2026.

---

## 1. Where a submitted claim should land

**Who decides:** ICB. This is a decision about their customers' data,
not a technical preference.

A claimant can now fill in, sign and send any of the five claim forms
from their phone. The question is where the completed form goes.

**What it does today.** Pressing Send opens the device's own share
sheet with the completed PDF and any photographs attached, ready for
WhatsApp or email to ICB. On a desktop the file is saved and a
pre-addressed email opens for it. Nothing passes through us or any
third party.

**Why that default.** The two motor forms carry an authorisation to
release medical and Social Security records. Until ICB says otherwise,
the safest arrangement is the one where that authorisation never sits
on a server belonging to neither ICB nor the claimant.

**The three options put to ICB:**

1. As built. Works today, costs nothing, nobody holds a copy. The
   claimant has to finish the share step, and ICB gets no record of a
   claim that was abandoned.
2. A tracked inbox. Claims arrive as email to a claims address with
   everything attached, through the website host's own form service.
   Better operationally. The host holds a copy. Free to 100 claims a
   month, paid above that.
3. ICB's own endpoint. Data goes nowhere but ICB. Their IT has to
   stand it up and keep it running.

**What changes:** `submit()` in `js/views/claim-form.js`, which is the
only place that decides what Send does. Nothing else moves.

---

## 2. Signatures drawn on a screen, and the stamp

**Who decides:** ICB's claims manager, and whoever advises them on it.

**The signature.** Belize's Electronic Transactions Act gives
electronic signatures legal effect, but these forms carry a declaration
that the claim is forfeited for a false statement, and the claimant
motor form contemplates a parent or guardian signing for a minor. ICB
has to confirm their claims team will accept a signature drawn on a
screen on these particular forms. Nothing should go live until they do.

**The stamp.** Several forms provide for a stamp beside the signature.
A stamp cannot be drawn on a phone. The completed PDF currently says so
in plain words rather than leaving a reader to wonder:

> Where ICB's printed form provides for a stamp, none is applied here.
> This form was completed and signed on a device.

Ask ICB what they would rather have there.

**What changes:** the closing note in `js/claim-pdf.js`, and possibly a
field in `js/data/claim-forms.js`.

---

## 3. Which Santa Cruz

**Who decides:** ICB.

The revised directory of 20 Oct 2026 places **Moro Agency** and
**Velasquez Agency** in "Santa Cruz Village" and gives no district.
Belize has more than one Santa Cruz: one in Stann Creek, one in Toledo,
one in Orange Walk.

**What was assumed.** The Stann Creek one, on the Southern Highway in
the banana belt. It is the Santa Cruz in the same corridor as ICB's
existing San Juan, Bella Vista and Independence offices, and the only
one of any size.

**What changes if it is Toledo instead:** the `district` on both records
in `js/data/locations.js` and both map pins. About a minute's work, and
the note in that file's header already says so.

**While here, two smaller ones in the same file:**

- **San Juan Village** has no published coordinates. Its pin is
  Cowpen's position, the same village pair at mile 35 of the Southern
  Highway. Worth confirming.
- **Bella Vista's** address is written in the directory as "Bella Vista
  Village, Toledo Village". Read as a slip for Toledo District and
  published that way.

---

## 4. The move to www.icbinsurance.com

**Who provides:** ICB's IT department, or whoever holds Search Console
and the Google Business Profiles.

Three things were asked for by email. All three protect what ICB
already has; none of them changes the current site.

**a. A list of the current website's page addresses.** The rebuild uses
new routes. Any old address with no new equivalent will answer 404
after the cutover, and the ranking and inbound links that page carried
go with it. Each old URL needs a 301 to its nearest new page, in a
`_redirects` file at the root. The build already ships that file if it
finds one; it is absent until there is something to put in it.

Best source first: Search Console > Indexing > Pages > Export (it also
shows which pages earn traffic); then the live site's `sitemap.xml`;
then the CMS page list. A crawl is the fallback and cannot be run from
our side.

**b. Whether Google has them indexed with or without the "www".** The
two are separate sites to a search engine. The build currently targets
`https://www.icbinsurance.com`. Match whichever one is already indexed
and redirect the other.

**c. The exact wording of the Google Business Profile listings.** The
site publishes details for all 22 locations. For Google to connect them
to ICB's map listings, the branch name, address and telephone have to
match the Business Profile entries character for character. Twenty-two
verified branch listings is the strongest local search asset ICB has.

**What changes:** `_redirects` gets written; `ICB_ORIGIN` at the top of
`build/build-static.js` if the hostname differs; the branch records in
`js/data/locations.js` if the Business Profiles disagree with them.

---

## Already flagged, still open

Smaller things raised earlier and not yet answered.

- **The Bee page's privacy section is a draft.** It needs ICB's
  sign-off before launch. Flagged at the top of `js/data/bee.js`.
- **The `noindex` comes off on launch day.** One line in `index.html`.
  It is the only thing keeping the site out of Google, and it matters
  more now that every page names ICB's domain as its own while being
  served from the agency subdomain.
- **The hurricane form's name.** Its own title page reads "PROPERTY
  CATASTROPHE CLAIM FORM"; ICB's published claims listing calls it the
  Hurricane Claim Form. The listing name is on the button, because that
  is the name a claimant was told to look for. Worth confirming.
- **The Spanish copy wants a read** by a Belizean Spanish speaker.
  This now includes 262 claim form questions.
- **Spanish URLs keep English slugs** (`/es/insurance/motor`). Fine,
  and deliberate, but worth a decision if ICB would rather they were
  translated.
