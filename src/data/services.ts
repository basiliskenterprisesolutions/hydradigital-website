// Copy and SEO metadata for the six standalone service pages.
//
// Each page targets a distinct commercial-intent query rather than the
// "[role] + Dundee" phrasing, which Google answers with a jobs module. The
// homepage keeps its broad custom-software positioning; the location and
// service targeting lives here so one business can rank for several things.
//
// prerenderRoutes in scripts/prerender.mjs is derived from this list, so adding
// a service here is enough to get it built, indexed and into the sitemap.
//
// Body copy (intro, capability items, section bodies and FAQ answers) may carry
// inline cross-links to sibling service pages in one deliberately small subset
// of Markdown: [anchor text](/services/slug). ServicePage renders those as real
// anchors; plainText below strips them back for JSON-LD, which must not contain
// markup. Nothing else in the copy is parsed, so square brackets used as
// punctuation are safe as long as no "(" follows the closing bracket.

export type ServiceSection = {
  heading: string
  body: string[]
}

export type ServiceFaq = {
  question: string
  answer: string
}

export type Service = {
  slug: string
  navLabel: string
  eyebrow: string
  h1: string
  seoTitle: string
  metaDescription: string
  schemaName: string
  intro: string[]
  capabilities: { heading: string; items: string[] }
  sections: ServiceSection[]
  faqs: ServiceFaq[]
}

export const services: Service[] = [
  {
    slug: 'web-development',
    navLabel: 'Websites & E-commerce',
    eyebrow: 'Websites & E-commerce',
    h1: 'Web development for businesses in Dundee and across Scotland',
    seoTitle: 'Web Development Dundee | Hydra Digital',
    metaDescription:
      'Custom websites and e-commerce builds for businesses in Dundee and across Scotland. Fast, accessible, and built to be maintained. Free consultation.',
    schemaName: 'Web Development',
    intro: [
      'We build websites that are genuinely fast, straightforward to run, and designed around what the business actually needs from them. That might be generating enquiries, selling online, explaining a complicated service clearly, or simply looking credible to a customer deciding whether to get in touch.',
      'Every site is written from scratch rather than assembled from a theme. That takes longer up front, and it is the reason the results load quickly, work properly on a phone, and can be changed later without unpicking someone else’s plugin stack.',
      'If what you need is closer to a system than a site - logins, stored records, work moving through stages - that is a [web application](/services/web-applications), or a [mobile app](/services/mobile-app-development) where the work happens away from a desk. Either becomes [bespoke software](/services/bespoke-software) once nothing off the shelf fits.',
    ],
    capabilities: {
      heading: 'What we build',
      items: [
        'Business and brochure websites',
        'E-commerce stores and product catalogues',
        'Landing pages built around a single conversion',
        'Content-managed sites your team can edit',
        'Booking and enquiry flows wired to your inbox or CRM',
        'Rebuilds of slow or unmaintainable existing sites',
      ],
    },
    sections: [
      {
        heading: 'Built for speed, because it decides whether people stay',
        body: [
          'Most business websites are slower than they need to be, usually because they carry a page builder, half a dozen plugins, and images nobody compressed. Visitors leave before the page finishes loading, and search engines treat that as a signal.',
          'We build lean by default: no unnecessary frameworks on the page, images sized and compressed properly, and the content present in the HTML rather than assembled by JavaScript after the fact. That last point matters more than most agencies admit - a page that needs JavaScript to show its own text is a page search engines have to work harder to read.',
        ],
      },
      {
        heading: 'Accessible and correct on every screen',
        body: [
          'Sites are built mobile-first and tested on real devices, not just a narrow browser window. Semantic HTML, sensible heading structure, keyboard-navigable controls and visible focus states are part of the build rather than an afterthought bolted on before launch.',
          'This is partly an obligation and partly self-interest: the same structure that makes a page usable with a screen reader is the structure search engines use to understand what the page is about.',
        ],
      },
      {
        heading: 'You own what we build',
        body: [
          'You get the code, the hosting arrangement, and the ability to take it elsewhere. There is no proprietary platform, no licence that expires, and no situation where leaving means starting again.',
          'If you would rather not manage it, we offer ongoing support and maintenance separately - but as a choice, not a dependency.',
        ],
      },
    ],
    faqs: [
      {
        question: 'How much does a website cost?',
        answer:
          'It depends almost entirely on scope - a focused brochure site is a very different piece of work from an e-commerce build with stock management. We give a fixed quote after an initial call rather than a headline figure that changes later.',
      },
      {
        question: 'How long does it take?',
        answer:
          'A straightforward business site is typically a few weeks from brief to launch. Larger builds with e-commerce, integrations or custom functionality take longer, and we set out the expected timeline in writing before development starts.',
      },
      {
        question: 'Can you work with our existing site?',
        answer:
          'Often, yes. We can improve performance, fix specific problems, or rebuild sections incrementally. Sometimes a rebuild genuinely is cheaper than repeated repairs, and we will say so plainly if that is what we find.',
      },
      {
        question: 'Do you work with businesses outside Dundee?',
        answer:
          'Yes. We are based in Dundee and work with clients throughout Scotland and the rest of the UK. Most projects run over video calls and email, with in-person meetings where they are useful.',
      },
    ],
  },

  {
    slug: 'web-applications',
    navLabel: 'Web Applications',
    eyebrow: 'Web Applications',
    h1: 'Web applications built around how your business actually runs',
    seoTitle: 'Web Application Development Dundee | Hydra Digital',
    metaDescription:
      'Custom web applications, booking systems, client portals and dashboards for businesses in Dundee and across the UK. Built around your existing processes.',
    schemaName: 'Web Application Development',
    intro: [
      'A web application is what you need when a website is not enough - when people have to log in, records have to be stored, work has to move through stages, or several people need to see the same information at once.',
      'These are usually built because the off-the-shelf option does not fit. It handles eighty per cent of the process and forces awkward workarounds for the rest, and those workarounds quietly become the most expensive part of the working week.',
    ],
    capabilities: {
      heading: 'What we build',
      items: [
        'Booking and scheduling systems',
        'Client and customer portals',
        'Internal dashboards and reporting tools',
        'Admin panels and back-office systems',
        'Quoting, onboarding and approval workflows',
        'Document and assessment platforms',
      ],
    },
    sections: [
      {
        heading: 'We start with the process, not the software',
        body: [
          'The first job is understanding how the work currently happens - including the spreadsheet someone maintains privately, and the step everyone knows is a nuisance. Software that ignores those details gets abandoned within a month.',
          'Once the process is clear, we design around it rather than asking your team to change how they work to suit the tool. Where a process genuinely should change, we will say so, but that is a conversation rather than an assumption baked into the build.',
        ],
      },
      {
        heading: 'Built to be extended',
        body: [
          'Business systems are never finished. Requirements shift, a new report is needed, another team wants access. We build with that expectation: clear structure, sensible data models, and code written to be read by whoever works on it next.',
          'That is the difference between a system you keep improving and one you eventually replace because nobody can safely change it.',
        ],
      },
      {
        heading: 'Access, roles and data handling',
        body: [
          'Most business applications need to distinguish between people - staff, managers, clients, administrators - and show each of them the right thing. Authentication, permissions and audit trails are designed in from the start rather than retrofitted.',
          'Where an application handles personal or commercially sensitive data, we discuss storage, retention and access openly at the design stage so the decisions are deliberate and documented.',
        ],
      },
    ],
    faqs: [
      {
        question: 'How is this different from a website?',
        answer:
          'A [website](/services/web-development) presents information. A web application does work - it stores records, manages logins, moves tasks through a process and produces output. The line blurs, and plenty of projects need both.',
      },
      {
        question: 'Can it connect to systems we already use?',
        answer:
          'Usually. Most modern accounting, CRM and payment platforms offer an API, and we regularly build [integrations](/services/automation) against them. Where a system has no API, there are often other routes - we will assess that specifically before quoting.',
      },
      {
        question: 'What happens if our requirements change mid-project?',
        answer:
          'They usually do, and that is normal. We work in reviewable stages so changes are discussed as they arise rather than discovered at handover. Significant scope changes are re-quoted openly rather than absorbed silently.',
      },
    ],
  },

  {
    slug: 'mobile-app-development',
    navLabel: 'Mobile Apps',
    eyebrow: 'Mobile Apps',
    h1: 'iOS and Android app development',
    seoTitle: 'Mobile App Development Dundee | Hydra Digital',
    metaDescription:
      'Custom iPhone and Android app development for businesses in Dundee and across the UK. Customer-facing apps, staff tools and internal systems.',
    schemaName: 'Mobile App Development',
    intro: [
      'Mobile apps make sense when something has to happen away from a desk - out on a job, on a shop floor, in a customer’s hand - or when a phone’s own capabilities are the point: the camera, location, notifications, or working with no signal.',
      'They are a bigger commitment than a website, so the first conversation is usually whether you need one at all. A well-built [mobile web experience](/services/web-development) is often the cheaper and better answer, and we would rather tell you that than sell you an app you do not need.',
    ],
    capabilities: {
      heading: 'What we build',
      items: [
        'Customer-facing apps for iPhone and Android',
        'Staff and field-worker tools',
        'Internal business apps not intended for public release',
        'Apps that work offline and sync when back in signal',
        'Companion apps for an existing web platform',
        'App Store and Google Play submission and release',
      ],
    },
    sections: [
      {
        heading: 'One build, both platforms, where that fits',
        body: [
          'For most business apps a cross-platform build is the sensible choice - one codebase covering iOS and Android, which means roughly one budget and one set of updates rather than two of everything.',
          'Where an app genuinely needs deep platform-specific behaviour or heavy performance work, native is the right answer and we will recommend it. The decision follows the requirements rather than a default.',
        ],
      },
      {
        heading: 'Getting through review, and staying there',
        body: [
          'App Store and Play Store submission has its own rules, and first-time rejections are common over things that have nothing to do with the quality of the software - privacy declarations, account deletion, metadata. We handle submission and the back-and-forth that sometimes follows.',
          'Published apps also need maintaining. Operating systems update annually, platform requirements change, and an app left untouched for two years usually stops working. That should be planned for rather than discovered.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Do we really need an app, or would a website do?',
        answer:
          'Frequently a website does. Apps earn their cost when you need offline capability, the phone’s hardware, push notifications, or genuinely frequent repeat use. We will give you a straight answer at the first call.',
      },
      {
        question: 'Do you handle publishing to the App Store?',
        answer:
          'Yes, including developer account setup, store listings, review submission and release. You retain ownership of the developer accounts and the app itself.',
      },
      {
        question: 'Can the app connect to our existing systems?',
        answer:
          'Yes. Apps are usually part of a wider system rather than standalone, and we regularly build them against an existing [web application](/services/web-applications), database or third-party API.',
      },
    ],
  },

  {
    slug: 'desktop-software',
    navLabel: 'Desktop Software',
    eyebrow: 'Desktop Software',
    h1: 'Desktop software for specialist business work',
    seoTitle: 'Desktop Software Development Dundee | Hydra Digital',
    metaDescription:
      'Custom Windows and cross-platform desktop application development for specialist business requirements and internal operations. Based in Dundee, Scotland.',
    schemaName: 'Desktop Software Development',
    intro: [
      'Desktop software is a narrower need than it once was, but where it applies there is often no reasonable substitute - work that has to run on local hardware, handle large files, talk to attached equipment, or operate somewhere with no dependable internet connection.',
      'We build desktop applications for those situations: internal tools, processing utilities, and systems that sit alongside equipment rather than in a browser tab. It is [bespoke software](/services/bespoke-software) by definition, because there is rarely a product that already does the specific job.',
    ],
    capabilities: {
      heading: 'What we build',
      items: [
        'Windows business applications',
        'Cross-platform tools for Windows, macOS and Linux',
        'Data processing and file conversion utilities',
        'Software that interfaces with attached hardware',
        'Offline-capable systems for sites with poor connectivity',
        'Internal tools not intended for public distribution',
      ],
    },
    sections: [
      {
        heading: 'When desktop is the right answer',
        body: [
          'Local processing power, direct access to the file system, integration with connected hardware, and reliable operation without a network are the usual reasons. If none of those apply, a [web application](/services/web-applications) is normally cheaper to build, easier to update and simpler to access - and we will say so.',
          'Where the honest answer is a hybrid - a desktop tool doing local work, reporting into a web system - that is often the most practical arrangement and we build it regularly.',
        ],
      },
      {
        heading: 'Installation, updates and support',
        body: [
          'Desktop software has to be distributed and kept current, which is its main disadvantage against the web. We handle installers, code signing where required, and update mechanisms so users are not manually reinstalling.',
          'For internal tools this is usually straightforward. For anything distributed more widely, we set the update strategy out at the design stage rather than leaving it until launch.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Should this be desktop software or a web application?',
        answer:
          'Web wins unless you need local hardware access, heavy local processing, or genuine offline operation. It is one of the first things we work through, because getting it wrong is expensive in both directions.',
      },
      {
        question: 'Can it work with our existing databases or equipment?',
        answer:
          'Usually, yes. Connecting to existing databases, network shares and attached equipment is a common reason desktop software is chosen in the first place.',
      },
    ],
  },

  {
    slug: 'automation',
    navLabel: 'Automation & Tools',
    eyebrow: 'Automation & Tools',
    h1: 'Automation and integrations that remove manual work',
    seoTitle: 'Business Automation Dundee | Hydra Digital',
    metaDescription:
      'Business process automation, systems integration and custom internal tools for companies in Dundee and across the UK. Remove repetitive manual work.',
    schemaName: 'Automation and Integrations',
    intro: [
      'Most businesses have at least one task that someone does by hand every week because the systems involved do not talk to each other. Copying figures between platforms, re-keying orders, producing the same report, chasing the same information.',
      'It is rarely dramatic on any given day, which is exactly why it persists. Totalled across a year it is usually a substantial amount of time, and the errors that creep in are the expensive part.',
    ],
    capabilities: {
      heading: 'What we build',
      items: [
        'Integrations between systems that do not natively connect',
        'Automated reporting and scheduled data exports',
        'Order, invoice and document processing',
        'Data cleaning, migration and synchronisation',
        'Custom internal tools for specific recurring tasks',
        'Alerting and monitoring for processes that matter',
      ],
    },
    sections: [
      {
        heading: 'We look at the work before proposing the tool',
        body: [
          'The first step is establishing what actually happens now, how often, how long it takes and where it goes wrong. Some tasks turn out to be far more expensive than anyone realised. Others are genuinely quicker by hand, and automating them would be a waste of money.',
          'We are happy to reach the second conclusion. A short piece of analysis that saves you a pointless project is a better outcome than a build nobody needed.',
        ],
      },
      {
        heading: 'Connecting systems that were not designed to connect',
        body: [
          'Accounting packages, CRMs, e-commerce platforms, spreadsheets, payment providers, [bespoke internal systems](/services/bespoke-software) and the [desktop software](/services/desktop-software) running on one machine in the corner can usually be made to work together, even where no official integration exists. APIs where they are available, and other approaches where they are not.',
          'The aim is that information is entered once and appears wherever it is needed, rather than being maintained in three places and disagreeing in two of them.',
        ],
      },
      {
        heading: 'Automation you can see and trust',
        body: [
          'Automated processes fail silently if you let them, which is worse than not automating at all - nobody notices until the numbers are wrong. Anything we build reports what it did, flags what it could not, and tells someone when it needs attention.',
          'You should be able to check that a process ran correctly without having to take it on faith. Where that reporting needs a proper interface rather than an email, it usually becomes a small [web application](/services/web-applications) with a dashboard attached.',
        ],
      },
    ],
    faqs: [
      {
        question: 'How do we know if a task is worth automating?',
        answer:
          'Frequency times duration, weighed against the cost of errors. Something taking two hours weekly is usually worth examining; something taking ten minutes monthly usually is not. We will work through the specifics with you before quoting.',
      },
      {
        question: 'Will this work with the software we already use?',
        answer:
          'Most mainstream business platforms offer an API and we build against them regularly. Where a system is closed, there are often other routes. We assess your specific stack before proposing anything.',
      },
      {
        question: 'What if the automation breaks?',
        answer:
          'It will eventually - platforms change their APIs, formats shift, credentials expire. That is why anything we build reports its own status and alerts someone rather than failing quietly. Ongoing support is available separately.',
      },
    ],
  },

  {
    slug: 'bespoke-software',
    navLabel: 'Bespoke Software',
    eyebrow: 'Bespoke Software',
    h1: 'Bespoke software built to your exact requirements',
    seoTitle: 'Bespoke Software Development Dundee | Hydra Digital',
    metaDescription:
      'Bespoke software development for businesses in Dundee and across the UK, for when off-the-shelf systems do not fit how your business actually works.',
    schemaName: 'Bespoke Software Development',
    intro: [
      'Bespoke software is what you commission when the available products do not fit - when your process is genuinely unusual, when the sector-standard package was built for companies much larger or much smaller than yours, or when the thing you need simply does not exist.',
      'It is a larger undertaking than adopting an off-the-shelf system, and it should be entered into deliberately. Where a product would serve you well, we will tell you which one. The projects worth building custom are the ones where fitting your business into someone else’s assumptions is the more expensive option.',
      'In practice it takes one of a few shapes: a [web application](/services/web-applications) your team logs into, a [desktop tool](/services/desktop-software) that has to run on local hardware, a [mobile app](/services/mobile-app-development) for work that happens away from a desk, or [automation](/services/automation) joining systems that were never meant to meet.',
    ],
    capabilities: {
      heading: 'Where bespoke usually earns its cost',
      items: [
        'Processes no off-the-shelf product models properly',
        'Sector software priced or scoped for the wrong size of business',
        'Several disconnected systems that should be one',
        'A workaround that has quietly become business-critical',
        'Competitive advantage that depends on doing something differently',
        'Requirements too specific for a general-purpose product',
      ],
    },
    sections: [
      {
        heading: 'The requirements work is the project',
        body: [
          'Most failed custom software fails at the specification stage, not in development. The requirements were vague, assumptions went unexamined, and the gap only became visible once something was built.',
          'We spend real time up front on what the software must do, who uses it, what happens in the awkward cases, and what success looks like in practice. That work is visible to you and agreed before development begins.',
        ],
      },
      {
        heading: 'Built in reviewable stages',
        body: [
          'You see working software throughout rather than a demonstration at the end. Each stage is something you can use and react to, which is the only reliable way to find the difference between what was specified and what was meant.',
          'It also means direction changes happen while they are still cheap.',
        ],
      },
      {
        heading: 'Built to be maintained by someone else',
        body: [
          'Bespoke software is a long-term asset and the risk everyone worries about is being tied to whoever wrote it. We write code intended to be read by another developer: clear structure, documented decisions, standard tooling and no unnecessary cleverness.',
          'You own the source. If you ever want to move the work elsewhere, that should be a straightforward decision rather than a trap.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Is bespoke software worth it compared to an off-the-shelf product?',
        answer:
          'Sometimes not, and we will say so. It earns its cost when the fit is genuinely poor, when licence costs scale badly with your growth, or when the process is a real competitive advantage. When a product fits, buying it is the better decision.',
      },
      {
        question: 'What does it cost?',
        answer:
          'Scope determines it, so we quote after the initial requirements work rather than guessing. That first conversation is free and carries no obligation, and you will get a straight assessment of whether the project makes commercial sense.',
      },
      {
        question: 'Who owns the software once it is built?',
        answer:
          'You do, including the source code. There is no licence to renew and no dependency on us continuing to be involved.',
      },
      {
        question: 'What happens after launch?',
        answer:
          'Software needs maintaining - dependencies update, requirements evolve, occasionally something breaks. We offer ongoing support and further development, but as a separate arrangement rather than a condition of the original build.',
      },
    ],
  },
]

export const serviceRoutes = services.map((service) => `/services/${service.slug}`)

export const getService = (slug: string | undefined) =>
  services.find((service) => service.slug === slug)

// Matches the [anchor text](/path) cross-links described at the top of the
// file. Built fresh on each call because a shared /g regex carries lastIndex
// state between callers.
export const inlineLinkPattern = () => /\[([^\]]+)\]\((\/[^)]+)\)/g

// Strips the cross-link markup back to its anchor text. Used for structured
// data and anywhere else the copy has to be plain.
export const plainText = (value: string) => value.replace(inlineLinkPattern(), '$1')
