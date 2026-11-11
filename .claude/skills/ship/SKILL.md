---
name: ship
description: Ship the portfolio to christophertran.xyz safely. Builds, runs the site check (errors, sideways scroll, phone taps, 3D Polaroid), commits, pushes to main, waits for Vercel, and confirms the live site serves the new build. Use when the user says "push", "ship", or "deploy".
---

# Ship

Run these in order from the repo root. Stop at the first failure, show the user what failed, and fix it or ask; never push past a failing step.

1. **Build**: `npm run build`. It must finish with "built".
2. **Lockfile sanity**: `npm ci --dry-run`. A blank-version entry in package-lock.json once broke every Vercel deploy silently.
3. **Site check**: make sure the dev server is running on port 5173 (start `npm run dev -- --port 5173 --strictPort` in the background if not), then `node scripts/check-site.mjs`. All checks must pass.
4. **Commit**: stage only what belongs to the change (`git status` first; never commit stray files or secrets). Write a short message that says what changed for a visitor, then end it with the co-author line.
5. **Push**: `git push origin main`.
6. **Confirm live**: `scripts/wait-deploy.sh`. It waits for Vercel and checks the live site serves this exact build.
7. **Optional live re-check** for risky changes (hover, scroll, 3D, layout): `node scripts/check-site.mjs https://christophertran.xyz`.

Report back in two or three lines: the commit, that the deploy succeeded, and that the live site matches. If anything failed, say which step and what the output was.
