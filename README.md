# Persona Spectrum / 人格光谱

A buildless Chinese personality exploration site with 110 questions, sixteen type reports, original-copy content, and bundled SVG illustrations.

## Run locally

Live website: https://kimura6341.github.io/MBTI/

GitHub Pages publishes `dist/` through `.github/workflows/pages.yml` after checks pass on pushes to `main`. It can also be run manually from the Actions tab.

Requires Node.js 22 or later. No npm installation is needed.

```sh
npm run dev
```

Open http://127.0.0.1:4173. Deploy `dist/` as a static website. The `#reference-preview` hash opens the sample report and lets you switch between 16 types and A/T variants.

## Check and build

```sh
npm test
npm run build:offline
```

The default offline output is `../../outputs/persona-lab/`. To choose another folder, set `PERSONA_OFFLINE_DIR` before building. The HTML embeds all content, scripts, styles, and 32 SVG assets and can be opened without a server.

## Edit report content and images

The homepage is a separate landing view modeled on the owner-authorized reference homepage, with desktop/mobile camping illustrations. The English homepage uses `dist/english-home.mjs` and `dist/home-reference.css`. Its four metric cards reproduce the supplied reference screenshot's static figures and labels (100K+, 200M+, 1.58B+, 91.2%); these are reference content rather than live measurements of this site. The test remains available at `#test`; report samples and type previews stay separate from personal answers.

Homepage SVG sources are documented in `dist/assets/home/sources.json`. Run `python build-home-assets.py` after replacing those assets.

- `content/type-copy.md`: the user-maintained sixteen-type introduction text.
- `python sync-type-copy.py`: imports that text into `dist/user-type-copy.mjs`.
- `dist/assets/personality/`: the 32 source SVGs and their source manifest.
- `python build-type-images.py`: rebuilds the embedded image module from those files.
- `dist/chapter-art.mjs`: growth and relationship illustrations.
- `dist/report.mjs`, `dist/type-stories.mjs`: scoring-dependent narratives and chapter material.

Python helper scripts use only the standard library. Rebuild the offline HTML after changing content or assets.

## Data and email capture

The online homepage and all report HTML pages use PostHog for anonymous usage analytics with the supplied public project token and US ingestion host. We do not call `identify` or attach customer emails to analytics. The supplied `api_host`, `defaults: '2026-05-30'`, and `person_profiles: 'identified_only'` remain unchanged in `content/posthog-snippet.html`. `npm run build:web` injects that exact snippet and the separate privacy bootstrap into each page's head, including legacy report redirects. Report source regeneration is followed by `npm run build:web` to reapply instrumentation.

All inputs (including email, honeypot, and questionnaire controls) have `ph-no-capture`; dynamic inputs are also protected. Autocapture is limited to link/button clicks, with text and attributes masked. Session recording is disabled and IP collection is disabled in the SDK configuration. Query strings and private result/export fragments are removed from analytics URL properties. PostHog's anonymous browser/session identifiers and normal technical event metadata still apply; no input values or individual answer records are sent to PostHog.

The bootstrap disables automatic pageviews and records one initial `$pageview` plus one per `hashchange`, so hash routes such as `#test` work without duplicate history tracking. Custom events only include these application properties:

| Event | Properties / trigger |
| --- | --- |
| `test_started` | None; entering the test, including a direct `#test` visit, but not internal question-group renders |
| `test_page_completed` | `page` (1–10); valid group submission, including revisits |
| `test_completed` | `type`, `variant`, `ei`, `ns`, `tf`, `jp`, `at`; a completed assessment with a conclusive result |
| `report_viewed` | `type`, `variant`; opening a report, including previews |
| `report_download_clicked` | None; clicking a report download/email entry point |
| `email_form_submitted` | None; submitting a valid email request, before delivery confirmation |

Dimension percentages are the winning pole's strength (50–100), matching the displayed report; they are not always the left pole's percentage. Exact ties retain the existing inconclusive-result behavior and do not emit `test_completed` with a fabricated final type. Event properties never include the email or individual answers. Analytics failures cannot block the test or report request.

Assessment answers remain in browser localStorage, with the completed answer snapshot in sessionStorage. Separately from analytics, a customer who submits a report request explicitly sends their email, result and private answer-export link to the configured FormSubmit endpoint for manual report fulfillment. This does not automatically email the customer a report. Offline builds remove the entire PostHog snippet and bootstrap from the homepage and every report, replace the online analytics notice, and contain no PostHog loader or token.

## Scoring

60 original exploration questions and 50 adapted IPIP Big-Five Factor Markers questions are interleaved but scored independently. IPIP answers do not change the four-letter type. Percentages show scale positions, not population percentiles or accuracy. This questionnaire and its Chinese adaptation have not been psychometrically validated and do not implement the proprietary 16Personalities or official MBTI scoring algorithm.

IPIP sources:

- https://www.ipip.ori.org/New_IPIP-50-item-scale.htm
- https://ipip.ori.org/newBigFive5broadKey.htm
- https://ipip.ori.org/newPermission.htm

Original-copy and illustration assets were supplied or collected under the project owner's authorization. Their provenance is retained in the content file and asset manifest.


## English questionnaire and imported reports

The active site uses 60 supplied English questions. Each of five dimensions has 12 equally weighted items, with reverse-keyed directions from the supplied CSV. This is explicitly approximate scoring, not the proprietary NERIS algorithm. Exact ties are reported as inconclusive rather than assigned a type.

Thirty-two supplied full HTML reports are served at dist/reports/TYPE-A.html and dist/reports/TYPE-T.html, retaining their original embedded styling, illustrations, and free chapters. Both -A and -T source editions are available. The calculated identity selects its matching source report; neither edition is produced by relabeling the other. Legacy TYPE.html links redirect to the matching edition. Saved sample percentages are replaced by the current assessment values. Paid services are not connected. The report request form sends the customer-approved data to FormSubmit for manual fulfillment; its entered email and answers are excluded from PostHog analytics.

Run npm test, npm run build:web, and npm run build:offline. Offline output includes an entry HTML and a companion reports folder; keep them together. Source import helpers read the user-supplied files from their original locations; generated assets are committed for deployment.


Algorithm reference: content/algorithm-spec.md and content/algorithm-key.json preserve the user-supplied reverse-engineered specification. Answer encoding is -3 for strongly agree and +3 for strongly disagree. Existing v1 browser answers migrate by sign inversion to v2, preserving selections. All sixty axis/direction assignments match the supplied key; the all-disagree fixture returns ISTP-A. The documented >=0 tie rule is used internally; the UI still shows an inconclusive dimensional result when any axis is exactly tied. Item weights are explicitly assumed 1, and displayed percentages remain a local linear estimate because official weights and the transform are unknown.


Homepage: the English landing page now adapts the reference homepage's original responsive layout, angular section dividers, illustrations, and Inter / Red Hat Display fonts. Embedded SVGs and fonts work offline. The four metric cards show this site's actual 60 questions, 16 types, 32 report editions, and approximate completion time. The testimonials / personality-card carousel section is omitted at the user’s request; adjacent calls to action lead to the assessment. Persona Spectrum branding and the previously simplified navigation are retained. The homepage stylesheet is disabled on the questionnaire to keep the layouts independent.


Questionnaire interaction: first-time pointer selection saves the answer, then smoothly centers the next question. Clicking a previously answered question centers that question and keeps it in view after editing, including when the same checked option is clicked again. The end of a group scrolls to its navigation controls and never submits automatically. Keyboard selection remains in the current question; reduced-motion preferences disable smooth animation. Pending navigation is cancelled on new input, manual scrolling, view changes, and form submission. Transparent native radio inputs and visible circles consistently use a pointer cursor, with hover and focus feedback.


Report charts use a shared bipolar coordinate mapping: a left-pole percentage p maps to x=100-p, and a right-pole percentage p maps to x=p. The marker is positioned against the full track with its center at x, including x=50 for a 50% result. The track is always fully colored (fillStart=0, fillWidth=100), with both ends rounded to match the track and no midpoint tick. Labels track the marker and clamp at the track edges, recalculating on resize and font load. Native sample previews and scored results share this renderer.


Report email entry points: all 32 report pages have a large email-download banner, a $19.99 crossed-out / limited-time free offer, and no inline Email / Compare strip. The scoring notice remains in the footer. Configure content/report-delivery.json with a deployed HTTPS mail endpoint, then regenerate the report pages. The endpoint receives POST JSON with email, type, result, reportUrl, and website (honeypot); it must validate inputs, restrict the allowed site origin, rate-limit requests, keep provider secrets server-side, and return {"sent": true} only after provider acceptance. A successful HTTP response alone does not display success. No endpoint is configured yet, so email submission is explicitly disabled and a direct HTML download remains available. No email is stored or transmitted in that state.


Manual fulfillment mode: customers submit a report request rather than triggering automated report delivery. Configure the receiving work email through a FormSubmit AJAX endpoint (prefer its random endpoint token after activation) in content/report-delivery.json. Each notification contains the customer email, type, actual assessment percentages (or an explicit preview marker), a report URL carrying those scores, request timestamp, and manual-delivery status. No autoresponse is requested and CAPTCHA is not disabled. The provider must be activated by the receiving mailbox owner. Without an endpoint, requests remain visibly unavailable and no fake success is shown. For a custom endpoint, return {"received":true} only once the request is durably accepted.

Customer answer Excel: new completed assessments retain a validated 60-answer snapshot in sessionStorage. Report requests include a download_answers_excel URL, not an unreliable FormSubmit AJAX file attachment. The private URL fragment carries the submitted record (not published to GitHub); answer-export.html validates it, recomputes results, and creates a two-sheet .xlsx locally. Preview or legacy requests explicitly have no answer record. No answers are inferred. The request form explains transmission via FormSubmit. Treat forwarded export links as customer data.
