# Handover guide for the Cojac’s family

You make all of these edits in plain text files in `src/content/`. After saving, rebuild and redeploy. If the site is connected to Netlify through Git, committing the change redeploys it automatically.

> **Golden rule:** if something hasn’t been confirmed, leave it empty (`''` or `null`). The website hides or labels anything empty. It never guesses.

---

## 0. Homepage slideshow

`src/content/hero.ts` lists the four hero photos (desktop 16:9 and mobile 9:16, in `public/hero/`). They rotate every 6 seconds in the listed order and loop. To change the order, move the entries; to change the speed, edit `heroIntervalMs`. For a new photo, add a desktop and mobile PNG plus WebP copies with the same naming and a new entry with a short description (`alt`) of the photo.

## 0b. English and Spanish

The whole site is bilingual. English pages are at `/flavours`, Spanish at `/es/flavours`, and so on. Visitors whose phone or browser is set to Spanish see the Spanish site automatically; everyone can switch with the EN / ESP buttons beside the basket at the top of every page (also in the phone menu), and the choice is remembered.

**Editing text:** wherever a sentence appears, both versions sit side by side as `t('English text', 'Texto en español')`. Change both. Page names and search titles in Spanish are in `src/content/routes.ts` (English in `routes.json`). Flavour names stay the same in both languages, matching the bottles.

**WhatsApp messages** arrive in the customer's language (for example “Solicitud de pedido”, “Pago: Efectivo contra entrega”). If you would rather receive every order in English, ask your developer to switch the message to English only; it is a one-line change in `src/lib/order.ts`.

## 0c. Footer credit

`site.ts → credit` holds the “Website developed by Austere Automations” link. Its colour steps through red, yellow and blue every 8 seconds (`creditPrimary` in `src/styles/components.css`).

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

**Current menu (2026/27):**

| Flavour | Half liter (500 mL) | Liter (1 L) |
|---|---:|---:|
| Classic Vanilla | BZD $17 | BZD $32 |
| Peanut Delight | BZD $20 | BZD $38 |
| Pumpkin Spice | BZD $22 | BZD $42 |
| White Chocolate w/ Hazelnut | BZD $25 | BZD $48 |
| Dark Chocolate Peppermint | BZD $22 | BZD $40 |
| Snickerdeluxe | BZD $25 | BZD $45 |
| Vegan | BZD $25 | BZD $50 |

**To change a price**, find the flavour in `src/content/catalogue.ts` and edit the two numbers in `variants: sizes(17, 32)` (half liter first, then liter). Everything else — cards, totals, WhatsApp message, FAQs, Google data — updates from that.

**To mark a size sold out**, replace `sizes(…)` with the full list and set `availability: 'sold-out'` on that size.

**Photos** follow the supplied naming, e.g. `Cojacs_Vegan_Rumpopo_Desktop_1600x1200.jpg` and `…_Mobile_1080x1350.jpg` in `public/products/`. A new flavour needs the same pair; add WebP copies (`…_Desktop_800x600.webp`, `…_Desktop_1600x1200.webp`, `…_Mobile_540x675.webp`, `…_Mobile_1080x1350.webp`) for speed, then use `photo('Cojacs_New_Flavour_Rumpopo', 'New Flavour')` in the catalogue entry.

The detailed field reference follows:

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

**Add to Order animation:** when a customer adds a flavour, a small copy of its photo floats into the basket at the top of the page. It uses the flavour's first photo automatically, so new flavours get it for free. The speed is `FLY_DURATION_MS` in `src/lib/flyToCart.ts` (1600 = 1.6 seconds).

## 3. Add photos

1. Put the images in `public/products/` (bottles) or `public/gallery/` (gallery). JPG or WebP, about 1600 px on the long side, under 400 KB each.
2. Products: list them in the flavour’s `images`.
3. Gallery: each photo is a pair, `<name>_Desktop_1600x1200.jpg` (4:3, larger screens) and `<name>_Mobile_1080x1350.jpg` (4:5, phones), plus WebP copies (`_Desktop_800x600.webp`, `_Desktop_1600x1200.webp`, `_Mobile_540x675.webp`, `_Mobile_1080x1350.webp`) in `public/gallery/`. In `src/content/gallery.ts` add an entry with that `base` name, a short `caption` (shown in the full-screen viewer) and an `alt` description of what is visible. The order of entries is the order on the page; the first four also appear on the homepage.

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
| Delivery | Anywhere in and within Belize City | `5` → BZD $5.00 |
| Pickup | Free | `0` → “Free” |
| Shipping | Out of district (anywhere outside Belize City), with a charge | `null` → “Charge confirmed by Cojac’s” |

Enter an amount (e.g. `feeBZD: 10`) to show it at checkout and in the WhatsApp message. When every item and the charge have prices, an estimated total appears. Switch any option on or off with `enabled`.

## 5b. What customers fill in at checkout

Customers choose Delivery, Pickup or Shipping and must give their **name**. Delivery and shipping also require the **exact address** (street, house number and a landmark). A preferred date and notes are optional. The WhatsApp message is kept short: items with sizes and prices, the delivery line, the total, name, address, date and notes.

## 5c. Payment (cash or bank transfer)

`src/content/payments.ts`. After choosing delivery, pickup or shipping and entering their name and address, customers choose how they will pay:

| Fulfilment | Payment options |
|---|---|
| Delivery (Belize City) | Cash on delivery, or bank transfer |
| Pickup | Cash at pickup, or bank transfer |
| Shipping (out of district) | Bank transfer only |

For a bank transfer the customer picks **Heritage Bank, Belize Bank or Atlantic Bank**. A button then opens that bank’s app:
- On **Android**, it opens the installed app, or Google Play if the app isn’t installed.
- On **iPhone**, it opens the App Store page, which shows “Open” when the app is installed.
- On a **computer**, it opens the bank’s website.

The page shows the amount when it is known and the steps to follow. It states clearly that **the order is placed once Cojac’s receives the screenshot of the completed transfer** in the WhatsApp chat. The WhatsApp message adds “Payment: Bank transfer (Belize Bank)” and “I will send the transfer screenshot in this chat.” For cash it adds “Payment: Cash on delivery”.

**Receiving account:** all transfers go to `receivingAccount` in the same file: **Atlantic Bank Limited, account 212001055, recipient Cojac Smith**. It is shown at checkout with copy buttons. Customers paying from Heritage Bank or Belize Bank are told to send it as a transfer to another bank in Belize. When the total is known (delivery or pickup), they transfer first, then send the order with the screenshot. For shipping, Cojac’s confirms the total with the shipping charge in the chat first. To change the account, edit those fields; set it to `null` to hide it, and customers will be told the details come in the chat.

The links to each bank’s app are in the same file (`iosAppStore`, `androidPackage`, `website`); they were checked against the official store listings in November 2026.

## 6. Contact details and social links (Facebook / Instagram)

`src/content/site.ts → contact` and `social`. Empty values stay hidden. Paste the full profile links, e.g. `facebook: 'https://www.facebook.com/…'` and `instagram: 'https://www.instagram.com/…'`. The WhatsApp, Facebook, Instagram and email logos appear side by side on Connect With Us, in the footer and in the mobile menu (the WhatsApp number itself is not printed — the logo opens the chat), and the links are added to the structured data for Google.

## 6a. Map

`site.ts → contact.mapUrl` (the “Open in Google Maps” link) and `contact.mapEmbedUrl` (the map shown on Connect With Us after a visitor taps “Show map”) both point to Diego St, Belize City. For an exact pin, open the location in Google Maps, choose **Share → Copy link** for `mapUrl`, and **Share → Embed a map** (copy just the `src="…"` address) for `mapEmbedUrl`.

## 7. FAQs

`src/content/faqs.ts`. Draft questions (prices, sizes, delivery fees, payment methods and so on) have `published: false`. Write the answer and switch to `published: true`.

## 8. Videos

`src/content/media.ts`. For YouTube, add the `youtubeId` (the part after `v=`) to get a play-in-page video. For Facebook links, a “Watch on Facebook” card is shown. Reorder the list to change the order on the page.

## 9. Brand name and logo

- The name is set once, in `site.ts` (`brandShort`, `brandName`). The approved copy in `copy.ts` and `catalogue.ts` also mentions “Cojac’s”. If the spelling changes, search and replace those files too.
- The official logo lives in `public/brand/` (the original file plus transparent cut-outs at 160/320/640 px). To replace it, overwrite those files with the same names.
- The colours are in `src/styles/global.css` (`:root`). Replace them with official brand colours if you have them.
