# Christopher Tran's portfolio

Vite + React 19 + TypeScript, deployed by Vercel from `main` to christophertran.xyz.

## Working here
- Ship with the `/ship` skill: build, `node scripts/check-site.mjs`, push, then `scripts/wait-deploy.sh`. Don't call something live until that last step passes.
- Anything touching hover, scroll, or pointer events: test on a phone width too (the site check does this). Gate hover-only behavior behind `(hover: hover) and (pointer: fine)`.
- Use the `design-review` agent after visual changes.
- Changes to the hero Polaroid (the 3D print, its arrows, the film-strip grid, the open print and its stamps): also run `node scripts/check-hero.mjs` (eight desktop window sizes) and `node scripts/check-touch.mjs` (four phones and a tablet, with real touch events). Phones get the same 3D print, by touch.
- The `portfolio-loop` agent is the feedback loop: it tests the live site, reads Vercel Web Analytics (`node scripts/analytics.mjs`), compares with its last report in `reviews/` (not committed), and says what to change next.
- After every change, give Christopher honest, prioritized feedback, not just "done".

## Content rules
- Never invent facts about Christopher's work, roles, dates, or results. Ask.
- Mesa: links to its X (x.com/mesaenergyai), not its site, until the rebrand ships; no funding, valuation, or unreleased product details.
- Case studies follow Ben's story-first structure (statement section titles, "Did it work?", "What I'd tell another designer").

## Design system
See `.claude/agents/design-review.md`: three text styles (headings 500 white, text 350 gray, captions 350 muted), Geist only, square covers with one caption line, no eyebrows or uppercase labels.
