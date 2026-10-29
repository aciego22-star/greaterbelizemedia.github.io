# Possible production options

These are hypotheses for discussion after discovery with Universal Hardware's management, not commitments. Scope, priorities and fees would be agreed only after the company's requirements are understood. None of these are built into the concept beyond the integration seams noted.

| # | Option | What it adds | Depends on | Seam in this concept |
|---|---|---|---|---|
| 1 | **Content & catalogue management** | Staff-editable categories, products, photos, promotions and branch details (headless CMS or similar), approved photography and logos | Content owner at the company; photography | `src/data/*.ts` already models categories, brands and branches as typed records |
| 2 | **Inventory & pricing feed** | Optional live or nightly availability and prices from the existing POS / ERP | Access to the stock system; pricing policy | Category and product pages are data-driven; stock badges deliberately absent until real data exists |
| 3 | **Product-level catalogue** | Individual product pages with specs and models, starting with priority lines | Item data, approvals per brand | Search index (`src/lib/search.ts`) extends to product records |
| 4 | **Enquiry routing to real staff** | Send the Enquiry Summary to the chosen branch by WhatsApp Business, email or CRM, with consent and privacy notice | Staff routing rules, consent wording, data-retention policy | `EnquiryDraft` shape and `buildSummary()` in `src/lib/enquiry-store.ts` |
| 5 | **AI Employee** | Multilingual product discovery, branch enquiries and request qualification on company-verified knowledge, with staff hand-off and clear AI disclosure | Approved knowledge base, escalation process, hosting & security review | `GuideEngine` interface (`src/lib/guide/types.ts`), Chatbase adapter |
| 6 | **Bilingual site (English / Spanish)** | Full Spanish content once the company confirms it can serve Spanish-speaking enquiries | Translation review, service commitment | Guide already supports EN / ES responses |
| 7 | **Service & parts journeys** | Service request intake per branch, parts lookup by model or catalogue | Service process per brand | Service section and Meilun catalogue links |
| 8 | **Reporting** | Privacy-respecting insight: top searches, finder paths, enquiry categories by branch | Consent and analytics policy | Finder and search events are centralised in islands |
| 9 | **E-commerce (if wanted)** | Online ordering with card payment and branch collection for selected lines | Universal Hardware's own merchant account and processor, current prices and stock (2), fulfilment, returns and refund policy | Shop, cart and checkout built; card step runs in demo mode behind the `PaymentProvider` interface (`src/lib/payments/`). See [`PAYMENTS.md`](PAYMENTS.md) |
| 10 | **Launch hardening** | Domain cut-over, accessibility audit on real devices, performance budget, legal pages, backups | Company IT / domain access | Static, CSP-locked build is the baseline |
