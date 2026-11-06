# Handover guide for the Cojac’s family

You make all of these edits in plain text files in `src/content/`. After saving, rebuild and redeploy. If the site is connected to Netlify through Git, committing the change redeploys it automatically.

> **Golden rule:** if something hasn’t been confirmed, leave it empty (`''` or `null`). The website hides or labels anything empty. It never guesses.

---

## 1. The WhatsApp order number (set to +501 621-8372)

`src/content/site.ts`:

```ts
whatsapp: {
  orderNumber: '501XXXXXXX',   // international format, digits only: 501 + the 7-digit number
},
```

- While this is empty, the “Send Order Request on WhatsApp” button stays switched off. Customers can still use “Copy order details”.
- Once it’s set, add an item to your order on your phone and tap Send. Check that WhatsApp opens a chat with the right number.

## 2. Change flavours, sizes and prices

`src/content/catalogue.ts`. Each flavour is one block:

```ts
{
  id: 'peanut-delight',
  name: 'Peanut Delight',
  subtitle: 'A customer favourite',
  description: '…',
  active: true,                 // false = hide this flavour completely
  highlighted: true,            // true = show on the homepage
  confirmedThisSeason: true,    // true once it's definitely on this year's menu
  variants: [
    { variantId: 'regular', bottleSize: '750 ml', priceBZD: 25, availability: 'available' },   // example only
    { variantId: 'large',   bottleSize: '1 litre', priceBZD: null, availability: 'ask' },
  ],
  allergens: ['Egg', 'Milk', 'Peanut'],   // only once approved; null = "being confirmed"
  images: [{ src: '/products/peanut-delight.jpg', alt: 'Bottle of Peanut Delight rumpopo' }],
  …
}
```

- **Prices:** `priceBZD: 25` shows “BZD $25.00”. `null` shows “To be confirmed by Cojac’s”. The order total only appears when *every* item in the order has a price.
- **Availability:** `'available'`, `'limited'`, `'sold-out'` (customers can’t add it), `'ask'` (“Ask about availability”) or `'coming-soon'`.
- **Max per order:** add `quantityLimit: 6` to a variant if you need one. The site-wide limit is 99 per line.
- **New flavour:** copy an existing block, give it a new `id` and `slug` (lower-case, with dashes), and set `seasonalCollection` to `'seasonal'` or `'new-release'`. Those headings show automatically.
- **Colours:** `palette` sets the colours of the illustrated bottle. Once real photos are added, the photo replaces the illustration.

## 3. Add photos

1. Put the images in `public/products/` (bottles) or `public/gallery/` (gallery). JPG or WebP, about 1600 px on the long side, under 400 KB each.
2. Products: list them in the flavour’s `images`.
3. Gallery: in `src/content/gallery.ts`, set `src: '/gallery/your-photo.jpg'` and write a short `alt` description. Tiles with no `src` show “Photo coming soon”.

## 4. Season banner and closing the season

`src/content/site.ts → season`:

| Setting | What it does |
|---|---|
| `isSeasonOpen` | Master switch. `false` puts the whole site into “season ended” mode. |
| `acceptOrderRequests` | `false` turns off ordering but leaves the site open. |
| `seasonOpensOn` / `seasonClosesOn` | Dates in `YYYY-MM-DD`, Belize time. After the closing date the site switches to “season ended” **automatically**: the banner disappears and Add to Order is switched off. |
| `showBanner` / `bannerText` | The green announcement bar at the top. |
| `closedHeadline` / `closedText` | The message shown after the season. |

**Next year:** update the two dates and the banner text. Then review the flavours (`confirmedThisSeason`, prices, `active`).

## 5. Delivery, shipping and pickup options

`src/content/site.ts → fulfilment`. Customers choose one of three options at checkout:

| Option | Meaning | `feeBZD` today |
|---|---|---|
| Delivery | Within Belize City limits, with a charge | `null` → “Charge applies — amount confirmed by Cojac’s” |
| Pickup | Free | `0` → “No charge” |
| Shipping | Out-district (other districts), with a charge | `null` → “Charge applies — amount confirmed by Cojac’s” |

Enter an amount (e.g. `feeBZD: 10`) to show it at checkout and in the WhatsApp message. When every item and the charge have prices, an estimated total appears. Switch any option on or off with `enabled`.

## 6. Contact details and social links (Facebook / Instagram)

`src/content/site.ts → contact` and `social`. Empty values stay hidden. Paste the full profile links, e.g. `facebook: 'https://www.facebook.com/…'` and `instagram: 'https://www.instagram.com/…'`. The WhatsApp, Facebook, Instagram and email logos appear side by side on Connect With Us, in the footer and in the mobile menu (the WhatsApp number itself is not printed — the logo opens the chat), and the links are added to the structured data for Google.

## 6a. Map

`site.ts → contact.mapUrl` (the “Open in Google Maps” link) and `contact.mapEmbedUrl` (the map shown on Connect With Us after a visitor taps “Show map”) both point to Diego St, Belize City. For an exact pin, open the location in Google Maps, choose **Share → Copy link** for `mapUrl`, and **Share → Embed a map** (copy just the `src="…"` address) for `mapEmbedUrl`.

## 6b. Footer credit

`site.ts → credit` holds the “Website development in Belize by Austere Automations” link at the bottom of every page.

## 7. FAQs

`src/content/faqs.ts`. Draft questions (prices, sizes, delivery fees, payment methods and so on) have `published: false`. Write the answer and switch to `published: true`.

## 8. Videos

`src/content/media.ts`. For YouTube, add the `youtubeId` (the part after `v=`) to get a play-in-page video. For Facebook links, a “Watch on Facebook” card is shown. Reorder the list to change the order on the page.

## 9. Brand name and logo

- The name is set once, in `site.ts` (`brandShort`, `brandName`). The approved copy in `copy.ts` and `catalogue.ts` also mentions “Cojac’s”. If the spelling changes, search and replace those files too.
- The official logo lives in `public/brand/` (the original file plus transparent cut-outs at 160/320/640 px). To replace it, overwrite those files with the same names.
- The colours are in `src/styles/global.css` (`:root`). Replace them with official brand colours if you have them.
