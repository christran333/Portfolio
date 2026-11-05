// Case study content, keyed by project id (see projects in data.ts).
// Each page is: meta line → headline → hero → highlights → overview → a few short, visual sections.
// Kept deliberately concise; the full long-form write-ups live in notes/case-studies-long-form.ts.


const img = (id: string, ext = 'png') => `https://framerusercontent.com/images/${id}.${ext}`
const video = (id: string) => `https://framerusercontent.com/assets/${id}.mp4`

// Locally hosted images live in public/work/<project>/
const A = '/work/act-one/'
const S = '/work/scout/'
const T = '/work/tactile/'
const P = '/work/priority/'

export type Card = { title: string; body?: string; points?: string[] }

export type Block =
  | { kind: 'p'; text: string }
  | { kind: 'lead'; text: string } // a larger pull-quote style paragraph
  | { kind: 'list'; title?: string; items: string[] }
  | { kind: 'cards'; items: Card[]; numbered?: boolean }
  | { kind: 'image'; src: string; caption?: string }
  | { kind: 'gallery'; images: string[]; columns?: 2 | 3; caption?: string } // a grid of images
  | { kind: 'finding'; theme: string; title: string; problem: string; fix: string; src?: string } // audit finding with its screenshot
  | { kind: 'link'; href: string; label: string }
  | { kind: 'feature'; title: string; text: string; src: string; video?: boolean } // a big shot beside a short title and text
  | { kind: 'video'; src: string; caption?: string }
  | { kind: 'table'; head: string[]; rows: string[][] }

// `title` can be a full statement ("Volume isn't value"); `nav` is the short label for the side nav.
// When `nav` is set the title renders as a sentence-case heading instead of a small label.
export type Section = { title: string; nav?: string; blocks: Block[] }

export type CaseStudy = {
  // The facts row under the headline: short labels, one per line (like a credits list).
  // Who led what belongs in the overview, not here.
  role: string[] // title, then where, e.g. ['Product Design Intern', 'Francois Labs']
  team?: string[] // names of the people you worked with
  scope: string[] // what you made, 2–3 short items
  date: string
  type: string
  headline: string
  hero: string
  highlights?: { value: string; label: string }[]
  overview: string[]
  sections: Section[]
}

export const caseStudies: Record<string, CaseStudy> = {
  meteormate: {
    role: ['Lead Product Designer', 'ACM at UTD'],
    team: ['2 designers', '4 engineers', '2 project leads'],
    scope: ['User research', 'MVP design', 'Brand refresh'],
    date: 'Summer 2025 → Present',
    type: 'Roommate-finding web app',
    hero: img('7agbU5LMHCSPcfO7YHuy97L5PaQ'),
    headline: 'Joining a design team six months in, without stepping on toes',
    overview: [
      "When I joined MeteorMate, ACM's roommate-matching app for UT Dallas students, it already had a designer, a concept, a landing page, and six months of work. My first instinct was to rebuild the design system. My co-designer wanted to build on it. We were both a little right.",
    ],
    sections: [
      {
        title: 'Figure out what the last person got right',
        nav: 'Meeting in the middle',
        blocks: [
          { kind: 'p', text: "Over one-on-one calls, with fresh eyes from leads on other ACM teams, we found the middle: keep the color themes and core ideas like swiping, and redesign the logo, components, and onboarding. I let go of some of my own ideas along the way." },
          { kind: 'gallery', images: [img('ZopPj00XIp0pniokIhqRlyL4kR4'), img('w9BGAa4AdOcQIxY739lWypxJKo')], caption: 'From the original handshake badge to the meteor mark I designed, bold enough to scale down to an app icon' },
        ],
      },
      {
        title: "Nobody here is anyone's boss",
        nav: 'Earning buy-in',
        blocks: [
          { kind: 'p', text: "Everyone on MeteorMate is a student volunteering their time, so nothing moves by authority. It moves by showing up to standups, sharing work early, and earning buy-in. When the refresh was ready, the dev team signed off, and I presented it to all of ACM. Along the way I grew from the second designer into the lead." },
          { kind: 'gallery', images: ['/work/meteormate/standup-updates.jpg', '/work/meteormate/standup-logo.jpg'], caption: 'Slides from my standup updates: matching-card iterations, and the new logo reveal' },
        ],
      },
      {
        title: 'Design for the team you actually have',
        nav: 'Designing for the team',
        blocks: [
          { kind: 'p', text: "Our engineers have classes, so elaborate card animations weren't worth the build time. ACM's servers couldn't handle real-time chat, so the MVP gets async messaging and real-time waits for V2. Saying “not yet” made the MVP better, not smaller." },
          { kind: 'image', src: img('7agbU5LMHCSPcfO7YHuy97L5PaQ'), caption: 'Compatibility at a glance: matched preferences in orange, mismatches in grey, and a thumbs-up instead of a heart' },
          { kind: 'p', text: "Swiping cards are the core feature. I studied how existing matching apps handle cards, then iterated on layouts with the engineers until we landed on one that showed compatibility at a glance and was realistic for a student team to build." },
        ],
      },
      {
        title: 'The research still had to be right',
        nav: 'The research',
        blocks: [
          { kind: 'p', text: "In 15+ interviews, students cared about sleep schedules, cleanliness, and guests, not major or year. The onboarding survey feeds an LLM that sorts students into matches, so every question had to earn its place. I cut the survey down to those habits, and in testing against the original questionnaire, students finished 37% faster." },
          { kind: 'feature', video: true, src: video('OOE0SIJKu07KI4xEU7drDjBE'), title: 'A survey that feels quick', text: 'Card-based choices with custom icons and three options per category replaced a long questionnaire.' },
          { kind: 'feature', src: img('8TqtpA6Rx4UBurd2Y7dAoJUbmw'), title: 'Match first, message second', text: 'One onboarding path collects preferences before swiping, so matches are accurate from day one and nobody gets cold messages.' },
        ],
      },
      {
        title: 'Where it is now',
        nav: 'Where it is now',
        blocks: [
          { kind: 'p', text: "Every MVP screen is designed, and engineering is building it now, aiming to launch around the end of this year or early next year." },
        ],
      },
      {
        title: "What I'd tell another designer",
        nav: 'What I learned',
        blocks: [
          { kind: 'lead', text: "Joining a project midway is mostly a people problem. Earn trust before you change things." },
        ],
      },
    ],
  },

  scout: {
    role: ['Product Design Intern', 'Francois Labs'],
    team: ['Vu Francois'],
    scope: ['Buyer app audit', 'Design system'],
    date: 'Summer 2026',
    type: 'B2B marketplace · UX audit · Design system',
    hero: `${S}insights.jpg`,
    headline: 'AI found the problems. I had to decide which ones mattered.',
    overview: [
      "AI made it easy to find problems. In two weeks of walking Scout's buyer app with AI tools at my side, I logged 50+ findings and felt pretty good about it. Then Vu, the senior designer I worked with, started crossing them out.",
    ],
    sections: [
      {
        title: "Volume isn't value",
        nav: "Volume isn't value",
        blocks: [
          { kind: 'p', text: "Scout is a marketplace where apartment teams order replacement parts straight from vendors. I walked 15 buyer flows end to end, using AI to move fast and draft write-ups. Some of those write-ups didn't even fit the screen they were about. Finding issues was never the hard part." },
          { kind: 'image', src: `${S}audit-notes.jpg`, caption: 'My buyer-app notes, each issue logged on the screen where it happened' },
        ],
      },
      {
        title: 'If you have to dig for a problem, the screen is probably working',
        nav: "Vu's rule",
        blocks: [
          { kind: 'p', text: "That was Vu's rule on our weekly calls. AI can generate a finding for any screen. A person has to decide whether it changes anything for someone who orders parts every week." },
          { kind: 'p', text: "Vu cut more than one of mine. AI mostly caught UI inconsistencies one screen at a time. Those did compound, but on their own they read as a pile of minor details. They only connected into something meaningful once I walked the whole flow." },
          { kind: 'image', src: `${S}audit-board.jpg`, caption: 'The full audit board, flow by flow, with Vu reviewing alongside' },
        ],
      },
      {
        title: 'Building the intuition',
        nav: 'Building the intuition',
        blocks: [
          { kind: 'p', text: "Over the two weeks, my question changed from “what's wrong here?” to “would fixing this change the experience?” The biggest thing I learned: in a UX audit, work through the flows yourself. Vu explained that polish can only really happen after the fact, once the core flow holds up." },
          { kind: 'p', text: "These are the findings that made the cut." },
          { kind: 'finding', theme: 'Information hierarchy', src: `${S}insights.jpg`, title: "The homepage isn't where users expect it", problem: 'Insights acts as the dashboard home but sits second in the navigation, so there is no obvious way back.', fix: 'Rename it Home and make it the first tab.' },
          { kind: 'finding', theme: 'Related features are split apart', src: `${S}price-lists.jpg`, title: 'Features that belong together live on separate pages', problem: 'Customer Groups exist mainly to assign price lists, yet they are a separate page.', fix: 'Collapse co-dependent features into one page with tabs.' },
          { kind: 'finding', theme: 'Friction in repeat workflows', src: `${S}import-landing.jpg`, title: 'A weekly task built like a first-time tour', problem: 'The import page repeats the same pitch three times before the button, and the wizard shows six steps in one place and four in another.', fix: 'Lead with the action and show one consistent step count.' },
          { kind: 'finding', theme: 'Buyer trust', src: `${S}buyer-card.jpg`, title: 'A price warning with no context', problem: 'Cards flag a price increase in red but never say compared to what, with no way to dig in.', fix: 'Explain the change and let buyers drill into price history.' },
        ],
      },
      {
        title: 'The few that mattered pointed at the cause',
        nav: 'The root cause',
        blocks: [
          { kind: 'p', text: "Seen across the whole flow, those small inconsistencies added up: the same button, card, or table looked different on every page. Patching screens one by one would drift again, so we fixed it at the root with a shared design system. That's why the system was so valuable in the end: we found the leaks in the core flow first, then worked backward from the flow to the components, so it came out as one coherent system instead of a pile of patches." },
        ],
      },
      {
        title: 'What we shipped',
        nav: 'What we shipped',
        blocks: [
          { kind: 'p', text: "34 components, 6 foundations, and 8 patterns, in light and dark. Vu coded it; I organized the Figma files and findings for handoff and reviewed the built components. It's live." },
          { kind: 'image', src: `${S}ds-colors.jpg` },
          { kind: 'gallery', images: [`${S}ds-buttons.jpg`, `${S}ds-type.jpg`] },
          { kind: 'link', href: 'https://scout-design-system-beta.vercel.app/', label: 'Explore the live design system' },
        ],
      },
      {
        title: "What I'd tell another designer",
        nav: 'What I learned',
        blocks: [
          { kind: 'lead', text: "AI is great at finding problems. Your value is knowing which few are worth anyone's time." },
        ],
      },
    ],
  },

  cosign: {
    role: ['Product Design Intern', 'Francois Labs'],
    team: ['Vu Francois'],
    scope: ['Application flow', 'Dashboard', 'Landing page'],
    date: 'Spring 2025',
    type: 'Rental platform · Fintech',
    hero: img('5pvYzGg5sCSysJdt9R5xFw0zvw'),
    headline: 'Selling design to a non-technical founder is storytelling',
    overview: [
      "Cosign's founder knew exactly what was broken: 65% of applicants were dropping off. What he didn't have was a picture of what fixed looked like, and our first directions didn't land.",
    ],
    sections: [
      {
        title: 'The old flow lost people before they started',
        nav: 'The old flow',
        blocks: [
          { kind: 'p', text: "Data from the old flow showed where: 30% of users entered the wrong path because renter and guarantor looked the same, 40% never took an action on the dashboard, and the 8-step application took 12 minutes on average." },
          { kind: 'list', title: 'Key decisions', items: ['Split the renter and guarantor paths from the very first screen', 'Grouped related information into 4 sections instead of 8 steps', 'Added visual progress tracking', 'Put trust signals and plain explanations up front'] },
          { kind: 'image', src: img('BPhNVYI5YheOZ6Pp9uuWIBdT7c'), caption: 'Metrics up top, a prioritized action panel, and status badges that pair color with a label, so managers can scan a whole page at once' },
          { kind: 'image', src: '/work/cosign/dashboard-overview.jpg', caption: 'The property-manager overview: applications, approvals, and defaults at a glance, with Refer New Applicant always one click away' },
        ],
      },
      {
        title: "Design words don't mean much to people who don't design",
        nav: 'Show, not tell',
        blocks: [
          { kind: 'p', text: "His feedback came as reactions more than reasons, so part of our job was understanding each one and digging for what it really meant." },
          { kind: 'p', text: "“Reduce cognitive load” and “clear hierarchy” are obvious to us and abstract to everyone else. So we cut the words only designers understand, like text hierarchy, cognitive load, condensing screens, or user flows, and chose language that was more compelling and made sense to anyone." },
        ],
      },
      {
        title: 'It clicked when we told the story behind each fix',
        nav: 'The moment it clicked',
        blocks: [
          { kind: 'p', text: "The direction clicked once we presented the work with stronger explanations and clear context: why we made each fix, framed so a non-technical founder could absorb it. We walked him through the one-pager's design choices and the fixes on the application screens for both flows, bit by bit. We kept pushing passes along until everyone felt the design was right, and telling the story behind each choice was what moved every pass forward." },
        ],
      },
      {
        title: 'The founder knew the users. We knew the language.',
        nav: 'Users and language',
        blocks: [
          { kind: 'p', text: "Many Cosign users have already been declined for an apartment, and the founder understood that better than we did. Our job was turning what he knew into plain copy, a calm palette, and trust signals up front." },
          { kind: 'feature', src: img('9hSes9fVwMjoVkUM5UA5k6tp0'), title: "A landing page for people who've been declined before", text: 'Plain language over clever copy, a calm palette, and a four-step overview that makes co-signing feel manageable before anyone signs up.' },
        ],
      },
      {
        title: 'How we worked',
        nav: 'How we worked',
        blocks: [
          { kind: 'p', text: "Vu and I co-worked the design process from start to finish. We had weekly syncs, plus extra meetings during busier weeks, to feed concepts to each other, brainstorm, and bounce ideas around, with a running thread in Figma comments in between. Vu led the conversations with the founder, and I learned a lot from how he works." },
          { kind: 'p', text: "With a small engineering team, we also weighed how easy each idea would be to build." },
        ],
      },
      {
        title: 'Conversions happen off the website too',
        nav: 'Beyond the screens',
        blocks: [
          { kind: 'p', text: "Cosign sells to leasing offices as much as to renters, so we designed the landlord one-pager, desk flyers, and partner flyer too." },
          { kind: 'gallery', columns: 3, images: ['/work/cosign/landlord-onepager.jpg', '/work/cosign/how-it-works.jpg', '/work/cosign/partner-flyer.jpg'], caption: 'Landlord one-pager, leasing-office handout, and partner revenue-share flyer' },
        ],
      },
      {
        title: 'Did it work?',
        nav: 'Did it work?',
        blocks: [
          { kind: 'p', text: "After launch, site analytics showed conversions up 17% and traffic up 22%." },
        ],
      },
      {
        title: "What I'd tell another designer",
        nav: 'What I learned',
        blocks: [
          { kind: 'lead', text: "A non-technical founder isn't an obstacle. They usually know the users better than you. Give them something concrete to react to, tell the story behind it in terms they care about, and they'll tell you what's right." },
        ],
      },
    ],
  },

  backtrack: {
    role: ['Product Design Intern', 'Sole designer'],
    team: ['Founder', 'Lead engineer', 'Sales team'],
    scope: ['AI assistant', 'Event setup tool', 'Usability testing'],
    date: 'Fall 2025',
    type: 'AI-powered enterprise tools',
    hero: img('XKHJwFkDB4kDxYxSEONjAoi0'),
    headline: 'Starting with fragments: finding direction when no one hands it to you',
    overview: [
      "I didn't get a spec at Backtrack. I got fragments: a rough idea for an AI assistant, a problem with users not acting on their meeting notes, and a founder too busy to hold my hand. Figuring out the rest was the job.",
    ],
    sections: [
      {
        title: "First, find who's already solved a piece of it",
        nav: 'Find who solved it',
        blocks: [
          { kind: 'p', text: "My founder's advice was simple: find who's doing it well and build from there. So I went deep on competitive analysis and moodboards. Notion showed me AI actions that live in context. Granola showed me one-tap prompts instead of a blank box." },
          { kind: 'p', text: "The reference that stuck most was Notion's own writing on how they built their AI note taker: how closely it could work with people in tech, or any industry, to shape what it picked up, and how it made the possibilities easy to find with a list of commands you could run on your transcripts. It changed how I thought about the work. Design choices should feel native and natural to work with, especially for a tool that's supposed to be like a third hand." },
          { kind: 'video', src: video('1QddOeE35EtR2Qa05oLSMwrNtc'), caption: 'Notion: AI actions appear in context, with progress shown while it works' },
          { kind: 'image', src: img('09QLXGndgYI0c30SZosmFBEaQ'), caption: 'Granola: one-tap prompts instead of a blank box' },
        ],
      },
      {
        title: 'Then, ground it in what people actually ask for',
        nav: 'Real requests',
        blocks: [
          { kind: 'p', text: "Inspiration gave me options. Real requests told me which ones mattered. I went through 50+ support conversations and transcripts and boiled them down to 12 scenarios people kept running into." },
        ],
      },
      {
        title: 'The direction: get rid of the blank box',
        nav: 'The direction',
        blocks: [
          { kind: 'p', text: "A blank chat box makes users do all the work. The next pass added prompt starters, so the question became “which do I need?” instead of “what do I type?” The last pass added inline refinements like “make this more casual.”" },
          { kind: 'image', src: img('hB1L8qYWkMRkiyEWudGnNYoT8Mc') },
          { kind: 'image', src: img('9jY6fcfvX4vnsP1zFCzZqJiFFQ'), caption: 'From a blank input to guided, refinable prompts' },
          { kind: 'image', src: img('gY8uoiMxW7YpvWuX0wOIhBHiB0M'), caption: 'The final design' },
        ],
      },
      {
        title: 'Go wide before you narrow',
        nav: 'Go wide',
        blocks: [
          { kind: 'p', text: "The founder's one big push was to explore lots of passes, even weird ones, before committing. The rule of thumb I was taught: make at least four different design directions before narrowing down." },
          { kind: 'p', text: "Some of my most abstract passes were the complete opposite of my first design choices. Others weren't UI at all: what if this lived in an email chain, an SMS, or a template instead of a dashboard or an app? Those didn't ship as they were, but they shaped the final design. I kept comparing them in the back of my head to find what would feel most native, with the least friction and the best outcome." },
          { kind: 'p', text: "Going wide felt uncomfortable. I was used to making one thing and polishing it to perfection. But exploring early is also a feasibility call: changing direction is cheap at the start and expensive at the end, once you've narrowed down too soon." },
        ],
      },
      {
        title: 'Same approach, second problem',
        nav: 'Event tool',
        blocks: [
          { kind: 'p', text: "The sales team ran live demos on a pile of phones at crowded events, and setting each one up for the right sponsor was a pain. Starting from that complaint, I worked with them and the lead engineer on a setup tool. In internal testing, setup for one sponsor took under 5 minutes." },
        ],
      },
      {
        title: 'Did it work?',
        nav: 'Did it work?',
        blocks: [
          { kind: 'p', text: "Across 8 rounds of testing with coworkers and outside friends, task completion went from 37% to 64%." },
        ],
      },
      {
        title: "What I'd tell another designer",
        nav: 'What I learned',
        blocks: [
          { kind: 'lead', text: "Ambiguity isn't a blocker. It's the brief. Find who's solved a piece of it, ground it in real requests, and go wide before you decide." },
        ],
      },
    ],
  },

  'act-one': {
    role: ['Product Design Intern', 'Francois Labs'],
    team: ['Vu Francois', 'Taylor Nguyen'],
    scope: ['Moodboards', 'Logo directions', 'Website UI'],
    date: 'Summer 2026',
    type: 'Venture capital · Brand identity',
    headline: 'Giving a venture capital firm something worth believing in',
    hero: `${A}hero.jpg`,
    highlights: [
      { value: '8', label: 'logo directions explored' },
      { value: '5', label: 'moodboards to set the visual territory' },
      { value: '3', label: 'designers on the project' },
    ],
    overview: [
      "Act One Ventures is a venture capital firm backing founders who are re-architecting the enterprise for the AI economy. They needed a full rebrand, and with no product to design around, the challenge was purely brand: attaching real meaning to a category that usually looks and sounds the same. With two other designers, I helped build a first pass at the whole system.",
    ],
    sections: [
      {
        title: 'Foundation',
        blocks: [
          { kind: 'lead', text: '"Intelligence is becoming a commodity. What remains scarce is the conviction to rebuild, not optimize."' },
          { kind: 'p', text: 'Everything hangs on that thesis. Visually, the brand sits where early computing, institutional finance, and the restlessness of a research lab meet, with blue replacing the old orange entirely.' },
        ],
      },
      { title: 'Moodboards', blocks: [{ kind: 'gallery', images: [1, 2, 3, 4, 5].map(n => `${A}moodboard-${n}.jpg`) }] },
      {
        title: 'Logo exploration',
        blocks: [
          { kind: 'p', text: 'Eight directions, from a quiet serif monogram to bolder tech-forward wordmarks. The engagement wrapped after this first pass, so the range was the point.' },
          { kind: 'gallery', images: [1, 2, 3, 4, 5, 6, 7, 8].map(n => `${A}logo-concept-${n}.jpg`) },
        ],
      },
      { title: 'Type & color', blocks: [{ kind: 'gallery', columns: 3, images: ['type-instrument-serif', 'type-abc-favorit', 'type-geist-mono', 'color-primary', 'color-secondary', 'color-gradients'].map(n => `${A}${n}.jpg`) }] },
      { title: 'Texture', blocks: [{ kind: 'gallery', images: ['texture-wave', 'texture-dither-1', 'texture-dither-2', 'texture-dither-3'].map(n => `${A}${n}.jpg`) }] },
      { title: 'Website UI', blocks: [{ kind: 'gallery', images: ['ui-components', 'ui-quote-cards', 'ui-cms-cards', 'ui-site-section'].map(n => `${A}${n}.jpg`) }] },
    ],
  },

  priority: {
    role: ['Product Design Intern', 'Francois Labs'],
    team: ['Vu Francois'],
    scope: ['Sales sheets', 'Shared layout system'],
    date: 'Fall 2025',
    type: 'Payments · POS · Print collateral',
    headline: 'A family of sales sheets for a point-of-sale system, one for every kind of business',
    hero: `${P}hero.jpg`,
    overview: ["Priority is a payments company, and MX™ POS is its cloud-based point-of-sale system. I helped create and update its sales sheets: 13 two-sided sheets tailored to different industries, plus 4 product sheets, all built on one shared layout so the sales team could hand every prospect a sheet that spoke to their business."],
    sections: [
      {
        title: 'Where it started',
        blocks: [
          { kind: 'p', text: 'Priority wanted its existing sales sheets updated. The originals were loud and playful, with lime grids, collage hands, and floating icons, but the bold graphics competed with the product, and the POS system itself never appeared.' },
          { kind: 'gallery', columns: 2, images: [`${P}00-original-pizza-front.webp`, `${P}00-original-pizza-back.webp`], caption: 'The original pizza sheet, front and back' },
        ],
      },
      {
        title: 'The update',
        blocks: [
          { kind: 'p', text: "The update brought the sheets onto Priority's brand: deep green, the teal-to-yellow gradient from the logo, and the actual MX™ POS screen front and center. Fronts sell the system at a glance with hardware, key features, and benefits. Backs group the essential tools and add-on solutions into scannable cards, with a real person using the product in place of clip art." },
          { kind: 'gallery', columns: 3, images: [`${P}17-salons.webp`, `${P}04-pizza-back.webp`, `${P}15-integrations.webp`], caption: 'Updated sheets: salons, the pizza back, and integrations' },
          { kind: 'p', text: 'Each of the 13 industry sheets gets its own headline, icon, screen imagery, and feature list, like age verification for liquor stores, a pizza builder for pizzerias, or a drive-thru module for quick service.' },
        ],
      },
    ],
  },

  janus: {
    role: ['Product Design Intern', 'Francois Labs'],
    team: ['Vu Francois', 'Taylor Nguyen'],
    scope: ['One-pagers', 'Pitch deck', 'Application UI'],
    date: 'Summer 2026',
    type: 'Logistics startup · Branding · Visual design',
    headline: 'Brand and product marketing for a freight finance platform',
    hero: img('UtCoo42KbgxyNsiJbJ4LdzBpcE'),
    overview: ['Janus is a finance platform that manages freight operations from order to cash for forwarders, carriers, and shippers. I worked alongside two other designers on product marketing and brand design.'],
    sections: [
      { title: 'One pager & deck', blocks: [{ kind: 'gallery', images: [img('kddOjm4sKmKCVtVZGuAccBTv2Dk'), img('tiaGBEsPT4JNuTd5sscnDogY')] }] },
      { title: 'Application', blocks: [{ kind: 'gallery', images: [img('II4Y0Sh23NH9jyif7nltwhKlM'), img('FRduQB6lOJLpMSjLm87fyHGhfs')] }] },
      { title: 'Imagery & UI', blocks: [{ kind: 'image', src: img('ouaoBHk6WuTaOkwavCuwVZBvkq8') }, { kind: 'gallery', images: [img('2LMBB8O4ukntlUMbYldvuJ0U5j0'), img('yDq0Q1gYBxkd3Q1u70DaYUnl0')] }] },
    ],
  },

  tennr: {
    role: ['Product Design Intern', 'Francois Labs'],
    team: ['Vu Francois'],
    scope: ['Investor deck', 'Marketing collateral'],
    date: 'Spring 2025 → Fall 2025',
    type: 'Healthcare AI startup · Branding · Visual design',
    headline: 'Revamping brand and marketing for a healthcare AI startup',
    hero: img('bPD5Y8PqndjPdKUVdovvOTugaw'),
    overview: ['Tennr is a healthcare AI platform that automates patient referrals, from fax intake to scheduling. During my time at Francois Labs, I worked on pitch decks, collateral, thumbnails, and marketing materials alongside one other designer.'],
    sections: [
      { title: 'Refresh', blocks: [{ kind: 'gallery', images: [img('IS6wKZaisLvzkUsrZJUuZ7pxmSw'), img('EDbtRUJXKixT5xZakGzTokjRJ8')], caption: 'The old thumbnail (left) and the refresh (right)' }] },
      { title: 'Application', blocks: [{ kind: 'image', src: img('CieBjR6lUj4MEnCHlOzpd3Tt9mg') }, { kind: 'gallery', images: [img('OAtPxEfcRffy7RZXwGHk5prcM'), img('tYEzUVawZDCajEJ4s8FdVX2sjE')] }] },
    ],
  },

  arist: {
    role: ['Product Design Intern', 'Francois Labs'],
    team: ['Vu Francois'],
    scope: ['Component system', 'Documentation'],
    date: 'Spring 2025 → Fall 2025',
    type: 'AI e-learning startup · Branding · Visual design',
    headline: 'Scaling the visual system of an AI microlearning platform',
    hero: img('BGG1xL6mAgP5bl9i3x50kdKRY'),
    overview: ["Arist helps enterprises deliver bite-sized training through SMS, Slack, and Teams. As the product scaled, its visual language wasn't keeping up, so I built a component system alongside Vu Francois, founder and senior designer at Francois Labs: reusable UI components, scalable asset libraries, and tighter consistency across product surfaces."],
    sections: [
      { title: 'UI components', blocks: [{ kind: 'image', src: img('XW7B4K8FDwhddmvFZURHcjQaBI') }, { kind: 'p', text: 'System-first: reusable components over one-off designs, rolled out incrementally so the product stayed familiar while the quality bar went up.' }] },
      { title: 'Final design', blocks: [{ kind: 'gallery', images: [img('3E4aTSItRP5dd7rQWtz1pE43rWw', 'jpg'), img('8xdlWkdbchwwJStdWcihwLqET58', 'jpg')] }] },
      { title: 'What I learned', blocks: [{ kind: 'p', text: "Design systems are built for scale. Finding components that stay coherent, follow design principles, still have character, and serve a real purpose takes far more effort and deep thinking than polishing a single screen." }] },
    ],
  },

  tactile: {
    role: ['Lead Designer'],
    team: ['Front-end & design teammate', '2 back-end engineers'],
    scope: ['Direction', 'Gesture system', 'MVP prototype'],
    date: '2026',
    type: 'FigBuild 2026 · Figma plugin · Hackathon',
    hero: `${T}tactile-cover.webp`,
    headline: 'Build fast, fail faster, and still make something thoughtful',
    overview: [
      "At FigBuild, I had a rough version of Tactile running within hours, a Figma plugin you control with your hands, before the team had even agreed on the idea. Building that fast meant we failed fast too, and everything thoughtful about the final project came from having something real to argue about that early.",
    ],
    sections: [
      {
        title: 'Some people have taste but no tools',
        nav: 'Taste, no tools',
        blocks: [
          { kind: 'p', text: "Easy tools feel dumbed down; pro tools shut non-designers out. Tactile lets you describe a feeling, like warm or bold, and turns it into a real design." },
          { kind: 'image', src: `${T}slide-brief.webp`, caption: 'The brief: bridging the gap between ideas and execution' },
        ],
      },
      {
        title: 'Soul before features',
        nav: 'Soul before features',
        blocks: [
          { kind: 'p', text: "We studied the past submissions we loved and asked why they stuck. The best ones had a point of view, and that became the filter for every idea." },
          { kind: 'image', src: `${T}slide-ideation.webp` },
        ],
      },
      {
        title: 'Figma, code, break it, repeat',
        nav: 'Figma, code, repeat',
        blocks: [
          { kind: 'image', src: `${T}slide-prototyping-hd.webp` },
          { kind: 'p', text: "Rough Figma frames went straight into Claude and Cursor, and working code came back fast: anywhere from a few minutes to an hour per loop. We had something running from almost the first brainstorm." },
          { kind: 'p', text: "That mattered because the core of Tactile was computer vision, and there's no way to prototype a camera reading your hands in Figma. In the mockups, every gesture worked perfectly. In code, the model misfired and read gestures as the wrong ones. We fixed the recognition in Cursor, while the design work was the polish and the direction behind it." },
          { kind: 'p', text: "Having working code that early let us chase the details that would have been a pain to solve down the road: how gestures registered, and how people interact with a camera and their hands instead of a cursor." },
        ],
      },
      {
        title: 'Four rewrites of a hand',
        nav: 'Four rewrites of a hand',
        blocks: [
          { kind: 'image', src: `${T}slide-iteration-hd.webp` },
          { kind: 'p', text: "The gesture map was the hardest design problem in the project. Open palms collided with natural movement, and finger counting was too fiddly on camera. After four full rewrites we landed on distinct shapes that are easy to make and hard to trigger by accident. The question I kept asking the team: does this feel like Tactile, or does it feel like a tool?" },
          {
            kind: 'table',
            head: ['Gesture', 'What it does'],
            rows: [
              ['Point', 'Cursor mode: hover and select'],
              ['Pinch', 'Click or select'],
              ['Peace', 'Scroll in the style editor'],
              ['Thumbs up', 'Toggle the style editor (short hold)'],
              ['Open palm', 'Drag a frame when your hand is over it'],
              ['Rock / horns', 'Hold to delete a frame'],
              ['Two palms', 'Create and pull out a new frame'],
              ['Two peace signs', 'Resize by spreading your hands'],
            ],
          },
        ],
      },
      {
        title: 'The team clicked when we cut things',
        nav: 'What we cut',
        blocks: [
          { kind: 'p', text: "Because the rough MVP was up within the first hours, everyone had something real to build on and argue about, instead of debating ideas in the abstract. The team really clicked once we talked about the purpose and the impact we wanted, then cut everything that didn't serve it." },
          { kind: 'p', text: "The biggest cut was in our first concept, where every gesture created a different type of card or component. Instead of polishing how many kinds of UI you could make, we narrowed it down: your hands customize one basic card." },
        ],
      },
      {
        title: 'How it went',
        nav: 'How it went',
        blocks: [
          { kind: 'image', src: `${T}slide-outcome.webp` },
          { kind: 'p', text: "We didn't place. Tactile still drew 60 likes and 20 comments on Devpost, and I'd build it the same way again." },
          { kind: 'link', href: 'https://www.youtube.com/watch?v=ZS_jWvac8cY', label: 'Watch the demo' },
          { kind: 'link', href: 'https://devpost.com/software/tactile-tyoilq', label: 'See it on Devpost' },
        ],
      },
      {
        title: "What I'd tell another designer",
        nav: 'What I learned',
        blocks: [
          { kind: 'lead', text: "Some things can't be prototyped in Figma. Get to real code before you trust the mockup." },
        ],
      },
    ],
  },

}
