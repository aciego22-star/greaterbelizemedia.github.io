# Card payments: from demo to live

The concept's Shop has a working cart and checkout. Only the card step is simulated. This document covers what the demo does, and what it takes to accept real credit and debit cards.

## What the demo does

- **Cart** (`src/lib/cart-store.ts`): product ids, colours and quantities only, kept in tab storage. Prices are always looked up from `src/data/shop.ts`.
- **Checkout** (`src/islands/Checkout.tsx`): contact details (kept in the component's memory, never stored or sent), branch collection, then the card step and an order confirmation.
- **Card step**: the checkout talks to a processor only through the `PaymentProvider` interface (`src/lib/payments/types.ts`). The concept ships one provider, `demo` (`src/lib/payments/demo.ts`). It draws a stand-in for the processor's secure card form with nothing to type, collects no card details, sends nothing and simulates an approved or declined answer. Order references start with `DEMO-`.

The end-to-end suite checks that the checkout page has no card inputs or third-party frames, and that the whole shop and checkout flow sends no POST (or other write) request and makes no third-party request.

## Who must own the merchant account

Card payments are settled to a **merchant account**. For this site, it must be **Universal Hardware's own**:

- Universal Hardware applies to its bank, or to a card processor that works with a Belize acquiring bank. The company is the merchant of record. The money, the chargebacks and the customer relationship are its own.
- Underwriting reviews the business and the website the account is for. The application must come from Universal Hardware, or be authorised by it in writing. This concept carries the company's name, logo and product photos without its approval. It must not be presented to a processor or bank as Universal Hardware's site, or used for an account in anyone else's name.
- Austere Automations' role is to build and integrate. It does not hold the account or the funds.

## What Universal Hardware needs to supply

| Item | Why |
|---|---|
| Merchant account and processor (BZD e-commerce, Visa / Mastercard credit and debit, 3-D Secure if offered) | The processor determines the integration, fees, settlement and card networks |
| Current prices and stock for the items to be sold online | The demo uses past sale prices from February 2026 graphics |
| GST registration details and whether prices include GST | For totals and receipts |
| Refund and returns, collection and delivery, privacy, and terms pages, plus business contact details | Processors require these on the site before approval |
| Who receives orders at each branch, and how customers are told the order is ready | Order notification and fulfilment |

## Target architecture

```
Browser (checkout)                         Server function (holds the secret key)      Processor
──────────────────                         ─────────────────────────────────────      ─────────
mount(): processor's hosted card fields ─────────────────────────────────────────────▶ (iframe, card data stays here)
pay(): fields tokenise the card  ──token──▶ POST /api/pay
                                            • recompute the amount from product ids
                                              and the server's own price list
                                            • create and confirm the charge ────────────▶ authorise (3-D Secure)
                                            ◀──────────────────────────── result ────────
◀──── approved / declined ────────────────  • store the order, notify the branch
                                            ◀──────────── signed webhook (settlement, refunds)
```

- **Card data never touches the site.** The processor's hosted fields (or its hosted payment page) collect the card, so the site stays in the simplest PCI DSS scope (SAQ A). Never build card inputs in the site's own HTML.
- **Never trust the browser's amount.** The server recomputes the total from product ids and its own prices.
- **Secrets stay on the server.** The secret key goes only in the server function's environment. Never put it in a `PUBLIC_*` variable or frontend code; `scripts/postbuild.mjs` fails the build if a secret-shaped string reaches `dist/`.
- **Use the order reference as the idempotency key**, so a retry cannot charge twice, and verify webhook signatures.

The static site can stay on Netlify. The server step can be a Netlify Function (or the processor's own hosted checkout, if it offers a redirect flow, which needs even less code).

## Adding a processor

1. Create `src/lib/payments/<processor>.ts` implementing `PaymentProvider`:
   - `mount(el)`: load the processor's script and render its hosted fields into `el`
   - `unmount()`: tear them down
   - `pay(req)`: tokenise, call `POST /api/pay` with the token, `req.reference` and the cart lines, and map the answer to `PaymentResult`
   - `live: true`
2. Return it from `getPaymentProvider()` in `src/lib/payments/index.ts`, selected by a `PUBLIC_PAYMENT_PROVIDER` build variable. The variable holds the provider's name only, never a key.
3. Add the server function, with the secret key set in Netlify's environment settings.
4. Allow the processor's domains in `public/_headers` (`script-src`, `frame-src`, `connect-src`). The demo's CSP is self-only.
5. Replace `src/data/shop.ts` prices with Universal Hardware's price source, and remove the "past sale price" labels.
6. Remove the demo banners from the Shop and checkout pages, and the demo wording in `Checkout.tsx`. The "Demo: simulate the processor's answer" control already disappears when `provider.live` is true.

## Before going live

- End-to-end tests in the processor's sandbox with its test cards: approvals, declines, 3-D Secure challenges, network errors, double-clicks, refunds.
- Receipts by email, order records, and a refund procedure for staff.
- The policy pages above published and linked from checkout.
- Remove `noindex` and the concept disclaimers only once Universal Hardware has approved the site and takes it over on its own domain.
