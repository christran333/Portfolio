# Christopher Tran's portfolio

Vite + React 19 + TypeScript, deployed by Vercel from `main` to christophertran.xyz.

## Working here
- Ship with the `/ship` skill: build, `node scripts/check-site.mjs`, push, then `scripts/wait-deploy.sh`. Don't call something live until that last step passes.
- Anything touching hover, scroll, or pointer events: test on a phone width too (the site check does this). Gate hover-only behavior behind `(hover: hover) and (pointer: fine)`.
- Use the `design-review` agent after visual changes.
- After every change, give Christopher honest, prioritized feedback, not just "done".

## Content rules
- Never invent facts about Christopher's work, roles, dates, or results. Ask.
- Mesa: no link to Mesa's site until the rebrand ships; no funding, valuation, or unreleased product details.
- Case studies follow Ben's story-first structure (statement section titles, "Did it work?", "What I'd tell another designer").

## Design system
See `.claude/agents/design-review.md`: three text styles (headings 500 white, text 350 gray, captions 350 muted), Geist only, square covers with one caption line, no eyebrows or uppercase labels.
