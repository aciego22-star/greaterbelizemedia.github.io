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

> **Answered in part, 27 Oct 2026**, by ICB's IT department. See
> "What IT came back with" at the foot of this file. Still open from
> this section: who holds the existing Search Console property, the
> Google Business Profile listings (Mr. Awe), what is on
> `/advertisements`, and what the PDF linked from the old home page is.


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

---

# What IT came back with, 27 Oct 2026

Answers to the email of earlier that week, and what each one settled.

**The current site is Wix**, built and owned by the agency Darkfire
Digital, with ICB staff as co-owners. The domain is registered at
**Hover under ICB's own account**, and its nameservers point at Wix
(`ns1.wix.com` / `ns2.wix.com`), so the DNS records live inside Wix.
ICB has admin access to both.

**Email is Google Workspace**, billed separately from Wix.

## Settled

- **www, not the bare domain.** `icbinsurance.com` already redirects to
  `www.icbinsurance.com`, and the old site's canonical and sitemap both
  use www. The build already targets www, so nothing changes.
- **Eight pages, with thirty-day view counts.** Written into
  `_redirects` at the root of this project. Three keep their address
  (`/`, `/contact`, `/claims`); four move; one is unresolved.
- **No redirects exist on the Wix site today**, so nothing has to be
  unpicked.
- **A naming trap, now fixed.** On the old site `/micro-insurance` is
  TRAVEL insurance and `/ana-seguros-quote` is MEXICAN insurance, the
  opposite of what the names suggest. Our `mexicanInsurance` link had
  been pointing at the travel page. Corrected in `js/data/site.js`.
- **The live site lists 17 locations**, against the 22 in ICB's revised
  directory of 20 Oct. It still shows Benque Viejo Agency, which that
  revision dropped, and is missing Caye Caulker, Benque Town Board, San
  Juan, Bella Vista, Moro and Velasquez. The revised directory is the
  newer document and remains the authority.

## The DNS zone is the serious part

The zone serves far more than the website, and IT asked that it be kept
exactly as it is. Recorded here so it cannot be lost:

- **Subdomains:** `agilis-connector`, `aml`, `billing`, `kiosk`,
  `kioskprinters`, `kioskprinters2`, `onlinesales`, `printer`,
  `training`, `covernote`, `gmail`
- **Google Workspace email:** MX, SPF, Google DKIM, DMARC
- **Amazon SES DKIM:** three records
- **Verification:** the Google site-verification TXT, plus three other
  TXT verification records

IT asked to see the full zone we intend to set up before any
nameserver change. The answer is that there is no such zone, because
there is no nameserver change: the cutover is the www record, and
possibly a second record for the bare domain, with the nameservers
staying at Wix and the rest of the zone untouched.

Writing ICB's zone is not Austere's work and should not be offered.
Specifying a client's mail records carries liability we were not
engaged for and are not accountable for. If ICB ever moves the zone off
Wix, that is their IT's project with their own provider, and we are a
consumer of the result rather than its author. An earlier draft of the
reply offered to draft it; that was an overreach and was corrected
before sending.

The one thing that could complicate the simple cutover is whether Wix
keeps the rest of the records, and allows www to point outward, once
the domain is disconnected from the Wix site. That is a single question
for Wix support, not a plan.

## Still open from this round

- **Who owns the existing Search Console property.** A Google
  verification TXT is already in the zone, so a property probably
  exists under somebody's account, most likely the agency that built
  the Wix site. IT is finding out. A newly verified property shows the
  site's historical data anyway, so this is a convenience rather than a
  blocker. Either way the existing verification record must not be
  removed.
- **The Google Business Profile listings.** None is linked in Wix,
  which does not mean none exists. Mr. Awe is updating the location
  list and will work with us on the profiles.
## Closed since

- **`/advertisements`** (25 views a month) is ICB's video
  advertisements and nothing else. Redirected to `/gallery`, where two
  of those films already live; the older ones are not being carried
  over. Confirmed with ICB, 27 Oct 2026.
- **The PDF linked from the old home page** is not significant and the
  content worth keeping is already carried across. No redirect.
  Confirmed with ICB, 27 Oct 2026.
- **The location count.** Mr. Sal confirmed 22. The Contact page's 17
  is several years out of date, so the revised directory of 20 Oct
  stands as the authority and no change is needed.

---

# ICB's FAQ, 27 Oct 2026

Mr. Sal supplied "ICB FAQ Web Site 26.10.26 v2". Eighty-three questions
are now in `js/data/faq.js`, on `/faq` in full and in context on the
pages they belong to.

**It was written for Bee, not for a website.** Several answers are in
the assistant's first person ("Tell me your district and I can help you
find an office near you"), and the document ends with fallback scripts
for when the assistant does not understand. Those scripts are not on
the site. The first-person answers were put into the site's voice and
each one is marked VOICE in a comment beside it, so the change is
visible and can be reversed.

**The same document should also go into Bee's knowledge base**, more or
less as written. That is what it was for, and it is a better answer set
than Bee has now.

## Settled by it

- The four wire transfer sheets (USD, CAD, EUR, GBP) are on the
  payments page. They exist in the document only as images; every line
  was read off those images.
- The three local bank accounts in the FAQ match `js/data/payments.js`
  digit for digit.
- The opening hours in the FAQ match what we built, borders included.
- It supplies, for the first time, what a claim requires: the motor and
  property document lists, what to do at the scene, after a fire, after
  a theft, after a hurricane. The claims page can now carry that,
  because ICB has said it.

## Answered, 27 Oct 2026

- **No online payments.** ICB does not take payments through the
  website. The kiosk on their network is a physical insurance terminal
  near the border; `billing` and `onlinesales` are unrelated to the
  public site. The payments page stands as written.

  One consequence: ICB's FAQ lists "ICB Payment Portal" among accepted
  payment methods, which contradicts that. It is **held back** from the
  published answer, because publishing it would send a customer looking
  for something that is not there. The bank transfer route, which is
  real, is named instead. The full original sentence is quoted in the
  comment above that answer in `js/data/faq.js`, and restoring it is
  one line.

  **ICB should settle the final wording of that one answer.** Either
  the portal is dropped from their document, or it means something we
  have not understood.

- **The Claims Department WhatsApp, 613-0579, is on the site.** Added
  as a department rather than as a branch: it has no address, no
  opening hours and no district, so putting it in the location dataset
  would place a telephone number on the map as though someone could
  walk into it. It now leads the WhatsApp directory under
  "Departments", and has its own row on the claims page for the errand
  the pathways do not serve, chasing a claim already reported.

- **Nationwide Cash Express** is a separate rebuild that may follow
  this one. Left as ICB wrote it in the FAQ, not built out.

- **The wire sheets are current**, received from ICB on 27 Oct 2026.
  No further confirmation needed.
