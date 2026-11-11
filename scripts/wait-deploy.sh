#!/usr/bin/env bash
# Waits for Vercel to finish deploying the current commit, then confirms christophertran.xyz is serving this build
# (its main script name matches the one in dist/ from the local build). Exits 1 if the deploy failed or the site
# is serving something else.
set -u
sha=$(git rev-parse HEAD)
for i in $(seq 1 40); do
  state=$(curl -s "https://api.github.com/repos/christran333/Portfolio/commits/$sha/statuses" | grep -o '"state": *"[a-z]*"' | head -1 | grep -o '[a-z]*"$' | tr -d '"')
  case "$state" in
    success) echo "Vercel: deploy succeeded for ${sha:0:7}"; break ;;
    failure|error) echo "Vercel: deploy FAILED for ${sha:0:7} (see: npx vercel inspect --logs)"; exit 1 ;;
  esac
  sleep 10
done
[ "${state:-}" = success ] || { echo "Vercel: still not finished after ~7 minutes"; exit 1; }
local_js=$(ls dist/assets/index-*.js 2>/dev/null | head -1 | xargs -n1 basename)
live_js=$(curl -s https://christophertran.xyz/ | grep -o 'index-[A-Za-z0-9_-]*\.js' | head -1)
if [ "$local_js" = "$live_js" ]; then echo "Live site is serving this build ($live_js)"; else echo "Live site serves $live_js but this build is $local_js"; exit 1; fi
