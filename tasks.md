# Collab Canvas — MVP Task & PR Checklist

Below is a proposed sequence of **pull requests (PRs)** to build and ship the Collab Canvas MVP. Each PR has a checklist of subtasks with the **files you’ll create or modify**. Adjust as needed once you begin implementation.

---

## Project File Structure (proposed)

```
collab-canvas/
├─ app/
│  ├─ (auth)/
│  │  └─ login/page.tsx
│  ├─ canvas/page.tsx
│  ├─ layout.tsx
│  ├─ globals.css
│  └─ api/health/route.ts
├─ components/
│  ├─ CanvasStage.tsx
│  ├─ CursorLayer.tsx
│  ├─ PresenceList.tsx
│  ├─ Toolbar.tsx
│  ├─ Shapes/
│  │  ├─ RectangleShape.tsx
│  │  ├─ CircleShape.tsx
│  │  └─ TextShape.tsx
│  └─ providers/AuthProvider.tsx
├─ hooks/
│  ├─ usePanZoom.ts
│  ├─ usePresence.ts
│  ├─ useShapes.ts
│  └─ useCanvasShortcuts.ts
├─ lib/
│  ├─ firebase/client.ts
│  ├─ firebase/firestore.ts
│  ├─ react-query/queryClient.ts
│  ├─ schema.ts
│  ├─ types.ts
│  ├─ sync/objects.ts
│  └─ sync/presence.ts
├─ store/
│  └─ selection.ts
├─ public/
│  └─ favicon.ico
├─ .github/workflows/ci.yml
├─ .env.example
├─ package.json
├─ tsconfig.json
├─ next.config.js
├─ postcss.config.js
├─ tailwind.config.ts
├─ eslint.config.js (or .eslintrc.cjs)
└─ README.md
```

**Notes**

- **Next.js 14 + App Router + TypeScript**.
- **Tailwind CSS** for speed.
- **Konva.js** for canvas rendering (chosen for performance with multiple concurrent users).
- **Firebase (Auth + Firestore)** for sync; **React Query** for server state & optimistic updates.
- Local UI-only state (e.g., selection) in a tiny store (or component state) under `store/`.

---

## PR #1 — Project Scaffold & Tooling

**Goal:** Initialize repo, baseline tooling, styling, and CI.

**Checklist**

- [ ] Create Next.js app (TS) and install deps: `next react react-dom @tanstack/react-query firebase konva tailwindcss` and utilities.

  - Files: `package.json`, `tsconfig.json`, `next.config.js`

- [ ] Configure Tailwind and global styles.

  - Files: `tailwind.config.ts`, `postcss.config.js`, `app/globals.css`

- [ ] Add React Query provider and base layout shell.

  - Files: `lib/react-query/queryClient.ts`, `app/layout.tsx`

- [ ] Add health endpoint for uptime checks.

  - Files: `app/api/health/route.ts`

- [ ] Add ESLint/Prettier configs and scripts; set up GitHub Actions CI (typecheck, build).

  - Files: `eslint.config.js` (or `.eslintrc`), `.github/workflows/ci.yml`

- [ ] Add `README.md` and `.env.example`.

---

## PR #2 — Firebase Integration (Auth + Firestore)

**Goal:** Initialize Firebase client, env wiring, and minimal helpers.

**Checklist**

- [ ] Configure Firebase client initialization.

  - Files: `lib/firebase/client.ts`

- [ ] Create Firestore helpers for collections (canvas, objects, presence).

  - Files: `lib/firebase/firestore.ts`

- [ ] Define app-wide types and schemas.

  - Files: `lib/types.ts`, `lib/schema.ts`

- [ ] Document env vars in `.env.example` and update `README.md`.

---

## PR #3 — Authentication UI & Flow

**Goal:** Login page with Google OAuth, user display name, and auth provider.

**Checklist**

- [ ] Auth context/provider with Firebase Auth (Google OAuth only).

  - Files: `components/providers/AuthProvider.tsx`

- [ ] Build Login page (App Router route).

  - Files: `app/(auth)/login/page.tsx`

- [ ] Add Google account display name and avatar in header layout.

  - Files: `app/layout.tsx` (header), possibly `components/ProfileMenu.tsx` (optional)

- [ ] Guard `/canvas` route to require auth (redirect if not logged in).

  - Files: `app/canvas/page.tsx`, `components/providers/AuthProvider.tsx`

---

## PR #4 — Canvas Shell (Stage, Pan/Zoom, Toolbar)

**Goal:** Render a large workspace with smooth pan/zoom and basic toolbar.

**Checklist**

- [ ] Add `CanvasStage` (Konva Stage + Layer), responsive to viewport.

  - Files: `components/CanvasStage.tsx`

- [ ] Implement pan/zoom hook and attach to stage.

  - Files: `hooks/usePanZoom.ts`, `components/CanvasStage.tsx`

- [ ] Create minimal `Toolbar` (shape tools: select, rectangle, circle, text; delete/duplicate).

  - Files: `components/Toolbar.tsx`

- [ ] Scaffold `/canvas` page to mount the stage and toolbar.

  - Files: `app/canvas/page.tsx`

---

## PR #5 — Shape Primitives & Selection/Transforms

**Goal:** Create/move/resize/rotate/delete/duplicate for rectangles, circles, and text.

**Checklist**

- [ ] Implement shape components and wiring to Konva nodes.

  - Files: `components/Shapes/RectangleShape.tsx`, `components/Shapes/CircleShape.tsx`, `components/Shapes/TextShape.tsx`

- [ ] Selection state (single + marquee). Keep UI-only selection in local store.

  - Files: `store/selection.ts`, `components/CanvasStage.tsx`

- [ ] Transformer handles for selected nodes; keyboard shortcuts (delete, dup, arrow nudge).

  - Files: `components/CanvasStage.tsx`, `hooks/useCanvasShortcuts.ts`

- [ ] Utilities for geometry, ids, cloning.

  - Files: `lib/utils/geometry.ts` (optional), extend `lib/types.ts`

---

## PR #6 — Real-Time Presence & Multiplayer Cursors

**Goal:** Show who’s online and render live cursors with names.

**Checklist**

- [ ] Presence service: join/leave room; heartbeat; track cursor positions.

  - Files: `lib/sync/presence.ts`, `hooks/usePresence.ts`

- [ ] Cursor layer to render other users’ cursors + labels.

  - Files: `components/CursorLayer.tsx`

- [ ] Presence list UI.

  - Files: `components/PresenceList.tsx`, `app/canvas/page.tsx`

- [ ] React Query integration for presence subscription and updates.

  - Files: `hooks/usePresence.ts`, `lib/react-query/queryClient.ts`

_Note:_ Firestore lacks `onDisconnect`; we'll use **Firestore heartbeat documents** for presence tracking. Implementation choice lives in `lib/sync/presence.ts`.

---

## PR #7 — Object Sync (Create/Update/Delete) with React Query

**Goal:** Server state for shapes with optimistic UI, conflict policy documented.

**Checklist**

- [ ] Define Firestore data model: `canvases/{canvasId}`, `canvases/{canvasId}/objects/{objectId}`.

  - Files: `lib/schema.ts`, `lib/types.ts`, `lib/firebase/firestore.ts`

- [ ] Queries & subscriptions for objects (React Query + Firestore snapshot bridge).

  - Files: `lib/sync/objects.ts`, `hooks/useShapes.ts`

- [ ] Mutations for create/move/resize/rotate/delete/duplicate with optimistic updates.

  - Files: `hooks/useShapes.ts`, `components/CanvasStage.tsx`

- [ ] Conflict handling: **last write wins** via `updatedAt` + `updatedBy`.

  - Files: `lib/sync/objects.ts`, `lib/types.ts`

---

## PR #8 — Persistence & Reconnect Handling

**Goal:** Ensure canvas state persists across refresh/disconnect, fast reconnect.

**Checklist**

- [ ] Initial load path: fetch current canvas, then subscribe to live updates.

  - Files: `hooks/useShapes.ts`, `app/canvas/page.tsx`

- [ ] Persist canvas-level metadata (viewport, default tool, etc.).

  - Files: `lib/firebase/firestore.ts`, `lib/types.ts`, `components/CanvasStage.tsx`

- [ ] Save on navigation/unload and restore on re-entry.

  - Files: `components/CanvasStage.tsx`

---

## PR #9 — Performance & Hardening

**Goal:** Hit target latency and FPS; avoid over-rendering.

**Checklist**

- [ ] Batch/transaction writes for bursty updates; debounce drag/resize network patches.

  - Files: `lib/sync/objects.ts`, `hooks/useShapes.ts`

- [ ] Throttle cursor broadcasts; interpolate cursor motion locally for smoothness.

  - Files: `lib/sync/presence.ts`, `hooks/usePresence.ts`, `components/CursorLayer.tsx`

- [ ] Avoid excessive React re-renders (memoization; Konva refs).

  - Files: `components/CanvasStage.tsx`, `components/Shapes/*`

- [ ] Stress test script (manual playbook) & profiling notes in README.

  - Files: `README.md`

---

## PR #10 — Deployment, Env, and Polishing

**Goal:** Public deploy + CI passing + minimal polish for demo.

**Checklist**

- [ ] Hook up Vercel project; configure Firebase env vars.

  - Files: `README.md`, `.env.example`, Vercel project settings

- [ ] Verify SSR/CSR boundaries and Firebase usage in Next.js App Router.

  - Files: `lib/firebase/client.ts`, any server-only modules

- [ ] Final UI polish (empty states, loading spinners, error toasts).

  - Files: `app/canvas/page.tsx`, `components/*`

- [ ] Add demo script to README and a 3–5 min video plan.

  - Files: `README.md`

---

## Optional (Post-MVP) — AI Agent Foundations (Stub Only)

**Goal:** Prepare minimal API for future AI function-calling (no AI yet).

**Checklist**

- [ ] Define callable canvas API surface to be used later by AI.

  - Files: `lib/sync/objects.ts` (export high-level create/move/resize), `lib/types.ts`

- [ ] Add `/lib/ai/tools.ts` with TypeScript signatures (no implementation yet).

  - Files: `lib/ai/tools.ts`

---

## Data Models (summary)

```ts
// lib/types.ts
export type ShapeType = 'rect' | 'circle' | 'text'
export interface ShapeBase {
  id: string
  type: ShapeType
  x: number
  y: number
  width?: number
  height?: number
  radius?: number
  rotation?: number
  fill?: string
  text?: string
  fontSize?: number
  createdAt: number
  createdBy: string
  updatedAt: number
  updatedBy: string
}
export interface CanvasMeta {
  id: string
  name?: string
  viewport: { x: number; y: number; scale: number }
}
```

---

## Milestone Acceptance Criteria (MVP)

- Authenticated users can join `/canvas` and see **presence list** and **live cursors**.
- Users can **create/move/resize/rotate/delete/duplicate** rectangles, circles, and text.
- **Edits sync** across 2+ users in <100ms; cursors in <50ms (under normal network).
- **Canvas state persists** on refresh and reconnect.
- Deployed app is **publicly accessible** and CI passes.

---

## Test Plan (Unit & Integration) — Mapped to PRs

**Testing stack**

- **Unit/Component:** Vitest + React Testing Library (RTL)
- **Integration/E2E (browser):** Playwright
- **Backend emulation:** Firebase Emulators (Auth, Firestore)
- **CI:** GitHub Actions workflow runs unit → emulators → integration

> Directory layout

```
/tests
  /unit
  /integration
  /e2e
playwright.config.ts
vitest.config.ts
setupTests.ts   // RTL + JSDOM setup
```

### PR #1 — Project Scaffold & Tooling → ✅ Add tests here

**Add/Update**

- Create testing configs & scripts; wire CI to run them.
- Files: `vitest.config.ts`, `setupTests.ts`, `playwright.config.ts`, `.github/workflows/ci.yml` (extend), `tests/unit/smoke.spec.ts`, `tests/e2e/health.spec.ts`

**Unit**

- **Smoke render** of `app/layout.tsx` without crashing.

**Integration/E2E**

- **Health endpoint** responds 200.

---

### PR #2 — Firebase Integration (Auth + Firestore) → ✅ Add tests here

**Add/Update**

- Emulator-based tests to verify SDK init and R/W to Firestore.
- Files: `lib/firebase/client.ts`, `lib/firebase/firestore.ts`
- Tests: `tests/integration/firebase.emu.spec.ts`

**Integration** (with Emulators)

- Can **write** and **read** a doc in test collection.
- Env vars validated; missing var throws helpful error.

**Unit**

- `firebase/client.ts` guards: returns **singleton** app instance.

---

### PR #3 — Authentication UI & Flow → ✅ Add tests here

**Add/Update**

- Files under test: `components/providers/AuthProvider.tsx`, `app/(auth)/*`
- Tests: `tests/unit/AuthProvider.spec.tsx`, `tests/e2e/auth-flow.spec.ts`

**Unit**

- AuthProvider: renders children when `currentUser` present; otherwise shows loader/redirect.

**Integration/E2E** (Emulator Auth)

- Google OAuth → Redirect to `/canvas` shows user display name in header.

---

### PR #4 — Canvas Shell (Stage, Pan/Zoom, Toolbar) → ✅ Add tests here

**Add/Update**

- Files: `components/CanvasStage.tsx`, `hooks/usePanZoom.ts`, `components/Toolbar.tsx`
- Tests: `tests/unit/usePanZoom.spec.ts`, `tests/e2e/pan-zoom-toolbar.spec.ts`

**Unit**

- `usePanZoom` math: zoom in/out clamps scale; panning updates viewport as expected.

**Integration/E2E**

- Loads `/canvas`, toolbar buttons visible; wheel zoom changes scale; drag canvas pans.

---

### PR #5 — Shape Primitives & Selection/Transforms → ✅ Add tests here

**Add/Update**

- Files: `components/Shapes/*`, `store/selection.ts`, `hooks/useCanvasShortcuts.ts`, optional `lib/utils/geometry.ts`
- Tests: `tests/unit/geometry.spec.ts`, `tests/e2e/shapes-crud.spec.ts`

**Unit**

- Geometry utils (bounds, cloning) behave correctly.
- Selection store: select, multi-select, clear.

**Integration/E2E**

- Create rectangle/circle/text via toolbar; drag to move; use handles to resize/rotate; delete and duplicate work.
- Keyboard shortcuts (Del, ⌘/Ctrl+D) perform expected actions.

---

### PR #6 — Real-Time Presence & Multiplayer Cursors → ✅ Add tests here

**Add/Update**

- Files: `lib/sync/presence.ts`, `hooks/usePresence.ts`, `components/CursorLayer.tsx`, `components/PresenceList.tsx`
- Tests: `tests/integration/presence-two-clients.spec.ts`, `tests/unit/throttle-utils.spec.ts`

**Integration (Emulators + Playwright, 2 pages)**

- Open two browser contexts to the same canvas: **Presence list** shows both users; moving cursor in Page A renders cursor in Page B (<50ms threshold not strictly asserted, only that updates occur).

**Unit**

- Throttle/debounce used for cursor broadcasting respects interval.

---

### PR #7 — Object Sync (Create/Update/Delete) with React Query → ✅ Add tests here

**Add/Update**

- Files: `lib/sync/objects.ts`, `hooks/useShapes.ts`, `lib/firebase/firestore.ts`, `lib/types.ts`
- Tests: `tests/integration/objects-sync.spec.ts`, `tests/unit/useShapes.spec.ts`

**Integration (Emulators, 2 pages)**

- Creating/updating/deleting a shape in Page A appears in Page B.
- **Optimistic update** shows immediately; eventual snapshot reconciliation matches server.
- **Last write wins** verified by racing two updates (newer `updatedAt` wins).

**Unit**

- `useShapes` mutation helpers produce correct patches; rollback on error.

---

### PR #8 — Persistence & Reconnect Handling → ✅ Add tests here

**Add/Update**

- Files: `hooks/useShapes.ts`, `lib/firebase/firestore.ts`, `components/CanvasStage.tsx`
- Tests: `tests/e2e/reconnect-persistence.spec.ts`

**E2E (Emulators)**

- Create a few shapes → **reload page** → shapes rehydrate from snapshot; viewport restored if persisted.

---

### PR #9 — Performance & Hardening → ⚠️ Limited unit tests only

**Add/Update**

- Files: `lib/sync/objects.ts`, `hooks/useShapes.ts`, `hooks/usePresence.ts`
- Tests: `tests/unit/debounce-batching.spec.ts`

**Unit**

- Debounce/batch utilities limit network calls under rapid drag (assert call count).

> Note: FPS/latency targets will be verified manually with DevTools + README playbook rather than automated.

---

### PR #10 — Deployment, Env, and Polishing → 🚫 No tests added

- Focus on deployment and CI wiring already covered in PR #1.

---

## CI Addendum

- Update `.github/workflows/ci.yml` to run:

  1. `pnpm test:unit` (Vitest)
  2. Start **Firebase Emulators** (Auth, Firestore)
  3. `pnpm test:e2e` (Playwright) against local dev server

- Cache `~/.cache/ms-playwright` and node modules to speed up runs.
