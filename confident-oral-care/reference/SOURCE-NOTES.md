# ConfiDent Oral Care | Sources for the build

## Practice details

The [business card](reference-material/business-card-back.jpg) supplies Dr. Brittni Haylock’s name and designation, the address at The Boardwalk Belize, and the clinic’s phone, email, and social names. The [hours announcement](reference-material/hours-and-booking.jpg) gives the posted times, phone and DM options, last appointment slot, and closing time. The precise last bookable start per day, services eligible for direct booking, and calendar provider require confirmation when connecting a live calendar.

The seven supplied story screenshots are in [reference-material](reference-material/). The corresponding files are named in [clinic-data.json](content/clinic-data.json). The consultation highlight was supplied twice and has one catalogue entry for each advertised consultation and X-ray service. Prices, insurance, and braces or clear aligners have yet to be verified with the practice.

The packaged logo and both responsive photo pairs are copies of the files provided for the project. Use the originals in [assets](assets/) for the build. Keep the story screenshots and business card in the project reference folder. They are supporting evidence for the team reviewing the content.

The clinic links supplied for Contact Us and the footer are [Instagram](https://www.instagram.com/confidentoralcare.bz/) and [Facebook](https://www.facebook.com/share/1F7DRqRkB8/?mibextid=wwXIfr).

## Design and typography

The live reference presents the practice through large-scale imagery and warm, understated styling. Its agency describes the underlying use of neutral tones and photography of the team and rooms. [Parchment Street Dental](https://parchmentstreet.co.uk/) · [Align Media case study](https://alignmedia.co.uk/parchment-street-dental-portfolio/)

The reference homepage's computed CSS showed Glossy with Cormorant Garamond as the fallback for a display heading and Red Hat Display for the sampled paragraph. Use the brief's fallback pair when preparing the preview. [Cormorant Garamond](https://fonts.google.com/specimen/Cormorant+Garamond) · [Red Hat Display](https://fonts.google.com/specimen/Red+Hat+Display)

## Patient education

These are general editorial references for the original copy. ConfiDent's own material establishes which treatments it offers.

- Dental examinations, cleanings, and imaging. [MedlinePlus](https://medlineplus.gov/lab-tests/dental-exam/) · [ADA MouthHealthy on X-rays](https://www.mouthhealthy.org/all-topics-a-z/x-rays)
- Fluoride, sealants, fillings, and whitening. [ADA on fluoride](https://www.mouthhealthy.org/all-topics-a-z/fluoride) · [ADA on sealants](https://www.mouthhealthy.org/all-topics-a-z/sealants) · [NHS dental treatments](https://www.nhs.uk/live-well/healthy-teeth-and-gums/dental-treatments/) · [ADA on whitening](https://www.mouthhealthy.org/all-topics-a-z/teeth-whitening)
- Mouthguards and retainers. [ADA on athletic mouthguards](https://www.ada.org/resources/ada-library/oral-health-topics/athletic-mouth-protectors-mouthguards/) · [American Association of Orthodontists on retainers](https://aaoinfo.org/whats-trending/what-are-dental-retainers/)
- Dental crowns and the need to contact a dentist about a loose or displaced restoration. [Cleveland Clinic on crowns](https://my.clevelandclinic.org/health/treatments/10923-dental-crowns) · [NHS England urgent dental care guidance](https://www.england.nhs.uk/long-read/clinical-guidance-unscheduled-urgent-and-non-urgent-dental-care/)
- Root canal treatment and retreatment. [American Association of Endodontists on root canal treatment](https://www.aae.org/patients/root-canal-treatment/what-is-a-root-canal/) · [AAE on retreatment](https://www.aae.org/patients/root-canal-treatment/endodontic-treatment-options/endodontic-retreatment/)
- Extractions, surgical removal, and dry socket. [Cambridge University Hospitals on surgical extractions](https://www.cuh.nhs.uk/patient-information/surgical-extraction-of-teeth/) · [NHS extraction recovery and complications](https://www.nhs.uk/tests-and-treatments/wisdom-tooth-removal/) · [NHS emergency dental guidance](https://www.nhs.uk/nhs-services/dentists/how-to-find-an-nhs-dentist-in-an-emergency/)
- Partial, full, temporary, and immediate dentures. [NHS on dentures](https://www.nhs.uk/tests-and-treatments/dentures/) · [University of Bristol Dental School on immediate dentures](https://www.bristol.ac.uk/dental/treatment/patient-information/immediatedentures/) · [University of Michigan removable partial dentures teaching notes](https://open.umich.edu/sites/default/files/downloads/JShotwell-Week1.pdf)

## Implementation

- Claude API tool call handling. [Claude Platform Docs](https://platform.claude.com/docs/en/agents-and-tools/tool-use/handle-tool-calls)
- Google Calendar adapter if configured. [Free/busy query](https://developers.google.com/workspace/calendar/api/v3/reference/freebusy/query) · [Create an event](https://developers.google.com/workspace/calendar/api/v3/reference/events/insert)
- Microsoft 365 adapter if configured. [Get schedule](https://learn.microsoft.com/en-us/graph/api/calendar-getschedule?view=graph-rest-1.0) · [Create an event](https://learn.microsoft.com/en-us/graph/api/calendar-post-events?view=graph-rest-1.0)
