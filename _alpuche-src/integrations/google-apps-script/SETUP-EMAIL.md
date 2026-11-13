# Turn on enquiry emails for Alpuche AI (free)

Alpuche AI collects a short enquiry and sends it by email. A confirmation goes to the visitor if they gave an email address. Delivery runs on Google Apps Script and sends from a Gmail account you choose. It costs nothing and needs no card.

**Limits**
- A personal Gmail account can send to about 100 recipients a day this way. Each enquiry uses up to 2 (office plus confirmation), so the script accepts at most 40 enquiries a day.
- A Google Workspace account allows about 1,500 recipients a day.

**Who sees what**
- During the demo, enquiries go to an inbox you choose, not to the firm. Both subjects start with `[Demo]`.
- Switch the inbox to the firm's address only after the firm approves the workflow and a privacy notice.

It takes about 10 minutes. On a phone, use your browser's "Desktop site" option for script.google.com.

## 1. Create the script
1. Go to **script.google.com** and sign in with the Gmail account the emails should come from.
2. Tap **New project**, then rename it (top left) to `Alpuche AI enquiries`.
3. Delete the sample code and paste in the whole of **Code.gs**.
4. Near the top, change `LEAD_INBOX: 'you@example.com'` to the inbox that should receive enquiries.
5. Tap **Save** (the disk icon).

## 2. Send yourself a test
1. In the function menu next to **Run**, choose `testSend`, then tap **Run**.
2. Google asks for permission:
   - Tap **Review permissions** and choose your account.
   - Tap **Advanced**, then **Go to Alpuche AI enquiries (unsafe)**. The warning appears because the script is yours and unverified.
   - Tap **Allow**.
3. Check your inbox for two emails: the enquiry and the confirmation.

## 3. Publish it as a web app
1. Tap **Deploy**, then **New deployment**.
2. Tap the gear next to "Select type" and choose **Web app**.
3. Set **Execute as** to *Me* and **Who has access** to *Anyone*. "Anyone" lets the website send to it without a sign-in.
4. Tap **Deploy** and copy the **Web app URL**. It ends in `/exec`.

## 4. Connect the website
Send the URL to Claude, or rebuild the site yourself:

```bash
node _alpuche-src/build.mjs --netlify --lead-endpoint=https://script.google.com/macros/s/XXXX/exec
```

The site's security settings then allow requests to that address and nowhere else.

## Changing things later
- **Settings:** edit `CONFIG` in Code.gs (inbox, sender name, `[Demo]` prefix, daily limit). Then use **Deploy → Manage deployments → Edit → Version: New version → Deploy** so the live URL picks up the change. The URL stays the same.
- **Pausing it:** **Deploy → Manage deployments → Archive**. The assistant will then tell visitors to call or email the office.

## What the script protects against
- **Only expected fields are accepted.** Names are reduced to letters, the matter must be one of the firm's areas, the message is capped at 500 characters, and email addresses and phone numbers are checked.
- **The confirmation never repeats the visitor's message.** That stops anyone using it to send their own text to someone else's address.
- **Sending is limited.** The same email address or phone number can send once every 30 minutes, with 40 enquiries a day in total, and the script checks Gmail's remaining quota before sending.
- **A hidden honeypot field catches simple bots.**
- **Nothing is stored in Google Sheets or elsewhere.** The only copies of an enquiry are the emails themselves.
