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

## What's New at ICB: the kiosk entry, now cleared

Added 7 Nov 2026 with the section itself, held as a draft because it
described an insurance product nobody at ICB had confirmed.

**Cleared 8 Nov 2026.** The client pointed us at ICB's own short-term
motor insurance site, which answers it in ICB's words: the vehicle
types it covers, the five coverage periods, every detail the purchase
process asks for, that payment is by card, and the Schedule 1 a driver
must print and display on the windscreen under Chapter 231. The
article now carries all of that and the draft flag is gone.

What nobody publishes anywhere is the kiosk's own opening hours, so
the article does not state them. That is the only piece still missing
and it does not hold anything up.

The one flag left in `js/data/news.js` is `launchDay: true` on the
launch announcement, which is only true once the site is live on ICB's
own domain. DEPLOY.md's checklist asks whoever ships it to check that
date against the real cutover day.

## What's New: two decisions that were taken as defaults

**Spanish articles keep the English address.** `/es/news/icb-claimsvault-belize`
rather than a translated slug. The copy packs suggest Spanish slugs,
and adopting them would give every article two addresses, two sets of
canonicals and two things to keep in step. This follows the rule the
rest of the site already follows, and it is the same open question that
is listed further down for the other Spanish URLs. One decision would
settle both.

**Each article's publication date is the day it went on this site**,
7 Nov 2026, and it is shown at the foot of the article and declared in
the structured data. The date of the thing itself, the conference in
February and the ClaimsVAULT launch in July, is shown separately at the
top with its own label. They are two different dates and a reader
should be able to tell which is which.

If the site goes live much later than November, those publication dates
are worth refreshing to the real launch date. One field per entry in
`js/data/news.js`.

## The nine claim forms, and four small things on the paper

ICB sent nine claim forms on 7 Nov 2026. Five were the ones already on
the site. Four were new and are now live, downloadable and fillable
online in both languages: **windscreen, inland cargo, public liability
and personal accident**.

Four things came out of reading them side by side with what we hold.

### 1. The marine form ICB resent has a typo the one we hold does not

The copy on the site reads "ALL FACTS MATERIAL TO THE QUESTION OF
INSURANCE LIABILITY ARE STATED ABOVE OR **ATTACHED** HERETO". The file
resent on 7 Nov reads "**ATTACKED** HERETO". Everything else in the two
files matches.

We kept the one we hold, because it reads correctly and it is what
claimants have been downloading. Worth ICB correcting the master file.

### 2. The property form ICB resent moves one field

The version on the site has "Sum Insured" and "Contact Number" on one
line, then "Name of Insured" below. The version resent on 7 Nov drops
the separate contact field and asks for "Name of Insured & Phone
Numbers" instead.

We kept the one we hold, which keeps the phone number in a field of its
own. Which is current? If it is the new one, it is a two-minute change.

### 3. Two slips in the printed text of the new forms

Neither is ours and neither changes what is being asked, but both would
look like ours on a polished page, so the online forms ask the question
in correct English and the PDFs are untouched:

- The public liability form asks "Where did the accident **occurred**".
- The windscreen form says "PLEASE ATTACH PROFORMA INVOICE/ ESTIMATE TO
  **THE IS** FORM".

Declarations, releases and anything a claimant signs under are
reproduced exactly as printed, slips included.

### 4. The stamp, which turned out not to be a question

**Settled 7 Nov 2026 and no longer waiting on ICB.**

Six of the nine forms print a stamp line beside the signature: both
motor forms, property, the hurricane form, inland cargo and public
liability. Marine, windscreen and personal accident do not.

An earlier version of this build treated that as a blocker, on the
grounds that a rubber stamp cannot be drawn on a phone, and the
completed PDF apologised for not having one. That was the wrong
reading of it. The public liability form spells out what the other
five abbreviate to "(& Stamp)":

> Where signing on behalf of a Company please affix official stamp

It is a business's rubber stamp, wanted only when someone signs for a
company. An individual signs their name and that is the whole of it.
Raised with Mr Sal around the branch photographs, his reaction was to
wonder why a claim form would want a postage stamp, which says how
small a thing this is and that the question as we first put it was the
confusing part.

**What the site does now.** On the six forms that have the line, the
signature step says plainly what the stamp is and that a signature is
all an individual needs, and the completed PDF carries the same
sentence instead of an apology. A business that stamps its paperwork
is told it can print the finished form and stamp it. The other three
forms say nothing, because their paper says nothing.

Nothing here is a statement about what ICB will accept. If the claims
team ever wants a stamped copy from a company, that is between them
and the claimant, and the printed form is still there to stamp.

### And one thing to confirm about the personal accident form

That form has a whole section only an attending physician can fill in.
ICB's own form says "Complete this Section or attach an itemized bill",
so the online version asks it, marks it plainly as the doctor's to
complete, and tells the claimant it can be left blank if the bill is
attached. Confirm the claims team is content to receive it that way,
since it is the only one of the nine that cannot be finished by the
claimant alone.

## Settled on 7 Nov 2026 by reading ICB's own live site

This session gained outbound network access, so a run of things on
this list stopped being questions. ICB's current site, the one being
replaced, was read directly, along with its claim form PDFs and
icbcovernote.com.

**One thing to understand first:** ICB's live site is OLDER than the
directory they sent on 20 Oct. It lists seventeen locations, not
twenty-two, and still carries the Benque Viejo Agency the revision
removed. So where the two disagree, the directory wins. Where they
agree, the question is closed.

### Closed outright

| Question | Answer |
| --- | --- |
| Orange Walk: 38 or 48 Belize Corozal Road? | **#48.** What ICB publishes and what we hold. The signboard's 38 is the outlier. |
| Southside: 26A-C or #38 Central American Boulevard? | **#38.** Same: ICB publishes it, we hold it, the sign is the outlier. |
| Benque Viejo Border email | **icb_benqueagency@** — ICB publishes it, we hold it. The sign's icb_benqueviejo@ is the outlier. |
| Punta Gorda email | **icb_pg@** with the underscore. ICB publishes it, we hold it. |
| Which marine and property claim forms are current? | **The ones we serve.** All five of our PDFs are byte-for-byte identical to the files ICB's claims page serves today. The marine and property files resent on 7 Nov are not. |
| Is "Hurricane Claim Form" ICB's name for it? | **Yes**, that is the wording on their claims page, even though the PDF's own title page says Property Catastrophe. |
| Is icbcovernote.com ICB's? | **Yes.** It titles itself "ICB Kiosk Landing", is signed Insurance Corporation of Belize, and carries ICB's telephone, email and website. Safe to link. |
| The ANA Seguros direct links | **Found**, on ICB's own Mexican Insurance page. Claims and FAQs now go straight to ANA. |

Every telephone number, WhatsApp number and email address we hold for
the seventeen locations ICB still publishes matches their site exactly.
Not one difference.

### Confirmed by a second source

Two of the three address changes in the 20 Oct revision are now backed
by the photographs as well as the directory, against ICB's older live
site:

- **San Pedro.** Live site says Pescador Drive. The directory and the
  signboard in the photograph both say Coconut Drive.
- **Punta Gorda.** Live site says #31 Main Middle Street. The
  directory and the signboard both say George Price Street.

### Answered by the client, 8 Nov 2026

**Where the directory and anything else disagree, the directory wins.**
That settles the last of them, and in every case the site already
publishes the directory's version, so nothing had to change:

- **Independence address.** 219, Corner of Hercules & Toucan Streets,
  not the live site's New School St.
- **Moro Agency WhatsApp.** 609-0497, not the signboard's 669-9497.
- **Benque Town Board email.** icb_benquetown@ with the underscore,
  not the sign's icb.benquetown@ with a dot.
- **San Juan email.** icb_sanjuan@, not the two-letter prefix on the
  sign.

**ICB's own site being four claim forms behind is not worth raising.**
They will not be using it much longer.

**The kiosk is answered, and now has a page.** ICB's short-term motor
insurance site sets out the vehicle types, the five coverage periods,
every detail the purchase process asks for, that payment is by card,
and the Schedule 1 a driver must print and display under Chapter 231.

On 8 Nov 2026 ICB said this product should be at the front of the site
rather than sitting in a news article, which is right: it is the one
ICB product somebody may need before they have ever heard of ICB, and
they are standing at a border post on a phone when they need it. It is
now a page, `#/insurance/motor/visitors`, reachable from the footer,
from Motor Insurance and from the home carousel.

Three further facts were read off icbcovernote.com that day and are on
the page: the cover pays up to $50,000 BZD for injury or death of a
third party, up to $200,000 BZD per incident, and up to $20,000 BZD for
damage to property. The $20,000 matches the Third-Party Act figure
already on the Motor page from ICB's own graphic, which is a good sign
the two describe the same underlying cover.

The kiosk's own opening hours still are not published anywhere. The
page gives the Benque Viejo Border Branch's hours instead, from ICB's
directory, and attributes them to the branch rather than to the kiosk.

**/micro-insurance is closed.** It was raised again on 8 Nov 2026 and
has been withdrawn the same day. The record is with the other settled
items, below.

### Still open

**1. Does ICB want a premium shown for Short-Term Insurance?** ICB
publishes no price for it: not on icbcovernote.com, not on the kiosk
site before you have entered a vehicle, nowhere. So the new page states
none, and says so in as many words rather than leaving a gap that looks
like an oversight. If there is a rate card, it would make the page
considerably more useful, and it is the first thing a driver wants to
know. If there is not, the page is right as it stands.

**2. Is kiosk.icbinsurance.com ICB's own system, operated by ICB?** It
is on ICB's domain and it is what icbcovernote.com's own Buy Now button
points at, so the page treats it as ICB's and says so. Worth one line
of confirmation, because the page tells a visitor to check the address
in their browser before entering a card, and that advice is only sound
if the address really is ICB's.

   Related, and deliberately not done: the purchase is linked, not
   embedded. ICB's old site embeds ANA Seguros' quote tool and this
   build carries that over, but a card field is different, and an
   iframe hides whose origin is really taking the number. If ICB would
   rather it were embedded, that is their call to make knowingly.

**3. The home carousel's dots sit below the fold on a short phone.**
Raised here because the fix is ICB's to choose, not ours. The hero is
taller than a phone screen, so the dots at the foot of it are out of
sight until the visitor scrolls; they work first time once reached,
and nothing covers them. The only way to bring them into view at rest
is a shorter hero, and the hero's height is set by the artwork: ICB's
upright What's New composition is 621px tall at 360px wide, against
616px of room above the quick bar. So it is a choice between cropping
that artwork, running it smaller with the slide's own ground showing
around it, or leaving the dots where they are. Left as they are
meanwhile, which is the only one of the three that costs ICB nothing.

**4. The campaign poster's second button sits under the Talk to Bee
launcher on a 390px phone.** One tap on "Request a quote" there opens
the assistant instead; a small scroll clears it. Every other control
on the site takes one tap.

This slide stacks on a phone, artwork above and words below, so its
buttons are the last thing in its content and no amount of padding
moves them up. There are two ways out and both cost something that is
ICB's to spend. Wrapping the buttons so they clear the corner makes
this slide taller, and because it is the tallest slide in the carousel
its height is every slide's height: tried on 9 Nov 2026, it took the
film from 70.9% of its frame cropped to 73.1% and pushed three other
slides' buttons back down into the launcher. Making the slide shorter
means cropping the campaign artwork, which carries wording.

A third way, if ICB prefers it: drop the one-line lead from that slide
on phones only. It buys back the height the wrap costs, the artwork
already carries the message, and nothing else moves.

**5. The branch opening hours**, and whether they vary branch to
branch. The door at Independence posts hours that differ from the ones
ICB gave us on three counts.

**6. ICB's own "View Coverage" link is broken.** On their Mexican
Insurance page it points at an ANA Seguros URL that returns 404, and
on 8 Nov every other spelling of that address was tried and returns
404 too, so there is no page at ANA behind it. The Claims and FAQs
links beside it both work and go straight to ANA from our product
page.

Rather than leave the pathway pointing at nothing, **View Coverage
now lands on our own quote page**, at the section that sets out the
four covers ANA offers and the limit ranges for each. Those came off
ANA's own server, not from anywhere else. Still worth passing on so
ANA can fix their link.

**7. Where a completed claim form should land.** The site emails them
to `icb@icbinsurance.com`, the general address, because that is the
only one ICB publishes anywhere near a claims context: their claims
page carries no email at all. `icb_claims1@icbinsurance.com` exists
but appears only on the kiosk site, and the client confirms it is for
kiosk claims specifically. If ICB wants a dedicated claims inbox for
forms submitted from the website, one line in `js/data/site.js`
changes it. This is the same decision as question 1 at the top of this
file, now with the evidence attached.

### Raised 8 Nov 2026: ANA Seguros' quote tool takes card details

Carrying ANA's quote tool over meant reading how it works, and one
thing in it should be put to ANA rather than left alone.

The tool is ANA's, not ICB's. It is loaded from
`auto-insurance-ana.com`, keyed to ICB's agent code, and it does the
whole job: it quotes, it issues the policy, and it takes the card
payment. Nothing about the pricing lives in ICB's page, which is why
it is embedded here rather than rebuilt.

Inside ANA's own `Turistas.js`, the card payment step chooses where
to post by looking at the hostname of the page it is running in. On
`auto-insurance-ana.com` it posts to their live server. From anywhere
else it falls back to `desarrollo.anaseguros.com.mx` — "desarrollo"
being Spanish for development. The call carries the cardholder name,
the card number, the expiry and the security code.

**This is not something this build introduced, and it is not a
regression.** ICB's current page serves the tool from the Wix file
host, which is not ANA's domain either, so ICB's live site already
takes that same fallback today. Our copy behaves identically.
Quoting is unaffected: the quote endpoint is hardcoded to the live
server. Both hosts resolve and answer, on neighbouring addresses, so
this is a naming question rather than a dead endpoint.

Two things for ICB to ask ANA:

1. Which host should receive a customer's card details when the tool
   runs on ICB's own site, and is `desarrollo` the intended one?
2. Does `www.icbinsurance.com` need registering their end? ANA's
   access check is sent the embedding page's address, and it accepted
   the Wix one, so it may not be enforced. Better asked than assumed.

Neither blocks launch. Both are ANA's code and ANA's call.

### Raised 8 Nov 2026: three things in ICB's hurricane brochure

The brochure is served exactly as ICB publishes it, byte for byte.
It is their document and nothing in it was altered. Three things in
it are worth ICB knowing about, for whenever it is next reprinted.

1. **It carries Nationwide Cash Express branding**, twice on the back
   page, including a half-page logo. The NCE slide came off the home
   page last round at ICB's instruction, so the brochure is now the
   one place on the site where that branding still appears.

2. **"INSURANCE CORPRATION"** is printed on two pages, missing the O.

3. **The branch directory in it is out of date.** It predates the
   October 2025 directory the site is built from. Among other things
   it gives the San Estevan Agency the Corozal Town email address.
   The site's own branch records are correct; only the brochure is
   stale.

None of this affects the safety advice, which is why the brochure is
offered as-is. The advice itself is also set out as a page, in both
languages, which is what most people will actually read.

### For ICB to confirm: the head office slide is now a regenerated image

ICB supplied a matched pair of the head office on 8 Nov 2026, one
landscape and one upright, and all three cuts of that slide now come
from them. They look very good and they solved the framing problem
outright. They are also not photographs of the building as it stands,
and ICB should know that before launch rather than after.

Compared against the photograph they are built from:

1. **The signage reads red.** On the wall it is navy. The red is
   ICB's brand colour, so this may well be deliberate, but the sign
   on the building is not that colour today.
2. **The sky is blue with cloud.** The day it was shot was overcast.
3. **The 40th anniversary banner and the two people at the door are
   in the upright one and gone from the landscape one.** So a phone
   and a desktop show slightly different buildings. Nobody is likely
   to notice, but it is there.
4. Everything is sharper than the source could carry, which means
   detail has been drawn rather than recorded. The architecture, the
   wording of the sign, the flags and the fountain all check out.

None of this is wrong to publish if ICB are happy with it. It is
their building and their brand. The question is only whether they
want their head office shown with signage in a colour it is not, and
whether the banner should be in both or neither. A real photograph
taken on a clear day would settle all of it.

### Settled 8 Nov 2026: the upright head office frame arrived

ICB supplied it the same day it was asked for, and it is exactly
right. The file is the untrimmed original with 706 rows of sky added
above it and nothing else altered: the lower 1284x954 was checked
against the original pixel for pixel and the difference is zero. The
join is invisible, a step of 1.5 in 255 across it, and the sky added
is flat overcast with nothing recognisable invented in it.

The phone hero takes it whole, at its own 0.773, and now fills the
slide with no ground left underneath. Because the picture is taller
than the slot at every phone width, what little has to go comes off
the top, and the top is the added sky. The building, the street and
the cars are never touched at any width.

What follows is the problem as it stood, kept because the arithmetic
explains why a rebuild was the only way out of it.

### Closed: why an upright composition was needed

The first slide is the one that sells the site and it has to show the
whole building. On a wide screen it does. On a phone it cannot, and
no amount of cutting will change that.

TWO FILES, AND THE FIRST BRIEF WENT OUT AGAINST THE WRONG ONE. ICB
sent an aerial twice: an untrimmed frame at 1284x954, and a 2576x1101
version of the same shot. The wide one looks like the better file and
is not. Compared patch for patch at the same size it carries no more
detail, only more pixels and a little softness: it is an upscale of
the same frame with the top and bottom trimmed off. The landscape
cuts still come from it, because at the size those are shown the
difference cannot be seen and the framing is slightly wider. The
upright cut must not, because the sky and street it trimmed away are
exactly what an upright frame needs.

THE ARITHMETIC, measured on the untrimmed original rather than
guessed from the trimmed one. The building occupies 865 of its 1284
pixels across and about 525 of its 954 down, so the building itself
is roughly 1.65 to 1, not the 2.8 quoted in the first brief. The slot
this slide gets on a phone is about 0.82 to 1. A square crop is the
most upright frame that still holds the whole building with margin;
below about 0.95 the right-hand wing starts going. So the slide now
takes a square, which invents nothing, shows the whole building, the
street below it and the neighbourhood behind, and leaves 68px over
instead of the 167px it left before.

Closing the last 68px needs a genuinely upright frame, and that needs
about 30% more height than the photograph has. It can be sky: the top
of the original is already open overcast above the skyline, so the
extension would be flat grey and would not have to invent a single
building. The revised brief went to ICB on 8 Nov 2026.

STILL WORTH ASKING FOR. The best file anyone has sent is 1284 across.
A full-bleed desktop hero is 1440 to 1920, so it is being stretched
there. The drone that shot this almost certainly wrote something far
larger, and the native file would beat anything generated, settle the
upright frame without inventing anything, and sharpen the desktop
slide as well.

### Still waiting: the Spanish on Short-Term Insurance

ICB publishes icbcovernote.com in English only, though the kiosk system
itself offers English or Spanish at step one. The Spanish on
`#/insurance/motor/visitors` was written here and needs the same review
by a Belizean Spanish speaker that the claim forms and the consumer
resources are waiting on. ICB's product and statute names are left in
English in both languages, as they are everywhere else: Short-Term
Insurance, Schedule 1, and the Motor Vehicle Insurance (Third Party
Risks) Act. The three BZD figures are ICB's own and are identical in
both.

### Still waiting: the Spanish on the carried-over resources

ICB publishes the hurricane guide and the fire prevention advice in
English only. Both were translated here so that half of ICB's
customers can read their own insurer's safety advice. That Spanish needs the same review by a Belizean
Spanish speaker that the 376 claim-form fields are waiting on. The
figures, wind speeds, telephone numbers and policy limits are ICB's
own and were not touched.

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

  **Both came back on 8 Nov 2026 and were taken out again the same
  day.** Bringing ICB's consumer resources across from the live site
  carried their Travel Emergency Insurance questions with the hurricane
  and fire material, as a resources card, a guide page in both
  languages, a route, a PDF and a redirect. Separately, reading the live
  site's navigation produced evidence that `/micro-insurance` is ICB's
  own Mexican Insurance page, and a redirect for it was drafted in
  `_redirects` and raised here as a decision for ICB. Neither should
  have happened. The instruction above is not a provisional state
  waiting on better information; it is the instruction. Everything
  carried over has been removed, the drafted redirect is gone, and
  `_redirects` now carries **do not add a rule here** at both
  addresses. What this item is for is to stop the next tidy-up, so the
  two places it failed are worth naming: content brought across
  wholesale from the old site, and evidence mistaken for a mandate.
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
