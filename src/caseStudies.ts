// Case study content, keyed by project id (see projects in data.ts).
// Each page is: meta line → headline → hero → highlights → overview → a few short, visual sections.
// Kept deliberately concise; the full long-form write-ups live in notes/case-studies-long-form.ts.


const img = (id: string, ext = 'png') => `https://framerusercontent.com/images/${id}.${ext}`
const video = (id: string) => `https://framerusercontent.com/assets/${id}.mp4`

// Locally hosted images live in public/work/<project>/
const A = '/work/act-one/'
const S = '/work/scout/'
const T = '/work/tactile/'

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

export type Section = { title: string; blocks: Block[] }

export type CaseStudy = {
  role: string
  team?: string // who you worked with, shown as a Team fact
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
    role: 'Lead Product Designer',
    date: 'Summer 2025 → Present',
    type: 'Roommate-finding web app',
    headline: 'Building a roommate-matching platform for 20,000+ UTD students, from scratch',
    hero: img('7agbU5LMHCSPcfO7YHuy97L5PaQ'),
    highlights: [
      { value: '20,000+', label: 'students the platform is designed to serve' },
      { value: '37%', label: 'faster survey completion in testing' },
      { value: '15+', label: 'reusable components in the design system' },
    ],
    overview: [
      "MeteorMate is a roommate-matching platform built by students, for students at UT Dallas through ACM. As Lead Product Designer, I took it from zero to a full MVP design, partnering with PMs and engineers on research, information architecture, brand, and developer handoff.",
    ],
    sections: [
      {
        title: 'The problem',
        blocks: [
          { kind: 'lead', text: 'Students find roommates through scattered Facebook groups and Reddit threads, with no way to screen for what actually matters.' },
          { kind: 'p', text: 'In 15+ interviews, sleep schedules and cleanliness mattered far more than major or year, and trust was the biggest barrier. That made lifestyle-first matching and UTD email verification the core of the MVP.' },
        ],
      },
      {
        title: 'Design',
        blocks: [
          { kind: 'image', src: img('7agbU5LMHCSPcfO7YHuy97L5PaQ'), caption: 'Compatibility at a glance: matched preferences in orange, mismatches in grey, and a thumbs-up instead of a heart' },
          { kind: 'feature', video: true, src: video('OOE0SIJKu07KI4xEU7drDjBE'), title: 'A survey that feels quick', text: 'Card-based choices with custom icons and three options per category replaced long questionnaires, cutting completion time by 37% in testing.' },
          { kind: 'feature', src: img('8TqtpA6Rx4UBurd2Y7dAoJUbmw'), title: 'Match first, message second', text: 'One onboarding path collects preferences before swiping, so the algorithm is accurate from day one and nobody gets cold messages.' },
          { kind: 'gallery', images: [img('ZopPj00XIp0pniokIhqRlyL4kR4'), img('w9BGAa4AdOcQIxY739lWypxJKo')], caption: 'Brand evolution: from a detailed handshake badge to a bold, scalable meteor mark' },
        ],
      },
      { title: 'Status', blocks: [{ kind: 'p', text: 'Brand, core flows, and high-fidelity designs for every MVP feature are complete. The app hasn\'t launched yet, and I\'m still working with the ACM team as it gets built.' }] },
    ],
  },

  scout: {
    role: 'Product Design Intern, Francois Labs',
    team: '2 designers (me + Vu), with Scout\'s founders',
    date: 'Summer 2026',
    type: 'B2B marketplace · UX audit · Design system',
    headline: 'Auditing a two-sided parts marketplace, and turning the findings into a design system',
    hero: `${S}insights.jpg`,
    highlights: [
      { value: '15', label: 'buyer flows audited end to end' },
      { value: '50+', label: 'findings logged across the buyer and vendor apps' },
      { value: '6', label: 'themes distilled from the findings' },
      { value: '34', label: 'components in the resulting design system' },
    ],
    overview: [
      'Scout is a B2B marketplace where apartment and property teams order replacement parts, from washers to doors, directly from vendors. Working alongside Vu, a founder and senior designer, I led the audit of the buyer app while Vu led the vendor app. Over two weeks we logged every point of friction on the screen where it happened, reviewed each other\'s findings on weekly calls, and clustered them into themes. The biggest outcome was a shared design system, which Vu coded and I reviewed.',
    ],
    sections: [
      {
        title: 'Six themes',
        blocks: [{
          kind: 'cards', numbered: true, items: [
            { title: 'Related features are split apart', body: 'Collapse co-dependent tabs into one place.' },
            { title: 'Inconsistent UI', body: 'Unify styling into one design system.' },
            { title: 'Redundant data', body: 'Show each piece of information once.' },
            { title: 'Friction in repeat workflows', body: 'Optimize for the weekly user, not the first-time tour.' },
            { title: 'Marketing over action', body: 'Lead with what users came to do.' },
            { title: 'Underserved error states', body: 'Guide users toward a fix.' },
          ],
        }],
      },
      {
        title: 'Key findings',
        blocks: [
          { kind: 'finding', theme: 'Information hierarchy', src: `${S}insights.jpg`, title: "The homepage isn't where users expect it", problem: 'Insights acts as the dashboard home but sits second in the navigation, so there is no obvious way back.', fix: 'Rename it Home and make it the first tab.' },
          { kind: 'finding', theme: 'Related features are split apart', src: `${S}price-lists.jpg`, title: 'Features that belong together live on separate pages', problem: 'Customer Groups exist mainly to assign price lists, yet they are a separate page.', fix: 'Collapse co-dependent features into one page with tabs.' },
          { kind: 'finding', theme: 'Friction in repeat workflows', src: `${S}import-landing.jpg`, title: 'A weekly task built like a first-time tour', problem: 'The import page repeats the same pitch three times before the button, and the wizard shows six steps in one place and four in another.', fix: 'Lead with the action and show one consistent step count.' },
          { kind: 'finding', theme: 'Buyer trust', src: `${S}buyer-card.jpg`, title: 'A price warning with no context', problem: 'Cards flag a price increase in red but never say compared to what, with no way to dig in.', fix: 'Explain the change and let buyers drill into price history.' },
        ],
      },
      {
        title: 'Outcome',
        blocks: [
          { kind: 'lead', text: "The audit's clearest theme was inconsistency, so its biggest outcome was a shared design system for both apps: 6 foundations, 34 components, and 8 patterns, in light and dark." },
          { kind: 'image', src: `${S}ds-colors.jpg` },
          { kind: 'gallery', images: [`${S}ds-buttons.jpg`, `${S}ds-type.jpg`] },
          { kind: 'link', href: 'https://scout-design-system-beta.vercel.app/', label: 'Explore the live design system' },
        ],
      },
    ],
  },

  cosign: {
    role: 'Product Design Intern, Francois Labs',
    date: 'Spring 2025',
    type: 'Rental platform · Fintech',
    headline: 'Redesigning a fintech rental platform to rebuild trust and lift conversions',
    hero: img('5pvYzGg5sCSysJdt9R5xFw0zvw'),
    highlights: [
      { value: '↑ 22%', label: 'increase in traffic' },
      { value: '↑ 17%', label: 'increase in conversions' },
      { value: '8 → 4', label: 'application steps' },
    ],
    overview: [
      'Cosign connects renters who need housing guarantors with people willing to co-sign their lease. As Product Design Intern at Francois Labs, I redesigned the dashboard, application flow, and landing page to reduce friction and build trust.',
    ],
    sections: [
      {
        title: 'The problem',
        blocks: [
          { kind: 'lead', text: '65% of applicants dropped off and 58% bounced from the landing page.' },
          { kind: 'p', text: "Users couldn't tell the renter and guarantor paths apart, the dashboard offered no clear next step, and an 8-step application took 12 minutes on average. I cut it to 4 steps, split the two paths from the start, and added progress tracking and trust signals throughout." },
        ],
      },
      {
        title: 'Design',
        blocks: [
          { kind: 'image', src: img('BPhNVYI5YheOZ6Pp9uuWIBdT7c'), caption: 'Metrics up top, a prioritized action panel, and status badges that pair color with a label, so managers can scan a whole page at once' },
          { kind: 'feature', src: img('9hSes9fVwMjoVkUM5UA5k6tp0'), title: "A landing page for people who've been declined before", text: 'Plain language over clever copy, a calm palette, and a four-step overview that makes co-signing feel manageable before anyone signs up.' },
        ],
      },
    ],
  },

  backtrack: {
    role: 'Product Design Intern, Backtrack',
    date: 'Fall 2025',
    type: 'AI-powered enterprise tools',
    headline: 'Designing an AI assistant that turns meeting notes into action',
    hero: img('XKHJwFkDB4kDxYxSEONjAoi0'),
    highlights: [
      { value: '50+ → 12', label: 'support conversations distilled into AI scenarios' },
      { value: '37% → 64%', label: 'task completion across 8 usability tests' },
    ],
    overview: [
      'Backtrack helps teams capture and act on meeting insights. I designed Ask Backtrack AI, a conversational assistant that turns notes into follow-ups, summaries, and action items, while keeping users in control of every output.',
    ],
    sections: [
      {
        title: 'The problem',
        blocks: [{ kind: 'lead', text: 'Users had the notes but not the time to act on them, and a blank chat box made it hard to know what to ask.' }],
      },
      {
        title: 'Iteration',
        blocks: [
          { kind: 'image', src: img('hB1L8qYWkMRkiyEWudGnNYoT8Mc') },
          { kind: 'image', src: img('9jY6fcfvX4vnsP1zFCzZqJiFFQ'), caption: 'From a blank input to guided, refinable prompts' },
          { kind: 'p', text: 'Structured prompt starters replaced the blank state, and inline refinements like "make this more casual" let users adjust tone instead of starting over.' },
        ],
      },
      { title: 'Final design', blocks: [{ kind: 'image', src: img('gY8uoiMxW7YpvWuX0wOIhBHiB0M') }] },
    ],
  },

  'act-one': {
    role: 'Product Design Intern, Francois Labs',
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

  janus: {
    role: 'Product Design Intern, Francois Labs',
    date: '2026',
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
    role: 'Product Design Intern, Francois Labs',
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
    role: 'Product Design Intern, Francois Labs',
    date: 'Spring 2025 → Fall 2025',
    type: 'AI e-learning startup · Branding · Visual design',
    headline: 'Scaling the visual system of an AI microlearning platform',
    hero: img('BGG1xL6mAgP5bl9i3x50kdKRY'),
    overview: ["Arist helps enterprises deliver bite-sized training through SMS, Slack, and Teams. As the product scaled, its visual language wasn't keeping up, so I built a component system alongside the founder of Francois Labs, a senior designer: reusable UI components, scalable asset libraries, and tighter consistency across product surfaces."],
    sections: [
      { title: 'UI components', blocks: [{ kind: 'image', src: img('XW7B4K8FDwhddmvFZURHcjQaBI') }, { kind: 'p', text: 'System-first: reusable components over one-off designs, rolled out incrementally so the product stayed familiar while the quality bar went up.' }] },
      { title: 'Final design', blocks: [{ kind: 'gallery', images: [img('3E4aTSItRP5dd7rQWtz1pE43rWw', 'jpg'), img('8xdlWkdbchwwJStdWcihwLqET58', 'jpg')] }] },
    ],
  },

  tactile: {
    role: 'Product Designer & Front-end',
    date: '2026',
    type: 'FigBuild 2026 · Figma plugin · Hackathon',
    headline: 'Designing with your hands: a Figma plugin for people with taste but no tools',
    hero: `${T}tactile-cover.webp`,
    highlights: [
      { value: '8', label: 'hand gestures that drive the whole canvas' },
      { value: '4', label: 'full rewrites of the gesture map before it felt right' },
      { value: '60s', label: 'the bar we set for a first-timer to pick it up' },
    ],
    overview: [
      "Tactile is a Figma plugin you control with hand gestures and plain language. Describe a feeling (warm, bold, academic) and it becomes a real design, with no hex codes or type scales in the way. Our team built it at FigBuild 2026 around one belief: plenty of people have taste, they've just never had a tool that speaks their language.",
    ],
    sections: [
      {
        title: 'Taste without the tools',
        blocks: [
          { kind: 'lead', text: "FigBuild asked for interfaces that resonate with real people, not just ones that work. We pointed that at Figma itself: it's powerful, but it assumes you already think like a designer." },
          { kind: 'image', src: `${T}slide-brief.webp`, caption: 'The brief: bridging the gap between ideas and execution' },
          { kind: 'p', text: 'Most people who care about design can\'t build what they imagine. So the question we aligned the team on was simple: what if the interface spoke human?' },
        ],
      },
      {
        title: 'Listening where designers talk',
        blocks: [
          { kind: 'image', src: `${T}slide-research.webp` },
          { kind: 'p', text: "I dug through past Figma Makeathon submissions to find where the ceiling was, then spent time on X hearing how designers actually talk about their tools. The same tension showed up everywhere: accessible tools feel dumbed down, and serious tools shut non-designers out. That gap became our target, something a non-designer can pick up in a minute that a designer still respects." },
        ],
      },
      {
        title: 'Soul before features',
        blocks: [
          { kind: 'image', src: `${T}slide-ideation.webp` },
          { kind: 'p', text: "Instead of starting from a feature list, we mapped the submissions we genuinely loved in FigJam and asked why they stuck. The best ones had a point of view, not just clever tech. That became the filter I held every idea to: it had to have soul before it earned a feature." },
          { kind: 'p', text: "Seeing how abstract the Makeathon ideas had gotten, I pushed for something that felt unique and fun to use: a computer-vision Figma plugin you drive with your hands. That became the core of our first MVP." },
          { kind: 'p', text: "I took the brand in the same direction. We built the identity around clouds and open sky to say what the product promises: the ceiling on what you can make is gone." },
        ],
      },
      {
        title: 'Figma, code, break it, repeat',
        blocks: [
          { kind: 'image', src: `${T}slide-prototyping-hd.webp` },
          { kind: 'p', text: "With a weekend on the clock, I built the first MVP myself in HTML and CSS, using Cursor and Claude Code to get the first computer-vision gesture prototype working, the version the team built on. From there I kept design and engineering in one tight loop: rough frames in Figma, fed straight into Claude and Cursor as context, working code within hours, then back to Figma once it broke. Design decisions showed up in the build the same day, so we could lock the right features early instead of polishing the wrong ones." },
        ],
      },
      {
        title: 'Four rewrites of a hand',
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
        title: 'Under the hood',
        blocks: [
          { kind: 'image', src: `${T}slide-stack.webp` },
          { kind: 'p', text: "MediaPipe reads hand gestures in the browser, React drives the plugin UI, and a FastAPI and LangChain backend turns plain-language prompts into design decisions, with MongoDB storing them and Vercel hosting it all. My job was making sure every one of those pieces still felt like one product from the user's side." },
        ],
      },
      {
        title: 'What it proved',
        blocks: [
          { kind: 'image', src: `${T}slide-outcome.webp` },
          { kind: 'lead', text: "Tactile proved that abstract language can drive real design decisions. The hardest part wasn't the tech, it was deciding what to cut." },
          { kind: 'p', text: "Coordinating frontend, backend, design, and integration in a weekend only worked once we had a real conversation about purpose and the impact we wanted. Everything fell into place after that. Design isn't about the tools; it's about giving people the confidence to decide." },
          { kind: 'p', text: "I also built our final pitch deck and helped write the script we presented to the judges, so the story landed as clearly as the demo." },
          { kind: 'link', href: 'https://www.youtube.com/watch?v=ZS_jWvac8cY', label: 'Watch the demo' },
          { kind: 'link', href: 'https://devpost.com/software/tactile-tyoilq', label: 'See it on Devpost' },
        ],
      },
    ],
  },
}
