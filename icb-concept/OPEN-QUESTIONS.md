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

### Two email addresses the branch photographs disagree with

The first five branch photographs arrived on 3 Nov 2026, and two of
them carry a signboard with an email address on it that is not the
address in the directory ICB sent.

- **Benque Viejo Border Branch.** The sign reads
  `icb_benqueviejo@icbinsurance.com`. The directory says
  `icb_benqueagency@icbinsurance.com`. Everything else on that sign,
  the 823-2319 landline and the 613-0548 WhatsApp number, matches.
- **Benque Town Board Branch.** The sign reads
  `icb.benquetown@icbinsurance.com`, with a dot. The directory says
  `icb_benquetown@icbinsurance.com`, with an underscore. Every other
  ICB address on the site uses the underscore, so the sign is the odd
  one out, but it is the sign a walk-in customer reads. The WhatsApp
  number, 656-7521, matches.

The site publishes the directory's version of both, since that is the
document ICB sent. One of each pair is out of date and it is worth
knowing which, because a customer who emails the wrong one gets
nothing back.

Same photograph, separate point: the Benque Town Board sign titles the
office **"Benque Viejo Branch"**, not "Benque Town Board Branch". The
site uses the directory name. If the sign is the name customers know
it by, the directory name is the one to change.

### Settled: Yellow Village, Branch_01 and Branch_03

All three were identified by the client on 3 Nov 2026 from the raw
photographs ICB sent, so no tile is captioned from a guess.

- `ICB_Branch_01`, the two-storey building whose only ICB sign is a
  small INSURANCE / SEGUROS plaque, is **Corozal Town**.
- `ICB_Branch_03`, the one with the long red fascia sign and the bench
  outside, is **Independence**. Its door decals are the ones posting
  the business hours below.
- `ICB_Yellow_Village_Branch` is **Seine Bight**. The file name was
  descriptive, not a location, so there is no 23rd branch and the
  network is still 22.

### San Estevan has not been removed, and has no photograph

Asked on 3 Nov 2026 whether San Estevan had been taken off the site
earlier. It has not, and nothing in the build has ever removed it.

**San Estevan Agency is in ICB's own revised directory**, the one
reissued after the review meeting of 20 Oct 2026, with a landline of
322-0659 and `icb_sanestevan@icbinsurance.com`. It is one of the
twenty-two. It is in the branch finder, on the map, in the call
directory and in the structured data, and its gallery tile is the last
one still showing a designed plate rather than a photograph.

Two locations were removed when that revised directory arrived, which
is probably the thing being remembered:

- **San Narciso**, which was never confirmed and had been held back
  from public view before that.
- **Benque Viejo Agency**, which had been public, at #58 George Price
  Boulevard on 615-3266 and 671-1100.

Both are gone from the dataset entirely. San Estevan is not either of
them, so it stays. Taking a branch that ICB currently publishes off
the website would mean a customer in San Estevan cannot find their own
agency, and the only thing actually missing is a photograph.

**Status, 4 Nov 2026:** ICB has confirmed the photograph is coming.
Nothing further is needed and this is not on the list of things to
chase.

**Status, 6 Nov 2026:** a frame went in so that no tile in the grid is
left as a plate, but it is the village welcome sign at the entrance to
San Estevan, not the agency office, and there is no ICB building or ICB
sign in it. The tile is therefore captioned "San Estevan Village"
rather than "San Estevan Agency", so the grid does not assert that the
house behind the sign is ICB's office. The location reads as San
Estevan Agency everywhere else on the site.

When ICB's photograph of the office arrives, replace the file and
delete that entry's caption in js/data/gallery.js. Nothing else
changes.

### The street number on the Orange Walk sign

The Orange Walk signboard reads **"38 Belize Corozal Road."** The
directory ICB sent carries **"#48 Belize Corozal Road"**. The telephone
number, the WhatsApp number and the email address on that sign all
match the directory exactly, so the street number is the only thing in
disagreement.

The site publishes #48, the directory's version. It is also what the
map link searches for, so if 38 is correct the pin is pointing at the
wrong building.

### The opening hours posted on the Independence door

The door decals at Independence post:

> Monday - Friday 8:00 a.m. - 12:00 noon, 1:15 p.m. - 5:00 p.m.
> Saturday 8:30 a.m. - 12:00 noon

The hours ICB gave us, and what the site publishes, are Monday to
Friday 8:00 to 11:45 and 1:00 to 5:00, Saturday 8:00 to 12:00. Three
differences: the morning close, the afternoon open and the Saturday
open.

Either that door sign is out of date, or hours vary from branch to
branch. It matters which, because the second case means every branch
needs its own hours rather than one set for all of them. The site
already does this for the two border branches, so it is data entry
rather than a change to the build.

### Four things on the Moro Agency sign

This is the largest disagreement between a signboard and the directory
so far. The sign on the fence at the Santa Cruz Village agency reads:

| On the sign | In the directory |
| --- | --- |
| MORIO AGENCY | Moro Agency |
| Belmopan Service S. Santa Cruz Village | #22 Police Station Street, Santa Cruz Village |
| WhatsApp 669-9497 | WhatsApp 609-0497 |
| william.moreno@icbinsurance.com | William.moro@icbinsurance.com |

"Moro" and "moreno" read like the same person's name shortened, so the
likeliest reading is that the directory entry was abbreviated at some
point and the sign is the fuller version. But the WhatsApp number is
the part that matters most, because a customer who messages 609-0497
when the agency is on 669-9497 gets nothing back, and we cannot tell
from a photograph which of the two is live.

The site publishes the directory's version of all four.

### Two more email addresses, same pattern as Benque

- **Punta Gorda.** The sign reads `icb.pg@icbinsurance.com` with a dot.
  The directory says `icb_pg@icbinsurance.com` with an underscore. The
  telephone, WhatsApp and street on that sign all match.
- **San Juan.** The sign reads a two-letter prefix, then
  `.sanjuan@icbinsurance.com`. The prefix is too small in the
  photograph to read with confidence, but it is plainly not `icb_`. The
  directory says `icb_sanjuan@icbinsurance.com`. The WhatsApp number on
  the sign matches.

That is now four branch signs carrying an email address the directory
does not have: Benque Viejo Border, Benque Town Board, Punta Gorda and
San Juan. It is worth asking ICB for one authoritative list of branch
email addresses rather than settling them one at a time.

## Settled

- **www, not the bare domain.** `icbinsurance.com` already redirects to
  `www.icbinsurance.com`, and the old site's canonical and sitemap both
  use www. The build already targets www, so nothing changes.
- **Eight pages, with thirty-day view counts.** Written into
  `_redirects` at the root of this project. Three keep their address
  (`/`, `/contact`, `/claims`); four move; one is unresolved.
- **No redirects exist on the Wix site today**, so nothing has to be
  unpicked.
- **A link of ours was pointing at the wrong page of theirs.** The
  page list showed that two of the old site's addresses are named the
  opposite way round from what they contain, and our Mexican Insurance
  link had followed the name rather than the content. Corrected in
  `js/data/site.js`.

- **Travel Insurance removed entirely, 28 Oct 2026.** ICB asked for
  the `/micro-insurance` redirect to be completely removed, and
  confirmed on being asked that the Travel Insurance product goes with
  it. Both are gone: the product record, its English and Spanish pages,
  the hub card, the footer link, the resources tile, the "My next trip"
  answer in the discovery quiz, the sitemap entries, the structured
  data, the photograph, and the plane glyph and travel motif that
  nothing else used.

  `/insurance/travel` and `/micro-insurance` both answer 404 now, by
  design rather than by omission. **Do not restore either as a
  tidy-up.** If ICB brings the product back it is a fresh build, not a
  revert, because the copy on the old page described a product whose
  sales were suspended.

  The `suspended` mechanism went with it, on the same instruction. The
  flag, the branches in the product page and the product card, the
  current-status route in the discovery quiz, and the four strings that
  only those branches used are all gone. If a line of cover goes off
  sale in future it is written fresh, against whatever ICB wants said
  at the time, rather than inherited from how Travel Insurance was
  handled.
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

  **"ICB Payment Portal" means that same bank transfer route**,
  confirmed by ICB. It is not a page to log in to. ICB's wording is
  published as they wrote it, with one sentence after it saying what
  the portal actually is, because a customer who reads "portal" and
  goes looking for a login will not find one. Closed.

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
