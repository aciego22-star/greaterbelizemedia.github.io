# ICB page-by-page review: what was done, what is waiting

Review by Rofel Nunez, checked 4 November 2026. Worked through
19 November 2026.

Your headings are kept word for word so this can be read side by side
with your document. Each one opens with where it stands:

- **Done.** Changed, built and checked.
- **Partly done.** The part that needed no new facts is changed. What
  is left is named.
- **For ICB.** Needs a fact or a decision only ICB has. Nothing was
  invented to fill the gap.

Thirty-seven items. Twenty-two are done, four are partly done, and
eleven are waiting on an answer from ICB. The eleven are gathered at
the end of this file as well, so nobody has to go hunting for them.

---

## All pages: "ICB publishes" wording

**Done.**

All 22 replaced, using the wording in your document, in English and
Spanish. The heading on all six product pages is now **Who it's for**.

Four more you did not list were changed the same way, because the
Short-Term Insurance page and the discovery quiz were written after
your review: "the protection levels ICB publishes for this cover",
"ICB publishes no price for this cover", "ICB publishes a separate set
of contacts", and "part of ICB's published property categories".

Where it came from, for the record: "publishes" was a deliberate
hedge, a way of attributing every claim to ICB rather than making it on
ICB's behalf. You are right that it reads like a newspaper. The
attribution is kept where it carries weight, so the figures on the
product pages still say they are ICB's, and dropped everywhere it was
only throat-clearing.

Also in this item: **Money Insurance** is now **Cash in Transit and
Fidelity Guarantees** throughout, and **Mexican Insurance** is
**Mexican Motor Insurance** as the product name. The address stays
`/insurance/mexican` so existing links keep working.

## Kiosk Portal is now

**For ICB.**

The heading in your document has no text under it, so there is nothing
to act on. What was this one going to say?

## Insurance page: "I'm not sure" points to the wrong product

**Done.**

The second button was Liability & Miscellaneous, the most specialised
product on the site. It is now **See all insurance types**, going to
the insurance hub. Your document offered "Ask Bee" as the alternative.
This one was chosen because it always lands somewhere useful, where a
Bee button opens a chat panel rather than answering the question. Easy
to switch if you prefer the other.

## Insurance page: The Spanish version keeps product names in English

**Done.**

Your rule is the one the site already follows: ICB's product names stay
in English, everything around them is Spanish. What had gone wrong is
that some sentences were built around the English names instead of
around Spanish grammar, which is what made them read as half-translated.

The line you quoted, "Cobertura Liability Only... y Comprehensive", now
reads:

> Vehículos personales y comerciales, con tres coberturas: Liability
> Only, Collision and Upsets, Comprehensive.

The Spanish sentence finishes before the English names begin, and the
names sit in a list rather than inside the grammar. Two more on the
same page had the same shape and were rewritten the same way: the
Liability & Miscellaneous line, which had been a bare list of five
English names joined by a Spanish "y", and the Mexican line, which read
"las opciones de Mexican Insurance de ICB".

Then every Spanish page on the site was read the same way, looking for
English verbs and prepositions rather than English names, because an
English name in a Spanish sentence is correct and an English verb is
not. Nothing else turned up. The two English film titles in the gallery
are the titles of ICB's own English films, each shown with its language
label beside its Spanish counterpart, and they stay as they are.

## Insurance page: Travel insurance isn't listed, and Bee gives a broken link for it

**For ICB. This one matters and cannot be fixed from the website.**

Bee is a hosted assistant, configured outside the website, and its
answers come from what it was given rather than from these pages.

It is telling people that travel insurance sales are "temporarily
suspended" and handing out `/#/insurance/travel`, which is a dead
address. ICB instructed on 28 October that Travel Insurance come off
the site entirely, and it did. Bee never got the message.

What Bee needs to be told:

- ICB does not sell Travel Insurance. Not suspended, not temporarily.
- There is no travel insurance page, and no link should ever be given.
- Short-Term Insurance at `/insurance/motor/visitors` is motor cover
  for a visiting vehicle. It is not travel insurance.

Worth checking the same way for anything else Bee has outgrown.

## Property Insurance page: Only Homeowners is explained

**For ICB.**

The page lists Home Owners, Small Business, Commercial and Renters, and
describes only the first. Writing the other three means writing new
statements about what ICB covers, which is ICB's to write.

Two or three sentences from the Property department on each of Renters,
Small Business and Commercial, and they go straight in.

## Property Insurance page: "Resource Centre" isn't a link

**Done.**

It links to the Resource Centre now. The page builder gained a general
way to link a phrase inside a Good to know line, so the next one costs
nothing.

## Motor Insurance page: Bodily Injury says "As described by ICB"

**For ICB.**

Left exactly as it is, deliberately. Your document offers "the real
figure, or remove the line", and removing it would quietly drop a cover
a motorist needs to know about. "As described by ICB" is poor, but it
is honest about not having the number.

The Bodily Injury limit on Third-Party Act from the Motor department,
and it goes in beside the $20,000 property damage figure in a minute.

## Motor Insurance page: Two different sets of cover names

**For ICB.**

Already an open question on our side, now confirmed from yours. The
flyer's options (Third-Party Act, Act Plus, Levels 1 to 4,
Comprehensive) and the website's list (Liability Only, Collision and
Upsets, Comprehensive) have never been mapped to each other by anyone
at ICB, so the page shows both without claiming a relationship between
them.

This needs the Motor department to say how they fit together. Once they
do, the two lists merge into one and Collision and Upsets gets a card
of its own.

It also holds up one small thing in the FAQ. The documents table has
rows called "Motor Third Party Liability" and "Motor Comprehensive
Insurance", which are ICB's own names from ICB's own table, and they
are not the names on the Motor page. Renaming them would assert exactly
the mapping nobody has confirmed, so they are left alone until this
answer arrives.

## Claims page: Remove the online claim form and keep the downloadable PDFs

**Done.**

Gone, along with the five files behind it: the form itself, the
on-device PDF writer, and the 376 field definitions that kept it in
step with ICB's paper. Each pathway now offers one button, which is
ICB's own form, and the address the online form used to live at answers
"that page is not here" rather than half-working.

Your reasons were the right ones, and there were more of them than your
document lists. It never sent anything to ICB, so the claimant still
had to. The answers sat in the device's storage, which on a shared
computer is somebody else's claim. It only ever produced an English
PDF. And it had to be kept in step with every change ICB made to the
real forms.

The decision is recorded in the code beside the button, so nobody
rebuilds it by accident.

## Claims page: It doesn't say where to send a finished form

**Partly done.** The line is there. The address is not.

Your reasoning is right and the gap is real. The honest position is
that ICB publishes no claims address anywhere. The claims page carries
no email, and `icb_claims1@icbinsurance.com` was confirmed by ICB as
being for kiosk claims specifically.

Your document suggests "[Claims email] or WhatsApp +501 613-0579".
613-0579 is the kiosk claims WhatsApp, and the site already presents it
as the line for the progress of a claim already reported, so pointing
new claims at it needs confirming rather than assuming.

So the line under each form sends the claimant to the destination ICB's
own page already names, in step 3: the nearest office.

> Download it, fill it in and sign it, then take it to your nearest ICB
> office.

**Still for ICB:** the address, and the WhatsApp number, a completed
form should go to. The line becomes "take it to your nearest ICB office
or send it to [address]" the day Claims answers.

## Claims page: The text under each form is confusing

**Done.**

It used to say "Fill in, sign and send from this device", which
described the online form and never said where a finished form goes.
It is now the single line above, in both languages, under every form.

## Claims page: "Empathy to claimants"

**Done.**

Now "Empathy for claimants", on the Claims, About and Home pages, which
all read it from one place.

## Claims page: There's no Spanish version of the claim forms

**Partly done.** The buttons are answered. The PDFs are ICB's to make.

On the Spanish page the buttons now read **Descargar Insured Motor
Accident Form**, and so on for all nine. The form's name stays in
English because it is the name printed on the paper and the name a
branch will have told the claimant to look for. The word that says what
the button does is Spanish, which is what was missing.

**Still for ICB:** Spanish versions of the PDFs themselves. Worth
knowing before that work starts that a form filled in by hand in
Spanish still has to be read by whoever processes it, so this is a
Claims department decision rather than a translation job.

## Claims page: Claim PDFs show "Microsoft Word" in the browser tab

**Done,** and it was worse than the two you found.

Checking all nine turned up three more carrying a spreadsheet filename,
two blank, and two with no title at all. Every one of the nine now
carries its proper name, so a claimant who opens one sees "ICB Insured
Motor Accident Report Form" in the tab and in the saved file.

Nothing else about the files changed. Same pages, same fields, same
bytes of content, just the title the file carries.

## Locations page: Two agencies share the same map pin

**Partly done.**

Both emails are lowercase now, matching every other one on the site.

Both Directions buttons used to search "Santa Cruz Village, Stann
Creek". They now search the agency by name and street: Moro at #22
Police Station Street, Velasquez at Main Road. That is as precise as a
search can be made without coordinates.

**Still for ICB:** an exact pin for each office. A search can only find
what Google already knows about, and two unlisted agencies in one
village may both still land on the village. Dropping a pin on each and
sending the two links fixes it for good.

## Locations page: Many Directions links won't land on the office

**Done.**

All 22 now carry ICB's name as well as the address. Before, only 7 did:
ten searched an address alone and five searched only a village.

Same caveat as above. A name and address makes a better search, not a
guaranteed one.

## Locations page: "Abierto" reads like "open now" in Spanish too

**Done.**

Now "Horario". The English label was "Open", which has the same
problem, so it is now "Opening hours". Long email addresses no longer
break mid-word either.

## Gallery page: The photo viewer has no next or previous button

**Done.**

Arrows, the left and right keys, a count, and a wrap at each end so
neither arrow is ever dead. On a phone the arrows sit under the picture
rather than over it, where a 48px control on each side of a 390px
screen would cover most of the photograph.

## Gallery page: Signs in two photos don't match the website

**For ICB.**

Orange Walk: the sign says 38, the directory says #48. ICB's own live
site says #38, so two sources now say 38 against the directory's 48.
The site shows the directory's version.

Moro: the sign reads MORIO AGENCY, with different contact details from
the directory.

Both need someone at ICB to say which is right. The site is not
guessing either way.

## Gallery page: San Estevan Agency has no photo

**For ICB.**

It needs a photograph of the office. The current frame is the village
welcome sign, with no ICB building and no ICB sign in it, which is why
it is captioned as the village and styled differently. It is not a
photograph of a branch and should not pretend to be.

It has also come off the home page gallery at Albert's instruction, so
it now appears only on the Gallery page itself.

## Gallery page: Velasquez Agency is out of Sync

**Done.**

Moved up beside Moro, so the two Toledo offices sit together.

## Gallery page: Headquarters and Corporate Office are the same building

**Done.**

Merged into one card, keeping the larger photograph as you asked. The
gallery is 22 cards now.

## Business page: Bonds aren't listed

**For ICB.**

The FAQ says ICB offers bonds, so the gap is real. Adding a category
means writing what the bonds are and who they are for, which is new
copy about a product nobody has described to us.

A sentence or two from Business on bonds, and which categories they
belong under, and it goes in.

## Business page: The Spanish version keeps category names in English

**Done.**

The line you quoted, "Hay cobertura Motor...", now reads "Motor
Insurance cubre los vehículos que opera un negocio", which is the same
shape as the Cargo and Marine lines beside it: the product's own name,
then Spanish.

The tags underneath were already translated except where they are ICB's
own category names, and those stay in English by the same rule as the
product names. Checking this page also turned up **Money Insurance**
still in the liability tags, which the rename had missed. It is now
Cash in Transit and Fidelity Guarantees.

## About page: One English line on the Spanish page

**Done,** the way your document asks for.

The slogan stays in English, because it is ICB's and it is painted on
ICB's wall, with a small Spanish translation underneath it:

> **Making a positive difference in a changing Belize.**
> *Marcando una diferencia positiva en un Belice en cambio.*

Your note "it may be on purpose" was right, and your solution is the
better one. A slogan nobody translates leaves a Spanish reader with one
English line and no way in. This gives them the sense of it and leaves
the slogan standing as the slogan.

## Resources page: "Forms and portals," but there's no portal

**Done.**

The word is gone. The page now reads "ICB's forms and safety
information, all in one place."

**For ICB:** your document has "(include CC Portal)" written beside
this item with no explanation. What is the CC Portal, and should it be
listed here?

## Mexican Insurance is missing from the enquiry form

**Done.**

The enquiry list is six products now, with **Mexican Motor Insurance**
at the end. It is the one product on the site ICB does not quote for
directly, which is why it was left out, but a visitor who wants to ask
about it should be able to ask about it. The enquiry goes to ICB either
way.

## Contact page: The "outside of Belize" answer has no country code

**Done.**

Both answers now read +501 224-5328/9. It is one string, so the Contact
and FAQ pages fixed together, as you predicted.

## Payments page: Agency customers can't send their confirmation

**For ICB.**

Your document has the heading and "Update: Only Seine Bight and San
Estevan", then stops, with no description and no solution.

The site builds its payment-confirmation list from which branches have
a WhatsApp number marked as taking receipts. If those two should be on
that list, or off it, it is a one-line change. What was this one going
to say?

## Payments page: Nothing says what to put in the transfer reference

**Done.**

Step 3 now says to put your policy number and your name in the
reference, so ICB can match the payment to the policy.

## Payments page: The Heritage Bank account number is only 4 digits

**For ICB.**

Not touched, and should not be. A bank account number is the one thing
on this site where a guess sends somebody's money to a stranger.

Accounts needs to confirm the full Heritage number and the account
name. The same answer fixes the FAQ item below.

## Payments page: It makes bank transfer sound like the only way to pay

**Done.**

The page opens with all of it now: "ICB does not process payments
through this website. Pay by bank transfer, then send your confirmation
to your branch. You can also pay by cash, cheque or card at any
branch."

## Payments page: "ICB Payment Portal" isn't named on this page

**Done.** Your note says "There is no portal atm", so the name is
dropped rather than adopted.

The FAQ answer now lists bank transfer as the payment method, which is
what ICB confirmed on 27 October the Payment Portal actually is, and
the sentence that used to warn readers not to go looking for a login
has gone with the name. Nothing on the site uses it any more.

If ICB ever builds a portal, the name comes back on both pages
together, which is the mismatch you found.

**For ICB:** Bee also treats the Payment Portal as a separate channel,
and that is in Bee's configuration rather than on the website. Same job
as the travel insurance item above.

## FAQ page: The Heritage Bank details don't match the Payments page

**For ICB.**

Same answer as the Heritage item above. Both pages will show whatever
Accounts confirms, from one place, so they cannot drift apart again.

## FAQ page: "What documents do I need to apply?" uses different product names

**Done.**

The table is ICB's own, with the changes you asked for. It is fourteen
rows now instead of ten, and each row carries the name its product page
carries.

- **Marine Cargo Insurance** is **Cargo Insurance**, the name on its
  page, which covers air, land, marine, domestic and overseas transit
  rather than marine alone.
- The **Property Insurance** row now names ICB's four categories, so
  Renters is answered rather than missing.
- **General Liability**, **Tour Operators Liability**, **Cash in
  Transit and Fidelity Guarantees** and **Mexican Motor Insurance** are
  new rows. Your document lists the first three as Money, Tour
  Operators and General Liability.
- **Money** was ICB's name for the third of those and is now Cash in
  Transit and Fidelity Guarantees, as everywhere else.

For the four new rows, the Documents column says **Contact nearest ICB
Office**, which is ICB's own answer in this same table for five other
products. Inventing a document list for them was the alternative, and
it is not one.

**Employers Liability** and **Public Liability** stay. They are ICB's
own rows, a claim form exists for Public Liability, and they are
missing from the Liability page rather than wrong here. Worth adding to
that page once someone at ICB confirms what they cover. The two motor
rows are explained under the motor naming item above.

## FAQ page: Home and renters answers say hurricane and flood are "generally covered"

**Done.**

Both answers now end "depending on the cover you choose", in English
and in Spanish, exactly as your document asks.

---

# Four things your review did not list

Found while working through it, and changed:

**The What's New article still described the online claim form.** It
told readers they could "fill in and sign official ICB claim forms on
your device", which stopped being true the moment the form came off.
Rewritten in both languages, and in the summary a search result would
show.

**Money Insurance was still in the Business page tags.** Covered under
that item above. The rename had reached the product pages and the FAQ
but not this one.

**The word "concept" was readable in four places on the site.** The
enquiry form said "This concept form", the browser tab fell back to
"ICB Concept Experience", the no-script note called the site a concept
preview, and the description a search result prints under ICB's name
read "a next-generation digital experience concept ... prepared for
private review". None of that belongs on icbinsurance.com. All four are
now written for an ICB customer, and a check now reads every page in
both languages, including titles, search descriptions and image
descriptions, so none of it can come back.

**Twenty-two lines of copy for the deleted claim form were still being
sent to every visitor.** Progress counters, file size limits, the
privacy note, the confirmations. Nothing displayed them once the form
was gone, but they were still in the file every page downloads. Removed.

---

# The eleven waiting on ICB

Grouped by who can answer, so this can be forwarded as it is.

**Claims department**

1. The address and WhatsApp number a completed claim form should be
   sent to. One line goes under all nine forms the day it arrives.
2. Whether Spanish versions of the nine claim PDFs should be made.

**Motor department**

3. The Bodily Injury limit on Third-Party Act.
4. How the flyer's motor options (Third-Party Act, Act Plus, Levels 1
   to 4, Comprehensive) map to the website's (Liability Only, Collision
   and Upsets, Comprehensive).

**Property and Business**

5. Two or three sentences each on Renters, Small Business and
   Commercial.
6. A sentence or two on bonds, and which business categories they
   belong under.

**Accounts**

7. The full Heritage Bank account number and the account name.

**Whoever looks after Bee**

8. Bee is giving out a travel insurance page that does not exist, and
   describing travel insurance as temporarily suspended. It also treats
   the Payment Portal as a separate channel. Neither is on the website
   and neither can be fixed from it.

**Rofel**

9. "Kiosk Portal is now" has no text under it.
10. "Agency customers can't send their confirmation" has no description
    or solution, only "Update: Only Seine Bight and San Estevan".
11. What the CC Portal is, and whether it belongs on the Resources
    page.

**And three photographs or facts, from whoever is nearest**

- A photograph of the San Estevan office.
- Orange Walk: is it #38, as the sign and ICB's live site say, or #48,
  as the directory says?
- Moro: the sign reads MORIO AGENCY with different contact details from
  the directory. Which is right?
- An exact map pin for Moro and for Velasquez, both in Santa Cruz
  Village.
