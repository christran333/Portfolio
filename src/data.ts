// Edit this file to change the site's content.

export const profile = {
  name: 'Christopher Tran',
  location: 'Dallas, TX',
  email: 'christophertran2005@gmail.com',
  resume: 'https://drive.google.com/file/d/1n3pCD4BLmDR3glADW7w6tJi5b7yhEKVU/view?usp=sharing',
  status: 'Looking for Summer 2027 product design internships.',
  about: [
    "I'm a product designer based in Dallas. I care about research, solving ambiguous problems, and getting the visual details right. Right now I'm a Product Design Intern at Francois Labs, designing for early-stage startups in fintech, AI, healthcare, and B2B.",
    "I'm studying Media Arts and Design at UT Dallas with a certificate in Applied Experience Design & Research. I'm also a Figma Campus Leader and a 2x Capital One Design & Research Scholar.",
    "Outside of school and client work, I play in a band, screen print shirts, and run my creative collective @centeredbyvoid.",
  ],
  // Outside of work, shown under About on the Info page
  interests: [
    { label: 'Art', items: ['Play in a band', 'Design band flyers', 'Screen print shirts', 'Make films', 'Take photos'] },
    { label: 'Outdoors', items: ['Bouldering', 'Hiking', 'Cycling'] },
  ],
  // Photos on the Info page, from public/about/, laid out in the same staggered grid as the work.
  // `caption` hides behind a small (i) badge that expands into a label on hover, focus or tap
  photos: [
    { src: '/about/portrait.webp', alt: 'Christopher smiling in front of a graffiti mural', aspect: '2000 / 1218', caption: 'My awesome headshot' },
    { src: '/about/band.jpg', alt: 'Playing a show with the band Hearth', aspect: '1 / 1', caption: 'My first show with my band, Hearth' },
    { src: '/about/capital-one.jpg', alt: 'With Professor Cox at a Capital One Design & Research award ceremony', aspect: '1154 / 1728', caption: 'With my dear Professor Cox at my first Capital One Design & Research award ceremony' },
    { src: '/about/working.webp', alt: 'Christopher laughing with his friend Prabhas at a laptop during HackAI', aspect: '2000 / 1500', caption: 'At HackAI with my friend Prabhas' },
    { src: '/about/capital-one-group.jpg', alt: 'With Corwin Stone and Dr. McKinney at a Capital One award ceremony', aspect: '1420 / 1600', caption: 'With the wonderful Corwin Stone (VP Product Design, Capital One) and Dr. McKinney (Program Head, Media Arts & Design) at my second Capital One Design & Research award ceremony' },
    { src: '/about/friend.jpg', alt: 'Christopher with his friend Miguel at a ColorStack meeting', aspect: '1440 / 1014', caption: 'My friend Miguel and me at a ColorStack meeting' },
    { src: '/about/capital-one-backdrop.jpg', alt: 'Christopher with his mentor Ben Doctor at Capital One', aspect: '1071 / 1600', caption: 'My mentor Ben Doctor (Director of Design Systems, Capital One)!!!' },
    { src: '/about/bouldering.webp', alt: 'Bouldering outdoors with friends from the UTD climbing club, crash pads in hand', aspect: '1200 / 1600', caption: 'Rock climbing outdoors with friends and the UTD climbing club' },
    { src: '/about/pup.webp', alt: 'Christopher holding a hairless chihuahua', aspect: '1200 / 1600', caption: 'Me with a hairless chihuahua. Need I say more?' },
  ],
  recognition: [
    { label: 'Capital One Design & Research Scholar', detail: '2x', href: 'https://news.utdallas.edu/philanthropy/capital-one-scholarship-2025/' },
    { label: 'Figma Campus Leader', detail: 'UT Dallas', href: 'https://www.instagram.com/figmacampusleaders/' },
    { label: "Dean's List", detail: 'UT Dallas' },
  ],
  links: [
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/christopherthanhtran/' },
    { label: 'X', href: 'https://x.com/christran05' },
    { label: 'Instagram', href: 'https://www.instagram.com/centeredbyvoid/' },
    { label: 'Spotify', href: 'https://open.spotify.com/user/pf2qr87jvq2lzroh3ux6pqw8u' },
    { label: 'Resume', href: 'https://drive.google.com/file/d/1n3pCD4BLmDR3glADW7w6tJi5b7yhEKVU/view?usp=sharing' },
  ],
}

export type Project = {
  id: string
  title: string
  tags: string[]
  summary: string // one sentence, shown under the title on the home grid
  when?: string // shown in the small line above the title
  href: string // '/work/<id>' opens a case study; full URLs open in a new tab
  soon?: boolean // case study not ready: shows "Coming soon" on hover. With an href (e.g. a demo video) the tile still links there
  img: string // cover image; also the poster frame when there's a video
  video?: string // optional looping muted clip shown in place of the cover
  aspect: string // the cover image's own width / height, so it shows uncropped
}

const framer = (id: string) => `https://framerusercontent.com/images/${id}.png`

// Framer resizes images on request; ask for only as many pixels as the layout needs
export const imgAt = (src: string, width: number) => `${src}?scale-down-to=${width}`

// Images are hotlinked from the Framer site. Copy them into /public before cancelling Framer.
export const projects: Project[] = [
  { id: 'cosign', title: 'Cosign', tags: ['Product Design'], summary: 'Redesigning a fintech rental flow, lifting conversions by 17%.', when: 'Spring 2025', href: '/work/cosign', img: framer('5pvYzGg5sCSysJdt9R5xFw0zvw'), aspect: '1 / 1' },
  { id: 'scout', title: 'Scout', tags: ['Product Design'], summary: 'Auditing a two-sided parts marketplace and turning the findings into a design system.', when: 'Summer 2026', href: '/work/scout', img: '/work/scout/thumbnail.webp', aspect: '2000 / 1125' },
  { id: 'backtrack', title: 'Backtrack', tags: ['Product Design'], summary: 'Designing an AI assistant that turns meeting notes into action.', when: 'Fall 2025', href: '/work/backtrack', img: framer('XKHJwFkDB4kDxYxSEONjAoi0'), aspect: '1 / 1' },
  { id: 'meteormate', title: 'MeteorMate', tags: ['Product Design'], summary: 'Designing a roommate-matching app from scratch for 20,000+ UT Dallas students.', when: 'Summer 2025', href: '/work/meteormate', img: framer('7agbU5LMHCSPcfO7YHuy97L5PaQ'), aspect: '1 / 1' },
  { id: 'toolkit', title: 'Toolkit', tags: ['Product Design'], summary: 'An app for saving the design tools you hear about and finding the right one later, made for the SVSD Design Competition.', when: '2026', href: 'https://youtu.be/JbNiQUGHzNo', soon: true, img: '/work/toolkit/poster.jpg', video: '/work/toolkit/thumbnail.mp4', aspect: '16 / 9' },
  { id: 'tactile', title: 'Tactile', tags: ['Product Design'], summary: 'A Figma plugin you control with hand gestures, built at FigBuild 2026.', when: '2026', href: '/work/tactile', img: '/work/tactile/tactile-cover.webp', aspect: '2800 / 1991' },
  { id: 'act-one', title: 'Act One Ventures', tags: ['Brand Design'], summary: 'A first-pass rebrand for a venture capital firm backing AI-native founders.', when: 'Summer 2026', href: '/work/act-one', img: '/work/act-one/thumbnail.webp', aspect: '1125 / 920' },
  { id: 'arist', title: 'Arist', tags: ['Visual Design'], summary: 'Scaling the visual system of an AI microlearning platform.', when: '2025', href: '/work/arist', img: framer('m2dJpbsJveZCEiAWVrCpBELUX0'), aspect: '1 / 1' },
  { id: 'tennr', title: 'Tennr', tags: ['Visual Design'], summary: 'Refreshing the brand and marketing of a healthcare AI startup.', when: '2025', href: '/work/tennr', img: framer('bPD5Y8PqndjPdKUVdovvOTugaw'), aspect: '16 / 9' },
  { id: 'janus', title: 'Janus', tags: ['Brand Design'], summary: 'Brand and product marketing for a freight finance platform.', when: '2026', href: '/work/janus', img: framer('EkeLjhylkYOjeDEBOhf5IiWJac'), aspect: '16 / 9' },
  { id: 'priority', title: 'Priority', tags: ['Visual Design'], summary: 'Sales sheets for a point-of-sale system, tailored to 13 industries.', when: 'Fall 2025', href: '/work/priority', img: '/work/priority/thumbnail.webp', aspect: '3514 / 2138' },
  { id: 'oro', title: 'Oro', tags: ['Product Design'], summary: 'Brand and platform UI for a fintech startup.', when: 'Fall 2025', href: '', soon: true, img: framer('LvAj1YZLb6lAVoXA7poLmqsEeEo'), aspect: '1 / 1' },
]

// Visual design, graphics, small projects and screens — display-only frames on the Work page.
// Titles below are placeholders: rename them, then drop each file into public/playground/
// and set `src` (e.g. '/playground/poster.png'). Videos (.mp4/.webm) autoplay muted on loop.
// `href` makes the tile a link; `youtube` (a video id) plays that video muted on loop in the frame
export type Shot = { title: string; caption: string; aspect: string; src?: string; href?: string; youtube?: string }

export const playground: Shot[] = [
  { title: 'StackedCast', caption: 'Multimedia · Social content', aspect: '459 / 512', src: 'https://framerusercontent.com/images/wYOVZUc5oorG0NcYXskYt1ard8g.png', href: 'https://www.instagram.com/stackedcast/' },
  { title: 'Mocktails & Melodies', caption: 'UX Club · Event flyer', aspect: '1600 / 2071', src: '/playground/mocktails-melodies.webp', href: 'https://www.instagram.com/ux_utd/' },
  { title: 'Centeredbyvoid', caption: 'Personal brand', aspect: '16 / 9', src: '/playground/cbv-brand-2400.webp', href: 'https://www.instagram.com/centeredbyvoid/' },
  { title: 'I Bombed Out at Nationals', caption: 'Centeredbyvoid · Video', aspect: '16 / 9', src: '/playground/cbv-nationals.webp', href: 'https://www.youtube.com/watch?v=CbyjhjOL92M' },
  { title: 'Hearth × Sugar Texas Run', caption: 'Tour flyer', aspect: '1080 / 1350', src: '/playground/hearth-sugar-tour.webp' },
  { title: 'Collegiate Nationals Roster', caption: 'UTD Powerlifting · Graphic', aspect: '1164 / 1323', src: '/playground/utdpl-nationals-roster.webp', href: 'https://www.instagram.com/p/DHMUCCpxenc/' },
  { title: 'C-State Roster', caption: 'UTD Powerlifting · Graphic', aspect: '1440 / 1529', src: '/playground/utdpl-c-state-roster.webp', href: 'https://www.instagram.com/p/DRTIxmqDI_p/' },
]

// External links open in a new tab; internal ones are handled by the router in App.tsx
export const linkProps = (href: string) =>
  href.startsWith('http') ? { href, target: '_blank', rel: 'noreferrer' } : { href }
