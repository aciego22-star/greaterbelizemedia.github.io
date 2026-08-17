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
  heading: { en: "Make a payment to ICB", es: "Hacer un pago a ICB" },
  standfirst: { en: "ICB does not process payments through this website. Pay by bank transfer, then send your confirmation to your branch.", es: "ICB no procesa pagos por este sitio web. Pague por transferencia bancaria y luego envíe su comprobante a su sucursal." },

  intro: [
    { en: "ICB does not process payments directly through this website. Use your bank's mobile or online banking service to transfer your payment to one of the ICB accounts below.", es: "ICB no procesa pagos directamente por este sitio web. Use la aplicación o la banca en línea de su banco para transferir su pago a una de las cuentas de ICB que aparecen abajo." },
    { en: "After making your payment, send a screenshot of the payment confirmation to your corresponding ICB branch via WhatsApp. Your payment will be verified before official documents are issued.", es: "Después de hacer el pago, envíe una captura de pantalla del comprobante a su sucursal de ICB por WhatsApp. Su pago será verificado antes de emitir documentos oficiales." }
  ],

  steps: [
    { n: 1, title: { en: "Choose one of ICB's banks", es: "Elija uno de los bancos de ICB" }, body: { en: "ICB holds accounts at Atlantic Bank, Belize Bank and Heritage Bank. Any of the three is fine.", es: "ICB tiene cuentas en Atlantic Bank, Belize Bank y Heritage Bank. Cualquiera de los tres sirve." } },
    { n: 2, title: { en: "Copy the account number", es: "Copie el número de cuenta" }, body: { en: "Each account below has a copy button, so the number goes across exactly as published.", es: "Cada cuenta de abajo tiene un botón para copiar, así el número pasa exactamente como está publicado." } },
    { n: 3, title: { en: "Make the transfer", es: "Haga la transferencia" }, body: { en: "Open your bank's mobile app or online banking service and send the payment to that account.", es: "Abra la aplicación de su banco o su banca en línea y envíe el pago a esa cuenta." } },
    { n: 4, title: { en: "Take a screenshot", es: "Tome una captura de pantalla" }, body: { en: "Capture the payment confirmation your bank shows you once the transfer is done.", es: "Capture el comprobante de pago que le muestra su banco una vez hecha la transferencia." } },
    { n: 5, title: { en: "Send it to your branch", es: "Envíela a su sucursal" }, body: { en: "Choose your ICB branch below and send the screenshot on WhatsApp. You will need to attach it yourself.", es: "Elija su sucursal de ICB abajo y envíe la captura por WhatsApp. Usted debe adjuntarla." } },
    { n: 6, title: { en: "Wait for verification", es: "Espere la verificación" }, body: { en: "ICB verifies the payment before official documents are issued.", es: "ICB verifica el pago antes de emitir documentos oficiales." } }
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
    title: { en: "Send your payment confirmation", es: "Envíe su comprobante de pago" },
    body: { en: "After completing your bank transfer, choose the corresponding ICB branch and send a screenshot of your payment confirmation through WhatsApp.", es: "Una vez hecha la transferencia, elija la sucursal de ICB que le corresponde y envíe una captura de su comprobante de pago por WhatsApp." },
    /* The customer attaches the file. A wa.me link cannot carry one, and
       saying so is better than letting someone assume it was sent. */
    attachNote: { en: "Attach the screenshot yourself once WhatsApp opens. A link cannot carry the file for you.", es: "Adjunte usted mismo la captura cuando se abra WhatsApp. Un enlace no puede llevar el archivo por usted." },
    prefill: { en: "Hello ICB, I am sending my payment confirmation for verification.", es: "Hola ICB, le envío mi comprobante de pago para verificación." }
  },

  /* Email is offered for help, NOT as a place to send receipts. ICB has
     not said the inbox is a receipt channel, so the copy does not. */
  help: {
    title: { en: "Need help with a payment?", es: "¿Necesita ayuda con un pago?" },
    body: { en: "For assistance with a payment, contact ICB.", es: "Para ayuda con un pago, comuníquese con ICB." },
    emailNote: { en: "For assistance. Payment confirmations go to your branch on WhatsApp.", es: "Para asistencia. Los comprobantes de pago van a su sucursal por WhatsApp." }
  }
};
