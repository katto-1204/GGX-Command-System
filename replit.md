# QUEPON — GGX Command System

A full-stack web app for a computer shop: mobile-first player UI (PC availability, queue, sessions, wallet, menu ordering, feedback, promos) and an admin desktop control panel.

## Run & Operate

- `pnpm run dev` — run both the API server (port 8080) and frontend (port 5174)
- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080, served at /api)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string, `SESSION_SECRET` — session token salt

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod, drizzle-zod
- API codegen: Orval (from OpenAPI spec → React Query hooks + Zod schemas)
- Frontend: React + Vite + wouter + TanStack Query v5 + shadcn/ui + framer-motion
- Fonts: Syne (display/headings), Inter (body)
- Build: esbuild (CJS bundle for API server)

## Where things live

- `lib/api-spec/openapi.yaml` — source of truth for all API contracts
- `lib/api-client-react/src/generated/` — auto-generated React Query hooks + Zod schemas (do not edit)
- `artifacts/api-server/src/` — Express API server
  - `routes/` — auth, pcs, queue, sessions, promos, feedback, players, menu, dashboard, orders
  - `db/schema/` — Drizzle schema files (users, pcs, sessions, queue, promos, announcements, feedback, wallet, menu, orders)
- `artifacts/quepon/src/` — React frontend
  - `pages/` — player pages (login, register, home, pcs, queue, session, promos, menu, wallet, feedback, profile) + admin pages
  - `components/layout/` — AdminLayout (sidebar) + PlayerLayout (bottom pill nav)
  - `hooks/use-auth.tsx` — AuthProvider with useAuth() hook

## Architecture decisions

- Session tokens are UUIDs stored in an in-memory Map on the server, returned on login and sent as `Authorization: Bearer <token>` header from the client.
- Token is stored in `localStorage` under `quepon_token` and loaded at app startup in `main.tsx` via `setAuthTokenGetter`.
- All API routes are prefixed `/api` and served through the Replit shared proxy (the frontend uses relative URLs).
- The OpenAPI spec drives all types — never edit generated files; run codegen instead.
- `UseQueryOptions` from TanStack Query v5 requires `queryKey`, so generated Orval hook `query` options are cast with `as any` where only partial options (e.g. `refetchInterval`) are passed.

## Product

- **Player UI** (mobile-first): splash screen → login/register → home dashboard with PC availability → browse PCs → join queue → active session timer → menu ordering → promos → wallet top-up → feedback → profile
- **Admin Panel** (desktop): dashboard with live stats → PC management → queue approval & assignment → session management → player management → top-up → orders → feedback review → promos → menu catalog → settings

## Seeded Data

- **PCs**: 16 total (standard/premium/VIP tiers), all `available`
- **Users**: admin (admin/admin123, role: admin), 3 players (xander/player123, kai_gamer/player123, nova_plays/player123)
- **Promos**: 4 active promos (Weekend Warrior, Loyalty Rewards, First Timer Bonus, VIP Tier Upgrade)
- **Menu**: 15 items across drinks/food/snacks categories
- **Announcements**: 3

## User preferences

- Dark futuristic glass UI: `#07070D` background, `#7C3AED` primary purple, neon accents
- Mobile-first player UI; desktop admin panel
- All TypeScript must pass `tsc --noEmit` with zero errors

## Gotchas

- Always run `pnpm --filter @workspace/api-spec run codegen` after editing `openapi.yaml`
- Use `pnpm run dev` at the workspace root for local development; it starts both backend and frontend.
- The API server uses plain `zod` import (not `zod/v4` subpath) — keep it that way
- `useListSessions` and `useListPlayers` take `(params, options)` — params go first, options second
- `useDeleteMenuItem` uses `itemId` (not `menuItemId`); `useUpdatePlayerStatus` uses `userId` (not `playerId`)

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
