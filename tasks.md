# Collab Canvas — MVP Task & PR Checklist

Below is a proposed sequence of **pull requests (PRs)** to build and ship the Collab Canvas MVP. Each PR has a checklist of subtasks with the **files you’ll create or modify**. Adjust as needed once you begin implementation.

---

## Project File Structure (proposed)

```
collab-canvas/
├─ src/
│  ├─ pages/
│  │  ├─ LoginPage.tsx
│  │  └─ CanvasPage.tsx
│  ├─ components/
│  │  ├─ CanvasStage.tsx
│  │  ├─ CursorLayer.tsx
│  │  ├─ PresenceList.tsx
│  │  ├─ Toolbar.tsx
│  │  ├─ Shapes/
│  │  │  ├─ RectangleShape.tsx
│  │  │  ├─ CircleShape.tsx
│  │  │  └─ TextShape.tsx
│  │  └─ providers/AuthProvider.tsx
│  ├─ hooks/
│  │  ├─ usePanZoom.ts
│  │  ├─ usePresence.ts
│  │  ├─ useShapes.ts
│  │  └─ useCanvasShortcuts.ts
│  ├─ lib/
│  │  ├─ firebase/client.ts
│  │  ├─ firebase/firestore.ts
│  │  ├─ react-query/queryClient.ts
│  │  ├─ schema.ts
│  │  ├─ types.ts
│  │  ├─ sync/objects.ts
│  │  └─ sync/presence.ts
│  ├─ store/
│  │  └─ selection.ts
│  ├─ App.tsx
│  ├─ main.tsx
│  └─ index.css
├─ public/
│  └─ favicon.ico
├─ .github/workflows/ci.yml
├─ .env.example
├─ package.json
├─ tsconfig.json
├─ vite.config.ts
├─ postcss.config.js
├─ tailwind.config.ts
├─ eslint.config.js (or .eslintrc.cjs)
└─ README.md
```

**Notes**

- **Vite + React + TypeScript** with React Router for navigation.
- **Tailwind CSS** for speed.
- **Konva.js** for canvas rendering (chosen for performance with multiple concurrent users).
- **Firebase (Auth + Firestore)** for sync; **React Query** for server state & optimistic updates.
- Local UI-only state (e.g., selection) in a tiny store (or component state) under `store/`.

---

## PR #1 — Project Scaffold & Tooling

**Goal:** Initialize repo, baseline tooling, styling, and CI.

**Checklist**

- [x] Create Vite React app (TS) and install deps: `vite react react-dom react-router-dom @tanstack/react-query firebase konva tailwindcss` and utilities.

  - Files: `package.json`, `tsconfig.json`, `vite.config.ts`

- [x] Configure Tailwind and global styles.

  - Files: `tailwind.config.ts`, `postcss.config.js`, `src/index.css`

- [x] Add React Query provider and base app shell with React Router.

  - Files: `src/lib/react-query/queryClient.ts`, `src/App.tsx`, `src/main.tsx`

- [x] Add health check utility for monitoring.

  - Files: `src/lib/health.ts`

- [x] Add ESLint/Prettier configs and scripts; set up GitHub Actions CI (typecheck, build).

  - Files: `eslint.config.js` (or `.eslintrc`), `.github/workflows/ci.yml`

- [x] Add `README.md` and `.env.example`.

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

  - Files: `src/components/providers/AuthProvider.tsx`

- [ ] Build Login page (React Router route).

  - Files: `src/pages/LoginPage.tsx`

- [ ] Add Google account display name and avatar in header layout.

  - Files: `src/App.tsx` (header), possibly `src/components/ProfileMenu.tsx` (optional)

- [ ] Guard `/canvas` route to require auth (redirect if not logged in).

  - Files: `src/pages/CanvasPage.tsx`, `src/components/providers/AuthProvider.tsx`

---

## PR #4 — Canvas Shell (Stage, Pan/Zoom, Toolbar)

**Goal:** Render a large workspace with smooth pan/zoom and basic toolbar.

**Checklist**

- [ ] Add `CanvasStage` (Konva Stage + Layer), responsive to viewport.

  - Files: `src/components/CanvasStage.tsx`

- [ ] Implement pan/zoom hook and attach to stage.

  - Files: `src/hooks/usePanZoom.ts`, `src/components/CanvasStage.tsx`

- [ ] Create minimal `Toolbar` (shape tools: select, rectangle, circle, text; delete/duplicate).

  - Files: `src/components/Toolbar.tsx`

- [ ] Scaffold `/canvas` page to mount the stage and toolbar.

  - Files: `src/pages/CanvasPage.tsx`

---

## PR #5 — Shape Primitives & Selection/Transforms

**Goal:** Create/move/resize/rotate/delete/duplicate for rectangles, circles, and text.

**Checklist**

- [ ] Implement shape components and wiring to Konva nodes.

  - Files: `src/components/Shapes/RectangleShape.tsx`, `src/components/Shapes/CircleShape.tsx`, `src/components/Shapes/TextShape.tsx`

- [ ] Selection state (single + marquee). Keep UI-only selection in local store.

  - Files: `src/store/selection.ts`, `src/components/CanvasStage.tsx`

- [ ] Transformer handles for selected nodes; keyboard shortcuts (delete, dup, arrow nudge).

  - Files: `src/components/CanvasStage.tsx`, `src/hooks/useCanvasShortcuts.ts`

- [ ] Utilities for geometry, ids, cloning.

  - Files: `src/lib/utils/geometry.ts` (optional), extend `src/lib/types.ts`

---

## PR #6 — Real-Time Presence & Multiplayer Cursors

**Goal:** Show who’s online and render live cursors with names.

**Checklist**

- [ ] Presence service: join/leave room; heartbeat; track cursor positions.

  - Files: `src/lib/sync/presence.ts`, `src/hooks/usePresence.ts`

- [ ] Cursor layer to render other users' cursors + labels.

  - Files: `src/components/CursorLayer.tsx`

- [ ] Presence list UI.

  - Files: `src/components/PresenceList.tsx`, `src/pages/CanvasPage.tsx`

- [ ] React Query integration for presence subscription and updates.

  - Files: `src/hooks/usePresence.ts`, `src/lib/react-query/queryClient.ts`

_Note:_ Firestore lacks `onDisconnect`; we'll use **Firestore heartbeat documents** for presence tracking. Implementation choice lives in `src/lib/sync/presence.ts`.

---

## PR #7 — Object Sync (Create/Update/Delete) with React Query

**Goal:** Server state for shapes with optimistic UI, conflict policy documented.

**Checklist**

- [ ] Define Firestore data model: `canvases/{canvasId}`, `canvases/{canvasId}/objects/{objectId}`.

  - Files: `src/lib/schema.ts`, `src/lib/types.ts`, `src/lib/firebase/firestore.ts`

- [ ] Queries & subscriptions for objects (React Query + Firestore snapshot bridge).

  - Files: `src/lib/sync/objects.ts`, `src/hooks/useShapes.ts`

- [ ] Mutations for create/move/resize/rotate/delete/duplicate with optimistic updates.

  - Files: `src/hooks/useShapes.ts`, `src/components/CanvasStage.tsx`

- [ ] Conflict handling: **last write wins** via `updatedAt` + `updatedBy`.

  - Files: `src/lib/sync/objects.ts`, `src/lib/types.ts`

---

## PR #8 — Persistence & Reconnect Handling

**Goal:** Ensure canvas state persists across refresh/disconnect, fast reconnect.

**Checklist**

- [ ] Initial load path: fetch current canvas, then subscribe to live updates.

  - Files: `src/hooks/useShapes.ts`, `src/pages/CanvasPage.tsx`

- [ ] Persist canvas-level metadata (viewport, default tool, etc.).

  - Files: `src/lib/firebase/firestore.ts`, `src/lib/types.ts`, `src/components/CanvasStage.tsx`

- [ ] Save on navigation/unload and restore on re-entry.

  - Files: `src/components/CanvasStage.tsx`

---

## PR #9 — Performance & Hardening

**Goal:** Hit target latency and FPS; avoid over-rendering.

**Checklist**

- [ ] Batch/transaction writes for bursty updates; debounce drag/resize network patches.

  - Files: `src/lib/sync/objects.ts`, `src/hooks/useShapes.ts`

- [ ] Throttle cursor broadcasts; interpolate cursor motion locally for smoothness.

  - Files: `src/lib/sync/presence.ts`, `src/hooks/usePresence.ts`, `src/components/CursorLayer.tsx`

- [ ] Avoid excessive React re-renders (memoization; Konva refs).

  - Files: `src/components/CanvasStage.tsx`, `src/components/Shapes/*`

- [ ] Stress test script (manual playbook) & profiling notes in README.

  - Files: `README.md`

---

## PR #10 — Deployment, Env, and Polishing

**Goal:** Public deploy + CI passing + minimal polish for demo.

**Checklist**

- [ ] Hook up Vercel project; configure Firebase env vars.

  - Files: `README.md`, `.env.example`, Vercel project settings

- [ ] Verify client-side Firebase usage and environment configuration.

  - Files: `src/lib/firebase/client.ts`, environment setup

- [ ] Final UI polish (empty states, loading spinners, error toasts).

  - Files: `src/pages/CanvasPage.tsx`, `src/components/*`

- [ ] Add demo script to README and a 3–5 min video plan.

  - Files: `README.md`

---

## Optional (Post-MVP) — AI Agent Foundations (Stub Only)

**Goal:** Prepare minimal API for future AI function-calling (no AI yet).

**Checklist**

- [ ] Define callable canvas API surface to be used later by AI.

  - Files: `src/lib/sync/objects.ts` (export high-level create/move/resize), `src/lib/types.ts`

- [ ] Add `/src/lib/ai/tools.ts` with TypeScript signatures (no implementation yet).

  - Files: `src/lib/ai/tools.ts`

---

## Data Models (summary)

```ts
// src/lib/types.ts
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

- **Smoke render** of `src/App.tsx` without crashing.

**Integration/E2E**

- **Health check utility** works correctly.

---

### PR #2 — Firebase Integration (Auth + Firestore) → ✅ Add tests here

**Add/Update**

- Emulator-based tests to verify SDK init and R/W to Firestore.
- Files: `src/lib/firebase/client.ts`, `src/lib/firebase/firestore.ts`
- Tests: `tests/integration/firebase.emu.spec.ts`

**Integration** (with Emulators)

- Can **write** and **read** a doc in test collection.
- Env vars validated; missing var throws helpful error.

**Unit**

- `firebase/client.ts` guards: returns **singleton** app instance.

---

### PR #3 — Authentication UI & Flow → ✅ Add tests here

**Add/Update**

- Files under test: `src/components/providers/AuthProvider.tsx`, `src/pages/LoginPage.tsx`
- Tests: `tests/unit/AuthProvider.spec.tsx`, `tests/e2e/auth-flow.spec.ts`

**Unit**

- AuthProvider: renders children when `currentUser` present; otherwise shows loader/redirect.

**Integration/E2E** (Emulator Auth)

- Google OAuth → Redirect to `/canvas` shows user display name in header.

---

### PR #4 — Canvas Shell (Stage, Pan/Zoom, Toolbar) → ✅ Add tests here

**Add/Update**

- Files: `src/components/CanvasStage.tsx`, `src/hooks/usePanZoom.ts`, `src/components/Toolbar.tsx`
- Tests: `tests/unit/usePanZoom.spec.ts`, `tests/e2e/pan-zoom-toolbar.spec.ts`

**Unit**

- `usePanZoom` math: zoom in/out clamps scale; panning updates viewport as expected.

**Integration/E2E**

- Loads `/canvas`, toolbar buttons visible; wheel zoom changes scale; drag canvas pans.

---

### PR #5 — Shape Primitives & Selection/Transforms → ✅ Add tests here

**Add/Update**

- Files: `src/components/Shapes/*`, `src/store/selection.ts`, `src/hooks/useCanvasShortcuts.ts`, optional `src/lib/utils/geometry.ts`
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

- Files: `src/lib/sync/presence.ts`, `src/hooks/usePresence.ts`, `src/components/CursorLayer.tsx`, `src/components/PresenceList.tsx`
- Tests: `tests/integration/presence-two-clients.spec.ts`, `tests/unit/throttle-utils.spec.ts`

**Integration (Emulators + Playwright, 2 pages)**

- Open two browser contexts to the same canvas: **Presence list** shows both users; moving cursor in Page A renders cursor in Page B (<50ms threshold not strictly asserted, only that updates occur).

**Unit**

- Throttle/debounce used for cursor broadcasting respects interval.

---

### PR #7 — Object Sync (Create/Update/Delete) with React Query → ✅ Add tests here

**Add/Update**

- Files: `src/lib/sync/objects.ts`, `src/hooks/useShapes.ts`, `src/lib/firebase/firestore.ts`, `src/lib/types.ts`
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

- Files: `src/hooks/useShapes.ts`, `src/lib/firebase/firestore.ts`, `src/components/CanvasStage.tsx`
- Tests: `tests/e2e/reconnect-persistence.spec.ts`

**E2E (Emulators)**

- Create a few shapes → **reload page** → shapes rehydrate from snapshot; viewport restored if persisted.

---

### PR #9 — Performance & Hardening → ⚠️ Limited unit tests only

**Add/Update**

- Files: `src/lib/sync/objects.ts`, `src/hooks/useShapes.ts`, `src/hooks/usePresence.ts`
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
  3. `pnpm test:e2e` (Playwright) against local Vite dev server

- Cache `~/.cache/ms-playwright` and node modules to speed up runs.
