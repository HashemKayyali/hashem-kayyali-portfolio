# Portfolio modernization — implementation and review

Implemented on `codex/portfolio-modernization` in `C:\Users\hashe\Desktop\site`, based on `main` commit `7094686`. React/Vite, burgundy palettes, glass surfaces, sidebar, responsive cards, galleries and five-language prerendering remain. Changes are committed locally for review; no remote push, merge or production deployment was performed.

## Changes and reading structure

The canonical professional identity now appears consistently in the hero, navigation, About metadata, professional profile, footer and localized metadata. Person structured data identifies R&D Product Engineer and Software Engineer and the graduated university. The social image was regenerated from the existing brand composition and visually inspected.

**R&D Product Engineer | Software Engineer | Embedded Systems, IoT & Hardware–Software Integration**

The public content source is now tracked `content/master.json`. `scripts/generate-locales.mjs` remains a transform; the five dictionaries are generated rather than independently authored. The legacy ignored master is synchronized locally but is unnecessary on a clean checkout. English About retains the exact six approved paragraphs, grouped into four reading areas with two columns on desktop and one on mobile.

Experience has four groups and three separately dated Terminal roles. Employer media is keyed by stable IDs; adding independent work no longer shifts company pictures. The graduation record is corrected without invented credentials.

Discovery keeps concise cards and detailed modals. Five categories distinguish Software, Business Systems, R&D / IoT, Automation and Computer Vision. A collapsible project index opens any matching case study directly. Long titles wrap; sticky card positions use individual measured heights. Dialogs move and trap focus, restore the opener, make the page behind inert, retain internal scrolling, arrows, fullscreen and RTL behavior, and honor reduced motion in gallery scrolling.

The financial system includes a clearly labeled architectural illustration. Existing Outreach raster media exposed inbox addresses and account information; all 13 originals/derivatives were moved to ignored `output/privacy-originals/outreach-automation-platform`, outside public assets. Two labeled illustrative SVGs replace them while retaining a two-image gallery. Captions are translated into all five languages. Original files are locally recoverable; this branch does not rewrite Git history or update the currently deployed site.

## Measured performance

| Measurement | Baseline | Modernized audit |
| --- | ---: | ---: |
| Lighthouse mobile performance | 33/100 | 40/100 |
| LCP | 8.542 s | 6.017 s |
| Total Blocking Time | 1,499 ms | 1,533 ms |
| CLS | 0 | 0 |
| Initial images including icons | 495,667 B | 120,263 B |
| Local uncompressed total transfer | 1,386,776 B | 889,569 B |
| Network requests / failures | 14 / 0 | 14 / 0 |

Final shipping JavaScript (entry plus English dictionary): **450,814 bytes / 141,524 gzip**, compared with **585,399 / 179,537 gzip** at baseline: 23.0% raw and 21.2% gzip reduction despite the additional content/project. Other locales load on selection, and the modal remains lazy. The 12 retained raster sources now have 24 correctly sized derivatives; 320 variants total 125,808 bytes versus 837,332 bytes of source assets (85.0% lower inventory size). This inventory is separate from initial navigation payload.

Self-hosted variable fonts remove Google font stylesheet/origin requests, with swap and original typography/fallbacks. Touch scrolling is native; Lenis runs only for fine-pointer, visible, normal-motion sessions. Offscreen copies unsubscribe, hidden documents pause rendering, secondary shaders compile on demand, mobile rendering is capped, and reduced-motion/save-data/low-resource devices use a persistent static field.

LCP improved 29.6% in the measured pair. **TBT did not improve** and remains an unresolved performance limitation. Both runs used official Lighthouse 13.5.0, headless Edge 155, simulated mobile 412×823 / DPR 1.75, 150 ms RTT / 1,638.4 Kbps and 4× CPU slowdown on the same no-store uncompressed local server. Both emitted host-CPU warnings (benchmark 640 / 649.5); these are single lab runs, not field guarantees. INP was not measured because no real-user dataset exists. The audit preceded the final below-fold Outreach media replacement; shipping bundle totals above were remeasured after that rebuild. [Full measurements, conditions and repeat commands](performance-modernization.md).

## Verification

| Check | Result |
| --- | --- |
| `npm run validate:content` | 14/14 passed; schemas, generated/source equality, exact approved About, dates, role groups, 11 IDs, public fields/technologies |
| `npm run typecheck` | Passed |
| `npm test` | 4/4 passed: locale cache/deduplication, request race, retry, hidden/unsubscribed/static warp delivery |
| `npm run build` | Passed; all five locale HTML pages prerendered |
| `npm run validate:seo` | 11/11 passed; identity, alumni, canonical/hreflang, sitemap, schema, 11 projects and social assets |
| `git diff --check` | Passed |
| Edge browser QA | 34 primary scenarios + 5 navigation scenarios + 5 Outreach follow-up scenarios passed; no runtime errors |
| Review | Independent source review and Outreach privacy follow-up found no remaining material issues |

Browser coverage: en/ar/de/fr/es; layouts at 390, 768 and 1366 px; correct RTL; six filter buttons with counts 11/2/3/4/1/1; all 55 initial locale/project detail opens; gallery arrows, fullscreen and keyboard focus in English/Arabic; five language switches and Back/Forward; mobile drawer and normal-motion section navigation/scroll; modal focus restoration; PDF/DOCX HTTP 200. The final privacy build additionally exercised Outreach SVG gallery/fullscreen and localized captions in all five languages, with no failed asset requests. Visual inspection covered each language plus About, professional journey, long German financial titles, Arabic Outreach, and both new SVGs. Sticky element screenshots can misrepresent viewport positioning; direct viewport captures were used for About/Resume review.

The public Eventies link was reachable, and Glitzz Lab resolved to its localized `/en` page. This checks public destinations, not project backends, payment/WhatsApp integrations or production workflows. No lint script exists. Browser coverage uses installed Edge; Safari, physical devices, assistive technology and a complete accessibility audit were not performed.

The SSR build reports that locale modules are imported both statically and dynamically; this is expected in the server bundle that prerenders every language. The client build emits separate locale chunks, as verified by the production inventory.

Local QA evidence (ignored, available in this workspace): `output/playwright/modernization-functional.json`, `modernization-navigation.json`, `modernization-outreach.json`, corresponding screenshots, baseline/final Lighthouse JSONs and `output/modernization-final/asset-inventory.json`. The optional browser scripts are tracked under `scripts/verify-*.cjs`; application dependencies remain unchanged.

## Remaining limitations and factual basis

- **Official resume files are outdated.** The existing PDF and DOCX still use the former Co-Founder headline, an August 2025 Eventies start, and the older combined Terminal progression; they omit the new training/independent structure. Both files were inspected and deliberately preserved. Their links work, but their content needs a separately approved replacement.
- Other project descriptions use the supplied approved factual brief. The financial accounting implementation was also checked against available local source: balanced postings, journal persistence, account/reporting state, audit reasons and linked reversals. No live database, legal accounting compliance or production scale was verified or claimed.
- Financial and Outreach diagrams are illustrations, not product screenshots or evidence of additional implemented capabilities. No government accreditation, fabricated business metrics, Coin Mode completion or private repository links were added.
- Mobile TBT remains high; the lab result and CPU conditions are disclosed. Rendering cadence changes preserve the visual palette but deliberately reduce animation frequency.
- A production deploy was not performed; current live content/media remain unchanged until approved integration.

## Preview and review

The production preview is available locally at http://127.0.0.1:4173/. Review `/ar/`, `/de/`, `/fr/`, `/es/`, then project filters/details, grouped roles and graduation. To reproduce:

```powershell
Set-Location C:\Users\hashe\Desktop\site
npm ci
npm run generate:content
npm run validate:content
npm run typecheck
npm test
npm run build
npm run validate:seo
npm run preview -- --host 127.0.0.1 --port 4173 --strictPort
```

For optional UI QA, install Playwright outside production dependencies, use installed Edge, and set its module path:

```powershell
npm install --prefix output/browser-tooling --no-audit --no-fund playwright
$env:PLAYWRIGHT_PACKAGE = (Resolve-Path output/browser-tooling/node_modules/playwright).Path
node scripts/verify-portfolio.cjs
node scripts/verify-navigation.cjs
node scripts/verify-outreach.cjs
```

Inspect `git diff main...HEAD` and `git log -1 --oneline` for the committed result. Keep this branch for review; pushing/merging/deploying requires the user’s next instruction.

## Approved About as published (English)

### Professional scope

I'm an R&D Product Engineer and Software Engineer with hands-on experience building and improving products across software, embedded systems, IoT, and hardware–software integration. My work spans web, mobile, desktop, automation, and connected systems, from early requirements and system design through implementation, deployment, and continuous improvement.

### Analysis & engineering decisions

I take an analytical approach to engineering and usually start with the problem before the technology. I focus on understanding the users, workflows, requirements, constraints, and business objective behind a system, then translate that context into clear priorities, system structure, and technical decisions. I break complex problems into smaller parts, compare different approaches, and evaluate solutions based on the expected outcome, time, cost, maintainability, and the value they add to the product.

### Communication & collaboration

Communication is an important part of how I work. I listen carefully, ask the questions needed to understand the real requirement, and adapt the way I communicate depending on whether I'm working with engineers, clients, or non-technical stakeholders. I'm comfortable discussing different viewpoints, explaining technical decisions clearly, and turning broad ideas and operational needs into structured and executable plans.

### Product development & improvement

I'm most engaged by products that can evolve through real-world use. Whether I'm taking an idea from concept to a working system or improving an existing product, I use testing, feedback, and actual usage to decide what should be refined, simplified, rebuilt, or developed next.

When a project requires technology outside my current experience, I'm comfortable learning and evaluating it rather than forcing a familiar approach into the solution. I value constructive feedback, take responsibility for my decisions, and use mistakes as part of the process of improving both the product and the way I work.

What motivates me most is seeing the impact of the work itself — using engineering, analysis, and continuous learning to turn ideas into useful products and increase the value of the systems I work on.

## Professional Journey as published (English)

### Eventies

**Technical Lead** — Part-time; January 2026 – Present; Amman, Jordan; Remote.

Co-founded Eventies and lead the hands-on technical development of the platform, shaping product direction and engineering decisions.

My responsibilities cover product planning, system architecture, user experience, frontend and backend development, integrations, deployment, and continuous product improvement.

I connect operational and business needs with product requirements and practical engineering decisions.

### Independent R&D / Software Engineering

**R&D Product Engineer & Software Engineer** — Self-employed; August 2025 – Present; Amman, Jordan; On-site.

I develop complete products across R&D, software engineering, embedded systems, and hardware–software integration, from early concepts and prototypes through implementation, testing, deployment, and continuous improvement.

The work includes web, mobile, and desktop software, embedded controllers, electronics, sensors, networking, automation systems, and interactive products.

I translate operational requirements into practical solutions and work across the full product lifecycle.

### The Terminal VR

January 2025 – Present; Amman, Jordan.

**Technical Training Lead — Software & VR Content** — Freelance; July 2025 – Present; Hybrid.

Led practical technical training for university students completing their field training, covering software development workflows, VR content creation, technical guidance, progress reviews, and practical project deliverables.

**Technical Operations Engineer** — Full-time; February 2025 – July 2025; Hybrid.

Managed daily technical operations for VR systems, computers, networking, and connected hardware, including installation, configuration, troubleshooting, updates, maintenance, and system reliability.

**Sales** — Full-time; January 2025 – February 2025; On-site.

Started in a customer-facing sales role before transitioning into technical operations. Supported customers, explained interactive experiences, and participated in daily venue operations.

### Umniah

**Youth Unit Operations Team Member** — Part-time; March 2024 – January 2025; Amman, Jordan; Hybrid.

Responsibilities included customer engagement, telecommunications service sales, understanding customer requirements, meeting individual and team targets, customer follow-up, and collaboration with marketing colleagues.

### Education

Amman Arab University — Bachelor's Degree in Computer Software Engineering. October 2021 – September 2026; Graduated.

## Eleven project stories as published (English)

### 1. Eventies

Web Platform · Live · Active Development

**Card summary:** An event-services marketplace connecting customer requests with rentals, production, entertainment, and custom event solutions.

Planning an event often means searching across disconnected suppliers and service lists. Eventies brings event rentals, production services, activations, entertainment, booths, screens, and custom solutions into one digital marketplace, with a customer-facing discovery journey and an operational workflow for handling requests.

**From search to request:** Make fragmented service discovery easier to navigate and connect customer needs to organized event-service requests.

**Building the marketplace:** As co-founder and Technical Lead, I work hands-on across product architecture, user journeys, frontend and backend development, service-catalog organization, database design, integrations, deployment, and continuous improvement.

**Catalog & operations architecture:** The Next.js and TypeScript application uses Supabase for its shared data layer. Product and database decisions keep the public catalog, request journey, and internal handling of those requests connected as the platform evolves.

**Capabilities:**

- Event-service discovery
- Structured customer requests
- Shared customer and operations workflows

**Engineering considerations:**

- Organizing diverse services without making the customer journey difficult to follow.
- Keeping catalog structure, request data, and operational requirements aligned as the product changes.

**Technology:** Next.js, TypeScript, Supabase.

### 2. Glitzz Lab

Web Platform · Live

**Card summary:** A connected graduation and wedding service experience that links customer requests, internal workflows, and Meta WhatsApp communication.

Graduation and wedding services need more than a booking screen: customer choices must reach the business in a form it can act on. Glitzz Lab connects service exploration and requests to internal workflows and automated customer and operational messaging through Meta WhatsApp services.

**A connected service journey:** Keep the customer-to-operations journey connected, so requests and communication remain part of the same service workflow.

**Customer-to-business workflow:** I built the customer experience, frontend and backend workflows, Supabase data model, and Meta WhatsApp integration that connects service requests with business communication.

**Communication inside the workflow:** Next.js and TypeScript connect the public service journey to Supabase-backed operational records. WhatsApp messaging is integrated into those workflows, tying customer communication to the request context rather than treating it as a separate manual task.

**Capabilities:**

- Service exploration and requests
- Internal request workflows
- Automated WhatsApp messaging

**Engineering considerations:**

- Keeping customer-facing choices consistent with internal service handling.
- Preserving request context across data changes and automated messages.

**Technology:** Next.js, TypeScript, Supabase, Meta WhatsApp Integration.

### 3. Umniah YouthConnect

Business System · Internal Operations Platform · Private Project

**Card summary:** Member mobile workflows and authorized leader dashboards built around the same operational data and role-based access.

Members and leaders need the same operational information in different forms. Umniah YouthConnect gives members mobile workflows for availability, shift-related information, internal support, and operational submissions, while authorized leaders use management dashboards for reporting, analytics, reviews, and exports.

**One operation, different roles:** Give each role a useful view of shared information without maintaining disconnected member and management records.

**Member & leader experiences:** I built the Flutter and Dart experiences, operational workflows, Supabase data layer, role-based access, management reporting, and export flows.

**Shared data, role-based access:** A shared Supabase data layer supports distinct member and leader interfaces. Role-based access governs which records and actions are available, while submissions, reviews, analytics, and exports remain connected to the same operational context.

**Capabilities:**

- Member mobile workflows
- Authorized management dashboards
- Operational reports and exports

**Engineering considerations:**

- Matching each role’s interface and permissions to its actual operational needs.
- Keeping submissions and management views consistent within a shared data model.

**Technology:** Flutter, Dart, Supabase.

### 4. The Terminal NFC

Business System · Under Development · Private Project

**Card summary:** A venue operations system linking POS sales, customer accounts, NFC identification, and the actual use of interactive experiences.

A sale at the counter is only one part of operating an interactive venue. The Terminal NFC connects the POS to the applications running its experiences: staff create or select customer accounts and prepare transactions, while NFC cards or wristbands identify customers and associate each transaction with the correct account.

**Sold → used:** Connect what was sold with what was actually used, so sales and experience operation share a coherent account and transaction context.

**Connecting the venue systems:** I built the desktop POS and operational integrations, NFC account identification, centralized API, data workflows, and dashboard connections across the client–server system.

**A central API between clients:** A centralized .NET Web API validates account state and eligibility and mediates between desktop clients and the database. The POS, operational applications, and dashboard share centrally managed transactions, invoices, device usage, and system activity, with NFC serving as the identification layer within that larger architecture.

**Capabilities:**

- Account-linked POS transactions
- API-based eligibility validation
- Shared sales and device-usage records

**Engineering considerations:**

- Validating account state before operational access is granted.
- Keeping transactions and actual device usage connected across multiple clients.

**Technology:** C#, WPF, .NET Web API, REST APIs, NFC, Client–Server Architecture.

### 5. Bike Tower

R&D / IoT · Private R&D Project

**Card summary:** A real-time multiplayer cycling installation linking connected bikes, synchronized games, and responsive lighting.

Pedaling becomes a shared competitive input in Bike Tower. Embedded controllers process physical cycling and communicate with a central Flutter controller that coordinates connected bikes, player states, synchronized game logic, lighting, and live feedback. Tug of War is one example of the multiplayer experience.

**Physical competition:** Turn physical cycling into a coordinated multiplayer experience with immediate game and visual feedback.

**Controller, firmware & hardware:** I developed the Flutter game controller, multiplayer logic, ESP32-S3 firmware, discovery and communication protocols, custom PCB, embedded input processing, and LED control.

**Coordinating connected bikes:** ESP32-S3 controllers process cycling input locally, while WebSockets and UDP connect devices to the central controller. Device discovery, interruption handling, reconnection, and firmware behavior keep physical inputs and multiplayer state coordinated across the installation.

**Capabilities:**

- Synchronized multiplayer cycling
- Tug of War gameplay
- Live lighting and player feedback

**Engineering considerations:**

- Recovering connected devices after network interruptions.
- Keeping player state and visual feedback synchronized with physical cycling input.

**Technology:** Flutter, Dart, ESP32-S3, Embedded C++, WebSockets, UDP, Custom PCB, LED Control.

### 6. Basket Beats

R&D / IoT · Private R&D Project

**Card summary:** A connected basketball game that turns physical impacts into synchronized scoring and real-time feedback across several bases.

A basketball hit must become one reliable digital event, even when impacts arrive rapidly. Basket Beats senses impacts at connected bases, processes them in embedded firmware, and sends scoring events to a central game controller that coordinates game modes, shared state, and real-time feedback.

**A hit becomes a score:** Make fast physical play usable as consistent scoring across a distributed game installation.

**Sensing through game control:** I built the Flutter controller, game logic, embedded C++ firmware, sensing and scoring pipeline, custom PCB, networking, and synchronized feedback across the connected bases.

**Reliable real-time events:** The event path accounts for rapid impacts and sensor noise before queued events cross WebSocket and UDP communication. Acknowledgements, retries, delayed-packet handling, and reconnection behavior help preserve event delivery and keep the controller’s scoring state consistent across several devices.

**Capabilities:**

- Impact-to-score processing
- Synchronized multi-base play
- Centralized game modes and feedback

**Engineering considerations:**

- Distinguishing valid rapid impacts from sensor noise.
- Avoiding lost or duplicated scoring events during delayed delivery and reconnection.

**Technology:** Flutter, Dart, Embedded C++, Sensors, WebSockets, UDP, Custom PCB.

### 7. VR Cycling

R&D / IoT · Prototype · Private Project

**Card summary:** An immersive cycling experience where a real exercise bike controls movement and speed inside a virtual world.

The exercise bike is the game controller in VR Cycling. As a player pedals, physical movement becomes digital riding input that changes movement and speed in the virtual world, connecting the effort of cycling to the experience of riding through it.

**Exercise as immersive gameplay:** Turn exercise into interactive VR gameplay through natural physical input and immediate virtual response.

**Physical-to-virtual integration:** I developed the embedded movement-processing firmware and physical-to-virtual integration that connects bicycle input with the riding experience.

**Pedaling into virtual motion:** Embedded processing converts cycling movement into usable real-time riding input, then passes it into the virtual experience. The central integration challenge is maintaining responsive synchronization between pedaling and virtual motion so the interaction feels connected.

**Capabilities:**

- Physical bike as VR input
- Pedaling-driven virtual movement
- Real-time physical-to-virtual integration

**Engineering considerations:**

- Translating changes in physical effort into stable riding input.
- Keeping virtual response closely synchronized with the player’s movement.

**Technology:** Microcontrollers, Embedded C++, Custom PCB, Hardware–Software Integration.

### 8. Bike-Land Smart Cycling Trainer

R&D / IoT · Completed · Private Project

**Card summary:** A smart cycling trainer translating bicycle movement into live speed, cadence, and distance for training software and interactive applications.

Bike-Land turns physical bicycle movement into structured cycling measurements. Sensors and custom firmware derive live speed, cadence, and distance, while hardware integration connects those metrics to training software and interactive applications. Its focus is useful measurement and integration, distinct from VR Cycling’s immersive gameplay.

**Movement into useful metrics:** Make live physical cycling metrics available to digital training and interactive experiences through a dependable embedded measurement path.

**The embedded measurement product:** I developed the custom firmware, physical sensor processing, cycling calculations, custom PCB, hardware integration, and connection of the measurements to compatible software.

**Stable real-time measurement:** The embedded pipeline processes physical sensor input into a coherent live measurement state before exposing it to connected applications. Stable real-time calculations and reliable hardware–software integration keep speed, cadence, and distance meaningful as cycling input changes.

**Capabilities:**

- Live speed, cadence, and distance
- Physical sensor processing
- Training-software integration

**Engineering considerations:**

- Deriving stable measurements when physical movement changes.
- Maintaining consistent live metrics between the bike and connected software.

**Technology:** Microcontrollers, Embedded C++, Sensors, Custom PCB, Hardware–Software Integration.

### 9. Financial Operations & Accounting System

Business System · Private Project

**Card summary:** A business accounting system connecting double-entry bookkeeping with partner balances, expenses, inventory, reconciliation, and traceable reversals.

Financial operations need accounting rules that stay consistent beyond the dashboard. This general-purpose business system connects a structured General Ledger, Chart of Accounts, double-entry journal entries, and trial balance validation with transaction workflows, partner accounts, expenses, inventory, reconciliation, and reporting.

**Consistency & traceability:** Keep financial movements consistent, traceable, and reversible while giving operational workflows and accounting reports a shared financial context.

**Accounting logic & operations:** I built the React and TypeScript application, Supabase/PostgreSQL data model and accounting logic, journal and transaction workflows, partner balances, expenses and inventory, reconciliation, reporting, and controlled reversal flows.

**Balanced postings & controlled reversals:** Posting workflows persist journal entries, with database constraints validating balanced double-entry movements. General Ledger and trial balance views derive from shared financial state; audit reasons and linked reversal entries preserve the history of corrections rather than silently removing the original movement.

**Capabilities:**

- General Ledger, journals, and trial balance
- Partner balances, expenses, and inventory
- Reconciliation, reporting, and controlled reversals

**Engineering considerations:**

- Preserving balanced entries and consistent account movements across transaction workflows.
- Making corrections explicit and traceable through linked reversals and audit reasons.

**Technology:** React, TypeScript, Supabase, PostgreSQL, Tailwind CSS, Recharts.

**Media:** Illustrative system architecture — no customer records.

### 10. Outreach Automation Platform

Automation System · Private Project

**Card summary:** An organized outreach workflow for contacts, personalized campaigns, templates, sending queues, delivery state, and synchronized replies.

Contact lists, message drafts, sending, and reply follow-up are often disconnected manual tasks. The Outreach Automation Platform brings them into one workflow: organize contacts, prepare personalized email campaigns using reusable templates, process controlled sending queues, track delivery state, synchronize replies, and review campaign activity.

**One outreach workflow:** Replace scattered outreach steps with a coordinated, traceable workflow that preserves the context of every contact and campaign.

**Automation & backend orchestration:** I built the Next.js/React interface, TypeScript backend orchestration, Supabase/PostgreSQL data model, SMTP/IMAP integration, template and campaign workflows, queue logic, reply synchronization, and activity history.

**Queues, delivery & reply context:** Linked contact, campaign, template, message, queue, and reply records support backend orchestration. SMTP handles outgoing mail and IMAP brings replies back into the same context, while delivery state and activity history make campaign progress inspectable.

**Capabilities:**

- Personalized campaigns and reusable templates
- Controlled sending queues and delivery tracking
- Reply synchronization and campaign history

**Engineering considerations:**

- Keeping queue state consistent as messages are processed.
- Associating incoming replies with the correct contact and campaign.

**Technology:** Next.js, React, TypeScript, Supabase, PostgreSQL, SMTP/IMAP.

**Media:** Illustrative outreach workflow — no customer records or account data.

### 11. Traffic Flow Analytics Studio

Computer Vision · Prototype · Private Project

**Card summary:** A desktop studio converting recorded traffic footage into tracked vehicle movements, annotated video, and CSV/Excel analysis outputs.

Recorded traffic footage becomes structured movement data in Traffic Flow Analytics Studio. Users define counting lines and regions, then run vehicle detection, multi-object tracking, route analysis, and background video processing to produce annotated video and structured CSV/Excel exports.

**Footage becomes movement data:** Make recorded footage usable for repeatable movement analysis, with visual evidence and structured data from the same analysis session.

**Desktop analysis tools:** I built the PySide6 desktop interface, OpenCV video tools, YOLOv8 and BoT-SORT detection/tracking pipeline, spatial counting rules, background processing, annotated output, and CSV/Excel exports.

**Identity, spatial rules & responsive processing:** The pipeline maintains object identities across frames and applies user-defined lines and regions to tracked movements. Computationally intensive analysis runs separately from the interface so the desktop remains responsive, while video annotations and tabular exports reflect the same movement rules.

**Capabilities:**

- Vehicle detection and multi-object tracking
- Counting lines, regions, and route analysis
- Background analysis, annotated video, and exports

**Engineering considerations:**

- Maintaining object identities across frames for meaningful movement counts.
- Keeping the interface responsive during heavy processing and applying spatial rules consistently.

**Technology:** Python, PySide6, OpenCV, YOLOv8, BoT-SORT.

## Files changed

The list includes deleted public raster files; their local originals are quarantined in ignored output. Generated locale files and all font licenses are included. No official resume file changed.

- `.gitignore`
- `README.md`
- `components/ProjectModal.tsx`
- `components/smoothScroll.ts`
- `components/ui/burgundy-warp-background.tsx`
- `components/ui/burgundy-warp-runtime.ts`
- `components/ui/feature-shader-cards.tsx`
- `components/ui/global-burgundy-warp-background.tsx`
- `content/index.ts`
- `content/locales/ar.ts`
- `content/locales/de.ts`
- `content/locales/en.ts`
- `content/locales/es.ts`
- `content/locales/fr.ts`
- `content/master.json`
- `content/types.ts`
- `data/profile.ts`
- `data/projectAssets.ts`
- `docs/modernization-plan.md`
- `docs/modernization-report.md`
- `docs/performance-modernization.md`
- `i18n/LanguageProvider.tsx`
- `i18n/dictionary-loader.ts`
- `i18n/vite-env.d.ts`
- `index.css`
- `index.html`
- `index.tsx`
- `package.json`
- `public/experience/rd-product-engineer-thumb-320.webp`
- `public/experience/rd-product-engineer-thumb-640.webp`
- `public/experience/the-terminal-vr-thumb-320.webp`
- `public/experience/the-terminal-vr-thumb-640.webp`
- `public/experience/umniah-thumb-320.webp`
- `public/experience/umniah-thumb-640.webp`
- `public/fonts/INTER-OFL.txt`
- `public/fonts/ROBOTO-SLAB-LICENSE.txt`
- `public/fonts/SOURCES.md`
- `public/fonts/fonts.css`
- `public/fonts/inter-latin-ext.woff2`
- `public/fonts/inter-latin.woff2`
- `public/fonts/roboto-slab-latin-ext.woff2`
- `public/fonts/roboto-slab-latin.woff2`
- `public/og-image.png`
- `public/projects/basket-beats/card-cover-thumb-320.webp`
- `public/projects/basket-beats/card-cover-thumb-640.webp`
- `public/projects/bike-land-smart-cycling-trainer/card-cover-thumb-320.webp`
- `public/projects/bike-land-smart-cycling-trainer/card-cover-thumb-640.webp`
- `public/projects/bike-tower/card-cover-thumb-320.webp`
- `public/projects/bike-tower/card-cover-thumb-640.webp`
- `public/projects/eventies/card-cover-thumb-320.webp`
- `public/projects/eventies/card-cover-thumb-640.webp`
- `public/projects/financial-operations/cover.svg`
- `public/projects/glitzz-lab/card-cover-thumb-320.webp`
- `public/projects/glitzz-lab/card-cover-thumb-640.webp`
- `public/projects/outreach-automation-platform/card-cover.webp`
- `public/projects/outreach-automation-platform/cover.svg`
- `public/projects/outreach-automation-platform/cover.webp`
- `public/projects/outreach-automation-platform/screenshot-01.webp`
- `public/projects/outreach-automation-platform/screenshot-02.webp`
- `public/projects/outreach-automation-platform/screenshot-03.webp`
- `public/projects/outreach-automation-platform/screenshot-04.webp`
- `public/projects/outreach-automation-platform/thumbs/cover.webp`
- `public/projects/outreach-automation-platform/thumbs/screenshot-01.webp`
- `public/projects/outreach-automation-platform/thumbs/screenshot-02.webp`
- `public/projects/outreach-automation-platform/thumbs/screenshot-03.webp`
- `public/projects/outreach-automation-platform/thumbs/screenshot-04.webp`
- `public/projects/outreach-automation-platform/workflow.svg`
- `public/projects/the-terminal-nfc/card-cover-thumb-320.webp`
- `public/projects/the-terminal-nfc/card-cover-thumb-640.webp`
- `public/projects/traffic-flow-analytics-studio/card-cover-thumb-320.webp`
- `public/projects/traffic-flow-analytics-studio/card-cover-thumb-640.webp`
- `public/projects/umniah-youthconnect/card-cover-thumb-320.webp`
- `public/projects/umniah-youthconnect/card-cover-thumb-640.webp`
- `public/projects/vr-cycling/card-cover-thumb-320.webp`
- `public/projects/vr-cycling/card-cover-thumb-640.webp`
- `scripts/capture-brand-assets.mjs`
- `scripts/generate-locales.mjs`
- `scripts/performance-images.py`
- `scripts/performance-inventory.mjs`
- `scripts/performance-lighthouse.mjs`
- `scripts/performance-report.mjs`
- `scripts/performance-server.mjs`
- `scripts/validate-content.mjs`
- `scripts/validate-seo.mjs`
- `scripts/verify-navigation.cjs`
- `scripts/verify-outreach.cjs`
- `scripts/verify-portfolio.cjs`
- `sections/About.tsx`
- `sections/Portfolio.tsx`
- `sections/Resume.tsx`
- `seo/brand-assets.html`
- `seo/head.mjs`
- `tests/performance.test.mjs`
