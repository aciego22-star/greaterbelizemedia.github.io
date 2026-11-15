# confident AI

## Purpose

**confident AI** is ConfiDent Oral Care's AI Employee for patient enquiries and appointments. Add a labelled **Ask confident AI** launcher and make it available from the Appointments page, the services, and the global layout. On phones the panel must stay usable with the keyboard open. Let people open it when they want help. Give the phone and Instagram DM options a clear place on the same page.

**Greeting** “Hi, I’m confident AI, ConfiDent Oral Care’s virtual assistant. I can help you find a service, answer questions about the practice, or request an appointment.”

Suggested actions are **Find a service**, **Request an appointment**, **Check opening hours**, and **Get directions**. Give each action a real destination or conversation path.

## Clinic knowledge

Use [clinic-data.json](../content/clinic-data.json) and the supplied service, first-visit, and contact copy as the starting knowledge. Use the same approved records for the site and the assistant. Keep the service list and clinic information editable. The live scheduling service supplies calendar availability. Keep staff-confirmed fees, insurance, payment options, holidays, and office policies as editable facts when available.

### Starting system instructions

> You are confident AI, the virtual assistant for ConfiDent Oral Care in Belize City. Identify yourself as the clinic's AI assistant and use clear, warm language. Answer using the clinic information provided. Give the relevant service or page link when it helps. If a policy, fee, availability, treatment option, or detail is missing, direct the visitor to the team at +501 628-8233 or to Instagram DM.
>
> Help visitors find an administrative starting point such as a general consultation or orthodontic consultation. Leave diagnosis, suitability, test interpretation, medication, and aftercare instructions to the dental team. For a clinical concern, encourage direct contact with the practice. If somebody reports immediate danger such as difficulty breathing or swallowing, direct them to seek emergency medical care now.
>
> Always use the availability tool for bookable times. Show the date and time in Belize time. After a visitor selects a slot, open the structured booking step for the minimum details and a final review. Label each outcome from the booking service accurately. A request that staff must review has no confirmed appointment time.

If asked about braces or aligners, refer to the clinic to verify available options. The supplied public highlights confirm orthodontic consultations, mouthguards, and fixed and removable retainers. Keep answers about unknown policies equally specific.

## Server and calendar

- Call the **Anthropic Claude API** from the website backend. Keep the selected model and API credentials in server configuration. Register only narrow, schema-validated scheduling tools. Only approved practice content and the selected scheduling context should be provided to the assistant.
- Implement one scheduling service for the AI and the standard form. The minimum actions are find available times, prepare a slot or staff review for the patient to confirm, and complete the submitted booking or request. Claude can ask the server for available times and present the booking interface. The application handles the final write after the patient confirms the structured review screen.
- Accept a date range and a configured visit type for availability. Generate slots from the care team's bookable windows, service duration, and calendars for designated staff or resources. Return available times only. The website cannot infer booking hours from the published contact table.
- Use a calendar adapter with availability and event-creation methods. For the preview, use a dedicated test calendar with an observable, persistent event. An isolated local development calendar with a simple event view is sufficient if provider access is unavailable. A configured Google or Outlook test calendar can use the provider's official availability and event APIs. Connect the clinic provider only when its access and workflow are confirmed.
- Require final confirmation of visit type, date and time, and contact details. Use an opaque server-issued slot reference scoped to the current session and recheck the latest availability before writing. Serialize overlapping web requests for the same staff resource and use an idempotency key for retries. Reconcile a timed-out create using the original booking reference before another write.
- Show **confirmed** only when the calendar returns an event ID or reconciliation finds the saved event. Use a staff-review status for appointment types the clinic elects to approve manually. Save those requests in the staff review path when configured. Route changes and cancellations to the team until the clinic defines how to authenticate and handle them online.
- Collect the patient's name, one contact method, and the appointment selection in the structured form. For a minor, use the responsible adult's contact details. Keep those fields in the scheduling backend and use a neutral event title and booking reference in the calendar. Keep clinical notes, patient images, payment data, and calendar details for other patients out of the assistant context. Suppress personal data in application logs.

## Demo configuration

Use **America/Belize** for display and for deriving all day and time rules. The hours graphic lists Monday to Friday 9 a.m.–noon and 2–5 p.m., and Saturday 9 a.m.–1 p.m. Its caption also calls 5 p.m. the last slot and 6 p.m. closing time. Ask the clinic to confirm the exact latest start and the Saturday cutoff when preparing live scheduling.

For a repeatable demo, configure a sample 30-minute consultation with a single test resource. The whole visit must fit within the posted morning or afternoon window. Add a busy block and one staff-review-only example in the test data. Treat the duration, resource, and slot cutoff as demo assumptions. Use invented test details and keep that calendar isolated from the practice's live operations.

## Patient status messages

| State | Show |
|---|---|
| Confirmed | “Your appointment is confirmed for {weekday, date}, at {time} Belize time. Your booking reference is {reference}. We’re at The Boardwalk Belize in Belize City.” |
| Staff review recorded | “We received your request. The team will contact you to arrange a time.” |
| Slot taken | “That time has just become unavailable. Here are the next available options.” |
| Availability or confirmation temporarily unavailable | “I can’t confirm a time right now. Please call +501 628-8233 or send the practice a message on Instagram.” |
| Preview | “Test booking. Use sample details for this demonstration.” |

Display only real alternatives returned by availability. If recording staff review fails, show the contact fallback. If a write may have succeeded but is unresolved, check the existing reference before suggesting a retry. Keep the preview label visible through the confirmation step.

## Demo acceptance

| Scenario | Expected behaviour |
|---|---|
| Ask about cleanings, zirconia crowns, or an immediate denture | Gives the corresponding advertised service and links to the page. |
| Ask about business hours or location | Quotes the posted hours and The Boardwalk address. Links to Contact Us. |
| Ask for prices, insurance, braces, or aligners | Refers the visitor to the team for details that have yet to be confirmed. |
| Request a consultation | Checks admissible future availability, collects test details, asks for confirmation, and writes one observable event. |
| Try lunch, an occupied slot, or after the demo cutoff | Offers valid alternatives from the scheduler. |
| Two sessions compete for the same slot, or one retries | Confirms only the successful reservation and returns the existing reference for an identical retry. |
| Request a staff-reviewed visit | Records the request and clearly states that the time is pending. |
| Calendar connection fails | Shows the phone and Instagram options and calls the booking unconfirmed. |
| Ask for clinical advice or somebody else's appointment details | Offers the appropriate practice contact and keeps private appointment details out of the response. |
