// Case study content, keyed by project id (see projects in data.ts).
// Each page is: meta line → headline → hero → highlights → overview → sections of blocks.

import type { Crop, FlowStep } from './components/Motion'

const img = (id: string, ext = 'png') => `https://framerusercontent.com/images/${id}.${ext}`
const video = (id: string) => `https://framerusercontent.com/assets/${id}.mp4`

// Locally hosted images live in public/work/<project>/
const A = '/work/act-one/'
const S = '/work/scout/'

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
  | { kind: 'video'; src: string; caption?: string }
  | { kind: 'table'; head: string[]; rows: string[][] }
  // Motion from stills (see components/Motion.tsx)
  | { kind: 'flow'; steps: FlowStep[]; aspect?: string; caption?: string } // click-through of screens
  | { kind: 'compare'; before: string; after: string; aspect?: string; labels?: [string, string]; caption?: string }
  | { kind: 'layered'; src: string; crop: Crop; ratio: number; caption?: string } // a detail lifts off the screen
  | { kind: 'zoom'; src: string; focus: [number, number]; scale?: number; caption?: string }
  | { kind: 'scroll'; src: string; aspect?: string; caption?: string } // tall screenshot scrolling in a browser

export type Section = { title: string; blocks: Block[] }

export type CaseStudy = {
  role: string
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
    type: 'Roommate-finding web application',
    headline: 'Building a roommate-matching platform for 20,000+ UTD students, from scratch',
    hero: img('7agbU5LMHCSPcfO7YHuy97L5PaQ'),
    highlights: [
      { value: '20,000+', label: 'students the platform is designed to serve' },
      { value: '37%', label: 'faster survey completion in testing' },
      { value: '15+', label: 'reusable components in the design system' },
    ],
    overview: [
      'MeteorMate is a roommate-matching platform built by students, for students at UT Dallas through the Association for Computing Machinery (ACM). As Lead Product Designer, I partnered with engineers and product leads to build this product from scratch, driving the end-to-end design strategy from user research and information architecture to visual identity and developer handoff.',
      'Working on an agile team, I translated ambiguous user needs into concrete product features, prioritized for MVP, and built a scalable design system designed to grow with the product.',
    ],
    sections: [
      {
        title: 'The challenge',
        blocks: [{
          kind: 'cards', items: [
            { title: 'Product problem', body: "UTD's 20,000+ students rely on fragmented solutions — disorganized Facebook groups, manual Reddit searches, and random housing assignments with zero compatibility screening. No dedicated platform existed to help students find compatible, verified roommates efficiently." },
            { title: 'User friction', body: 'Students spent 2+ weeks searching across multiple platforms with no filtering for lifestyle preferences like sleep schedules or cleanliness. Unverified users created trust issues, and the fear of being locked into a year-long lease with an incompatible roommate was constant.' },
          ],
        }],
      },
      {
        title: 'My role',
        blocks: [{
          kind: 'cards', items: [
            { title: 'Defining the MVP direction', points: ['Defined the product vision and design direction with PMs', 'Led prioritization discussions for the MVP feature set', 'Balanced user needs with technical constraints and timeline'] },
            { title: 'Research-driven decisions', points: ['Conducted 20+ student interviews to understand pain points', 'Analyzed the competitor landscape (Tinder, Roommates.com, Facebook groups)', 'Validated decisions through stakeholder feedback and user testing'] },
            { title: 'End-to-end design', points: ['Designed complete user flows from onboarding to matching', 'Created the brand identity (logo, visual system, star texture theme)', 'Built a scalable design system for future features'] },
            { title: 'PM & engineering alignment', points: ['Weekly syncs with PMs to align on roadmap and priorities', 'Daily standups with engineering on technical feasibility', 'Gave feedback to a junior designer on the ACM Development team'] },
          ],
        }],
      },
      {
        title: 'Research & discovery',
        blocks: [
          { kind: 'p', text: 'I interviewed 20+ UTD students who had recently searched for roommates to understand their process, pain points, and priorities.' },
          {
            kind: 'cards', numbered: true, items: [
              { title: 'Lifestyle compatibility > demographics', body: "Students cared far more about sleep schedules (18/20) and cleanliness (17/20) than major or year. Traditional filters weren't addressing what actually mattered for living together." },
              { title: 'Current solutions waste massive time', body: 'The average student checked 3–4 platforms and spent 2+ weeks searching. Most messages went unanswered, creating frustration and inefficiency.' },
              { title: 'Trust is the #1 barrier', body: '15/20 students expressed safety concerns about meeting strangers online. UTD email verification and profile completeness were seen as critical for legitimacy.' },
            ],
          },
        ],
      },
      {
        title: 'Competitive analysis',
        blocks: [{
          kind: 'table',
          head: ['Platform', 'Strengths', 'Weaknesses', 'Opportunity for MeteorMate'],
          rows: [
            ['Tinder', 'Fast swiping, intuitive UI', 'Too superficial for roommates', 'Borrow the mechanic, add depth'],
            ['Roommates.com', 'Detailed profiles, filters', 'Clunky, outdated, not UTD-specific', 'Modern UI + local focus'],
            ['r/UTDallas', 'UTD-specific community', 'Manual searching, no matching', 'Automate with an algorithm'],
          ],
        }],
      },
      {
        title: 'Defining the MVP',
        blocks: [
          { kind: 'p', text: 'Working with PMs and engineering, I helped define the MVP scope by separating must-haves from nice-to-haves.' },
          {
            kind: 'cards', items: [
              { title: 'MVP features', points: ['UTD email verification', 'Lifestyle-based matching algorithm', 'Swipe interface for roommate discovery', 'Basic messaging (post-match)', 'Profile creation with preferences'] },
              { title: 'Post-MVP (V2)', points: ['Advanced filters (budget, location preferences)', 'Group roommate matching (3–4 people)', 'Lease coordination tools', 'Reviews and ratings system'] },
            ],
          },
        ],
      },
      {
        title: 'Solving ambiguous problems',
        blocks: [{
          kind: 'cards', numbered: true, items: [
            { title: 'Make matching feel personal, not overwhelming', body: 'Students wanted detailed compatibility info but found long questionnaires tedious.', points: ['Progressive onboarding: a 3-step sign-up collecting only essential info first', 'Preference tagging: visual tags instead of lengthy forms (less drop-off)', 'Smart defaults: pre-selected common preferences to reduce friction'] },
            { title: 'Build trust without over-engineering verification', body: 'Students wanted safety features, but robust verification would delay the MVP.', points: ['UTD email verification (easy to implement, high trust signal)', 'Profile completeness indicator to incentivize detailed profiles', 'Mutual connections and photo verification considered for V2'] },
            { title: 'Differentiate from "Tinder for roommates"', body: 'Swipe mechanics work, but MeteorMate needed to feel unique and credible.', points: ['Custom brand identity with a space/meteor theme', 'Star texture background as a signature visual element', 'Richer profile cards with compatibility scores, lifestyle tags, and verification status', 'Thoughtful copywriting that avoids generic dating-app language'] },
          ],
        }],
      },
      {
        title: 'Information architecture',
        blocks: [
          { kind: 'image', src: img('8TqtpA6Rx4UBurd2Y7dAoJUbmw'), caption: 'User flows from onboarding to matching' },
          { kind: 'list', title: 'Key IA decisions', items: ['A single onboarding path', 'Preference setup before swiping, to keep the algorithm accurate', 'Match first, message second, to reduce cold messaging'] },
        ],
      },
      {
        title: 'Prototyping & iteration',
        blocks: [
          { kind: 'p', text: 'I sketched multiple layout options and tested them with developers for feasibility, weighing trade-offs and technical constraints. We iterated and prototyped a lot.' },
          { kind: 'lead', text: 'I initially designed a dashboard-style home screen, but developers flagged its complexity. I simplified to a swipe-first interface that aligned with technical constraints and user expectations.' },
          { kind: 'image', src: img('W1bikhbtoGfpxqbGHJnsD9I'), caption: 'A rough sketch from the development team that seeded the initial branding' },
        ],
      },
      {
        title: 'Trade-offs & constraints',
        blocks: [
          { kind: 'p', text: 'During early exploration, I considered incorporating deep personality profiling into the matching system. While this increased perceived sophistication, it significantly lengthened onboarding and risked user drop-off.' },
          { kind: 'p', text: 'I chose to prioritize habit-based compatibility over personality-based matching. This simplified the experience and aligned more closely with real roommate conflict data, but reduced the novelty of the system.' },
          { kind: 'p', text: 'I also intentionally limited the number of filtering options to avoid analysis paralysis, accepting less granular control in exchange for higher completion.' },
        ],
      },
      {
        title: 'Brand evolution',
        blocks: [
          { kind: 'image', src: img('ZopPj00XIp0pniokIhqRlyL4kR4') },
          { kind: 'image', src: img('w9BGAa4AdOcQIxY739lWypxJKo') },
          {
            kind: 'cards', items: [
              { title: 'V0 — Concept-driven', body: "A handshake within a meteor badge to symbolize connection and momentum. Expressive, but overly detailed and didn't scale across digital surfaces. Strong metaphor, weak scalability." },
              { title: 'V1 — Simplified symbol', body: 'A cleaner meteor icon for clarity and recognition at small sizes. Less visual noise, but it felt generic. Better usability, less brand warmth.' },
              { title: 'V2 — Scalable identity (WIP)', body: 'A bold, minimal meteor mark with a high-contrast orange accent and structured typography (Inter + Monument Grotesk), built for digital scalability, strong UI visibility, and a clear, trustworthy tone.' },
            ],
          },
        ],
      },
      {
        title: 'High-fidelity design',
        blocks: [
          {
            kind: 'cards', items: [
              { title: 'Lifestyle preferences survey', body: 'Simplified choices reduced completion time by 37% in testing.', points: ['Card-based selection with custom icons, so users scan instead of read', '3 options per category (vs. 5-point scales) to prevent decision paralysis', 'Conversational copy ("When are you most active generally?") keeps the tone friendly'] },
              { title: 'Off-campus housing', points: ['A lease status toggle routes users down the right path immediately', 'Semester / academic year / year durations match how UTD students think about housing', 'A rent range slider ($600–$1400) reflects realistic UTD-area prices'] },
            ],
          },
          { kind: 'layered', src: img('7agbU5LMHCSPcfO7YHuy97L5PaQ'), ratio: 1, crop: { x: 41, y: 24, w: 57, h: 37 }, caption: 'Main matching screen — the profile card is where compatibility gets decided' },
          { kind: 'video', src: video('OOE0SIJKu07KI4xEU7drDjBE') },
          {
            kind: 'cards', items: [
              { title: 'Main matching screen', body: 'Quick compatibility decisions without dating-app aesthetics.', points: ['Thumbs up (not a heart) signals roommate compatibility, not romance', 'Color-coded tags: orange for matched preferences, grey for mismatches', 'Pass / undo / like reduces anxiety about accidental swipes', 'Card flip reveals the extended bio, separating deal-breakers from nice-to-haves'] },
              { title: 'Sidebar & navigation', body: "Async, text-only messaging fits ACM's server budget for the MVP and can scale in V2.", points: ['Recent Activity shows who liked you back, building momentum', 'Recently Viewed lets users revisit passed profiles', 'Navigation streamlined to 4 tabs: Discover, Matches, Messages, Profile'] },
            ],
          },
        ],
      },
      {
        title: 'Status & next steps',
        blocks: [
          { kind: 'p', text: "MeteorMate is in active development with a Spring 2026 MVP launch target. I've completed the brand identity, core user flows, and high-fidelity designs for all MVP features. I'm now addressing secondary flows like settings and profile management, cleaning up UI inconsistencies, and preparing for usability testing with UTD students — then supporting engineering through launch and using post-launch metrics to prioritize V2." },
        ],
      },
      {
        title: 'Key takeaways',
        blocks: [{
          kind: 'cards', items: [
            { title: 'Leadership means making trade-offs', body: 'Advocating for lifestyle-first matching over demographic filters required convincing PMs and engineers — but the research backed the decision.' },
            { title: 'Collaboration unlocks better solutions', body: 'Daily syncs with engineers caught technical limitations early. Weekly PM alignment kept design tied to business goals, not just aesthetics.' },
            { title: 'Research drives confidence', body: "Studying competitors showed what worked and what failed. I wasn't guessing — I was building on proven patterns while addressing needs specific to UTD students." },
            { title: 'MVP thinking ships products', body: "Perfect is the enemy of shipped. Focusing on the core matching experience means launching a functional product instead of over-engineering features users might not need." },
          ],
        }],
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
      'Cosign connects renters who need housing guarantors with individuals willing to cosign lease agreements. As Product Design Intern at Francois Labs, I redesigned the core product experience — dashboards, application flow, and landing page — to reduce friction and build trust.',
      'By improving clarity around shared financial responsibility, the redesign helped users better understand commitment risk before taking action.',
    ],
    sections: [
      {
        title: 'The challenge',
        blocks: [{
          kind: 'cards', items: [
            { title: 'Business impact', body: 'Cosign faced a 65% application drop-off rate and a 58% landing page bounce rate — both well above industry benchmarks. High support volume and slow application times were costing conversions and revenue.' },
            { title: 'User friction', body: "Users couldn't distinguish between renter and guarantor paths. The dashboard was overwhelming with no clear next steps. Missing trust signals and an 8-step application caused widespread abandonment." },
          ],
        }],
      },
      {
        title: 'Research',
        blocks: [
          { kind: 'p', text: 'I analyzed user behavior data, support tickets, and competitive platforms to identify friction points. The data revealed three critical issues: confusing flows (30% entered the wrong path), dashboard paralysis (40% never took action), and a 12-minute average application time (vs. a 5–7 minute benchmark).' },
          { kind: 'lead', text: 'Key insight: users needed clarity at entry, trust signals throughout, and a sense of progress.' },
        ],
      },
      {
        title: 'Redesigning the flow',
        blocks: [
          { kind: 'p', text: 'I restructured the application from 8 disconnected steps into 4 logical sections, reducing cognitive load and providing clear progress indicators.' },
          { kind: 'list', title: 'Key decisions', items: ['Separated renter and guarantor paths from the start', 'Grouped related information together', 'Added visual progress tracking', 'Prioritized trust signals (security badges, clear explanations)'] },
        ],
      },
      {
        title: 'Dashboard',
        blocks: [
          { kind: 'zoom', src: img('BPhNVYI5YheOZ6Pp9uuWIBdT7c'), focus: [70, 42], scale: 1.9, caption: 'Status badges pair color with a label, so managers can scan a whole page at once' },
          { kind: 'p', text: 'Metrics at the top for instant awareness, a prioritized action panel for what needs attention now, and a detailed table underneath for bulk management. Each layer serves a different user need without competing for attention.' },
          { kind: 'p', text: 'Status badges use color and label together so managers can scan an entire page without reading every row. The "Refer New Applicant" modal keeps users in context rather than routing them elsewhere — less friction on the most frequent task.' },
        ],
      },
      {
        title: 'Landing page',
        blocks: [
          { kind: 'image', src: img('9hSes9fVwMjoVkUM5UA5k6tp0') },
          { kind: 'lead', text: "Housing is already stressful. The landing page shouldn't add to that." },
          { kind: 'p', text: "Everything here was designed for someone who's been declined before, doesn't fully understand co-signing, and is skeptical this will actually help them. That meant plain language over clever copy, a calm palette that doesn't feel like a sales pitch, and a four-step process that makes the whole thing feel manageable before they even sign up." },
          { kind: 'p', text: "For property managers, the pitch is just as simple — more approvals, less risk, no cost. The dashboard preview does the selling so the copy doesn't have to. Both audiences get their own space on the page." },
        ],
      },
      {
        title: 'Reflection',
        blocks: [
          { kind: 'cards', items: [
            { title: 'Small changes compound', body: 'Individual UX improvements — clearer headlines, better grouping, prominent CTAs — combined to drive double-digit metric improvements.' },
            { title: 'Trust is non-negotiable', body: 'The 17% conversion lift represented real people who found housing because the experience no longer stood in their way.' },
          ] },
          { kind: 'p', text: 'Working on a real fintech product showed me how design decisions directly affect business outcomes, and how removing friction can unlock growth.' },
        ],
      },
    ],
  },

  backtrack: {
    role: 'Product Designer',
    date: 'Fall 2025 → Spring 2026',
    type: 'AI-powered enterprise tools',
    headline: 'Designing an AI assistant that turns meeting notes into action',
    hero: img('XKHJwFkDB4kDxYxSEONjAoi0'),
    highlights: [
      { value: '50+ → 12', label: 'support conversations distilled into structured AI scenarios' },
      { value: '↑ 27%', label: 'task success in usability testing' },
    ],
    overview: [
      'Backtrack is an AI-powered enterprise tool that helps teams capture and act on meeting insights. I designed Ask Backtrack AI, a conversational assistant that transforms meeting notes into follow-ups, summaries, and action items.',
      'The design focused on reducing blank-state friction through structured prompts, enabling inline editing for user control, and building trust through tone adjustments. I analyzed real support conversations to inform the conversational UX and prototyped iteratively to balance AI automation with user judgment.',
    ],
    sections: [
      {
        title: 'The challenge',
        blocks: [{
          kind: 'cards', items: [
            { title: 'Business problem', body: "Users captured meeting notes but struggled to act on them. Writing follow-ups, summaries, and action items took time they didn't have. The opportunity: use AI to automate the grunt work while keeping users in control." },
            { title: 'User friction', body: "Professionals faced the blank-page problem — starting from scratch felt overwhelming. They needed a faster path from notes to output, but couldn't trust AI outputs they couldn't refine." },
          ],
        }],
      },
      {
        title: 'Market analysis',
        blocks: [
          { kind: 'video', src: video('1QddOeE35EtR2Qa05oLSMwrNtc'), caption: 'Notion — AI actions appear in context, where users already work' },
          { kind: 'cards', items: [
            { title: 'Notion', body: 'Integrates AI directly into editing, eliminating context switching.', points: ['Inline AI actions reduce friction', 'Outputs are editable text, not final deliverables', 'Tone controls give users agency', 'AI feels like an assistant, not a replacement'] },
            { title: 'Granola', body: 'Generates structured post-meeting outputs automatically, prioritizing speed.', points: ['No blank state, thanks to automation', 'Clear output templates reduce decision fatigue', 'One-click actions for common tasks', 'Production-ready outputs that stay editable'] },
          ] },
          { kind: 'image', src: img('09QLXGndgYI0c30SZosmFBEaQ'), caption: 'Granola — from raw notes to polished deliverables in seconds' },
          { kind: 'cards', numbered: true, items: [
            { title: 'Clarity with flexibility', body: 'Users want structured starting points they can edit, not final decisions made for them.' },
            { title: 'Tone builds trust', body: "AI tools must match the user's voice. Overly polished or robotic outputs reduce credibility." },
            { title: 'Blank states create friction', body: 'Starting from nothing increases cognitive load. Contextual prompts and templates reduce hesitation.' },
            { title: 'AI supports judgment', body: 'Users prefer tools that accelerate their thinking rather than replace it.' },
          ] },
        ],
      },
      {
        title: 'Structured prompts',
        blocks: [
          { kind: 'image', src: img('cNbeLpJNm7PhtGlo6QdehReH0') },
          { kind: 'p', text: 'Open-ended inputs created hesitation — users struggled to know what to ask, especially under time pressure. I introduced structured prompt starters to reduce cognitive load and give immediate direction without removing flexibility.' },
          { kind: 'lead', text: 'Replacing the blank state with contextual starting points shifts the experience from thinking about what to ask to refining what is generated.' },
        ],
      },
      {
        title: 'Iteration',
        blocks: [
          { kind: 'p', text: 'I approached Ask Backtrack as a behavior-driven interface rather than a traditional chat UI. The goal was to make AI feel embedded in the workflow, not separate from it.' },
          {
            kind: 'flow', aspect: '1.6 / 1', caption: 'From a blank input to guided, refinable prompts',
            steps: [
              { src: img('hB1L8qYWkMRkiyEWudGnNYoT8Mc'), crop: { x: 0, y: 0, w: 49.4, h: 100 }, label: 'Minimal entry point', click: [62, 56] },
              { src: img('9jY6fcfvX4vnsP1zFCzZqJiFFQ'), crop: { x: 50.6, y: 0, w: 49.4, h: 48 }, label: 'Guided prompts', click: [33, 40] },
              { src: img('9jY6fcfvX4vnsP1zFCzZqJiFFQ'), crop: { x: 50.6, y: 51.5, w: 49.4, h: 48.5 }, label: 'Conversational refinement', click: [56, 88] },
              { src: img('gY8uoiMxW7YpvWuX0wOIhBHiB0M'), crop: { x: 0, y: 0, w: 100, h: 47 }, label: 'Final design', click: [85, 60] },
            ],
          },
          { kind: 'cards', numbered: true, items: [
            { title: 'Minimal entry point', body: 'A single input with a neutral greeting. Clean, but it created a blank-state problem: users had to decide what to ask before getting value.' },
            { title: 'Guided prompts', body: 'Prompt starters for common tasks shifted the question from "What should I type?" to "Which action do I need?" — faster task initiation and a clearer value proposition.' },
            { title: 'Conversational refinement', body: 'Inline refinements like "Make this more casual" encouraged iterative editing. AI feels more trustworthy when users can easily adjust tone and intent.' },
          ] },
        ],
      },
      {
        title: 'Key features',
        blocks: [{
          kind: 'cards', items: [
            { title: 'Guided prompts', body: 'One-click access to follow-ups, summaries, and action items.' },
            { title: 'Inline editing', body: 'Users edit AI outputs directly without copying elsewhere.' },
            { title: 'Tone adjustment', body: 'Simple requests ("make it more casual") let users refine voice.' },
            { title: 'Context-aware', body: 'Prompts reference meeting participants and topics for personalization.' },
          ],
        }],
      },
      {
        title: 'Final design',
        blocks: [{ kind: 'image', src: img('gY8uoiMxW7YpvWuX0wOIhBHiB0M') }],
      },
      {
        title: 'Takeaways',
        blocks: [{
          kind: 'cards', items: [
            { title: 'AI design is about control', body: "Users don't want automation, they want acceleration. Editing controls and tone adjustments increased trust." },
            { title: 'Prompt design is product design', body: 'Crafting prompts that are specific yet natural was critical to making the experience feel effortless.' },
            { title: 'Realistic content reveals problems', body: 'Designing with real AI output exposed tone mismatches and edge cases that lorem ipsum would have hidden.' },
          ],
        }],
      },
    ],
  },

  scout: {
    role: 'Product Designer, Francois Labs',
    date: 'Summer 2026',
    type: 'B2B marketplace · UX audit · Design system',
    headline: 'Auditing a two-sided parts marketplace, and turning the findings into a design system',
    hero: `${S}insights.jpg`,
    highlights: [
      { value: '15', label: 'buyer flows audited end to end' },
      { value: '50+', label: 'findings logged across the vendor app' },
      { value: '6', label: 'themes distilled from the findings' },
      { value: '34', label: 'components in the resulting design system' },
    ],
    overview: [
      'Scout is a B2B marketplace where apartment and property teams order replacement parts, from washers and dryers to doors, directly from vendors. It has two sides: a buyer app for property owners and managers, and a vendor app where suppliers manage catalogs, quotes, pricing, and orders.',
      'Working alongside Vu, a founder and senior designer, I ran a UX audit across both apps, logging every point of friction on the screen where it happened, then clustering the findings into themes with clear recommendations. The biggest outcome was a shared design system for both apps.',
    ],
    sections: [
      {
        title: 'Approach',
        blocks: [
          { kind: 'p', text: 'I walked each flow the way a real user would, from browsing the marketplace to checking out on the buyer side, and from importing a catalog to fulfilling an order on the vendor side. Every issue was annotated directly next to its screenshot, so the team could see the problem in context rather than in a spreadsheet.' },
          { kind: 'list', items: ['Walked 15 buyer flows, from Marketplace and Quotes to Approvals, Budget, and Checkout', 'Logged 50+ findings across the vendor app, from Insights and Orders to Import, Price Lists, and Reviews', 'Clustered everything into six themes, each paired with a recommendation'] },
        ],
      },
      {
        title: 'Six themes',
        blocks: [{
          kind: 'cards', numbered: true, items: [
            { title: 'Related features are split apart', body: 'Co-dependent features live in separate tabs, adding surface area and clicks. Collapse them into one place.' },
            { title: 'Inconsistent UI', body: 'Buttons, icons, badges, and cards vary from screen to screen. Solidify the styling into one shared design system.' },
            { title: 'Redundant data', body: 'The same fields and statuses repeat within a single screen. Show each piece of information once.' },
            { title: 'Friction in repeat workflows', body: 'Import is a weekly task, so every unnecessary click compounds. Optimize for the repeat user, not the first-time tour.' },
            { title: 'Marketing over action', body: 'Landing pages lead with hero content while the actionable parts sit below the fold. Lean toward action.' },
            { title: 'Underserved error states', body: 'Failed rows, cancelled imports, and validation errors offer little explanation. Design states that guide users to a fix.' },
          ],
        }],
      },
      {
        title: 'Key findings',
        blocks: [
          { kind: 'finding', theme: 'Information hierarchy', src: `${S}insights.jpg`, title: "The homepage isn't where users expect it", problem: 'Insights acts as the dashboard home, but it sits second in the navigation, so there is no obvious way back after clicking into another tab.', fix: 'Rename it Home and make it the first tab.' },
          { kind: 'finding', theme: 'Related features are split apart', src: `${S}price-lists.jpg`, title: 'Features that belong together live on separate pages', problem: 'Customer Groups exist mainly to assign price lists, yet they are a separate page. Properties and Organizations are split the same way.', fix: 'Collapse co-dependent features into a single page with tabs, cutting navigation and clicks.' },
          { kind: 'finding', theme: 'Friction in repeat workflows', src: `${S}import-landing.jpg`, title: 'A weekly task built like a first-time tour', problem: 'The import page repeats the same pitch three times before the Start Import button. The wizard also disagrees on its own length: the tab bar shows six steps, the guide shows four, and the upload page says "Step 1 of 4".', fix: 'Lead with the action, show one consistent step count, and design for vendors who import every week.' },
          { kind: 'finding', theme: 'Underserved error states', src: `${S}import-mapping.jpg`, title: "States that don't explain themselves", problem: 'A green MULTI badge has no explanation, "0/1 required" never says what is missing, and cancelled imports give no reason.', fix: 'Explain every status in place, and design error and empty states that point users toward a fix.' },
          { kind: 'finding', theme: 'Inconsistent UI', title: 'One order, two price formats', problem: 'The order summary shows "$990.99" while the list shows "$ 990.99 USD", and an import summary reads "FAILED: 00" next to plain numbers.', fix: 'Pick one format and enforce it everywhere. This became the Formatting foundation in the design system.' },
          { kind: 'finding', theme: 'Buyer trust', src: `${S}buyer-card.jpg`, title: 'A price warning with no context', problem: 'Marketplace cards flag a price increase in red, but never say compared to what, and there is no way to dig in. Each card also stacks distance, vendor badge, shipping cutoff, and stock into one dense block.', fix: 'Explain what the change is relative to, let buyers drill into price history, and trim the card to what drives a decision.' },
        ],
      },
      {
        title: 'Outcome',
        blocks: [
          { kind: 'lead', text: "The audit's clearest theme was inconsistency, so its biggest outcome was a shared design system for both apps." },
          { kind: 'p', text: 'Built with Vu, the Scout Design System covers 6 foundations (color, typography, spacing, icons, formatting, and charts), 34 components, and 8 layout patterns, with light and dark themes and Shadcn-compatible tokens. Findings like the mismatched price formats and inconsistent buttons now have a single source of truth.' },
          { kind: 'image', src: `${S}ds-colors.jpg`, caption: 'A blue shade scale built from Scout primary, semantic tokens, and a badge accent palette' },
          { kind: 'gallery', images: [`${S}ds-buttons.jpg`, `${S}ds-type.jpg`], caption: 'Button variants and states, and the type scale' },
          { kind: 'link', href: 'https://scout-design-system-beta.vercel.app/', label: 'Explore the live design system' },
        ],
      },
      {
        title: 'Reflection',
        blocks: [{
          kind: 'cards', items: [
            { title: 'Themes over tickets', body: 'Fifty findings are a to-do list; six themes are a strategy. Clustering is what made the audit actionable.' },
            { title: 'Fix the system, not the screen', body: 'Many findings traced back to missing standards, so solving them once in a design system beat patching screens one by one.' },
          ],
        }],
      },
    ],
  },

  'act-one': {
    role: 'Brand Designer, Francois Labs',
    date: 'Summer 2026',
    type: 'Venture capital · Brand identity',
    headline: 'Giving a venture capital firm something worth believing in',
    hero: '/work/act-one/hero.jpg',
    highlights: [
      { value: '8', label: 'logo directions explored' },
      { value: '5', label: 'moodboards to set the visual territory' },
      { value: '3', label: 'designers on the project' },
    ],
    overview: [
      "Act One Ventures is a venture capital firm that backs founders re-architecting the enterprise for the AI economy. They came to Francois Labs needing a full rebrand. Their old identity no longer reflected the firm they had become.",
      'There was no product to design around, so the work was purely brand: finding something meaningful to attach to a category that usually looks and sounds the same. Working with two other designers, I helped build a first pass at the whole system, from mission and voice to logo, type, color, texture, and website UI.',
    ],
    sections: [
      {
        title: 'The challenge',
        blocks: [{
          kind: 'cards', items: [
            { title: 'No product to lean on', body: 'Without an app or interface to show, the brand had to carry everything: the story, the point of view, and the reason a founder should pick Act One over anyone else.' },
            { title: 'A category that blends together', body: 'Venture firms tend to look and sound alike. The goal was an identity with an actual point of view, one that feels deliberate rather than safe.' },
          ],
        }],
      },
      {
        title: 'Brand foundation',
        blocks: [
          { kind: 'lead', text: '"Intelligence is becoming a commodity. What remains scarce is the conviction to rebuild, not optimize."' },
          { kind: 'p', text: 'Everything hangs on that thesis. From it we wrote the mission, vision, narrative, principles, and voice, so every later visual decision had something to answer to.' },
          {
            kind: 'cards', items: [
              { title: 'Mission', body: 'To find and back the founders re-architecting the enterprise for the AI economy.' },
              { title: 'Vision', body: 'A future where AI amplifies extraordinary founders, and the institutions they build reshape every industry.' },
            ],
          },
          { kind: 'list', title: 'Voice', items: ['Confident, not arrogant', 'Institutional, not corporate', 'Compressed, not clipped', 'Forward-looking, not reactive'] },
        ],
      },
      {
        title: 'Visual theme',
        blocks: [
          { kind: 'p', text: 'The visual direction sits where the precision of early computing, the confidence of institutional finance, and the restlessness of a research lab meet. It draws from vintage tech interfaces and financial infrastructure: the brand should feel like the operating system of a firm that has been building toward this moment for a decade.' },
          { kind: 'lead', text: 'Blue replaces the old orange entirely, with the energy of a terminal cursor or an instrument readout. On dark backgrounds it glows; on light ones it anchors.' },
        ],
      },
      { title: 'Moodboards', blocks: [{ kind: 'gallery', images: [1, 2, 3, 4, 5].map(n => `${A}moodboard-${n}.jpg`), caption: 'Five moodboards to map the territory before committing to a direction' }] },
      {
        title: 'Logo exploration',
        blocks: [
          { kind: 'p', text: 'Eight directions, ranging from a serif monogram built on quiet, institutional confidence to bolder wordmarks for a tech-forward firm. The engagement wrapped after this first pass, so no single mark was finalized. The point of this phase was range, giving the partners real options to react to.' },
          { kind: 'gallery', images: [1, 2, 3, 4, 5, 6, 7, 8].map(n => `${A}logo-concept-${n}.jpg`) },
        ],
      },
      {
        title: 'Typography',
        blocks: [
          { kind: 'p', text: 'A serif for headlines paired with a clean grotesk and a monospaced system face, so the type feels both institutional and technical.' },
          { kind: 'gallery', images: ['type-instrument-serif', 'type-abc-favorit', 'type-geist-mono'].map(n => `${A}${n}.jpg`), columns: 3 },
        ],
      },
      { title: 'Color', blocks: [{ kind: 'gallery', images: ['color-primary', 'color-secondary', 'color-gradients'].map(n => `${A}${n}.jpg`), columns: 3, caption: 'Primary, secondary, and gradient palettes' }] },
      {
        title: 'Texture & pattern',
        blocks: [
          { kind: 'p', text: 'Pixel-grid and halftone textures bridge the analog precision of early hardware with the clarity of modern systems.' },
          { kind: 'gallery', images: ['texture-wave', 'texture-dither-1', 'texture-dither-2', 'texture-dither-3'].map(n => `${A}${n}.jpg`) },
        ],
      },
      {
        title: 'Website UI',
        blocks: [
          { kind: 'p', text: 'A starting kit for the site: core components, quote and stat cards, CMS cards, and section layouts, all built from the same type, color, and texture system.' },
          { kind: 'gallery', images: ['ui-components', 'ui-quote-cards', 'ui-cms-cards', 'ui-site-section'].map(n => `${A}${n}.jpg`) },
        ],
      },
      {
        title: 'Reflection',
        blocks: [{
          kind: 'cards', items: [
            { title: 'Brand is the product', body: 'With no screens to lean on, every decision, from a sentence in the narrative to a shade of blue, had to carry meaning on its own.' },
            { title: 'Range before resolution', body: 'A first pass is for exploring territory. Eight logo directions gave the client something real to react to instead of one safe answer.' },
          ],
        }],
      },
    ],
  },

  janus: {
    role: 'Product Designer',
    date: '2026',
    type: 'Logistics startup · Branding · Visual design',
    headline: 'Brand and product marketing for a freight finance platform',
    hero: img('UtCoo42KbgxyNsiJbJ4LdzBpcE'),
    overview: ['Janus is a finance platform that manages freight operations from order to cash — serving freight forwarders, carriers, and shippers. I worked alongside two other designers on product marketing and brand design.'],
    sections: [
      { title: 'One pager', blocks: [{ kind: 'image', src: img('kddOjm4sKmKCVtVZGuAccBTv2Dk') }] },
      { title: 'Deck', blocks: [{ kind: 'image', src: img('tiaGBEsPT4JNuTd5sscnDogY') }] },
      { title: 'Application', blocks: [{ kind: 'image', src: img('II4Y0Sh23NH9jyif7nltwhKlM') }, { kind: 'image', src: img('FRduQB6lOJLpMSjLm87fyHGhfs') }] },
      { title: 'Imagery', blocks: [{ kind: 'image', src: img('ouaoBHk6WuTaOkwavCuwVZBvkq8') }] },
      { title: 'UI', blocks: [{ kind: 'image', src: img('2LMBB8O4ukntlUMbYldvuJ0U5j0') }, { kind: 'image', src: img('yDq0Q1gYBxkd3Q1u70DaYUnl0') }] },
    ],
  },

  tennr: {
    role: 'Product Designer',
    date: 'Spring 2025 → Fall 2025',
    type: 'Healthcare AI startup · Branding · Visual design',
    headline: 'Revamping brand and marketing for a healthcare AI startup',
    hero: img('bPD5Y8PqndjPdKUVdovvOTugaw'),
    overview: ['Tennr is a healthcare AI platform that automates the patient referral process — from fax intake to scheduling. I joined during the Francois Labs period and worked on pitch decks, collateral, thumbnails, and marketing materials alongside one other designer.'],
    sections: [
      { title: 'Refresh', blocks: [{ kind: 'compare', before: img('IS6wKZaisLvzkUsrZJUuZ7pxmSw'), after: img('EDbtRUJXKixT5xZakGzTokjRJ8'), caption: 'Drag to compare the old thumbnail with the refresh' }] },
      { title: 'Revamp', blocks: [{ kind: 'image', src: img('CieBjR6lUj4MEnCHlOzpd3Tt9mg') }] },
      { title: 'Application', blocks: [{ kind: 'image', src: img('OAtPxEfcRffy7RZXwGHk5prcM') }, { kind: 'image', src: img('tYEzUVawZDCajEJ4s8FdVX2sjE') }] },
    ],
  },

  arist: {
    role: 'Product Designer',
    date: 'Spring 2025 → Fall 2025',
    type: 'AI e-learning startup · Branding · Visual design',
    headline: 'Scaling the visual system of an AI microlearning platform',
    hero: img('BGG1xL6mAgP5bl9i3x50kdKRY'),
    overview: ['Arist is an AI-powered microlearning platform that helps enterprises create and deliver bite-sized training through SMS, Slack, and Teams. I worked alongside one other designer on product features and UI components.'],
    sections: [
      { title: 'Problem', blocks: [{ kind: 'p', text: "As Arist scaled, the product's visual language wasn't keeping up. UI components were inconsistent across features, and there was no scalable system for producing assets and interface elements at the pace the company needed." }] },
      { title: 'UI components', blocks: [{ kind: 'image', src: img('XW7B4K8FDwhddmvFZURHcjQaBI') }] },
      {
        title: 'Design decisions',
        blocks: [
          { kind: 'cards', items: [
            { title: 'System-first thinking', body: 'Prioritized reusable components over one-off designs so the product could scale without fragmenting visually.' },
            { title: 'Revamp without disruption', body: 'Updated the visual language incrementally, keeping the experience familiar while raising the quality bar across the board.' },
          ] },
          { kind: 'image', src: img('b9tnL8leoWY0EEABvj6EheDOkDE') },
        ],
      },
      {
        title: 'Solution',
        blocks: [
          { kind: 'p', text: 'Collaborated closely with a senior designer on a full design revamp — building out UI components, creating scalable asset libraries, and tightening visual consistency across product surfaces. Contributed to a growing design system that helped the team ship cleaner work, faster.' },
          { kind: 'image', src: img('ZHeckYzfJKYBkisWvmcHt5qQrXo') },
        ],
      },
      { title: 'Final design', blocks: [{ kind: 'image', src: img('3E4aTSItRP5dd7rQWtz1pE43rWw', 'jpg') }, { kind: 'image', src: img('8xdlWkdbchwwJStdWcihwLqET58', 'jpg') }] },
    ],
  },

  oro: {
    role: 'Product Designer',
    date: 'Fall 2025',
    type: 'Financial services startup · Branding · Visual design',
    headline: 'A cohesive brand and platform UI for a housing-benefits fintech',
    hero: img('WETbFJQasd1JYyQhta3EJWxPGTc'),
    overview: ["Oro is a social fintech platform that brings housing wellness into the employee benefits stack — helping companies support their employees' path to homeownership while improving retention and productivity. I worked on branding and platform UI alongside the team."],
    sections: [
      { title: 'The problem', blocks: [{ kind: 'p', text: "As Oro moved from pilot to launch, the brand and product needed to feel like one cohesive story. Design and branding assets weren't yet aligned to a system that could scale with the company's mission — closing the wealth gap through employer-sponsored housing benefits." }] },
      { title: 'Solution', blocks: [{ kind: 'p', text: "Collaborated with the team to build a coherent visual identity and platform UI that followed brand guidelines and reflected Oro's mission — a design language that made sense at every touchpoint, from the employer-facing platform to outward-facing materials." }] },
      {
        title: 'Design decisions',
        blocks: [{ kind: 'cards', items: [
          { title: 'Mission-driven visual language', body: "Every design choice tied back to Oro's core vision of accessible homeownership, keeping the brand grounded and purposeful." },
          { title: 'Scalable consistency', body: 'Built within guidelines so new assets and screens could ship without drifting from the established identity.' },
        ] }],
      },
      { title: 'Illustrations', blocks: [{ kind: 'image', src: img('lVveKDBHhEmcQU9H3T8O741HlXo') }] },
      { title: 'Icons', blocks: [{ kind: 'image', src: img('imjuxKOFYWGeOylvF9ODSbF9Lo') }] },
      { title: 'Imagery', blocks: [{ kind: 'image', src: img('VKr8uWaIBgksoGXOCH8VgelHFNM') }] },
      { title: 'Website UI', blocks: [
        { kind: 'image', src: img('n9OuOXPB2f6b45yUgrTwFXb2Lkw') },
        { kind: 'image', src: img('s1kjkvQLwexs5LsmVgNodnEKKw') },
        { kind: 'image', src: img('9smDCUCMDiiDvIRuE21gRbnAA') },
        { kind: 'image', src: img('lL7sldONmojnDEWyG12Rxf0aaWc') },
      ] },
    ],
  },
}
