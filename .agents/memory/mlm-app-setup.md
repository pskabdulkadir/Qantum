---
name: MLM app setup
description: Key facts about the mlm-app standalone project structure and common pitfalls
---

# MLM App Setup

The mlm-app is a standalone npm project (NOT a pnpm workspace package) at `/home/runner/workspace/mlm-app/`.

**Run command:** `cd /home/runner/workspace/mlm-app && tsx server.ts` on PORT=24163

**Date-fns fix:** Vite config has regex aliases pointing `date-fns` and `date-fns/locale` to their `index.js` files — do not remove these aliases.

**API routing:** The api-server artifact was moved to path `/api-server` (NOT `/api`) to avoid conflicting with mlm-app's own Express API at `/api/`.

**Admin credentials:** `psikologabdulkadirkan@gmail.com` / memberId `ak000001` / role admin — seeded at startup from PostgreSQL persistence layer.

**Database:** In-memory MongoDB backed by PostgreSQL for persistence. Data survives restarts via PostgreSQL.

**Why:** The mlm-app predates the monorepo and is a self-contained Express + Vite SSR app. It cannot be treated as a pnpm workspace package.
