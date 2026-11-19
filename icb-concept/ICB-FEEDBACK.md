# ICB page-by-page review — what was done, what is waiting

Review by Rofel Nunez, checked 4 November 2026. Worked through
19 November 2026.

Their headings are kept word for word so this can be read side by side
with their document. Three states:

- **DONE** — changed, built and checked.
- **PARTLY DONE** — the part that needed no new facts is changed; what
  is left is named.
- **FOR ICB** — needs a fact or a decision only ICB has. Nothing was
  invented to fill the gap.

---

## All pages: "ICB publishes" wording — DONE

All 22 replaced, using the wording in their document, in English and
Spanish. The heading on all six product pages is now **Who it's for**.

Four more they did not list were changed the same way, because the
Short-Term Insurance page and the discovery quiz were written after
their review: "the protection levels ICB publishes for this cover",
"ICB publishes no price for this cover", "ICB publishes a separate set
of contacts", and "part of ICB's published property categories".

Where this came from, for the record: "publishes" was a deliberate
hedge, a way of attributing every claim to ICB rather than making it on
their behalf. Rofel is right that it reads like a newspaper. The
attribution is kept where it carries weight — the figures on the
product pages still say they are ICB's — and dropped everywhere it was
only throat-clearing.

Also in this item: **Money Insurance → Cash in Transit and Fidelity
Guarantees** throughout the Liability page, and **Mexican Insurance →
Mexican Motor Insurance** as the product name. The address stays
`/insurance/mexican` so existing links keep working.

## Kiosk Portal is now — FOR ICB

The heading in their document has no text under it. Nothing to act on.
Ask Rofel what this one was going to say.

## Insurance page: "I'm not sure" points to the wrong product — DONE

The second button was Liability & Miscellaneous, the most specialised
product on the site. It is now **See all insurance types**, going to
the insurance hub. Their document offered "Ask Bee" as the alternative;
this one was chosen because it always lands somewhere useful, where a
Bee button would open a chat panel rather than answer the question.
Easy to switch if they prefer the other.

## Insurance page: the Spanish version keeps product names in English — PARTLY DONE

See the Spanish section at the end of this file.

## Insurance page: Bee gives a broken link for travel insurance — FOR ICB

**This one matters and cannot be fixed from the website.** Bee is a
hosted assistant, configured outside this repository, and its answers
come from what it was given, not from these pages.

It is telling people that travel insurance sales are "temporarily
suspended" and handing out `/#/insurance/travel`, which is a dead
address. ICB instructed on 28 October that Travel Insurance come off
the site entirely, and it did; Bee never got the message.

What Bee needs to be told:
- ICB does not sell Travel Insurance. Not suspended, not temporarily.
- There is no travel insurance page, and no link should ever be given.
- Short-Term Insurance at `/insurance/motor/visitors` is motor cover
  for a visiting vehicle, and is not travel insurance.

Worth checking the same way for anything else Bee has outgrown.

## Property Insurance page: only Homeowners is explained — FOR ICB

The page lists Home Owners, Small Business, Commercial and Renters, and
describes only the first. Writing the other three means writing new
statements about what ICB covers, which is theirs to write, not ours.

Ask the Property department for two or three sentences on each of
Renters, Small Business and Commercial, and they go straight in.

## Property Insurance page: "Resource Centre" isn't a link — DONE

It links to the Resource Centre now. The renderer gained a general way
to link a phrase inside a Good to know line, so the next one costs
nothing.

## Motor Insurance page: Bodily Injury says "As described by ICB" — FOR ICB

Left exactly as it is, deliberately. Their document offers "the real
figure, or remove the line", and removing it would quietly drop a
cover a motorist needs to know about. "As described by ICB" is poor,
but it is honest about not having the number.

Ask the Motor department for the Bodily Injury limit on Third-Party Act
and it goes in beside the $20,000 property damage figure in a minute.

## Motor Insurance page: two different sets of cover names — FOR ICB

Already an open question on our side, now confirmed from theirs. The
flyer's options (Third-Party Act, Act Plus, Levels 1–4, Comprehensive)
and the website's list (Liability Only, Collision and Upsets,
Comprehensive) have never been mapped to each other by anyone at ICB,
so the page shows both without claiming a relationship.

Needs the Motor department to say how they fit together. Once they do,
the two lists merge into one and Collision and Upsets gets a card.

## Claims page: remove the online claim form — DONE

See the note at the end of this file.

## Claims page: it doesn't say where to send a finished form — FOR ICB

Their reasoning is right and the gap is real. The honest answer is that
ICB publishes no claims address anywhere: the claims page carries no
email, and `icb_claims1@icbinsurance.com` is the kiosk's, confirmed by
ICB as being for kiosk claims specifically.

Their document suggests "[Claims email] or WhatsApp +501 613-0579".
613-0579 is the kiosk claims WhatsApp, so using it for all claims needs
confirming rather than assuming.

Ask the Claims department for the address and the WhatsApp number a
completed form should go to. One line goes under the forms the day they
answer.

## Claims page: the text under each form is confusing — PARTLY DONE

See the claims section at the end of this file.

## Claims page: "Empathy to claimants" — DONE

Now "Empathy for claimants", on the Claims, About and Home pages, which
all read it from one place.

## Claims page: no Spanish version of the claim forms — FOR ICB

The PDFs themselves only ICB can make. Note that a hand-filled Spanish
form still has to be read by whoever processes it, so that is a Claims
department decision rather than a translation job.

The button labels are a separate matter, covered in the Spanish section
below.

## Claims page: PDFs show "Microsoft Word" in the browser tab — DONE

See the note at the end of this file.

## Locations page: two agencies share the same map pin — PARTLY DONE

Both emails are lowercase now, matching every other one.

Both Directions buttons searched "Santa Cruz Village, Stann Creek".
They now search the agency by name and street: Moro at #22 Police
Station Street, Velasquez at Main Road. That is as precise as a search
can be without coordinates.

**Still for ICB:** an exact pin for each office. A search can only find
what Google already knows about, and two unlisted agencies in one
village may both still land on the village. Dropping a pin on each and
sending the two links fixes it for good.

## Locations page: many Directions links won't land on the office — DONE

All 22 now carry ICB's name as well as the address. Before, only 7 did,
ten searched an address alone and five searched only a village.

The same caveat as above: a name and address is a better search, not a
guaranteed one.

## Locations page: "Abierto" reads like "open now" — DONE

Now "Horario". The English label was "Open", which has the same
problem, so it is now "Opening hours". Long email addresses no longer
break mid-word.

## Gallery page: the photo viewer has no next or previous button — DONE

Arrows, the left and right keys, a count, and a wrap at each end so
neither arrow is ever dead. On a phone the arrows sit under the picture
rather than over it, where a 48px control on each side of a 390px
screen would cover most of the photograph.

## Gallery page: signs in two photos don't match the website — FOR ICB

Orange Walk: the sign says 38, the directory says #48. ICB's own live
site says #38, so two sources now say 38 against the directory's 48.
The site shows the directory's version.

Moro: the sign reads MORIO AGENCY with different contact details from
the directory.

Both need someone at ICB to say which is right. The site is not guessing
either way.

## Gallery page: San Estevan Agency has no photo — FOR ICB

Needs a photograph of the office. The current frame is the village
welcome sign, with no ICB building and no ICB sign in it, which is why
it is captioned as the village and styled differently: it is not a
photograph of a branch and should not pretend to be.

## Gallery page: Velasquez Agency is out of sync — DONE

Moved up with Moro, so the two Toledo offices sit together.

## Gallery page: Headquarters and Corporate Office are the same building — DONE

Merged into one card, keeping the larger photograph as they asked. The
gallery is 22 cards now.

## Business page: Bonds aren't listed — FOR ICB

The FAQ says ICB offers bonds, so the gap is real. Adding a category
means writing what the bonds are and who they are for, which is new
copy about a product nobody has described to us.

Ask Business for a sentence or two on bonds and which categories they
belong under.

## Business page: the Spanish version keeps category names in English — PARTLY DONE

See the Spanish section below.

## About page: one English line on the Spanish page — DONE

See the note at the end of this file.

## Resources page: "forms and portals," but there's no portal — DONE

The word is gone. The page now reads "ICB's forms and safety
information, all in one place."

Their document has "(include CC Portal)" written beside this item with
no explanation. **FOR ICB:** what is the CC Portal, and should it be
listed here?

## Mexican Insurance is missing from the enquiry form — DONE

See the note at the end of this file.

## Contact page: the "outside of Belize" answer has no country code — DONE

Both answers now read +501 224-5328/9. It is one string, so the Contact
and FAQ pages fixed together, as they predicted.

## Payments page: agency customers can't send their confirmation — FOR ICB

Their document has the heading and "Update: Only Seine Bight and San
Estevan" and then stops, with no description or solution. The site
builds its payment-confirmation list from which branches have a
WhatsApp number marked as taking receipts, so if those two should be on
it, or off it, that is a one-line change.

Ask Rofel what this item was going to say.

## Payments page: nothing says what to put in the transfer reference — DONE

See the note at the end of this file.

Their note "Please bring up Contact information for whatsapp banking"
is **FOR ICB** — not clear what is being asked for.

## Payments page: the Heritage Bank account number is only 4 digits — FOR ICB

Not touched, and should not be. A bank account number is the one thing
on this site where a guess sends someone's money to a stranger.

Accounts needs to confirm the full Heritage number and the account
name, and the same answer fixes the FAQ item below.

## Payments page: it makes bank transfer sound like the only way to pay — DONE

See the note at the end of this file.

## Payments page: "ICB Payment Portal" isn't named on this page — PARTLY DONE

Their note says "There is no portal atm", so the name is dropped rather
than adopted. Done on the FAQ answer.

**FOR ICB:** Bee also treats the Payment Portal as a separate channel,
and that is in Bee's configuration, not here. Same job as the travel
insurance item above.

## FAQ page: Heritage Bank details don't match the Payments page — FOR ICB

Same answer as the Heritage item above. Both pages will show whatever
Accounts confirms.

## FAQ page: "What documents do I need to apply?" uses different product names — PARTLY DONE

See the note at the end of this file.

## FAQ page: hurricane and flood "generally covered" — DONE

See the note at the end of this file.
