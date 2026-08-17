/* ============================================================================
   ICB.DATA.payments — how ICB is actually paid.

   ICB DOES NOT TAKE PAYMENTS ON ITS WEBSITE. Payment is a bank transfer
   the customer makes through their own bank, followed by a screenshot
   sent to their branch on WhatsApp, which ICB then verifies. Nothing on
   this site processes, submits, verifies or completes a payment, and no
   copy may suggest otherwise.

   What that rules out, deliberately: card fields, amount fields, any
   banking login, a receipt upload, and any "payment successful" state.
   A website also cannot attach the customer's screenshot to WhatsApp for
   them, so the instructions say to attach it themselves rather than
   pretending a link can carry a file.

   App links are the verified App Store and Google Play pages. There is no
   reliable way for a page to open "the banking app" or to know whether it
   is installed, so no custom URL schemes are invented here: the store
   page is the honest destination, and it offers to open the app when it
   is already installed. Desktop visitors are pointed at online banking.

   The payment-confirmation directory is NOT a list kept here. It is
   derived from ICB.DATA.receiptLines(), which reads the receipt flag on
   the WhatsApp lines in js/data/locations.js. One dataset, so a branch
   cannot be listed as taking receipts on one screen and not another.
   ========================================================================== */
window.ICB = window.ICB || {};
ICB.DATA = ICB.DATA || {};

ICB.DATA.payments = {
  heading: "Make a payment to ICB",
  standfirst: "ICB does not process payments through this website. Pay by bank transfer, then send your confirmation to your branch.",

  intro: [
    "ICB does not process payments directly through this website. Use your bank's mobile or online banking service to transfer your payment to one of the ICB accounts below.",
    "After making your payment, send a screenshot of the payment confirmation to your corresponding ICB branch via WhatsApp. Your payment will be verified before official documents are issued."
  ],

  steps: [
    { n: 1, title: "Choose one of ICB's banks", body: "ICB holds accounts at Atlantic Bank, Belize Bank and Heritage Bank. Any of the three is fine." },
    { n: 2, title: "Copy the account number", body: "Each account below has a copy button, so the number goes across exactly as published." },
    { n: 3, title: "Make the transfer", body: "Open your bank's mobile app or online banking service and send the payment to that account." },
    { n: 4, title: "Take a screenshot", body: "Capture the payment confirmation your bank shows you once the transfer is done." },
    { n: 5, title: "Send it to your branch", body: "Choose your ICB branch below and send the screenshot on WhatsApp. You will need to attach it yourself." },
    { n: 6, title: "Wait for verification", body: "ICB verifies the payment before official documents are issued." }
  ],

  /* Account numbers are reproduced exactly as supplied. Anything here is
     what a customer will type into their bank, so it is checked digit by
     digit in the verification suite rather than trusted by eye. */
  accountName: "Insurance Corporation of Belize",
  banks: [
    {
      id: "atlantic",
      name: "Atlantic Bank Ltd.",
      accountName: "Insurance Corporation of Belize",
      account: "100021393",
      online: "https://aolweb.atlabank.com/",
      ios: "https://apps.apple.com/us/app/atlantic-bank-mobile-banking/id1608600308",
      android: "https://play.google.com/store/apps/details?id=com.mobilebankingatlanticbank"
    },
    {
      id: "belize",
      name: "Belize Bank Ltd.",
      accountName: "Insurance Corporation of Belize",
      account: "129923010120026",
      online: "https://online.belizebank.com/",
      ios: "https://apps.apple.com/us/app/belize-bank-mobile-banking/id1361907333",
      android: "https://play.google.com/store/apps/details?id=com.belizebank.mobile"
    },
    {
      id: "heritage",
      name: "Heritage Bank Ltd.",
      accountName: "Insurance Corporation of Belize",
      account: "1560",
      online: "https://secure.heritageibt.com/login.html",
      ios: "https://apps.apple.com/us/app/heritage-bank-ltd/id1484725931",
      android: "https://play.google.com/store/apps/details?id=com.heritage.mobile.android.ui"
    }
  ],

  receipts: {
    title: "Send your payment confirmation",
    body: "After completing your bank transfer, choose the corresponding ICB branch and send a screenshot of your payment confirmation through WhatsApp.",
    /* The customer attaches the file. A wa.me link cannot carry one, and
       saying so is better than letting someone assume it was sent. */
    attachNote: "Attach the screenshot yourself once WhatsApp opens. A link cannot carry the file for you.",
    prefill: "Hello ICB, I am sending my payment confirmation for verification."
  },

  /* Email is offered for help, NOT as a place to send receipts. ICB has
     not said the inbox is a receipt channel, so the copy does not. */
  help: {
    title: "Need help with a payment?",
    body: "For assistance with a payment, contact ICB.",
    emailNote: "For assistance. Payment confirmations go to your branch on WhatsApp."
  }
};
