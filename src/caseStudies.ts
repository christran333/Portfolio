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
    role: 'Product Design',
    team: '2 designers, 4 engineers, 2 project leads, and ACM\'s director of development',
    date: 'Summer 2025 → Present',
    type: 'Roommate-finding web app',
    headline: 'Building a roommate-matching platform for 20,000+ UTD students, from scratch',
    hero: img('7agbU5LMHCSPcfO7YHuy97L5PaQ'),
    highlights: [
      { value: '20,000+', label: 'students the platform is designed to serve' },
      { value: '15+', label: 'student interviews I ran' },
      { value: '37%', label: 'faster survey completion in testing' },
    ],
    overview: [
      "MeteorMate is a roommate-matching platform built by students, for students at UT Dallas through ACM. I joined as a second designer, about six months after a co-designer had built the first concept, and later became the lead. I worked with two front-end engineers, two back-end engineers, two project leads, and ACM's director of development to take it from that early concept to a full MVP design.",
    ],
    sections: [
      {
        title: 'In brief',
        blocks: [{
          kind: 'cards', numbered: true, items: [
            { title: 'Research', body: "Ran 15+ student interviews and a competitive analysis, which shifted matching away from personality toward daily habits." },
            { title: 'Collaboration', body: "Joined a co-designer's existing work, met in the middle on the design system, and grew into the lead role while syncing weekly with engineers and leads." },
            { title: 'Brand', body: "Designed the new meteor mark and design refresh, got sign-off from the dev team, and presented it to all of ACM at standup." },
          ],
        }],
      },
      {
        title: 'The problem',
        blocks: [
          { kind: 'lead', text: 'Students find roommates through scattered Facebook groups and Reddit threads, with no way to screen for what actually matters.' },
          { kind: 'p', text: 'In 15+ interviews I ran, sleep schedules and cleanliness mattered far more than major or year, and trust was the biggest barrier. That made lifestyle-first matching and UTD email verification the core of the MVP.' },
        ],
      },
      {
        title: 'Scoping the survey',
        blocks: [
          { kind: 'lead', text: 'The onboarding survey feeds an LLM that sorts students into matches, so every question had to earn its place.' },
          { kind: 'p', text: "The original questionnaire leaned on personality questions, and its copy was loose. I cut it down to the questions that actually predict a good roommate (habits like sleep, cleanliness, and guests), rewrote the copy, and trimmed the onboarding flow around them. A leaner survey was faster for students and gave the back end less noise to sort through." },
          { kind: 'p', text: "I tested the new survey with UTD students and compared it against data from the original questionnaire. Completion was 37% faster." },
        ],
      },
      {
        title: 'Design',
        blocks: [
          { kind: 'image', src: img('7agbU5LMHCSPcfO7YHuy97L5PaQ'), caption: 'Compatibility at a glance: matched preferences in orange, mismatches in grey, and a thumbs-up instead of a heart' },
          { kind: 'p', text: "Swiping cards are the core feature. I studied how existing matching apps handle cards, then iterated on layouts with the engineers until we landed on one that showed compatibility at a glance and was realistic for a student team to build." },
          { kind: 'feature', video: true, src: video('OOE0SIJKu07KI4xEU7drDjBE'), title: 'A survey that feels quick', text: 'Card-based choices with custom icons and three options per category replaced long questionnaires, cutting completion time by 37% in testing.' },
          { kind: 'feature', src: img('8TqtpA6Rx4UBurd2Y7dAoJUbmw'), title: 'Match first, message second', text: 'One onboarding path collects preferences before swiping, so the algorithm is accurate from day one and nobody gets cold messages.' },
          { kind: 'gallery', images: [img('ZopPj00XIp0pniokIhqRlyL4kR4'), img('w9BGAa4AdOcQIxY739lWypxJKo')], caption: "Brand evolution: from the original handshake badge to the meteor mark I designed, bold enough to scale down to an app icon" },
        ],
      },
      {
        title: 'Working together',
        blocks: [
          { kind: 'lead', text: "I joined a project that already had a designer, a concept, and a flow, so the first job was building on it without bulldozing it." },
          { kind: 'p', text: "My co-designer had spent about six months on the landing page, a small design system, and the MVP flow. I thought the system needed a redesign; they wanted to build on it. Over one-on-one calls, and with fresh eyes from leads on other ACM teams, we met in the middle: we kept the color themes and core ideas like swiping, and redesigned the logo, UI components, and onboarding. I let go of some of my own ideas along the way." },
          { kind: 'p', text: "With the engineers, feasibility shaped the design as much as taste. Our developers are students, so elaborate card animations weren't worth the build time. We weighed every interaction on the swipe cards against what the team could ship well. Budget shaped scope too: ACM's servers couldn't support real-time chat, so I designed async, text-only messaging for the MVP and saved real-time and media for V2." },
          { kind: 'p', text: "Standups and weekly meetings kept everyone in sync. When the refresh was ready, the dev team signed off and I presented the new logo and design direction to the entire org at standup." },
          { kind: 'gallery', images: ['/work/meteormate/standup-updates.jpg', '/work/meteormate/standup-logo.jpg'], caption: 'Slides from my standup updates: matching-card iterations, and the new logo reveal' },
        ],
      },
      { title: 'Status', blocks: [{ kind: 'p', text: "Brand, core flows, and high-fidelity designs for every MVP feature are complete. Engineering is building it now, aiming to launch around the end of this year or early next year." }] },
      {
        title: 'What I learned',
        blocks: [{
          kind: 'cards', numbered: true, items: [
            { title: 'Feasibility is a design input', body: "Cool motion isn't always the right tradeoff. Designing with student engineers' constraints in mind made the card feature better, not smaller." },
            { title: 'Ask less, match better', body: "Every survey question costs the user time and the back end effort. Cutting to the questions that matter helped both." },
            { title: 'Sync early, backtrack less', body: "Standups and weekly meetings surfaced good ideas and direction early, so I spent less time redoing designs built on guesses." },
          ],
        }],
      },
    ],
  },

  scout: {
    role: 'Product Design',
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
      "Scout is a B2B marketplace where apartment and property teams order replacement parts, from washers to doors, directly from vendors. The storefront looks like a consumer shop, but underneath it runs on purchase orders and approvals, and both the buyer and vendor apps had grown inconsistent. Vu, a founder and senior designer, and I spent two weeks auditing both to figure out what to fix first.",
    ],
    sections: [
      {
        title: 'In brief',
        blocks: [{
          kind: 'cards', numbered: true, items: [
            { title: 'Audit', body: 'Led the buyer-app audit, walking 15 flows end to end as a buyer and logging every friction point on the screen where it happened.' },
            { title: 'Collaboration', body: 'Paired with Vu, who led the vendor app. We reviewed each other\'s findings on weekly calls and narrowed 50+ down to what mattered most.' },
            { title: 'Design system', body: 'Clustered the findings into 6 themes. The biggest became a shared design system for both apps: 34 components, in light and dark.' },
          ],
        }],
      },
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
        title: 'Working together',
        blocks: [
          { kind: 'lead', text: "Vu pushed back on findings that didn't carry much weight." },
          { kind: 'p', text: "We each logged everything we found, which meant a lot of small issues. On our weekly calls, Vu challenged the ones that wouldn't really change the experience and steered me toward the screen-level problems with the biggest impact. Early on we agreed, on his call, that fixing inconsistency at the root with a design system would do more than patching screens one by one." },
          { kind: 'image', src: `${S}audit-notes.jpg`, caption: 'My buyer-app notes, each issue logged on the screen where it happened' },
          { kind: 'image', src: `${S}audit-board.jpg`, caption: 'The full audit board, flow by flow, with Vu reviewing alongside' },
        ],
      },
      {
        title: 'Outcome',
        blocks: [
          { kind: 'lead', text: "The audit's clearest theme was inconsistency, so its biggest outcome was a shared design system for both apps: 6 foundations, 34 components, and 8 patterns, in light and dark." },
          { kind: 'p', text: "Vu coded the system. I organized the Figma files and findings for handoff, then reviewed the components once they were built." },
          { kind: 'image', src: `${S}ds-colors.jpg` },
          { kind: 'gallery', images: [`${S}ds-buttons.jpg`, `${S}ds-type.jpg`] },
          { kind: 'link', href: 'https://scout-design-system-beta.vercel.app/', label: 'Explore the live design system' },
        ],
      },
      {
        title: 'What I learned',
        blocks: [{
          kind: 'cards', items: [
            { title: 'Walk every flow yourself', body: "AI tools helped, but the real findings came from sitting down and trying to buy something as a user, counting every step it took." },
            { title: 'Design for the weekly user', body: "Buyers repeat the same order, approval, and checkout loop every week. Fixing that loop matters more than polishing the first-time tour." },
            { title: 'Impact over volume', body: "Fifty findings aren't the goal. Vu's pushback taught me to lead with the few that actually change the experience." },
          ],
        }],
      },
    ],
  },

  cosign: {
    role: 'Product Design',
    team: "2 designers (me + Vu), with Cosign's founder",
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
      "Cosign connects renters who need housing guarantors with people willing to co-sign their lease. The founder brought us data from the old flow and their own research, and Vu and I redesigned the application, dashboard, and landing page together to reduce friction and build trust.",
    ],
    sections: [
      {
        title: 'In brief',
        blocks: [{
          kind: 'cards', numbered: true, items: [
            { title: 'Redesign', body: 'Designed the application flow, dashboard, landing page, and print collateral side by side with Vu, cutting the application from 8 steps to 4.' },
            { title: 'Collaboration', body: "Worked in passes with a non-technical founder, showing the design reasoning behind each choice until the direction clicked." },
            { title: 'Impact', body: 'After launch, conversions rose 17% and traffic rose 22%, comparing site analytics before and after.' },
          ],
        }],
      },
      {
        title: 'The problem',
        blocks: [
          { kind: 'lead', text: '65% of applicants dropped off and 58% bounced from the landing page.' },
          { kind: 'p', text: "Data from the old flow showed why: 30% of users entered the wrong path because renter and guarantor looked the same, 40% never took an action on the dashboard, and the 8-step application took 12 minutes on average." },
        ],
      },
      {
        title: 'Design',
        blocks: [
          { kind: 'list', title: 'Key decisions', items: ['Split the renter and guarantor paths from the very first screen', 'Grouped related information into 4 sections instead of 8 steps', 'Added visual progress tracking', 'Put trust signals and plain explanations up front'] },
          { kind: 'image', src: img('BPhNVYI5YheOZ6Pp9uuWIBdT7c'), caption: 'Metrics up top, a prioritized action panel, and status badges that pair color with a label, so managers can scan a whole page at once' },
          { kind: 'image', src: '/work/cosign/dashboard-overview.jpg', caption: 'The property-manager overview: applications, approvals, and defaults at a glance, with Refer New Applicant always one click away' },
          { kind: 'feature', src: img('9hSes9fVwMjoVkUM5UA5k6tp0'), title: "A landing page for people who've been declined before", text: 'Plain language over clever copy, a calm palette, and a four-step overview that makes co-signing feel manageable before anyone signs up.' },
        ],
      },
      {
        title: 'Beyond the screens',
        blocks: [
          { kind: 'lead', text: 'Conversions also happen off the website, so we designed the sales material too.' },
          { kind: 'p', text: "Cosign sells to property managers and partners as much as to renters. Alongside the product work, we designed print and sales collateral: desk flyers and handouts for leasing offices, a partner revenue-share flyer, a landlord one-pager, a customer case study, and a pitch deck (confidential, so not shown here)." },
          { kind: 'gallery', columns: 3, images: ['/work/cosign/landlord-onepager.jpg', '/work/cosign/how-it-works.jpg', '/work/cosign/partner-flyer.jpg'], caption: 'Landlord one-pager, leasing-office handout, and partner revenue-share flyer' },
        ],
      },
      {
        title: 'Working together',
        blocks: [
          { kind: 'lead', text: "The founder wasn't sold on our first ideas, so we earned trust one pass at a time." },
          { kind: 'p', text: "Vu and I checked in twice a week and kept a running conversation in Figma comments. Vu synced weekly with the founder on direction, and after each round the two of us sat down to plan the next pass. The founder isn't a designer and didn't have a clear picture yet, so early directions met a lot of hesitation. Instead of arguing in the abstract, we answered with iterations, each one showing the reasoning behind a choice, like why splitting the two paths up front cuts confusion." },
          { kind: 'p', text: "With a small engineering team, we also weighed how easy each idea would be to build. Nothing was technically hard, but simpler was always worth considering." },
        ],
      },
      {
        title: 'What I learned',
        blocks: [{
          kind: 'cards', items: [
            { title: 'Show the why', body: "Design principles don't land with a non-technical founder until you show them. Every iteration was a chance to make the reasoning visible." },
            { title: 'Small changes compound', body: 'Clearer headlines, better grouping, and fewer steps added up to double-digit gains.' },
            { title: 'Trust is the product', body: "For someone who's been declined before, plain language and clear trust signals matter as much as fewer steps." },
          ],
        }],
      },
    ],
  },

  backtrack: {
    role: 'Product Design',
    team: 'Solo designer, with the founder, lead engineer, and sales team',
    date: 'Fall 2025',
    type: 'AI-powered enterprise tools',
    headline: 'Designing an AI assistant that turns meeting notes into action',
    hero: img('XKHJwFkDB4kDxYxSEONjAoi0'),
    highlights: [
      { value: '50+ → 12', label: 'support conversations distilled into AI scenarios' },
      { value: '37% → 64%', label: 'task completion across 8 usability tests' },
      { value: '< 5 min', label: 'event demo setup in internal testing' },
    ],
    overview: [
      "Backtrack helps teams capture and act on meeting insights. As the only designer, working directly with the founder, I owned two projects end to end: Ask Backtrack AI, a conversational assistant that turns notes into follow-ups, summaries, and action items, and an event tool that made setting up live demos at sales events faster.",
    ],
    sections: [
      {
        title: 'In brief',
        blocks: [{
          kind: 'cards', numbered: true, items: [
            { title: 'Ownership', body: 'Owned Ask Backtrack AI and the event tool end to end, deciding what to research, explore, and build next.' },
            { title: 'Collaboration', body: 'Presented passes to the founder in weekly standups and on Slack, and worked with the lead engineer and the sales team running live demos.' },
            { title: 'Impact', body: 'Task completion rose from 37% to 64% across 8 usability tests, and demo setup took under 5 minutes in internal testing.' },
          ],
        }],
      },
      {
        title: 'The problem',
        blocks: [
          { kind: 'lead', text: 'Users had the notes but not the time to act on them, and a blank chat box made it hard to know what to ask.' },
          { kind: 'p', text: "I pulled from recorded transcripts and support conversations, and distilled 50+ of them into 12 interaction scenarios on my own, drafting with Claude and writing much of the copy myself. That gave every design decision a real request behind it." },
        ],
      },
      {
        title: 'Learning from the best',
        blocks: [
          { kind: 'lead', text: "The founder's advice was simple: find who's doing it well and build from there." },
          { kind: 'p', text: "Teams like Notion and Granola have already tested what works for AI and meeting notes, so I studied their interaction patterns and UX writing closely before designing anything." },
          { kind: 'video', src: video('1QddOeE35EtR2Qa05oLSMwrNtc'), caption: 'Notion: AI actions appear in context, with progress shown while it works' },
          { kind: 'image', src: img('09QLXGndgYI0c30SZosmFBEaQ'), caption: 'Granola: one-tap prompts instead of a blank box' },
          {
            kind: 'cards', items: [
              { title: 'Clarity with flexibility', body: 'Users want structured starting points they can edit, not decisions made for them.' },
              { title: 'Tone builds trust', body: "AI has to match the user's voice. Robotic output hurts credibility." },
              { title: 'Blank states create friction', body: 'Starting from nothing raises cognitive load. Contextual prompts reduce hesitation.' },
              { title: 'AI supports judgment', body: 'People want tools that speed up their thinking, not replace it.' },
            ],
          },
        ],
      },
      {
        title: 'Iteration',
        blocks: [
          { kind: 'image', src: img('hB1L8qYWkMRkiyEWudGnNYoT8Mc') },
          { kind: 'image', src: img('9jY6fcfvX4vnsP1zFCzZqJiFFQ'), caption: 'From a blank input to guided, refinable prompts' },
          {
            kind: 'cards', numbered: true, items: [
              { title: 'Minimal entry point', body: 'A single input with a neutral greeting. Clean, but users had to decide what to ask before getting any value.' },
              { title: 'Guided prompts', body: 'Prompt starters for common tasks changed the question from "What should I type?" to "Which action do I need?"' },
              { title: 'Conversational refinement', body: 'Inline refinements like "make this more casual" let users adjust tone instead of starting over.' },
            ],
          },
          { kind: 'p', text: "I tested each pass with coworkers and with friends who had no stake in the product, 8 rounds in all. Task completion climbed from 37% to 64%." },
        ],
      },
      {
        title: 'Event tool',
        blocks: [
          { kind: 'lead', text: 'At big sales events, the team ran live demos on a bunch of phones at once, in crowded, chaotic rooms.' },
          { kind: 'p', text: "Each phone had to show which sponsor or company it was for, and setting them all up was a pain for the sales team running demos. Working with them and the lead engineer, I designed a tool for quickly building template wallpapers and setting up the screens for each sponsor, keeping it simple both for the team and for the people dropping by to try the demo. In internal testing, setup for a sponsor took under 5 minutes." },
        ],
      },
      {
        title: 'Working together',
        blocks: [
          { kind: 'lead', text: "My boss was too busy to hold my hand, so I owned the direction." },
          { kind: 'p', text: "As a design intern and the only designer, I decided what to work on next, did the research, and found the direction we needed to go. In weekly standups on Slack, I walked the founder through what I'd made and the thinking behind it, and through the day I sent passes and left comments in Figma to get quick feedback." },
          { kind: 'p', text: "His biggest push was to go wide: explore lots of passes, even abstract ones, instead of narrowing down early, then decide with research and feedback. I also worked with the lead engineer and the sales team, since they were the ones using the software hands-on at events." },
        ],
      },
      { title: 'Final design', blocks: [{ kind: 'image', src: img('gY8uoiMxW7YpvWuX0wOIhBHiB0M') }] },
      {
        title: 'What I learned',
        blocks: [{
          kind: 'cards', items: [
            { title: 'Ambiguity is the job', body: "No one will hold your hand forever. Owning the research and the next decision is what moves the work forward." },
            { title: 'Go wide before you narrow', body: 'First iterations are never the final thing. Throwing out lots of ideas, failing fast, and rebuilding is how the good one shows up.' },
            { title: 'Everyone is a collaborator', body: 'Engineers, the founder, and even sales shaped this work. The people demoing it every day knew things I never would have guessed.' },
          ],
        }],
      },
    ],
  },

  'act-one': {
    role: 'Brand Design',
    team: '3 designers',
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
    role: 'Visual Design',
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
    role: 'Brand Design',
    team: '3 designers',
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
    role: 'Visual Design',
    team: '2 designers',
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
    role: 'Visual Design',
    team: '2 designers (me + Vu)',
    date: 'Spring 2025 → Fall 2025',
    type: 'AI e-learning startup · Branding · Visual design',
    headline: 'Scaling the visual system of an AI microlearning platform',
    hero: img('BGG1xL6mAgP5bl9i3x50kdKRY'),
    overview: ["Arist helps enterprises deliver bite-sized training through SMS, Slack, and Teams. As the product scaled, its visual language wasn't keeping up, so I built a component system alongside the founder of Francois Labs, a senior designer: reusable UI components, scalable asset libraries, and tighter consistency across product surfaces."],
    sections: [
      { title: 'UI components', blocks: [{ kind: 'image', src: img('XW7B4K8FDwhddmvFZURHcjQaBI') }, { kind: 'p', text: 'System-first: reusable components over one-off designs, rolled out incrementally so the product stayed familiar while the quality bar went up.' }] },
      { title: 'Final design', blocks: [{ kind: 'gallery', images: [img('3E4aTSItRP5dd7rQWtz1pE43rWw', 'jpg'), img('8xdlWkdbchwwJStdWcihwLqET58', 'jpg')] }] },
      { title: 'What I learned', blocks: [{ kind: 'p', text: "Design systems are built for scale. Finding components that stay coherent, follow design principles, still have character, and serve a real purpose takes far more effort and deep thinking than polishing a single screen." }] },
    ],
  },

  tactile: {
    role: 'Product Design',
    team: '4: me as lead designer, a front-end and design teammate, and 2 back-end engineers',
    date: '2026',
    type: 'FigBuild 2026 · Figma plugin · Hackathon',
    headline: 'Designing with your hands: a Figma plugin for people with taste but no tools',
    hero: `${T}tactile-cover.webp`,
    highlights: [
      { value: '8', label: 'hand gestures that drive the whole canvas' },
      { value: '4', label: 'full rewrites of the gesture map before it felt right' },
      { value: '60s', label: 'the bar we set for a first-timer to pick it up' },
      { value: '60', label: 'likes and 20 comments on Devpost' },
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
        title: 'Working together',
        blocks: [
          { kind: 'lead', text: 'On a team of four, I was the main designer and set the direction early.' },
          { kind: 'p', text: "One teammate split front end and design with me, and two back-end engineers built out the full stack. Because I had a rough working MVP up within the first hours, everyone had something real to build on and argue about, instead of debating ideas in the abstract. The team really clicked once we stopped and talked about the purpose and the impact we wanted, then cut everything that didn't serve it." },
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
          { kind: 'p', text: "We didn't place, but Tactile drew 60 likes and 20 comments on Devpost." },
          { kind: 'link', href: 'https://devpost.com/software/tactile-tyoilq', label: 'See it on Devpost' },
        ],
      },
      {
        title: 'What I learned',
        blocks: [{
          kind: 'cards', numbered: true, items: [
            { title: 'Iterate early', body: "Big changes are cheap at the start. Later on, core features get much harder to change, so the important pivots need to happen early." },
            { title: 'Ship during ideation', body: "Students build full apps in 24 hours now. Getting an MVP out during ideation leaves room to break things, fail, and pivot in better directions." },
            { title: 'Purpose aligns the team', body: "The work came together once we agreed on the impact we wanted, which made it obvious what to cut." },
          ],
        }],
      },
    ],
  },
}
