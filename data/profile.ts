import { ExperienceItem, Profile, Project, Service, SkillGroup } from '../types';

export const profile: Profile = {
  name: 'Hashem Kayyali',
  role: 'R&D Product Engineer · Software Engineer',
  tagline: 'I design and develop complete digital products, connected systems, and hardware-integrated experiences from concept to deployment.',
  location: 'Amman, Jordan',
  email: 'hashemkayyali99@gmail.com',
  phone: '+962 78 600 9370',
  whatsapp: '+962786009370',
  freelanceStatus: 'Open to software engineering and R&D opportunities',
  social: {
    linkedin: 'https://www.linkedin.com/in/hashem-kayyali-a4852a2b7/',
    instagram: 'https://www.instagram.com/hashemkayyali/',
    whatsapp: 'https://wa.me/962786009370',
    email: 'mailto:hashemkayyali99@gmail.com',
  },
  aboutParagraph:
    'I work at the intersection of software, product development, and real-world systems. My approach combines user-focused interfaces, reliable backend services, connected hardware, testing, and practical problem solving. Experience in technical operations and customer-facing roles also helps me understand how products are installed, supported, explained, and used in real environments.',
  professionalSummary:
    'Product-minded Software Engineer and R&D Product Engineer with experience across web, desktop, cross-platform, automation, computer vision, embedded systems, and connected products. I combine hands-on software development with technical operations, system integration, troubleshooting, and customer-facing experience.',
  targetRoles: [
    'Software Engineer',
    'R&D Product Engineer',
    'Mobile Developer',
    'Full-Stack Developer',
    'IoT Developer',
  ],
};

export const skillGroups: SkillGroup[] = [
  {
    category: 'Web & Frontend',
    items: ['Next.js', 'React', 'TypeScript', 'JavaScript', 'Tailwind CSS', 'Responsive UI'],
  },
  {
    category: 'Mobile & Cross-Platform',
    items: ['React Native', 'Flutter', 'Dart', 'Android Studio', 'Cross-Platform Development'],
  },
  {
    category: 'Backend & Data',
    items: ['C#', 'WPF', '.NET Web API', 'REST APIs', 'Supabase', 'PostgreSQL', 'WebSocket'],
  },
  {
    category: 'Hardware & Embedded',
    items: ['ESP32 / ESP32-S3', 'Sensors', 'Embedded C++', 'NFC', 'Real-Time Communication'],
  },
  {
    category: 'Automation & Applied Tools',
    items: ['Python', 'OpenCV', 'Computer Vision', 'Email Automation', 'Excel / CSV Processing'],
  },
];

export const experience: ExperienceItem[] = [
  {
    company: 'Eventies',
    title: 'Co-Founder & R&D Product Engineer',
    period: 'Aug 2025 – Present',
    location: 'Amman, Jordan',
    current: true,
    image: '/experience/rd-product-engineer.webp',
    imageAlt: 'R&D Product Engineer experience photo placeholder',
    /* Tested in the colour lab: white and magenta over a near-black mid. */
    warpRamp: ['#fafafa', '#b831dd', '#221f23', '#7100bd', '#ffffff'],
    details: [
      'Leading end-to-end R&D software and connected-system products across web, desktop, automation, computer vision, and IoT.',
      'Translating product ideas into clear requirements, technical plans, user flows, and working implementations.',
      'Building React, Next.js, Flutter, .NET, and Python solutions alongside ESP32 firmware, sensors, NFC, BLE, and real-time communication.',
      'Managing projects from concept and interface design through integration, testing, troubleshooting, and deployment preparation.',
    ],
  },
  {
    company: 'The Terminal VR',
    title: 'Technical Operations Engineer',
    period: 'Jan 2025 – Jul 2025',
    location: 'Jordan',
    mode: 'Hybrid',
    image: '/experience/the-terminal-vr.webp',
    imageAlt: 'The Terminal VR experience photo placeholder',
    roles: [
      { title: 'Sales Representative', period: 'Jan 2025 – Feb 2025' },
      { title: 'Technical Operations Engineer', period: 'Feb 2025 – Jul 2025' },
    ],
    details: [
      'Started in sales, engaging customers, explaining experiences, and building a strong understanding of products and daily operations.',
      'Promoted after one month to Technical Operations Engineer based on product knowledge, communication, and practical problem solving.',
      'Supported installation, configuration, networking, system integration, hardware diagnostics, software troubleshooting, and maintenance of interactive systems.',
      'Later worked from a dedicated office with sole responsibility for day-to-day technical operations, including system setup, support, issue resolution, and ongoing optimization.',
    ],
  },
  {
    company: 'Umniah',
    title: 'Youth Unit Operations Team Member',
    period: 'Mar 2024 – Jan 2025',
    location: 'Amman, Jordan',
    mode: 'Part-time',
    image: '/experience/umniah.webp',
    imageAlt: 'Umniah experience photo placeholder',
    details: [
      'Promoted and sold internet and mobile subscriptions through direct customer engagement.',
      'Identified customer needs, explained available services, and recommended suitable telecommunications solutions.',
      'Worked toward individual and team sales targets while handling customer questions and post-sale follow-up.',
      'Collaborated with colleagues and marketing teams to improve customer engagement and sales activities.',
    ],
  },
];

const gallery = (slug: string, count: number) =>
  Array.from({ length: count }, (_, index) =>
    `/projects/${slug}/screenshot-${String(index + 1).padStart(2, '0')}.webp`,
  );

export const projects: Project[] = [

{
    slug: 'eventies',
    title: 'Eventies',
    category: 'Web Platform',
    status: 'Live platform · Active reconstruction',
    description: 'A bilingual platform for discovering event rentals, activations, production services, and custom builds across Jordan.',
    longDescription:
      'Eventies organizes event services into an Arabic and English discovery experience. Customers can review services and submit rental, quotation, or custom-build requests through one platform.',
    stakeholderValue:
      'Makes event-service discovery and request management more organized for customers and operations teams.',
    role: 'Designed and developed the product, bilingual UI/UX, frontend, backend integrations, catalog workflows, security flows, testing, and deployment process.',
    tech: ['Next.js', 'TypeScript', 'Supabase', 'Cloudinary', 'Realtime'],
    image: '/projects/eventies/cover.webp',
    gallery: gallery('eventies', 4),
    /* Tested in the colour lab: white and magenta over a near-black mid. */
    warpRamp: ['#fafafa', '#b831dd', '#221f23', '#7100bd', '#ffffff'],
    liveUrl: 'https://www.eventiesjo.com/',
    features: ['Arabic and English experience', 'Service catalog and details', 'Rental and quotation requests', 'Custom-build inquiries', 'Admin and communication tools'],
    challenges: [],
  },
{
    slug: 'glitzz-lab',
    title: 'Glitzz Lab',
    category: 'Web Platform',
    status: 'Live',
    description: 'A bilingual event-service booking platform with configurable options, availability checks, pricing, payments, and an owner dashboard.',
    longDescription:
      'Glitzz Lab lets customers configure event services, select dates and add-ons, review pricing, and submit booking requests. Customers can track requests and upload payment proof while the owner manages services and operations.',
    stakeholderValue:
      'Replaces scattered booking steps with one structured customer and business workflow.',
    role: 'Designed and developed the complete product, bilingual UI/UX, booking workflows, database, Supabase integration, WhatsApp automation, security, testing, and Vercel deployment.',
    tech: ['Next.js', 'TypeScript', 'Supabase', 'PostgreSQL', 'WhatsApp API'],
    image: '/projects/glitzz-lab/cover.webp',
    gallery: gallery('glitzz-lab', 7),
    liveUrl: 'https://www.glitzzlab.com/',
    features: ['Bilingual booking experience', 'Dynamic service configuration', 'Availability and pricing checks', 'Customer request portal', 'Owner dashboard'],
    challenges: [],
  },
{
    slug: 'umniah-youthconnect',
    title: 'Umniah YouthConnect',
    category: 'Business System',
    status: 'Internal operations platform · Private project',
    description: 'An internal mobile and web operations platform for Umniah Youth Unit teams, combining availability, shift-leader, support, campaign, check-in, role-based reporting, and Excel export workflows.',
    longDescription:
      'Umniah YouthConnect is a Flutter application backed by Supabase that centralizes daily Youth Unit operations through a member experience and a leader panel. Members sign in with company accounts, reset passwords by email, submit availability and operational forms, while authorized leaders review role-based data, analytics, reports, and exports.',
    stakeholderValue:
      'Reduces manual coordination and gives members and leaders a structured source of operational information for faster daily decisions.',
    role: 'Designed and developed the member experience and leader panel, including authentication and password-reset flows, availability and operations forms, role-based access, dashboard reporting, and Excel export workflows.',
    tech: ['Flutter', 'Dart', 'Supabase'],
    image: '/projects/umniah-youthconnect/cover.webp',
    gallery: gallery('umniah-youthconnect', 11),
    privateSource: true,
    features: [
      'Company-account login and email password reset',
      'Member availability and daily operations forms',
      'Shift-leader and internal-support workflows',
      'Role-based leader dashboard and navigation',
      'Real-time reporting and Excel data export',
    ],
    challenges: [],
  },
{
    slug: 'the-terminal-nfc',
    title: 'The Terminal NFC',
    category: 'Business System',
    status: 'Under development · Private project',
    description: 'An NFC-based point-of-sale system connecting a POS application, client interface, API, reader, and central transaction database.',
    longDescription:
      'Staff prepare a purchase through the POS application, then an NFC card or wristband identifies the customer. The system verifies the linked account before saving the transaction centrally for later reporting.',
    stakeholderValue:
      'Provides a faster and more organized alternative to manual or cash-based service-point transactions.',
    role: 'Designed and developed the POS workflow, WPF applications, client-server architecture, .NET Web API, NFC integration, database connection, and transaction flow.',
    tech: ['C#', 'WPF', '.NET Web API', 'NFC', 'REST API'],
    image: '/projects/the-terminal-nfc/cover.webp',
    gallery: gallery('the-terminal-nfc', 1),
    privateSource: true,
    features: ['POS transaction interface', 'NFC user identification', 'Account verification', 'Separate client application', 'Central transaction records'],
    challenges: [],
  },
{
    slug: 'bike-tower',
    title: 'Bike Tower',
    category: 'R&D / IoT',
    status: 'Private project',
    description: 'An interactive cycling race system that connects real bicycles, ESP32-S3 towers, Hall sensors, LED strips, and a Flutter desktop controller.',
    longDescription:
      'Bike Tower converts bicycle wheel movement into live race progress. The desktop app manages races, Tug of War, tower status, settings, and diagnostics while each tower controls its sensors and LED visuals.',
    stakeholderValue:
      'Transforms physical cycling into a clear multiplayer experience with real-time visual feedback.',
    role: 'Designed and developed the Flutter controller, race logic, local networking, diagnostics, ESP32-S3 firmware, Hall-sensor integration, and LED control.',
    tech: ['Flutter', 'ESP32-S3', 'Hall Sensor', 'WebSocket', 'FastLED'],
    image: '/projects/bike-tower/cover.webp',
    gallery: gallery('bike-tower', 4),
    privateSource: true,
    features: ['Race and Tug of War modes', 'Live speed and distance telemetry', 'UDP discovery and WebSocket control', 'Tower monitoring', 'LED theme settings'],
    challenges: [],
  },
{
    slug: 'basket-beats',
    title: 'Basket Beats',
    category: 'R&D / IoT',
    status: 'Private project',
    description: 'An interactive basketball game system with smart sensor bases, LED feedback, real-time scoring, and a Flutter Windows control application.',
    longDescription:
      'Basket Beats connects physical game bases to a desktop control application. Each ESP32 base detects hits through an MPU6050 sensor, controls an LED ring, and sends live events to the app for scoring and game management.',
    stakeholderValue:
      'A complete hardware-software game system designed for competitive play and event operation.',
    role: 'Designed and developed the Flutter application, game logic, ESP32 firmware, sensor detection, LED effects, reports, and local firmware-update workflow.',
    tech: ['Flutter', 'ESP32', 'MPU6050', 'WebSocket', 'SQLite'],
    image: '/projects/basket-beats/cover.webp',
    gallery: gallery('basket-beats', 0),
    privateSource: true,
    features: ['Multiple game modes', 'Real-time hit tracking', 'LED feedback and themes', 'Local reports and leaderboards', 'OTA firmware updates'],
    challenges: [],
  },
{
    slug: 'vr-cycling',
    title: 'VR Cycling',
    category: 'R&D / IoT',
    status: 'Prototype · Private project',
    description: 'An ESP32-S3 cycling controller that converts wheel movement into Bluetooth FTMS data for compatible VR and fitness applications.',
    longDescription:
      'VR Cycling reads bicycle wheel rotation through a Hall sensor and broadcasts cycling data through Bluetooth Low Energy. It also manages battery monitoring, charging detection, LED status, and low-power operation.',
    stakeholderValue:
      'Connects a physical bicycle to compatible digital fitness and VR experiences using standard BLE cycling data.',
    role: 'Designed and developed the embedded firmware, FTMS integration, Hall-sensor processing, battery monitoring, LED interface, charging detection, and power management.',
    tech: ['ESP32-S3', 'Bluetooth LE', 'FTMS', 'Hall Sensor', 'Embedded C++'],
    image: '/projects/vr-cycling/cover.webp',
    gallery: gallery('vr-cycling', 0),
    privateSource: true,
    features: ['Bluetooth FTMS data', 'Speed, cadence, and distance metrics', 'Battery LED indicator', 'Charging detection', 'Deep-sleep power management'],
    challenges: [],
  },
{
    slug: 'bike-land-smart-cycling-trainer',
    title: 'Bike-Land Smart Cycling Trainer',
    category: 'R&D / IoT',
    status: 'Completed · Private project',
    description: 'A smart cycling trainer that turns physical bicycle movement into standard Bluetooth cycling metrics for compatible training applications.',
    longDescription:
      'The ESP32-S3 reads wheel rotation and calculates speed, cadence, distance, power, time, and energy. It broadcasts the data through FTMS, CSC, and CPS while managing battery status and power saving.',
    stakeholderValue:
      'Transforms a stationary bicycle into a Bluetooth-enabled connected fitness device.',
    role: 'Designed and developed the complete embedded product, BLE services, cycling calculations, Hall-sensor input, battery monitoring, LED interface, and low-power firmware.',
    tech: ['ESP32-S3', 'Bluetooth FTMS', 'CSC / CPS', 'Hall Sensor', 'Embedded C++'],
    image: '/projects/bike-land-smart-cycling-trainer/cover.webp',
    gallery: gallery('bike-land-smart-cycling-trainer', 1),
    privateSource: true,
    features: ['FTMS, CSC, and CPS services', 'Real-time cycling metrics', 'FTMS control commands', 'Battery and charging indicators', 'Deep-sleep operation'],
    challenges: [],
  },
{
    slug: 'outreach-automation-platform',
    title: 'Outreach Automation Platform',
    category: 'Automation System',
    status: 'Private project',
    description: 'A business system for organizing contacts, email templates, outreach campaigns, sending queues, logs, and incoming replies.',
    longDescription:
      'The platform imports contacts from Excel or CSV, builds campaigns, processes pending emails, and connects incoming replies to the correct contact and campaign.',
    stakeholderValue:
      'Reduces repetitive outreach work and centralizes campaign operations in one controlled system.',
    role: 'Designed and developed the complete product, UI/UX, Next.js frontend and backend, Supabase database, email integrations, campaign workflows, and logging.',
    tech: ['Next.js', 'TypeScript', 'Supabase', 'SMTP / IMAP', 'XLSX'],
    image: '/projects/outreach-automation-platform/cover.webp',
    gallery: gallery('outreach-automation-platform', 4),
    privateSource: true,
    features: ['Contact imports', 'Email templates and sender identities', 'Campaign queue processing', 'Reply synchronization', 'Sending logs and reports'],
    challenges: [],
  },
{
    slug: 'traffic-flow-analytics-studio',
    title: 'Traffic Flow Analytics Studio',
    category: 'Computer Vision',
    status: 'Prototype · Private project',
    description: 'A desktop computer-vision application for detecting, tracking, counting, and analyzing vehicle movement in recorded road footage.',
    longDescription:
      'Users load road footage, draw counting lines and analysis regions, then run YOLO-based vehicle detection and tracking. The application produces an annotated video and structured CSV and Excel reports.',
    stakeholderValue:
      'Reduces manual traffic-video review and turns recorded footage into organized movement data.',
    role: 'Designed and developed the PySide6 interface, video tools, YOLO tracking pipeline, background processing, project storage, and report exports.',
    tech: ['Python', 'PySide6', 'YOLOv8', 'OpenCV', 'BoT-SORT'],
    image: '/projects/traffic-flow-analytics-studio/cover.webp',
    gallery: gallery('traffic-flow-analytics-studio', 0),
    privateSource: true,
    features: ['Vehicle detection and tracking', 'Line and route counting', 'Perspective and region tools', 'Background video analysis', 'Video, CSV, and Excel exports'],
    challenges: [],
  },
];

export const services: Service[] = [
  {
    title: 'Product Engineering',
    description: 'Turning ideas and requirements into complete, testable, and deployable products.',
    icon: 'product',
  },
  {
    title: 'Web & Cross-Platform Software',
    description: 'Building responsive web, mobile, tablet, and desktop experiences using modern technologies.',
    icon: 'code',
  },
  {
    title: 'R&D & IoT Systems',
    description: 'Connecting applications with ESP32 devices, sensors, NFC, Bluetooth, Wi-Fi, and physical products.',
    icon: 'cpu',
  },
  {
    title: 'Automation & Applied Tools',
    description: 'Creating email automation, computer-vision tools, reporting workflows, and practical data-processing systems.',
    icon: 'automation',
  },
];