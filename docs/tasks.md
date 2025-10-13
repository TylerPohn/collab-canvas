# Collab Canvas — MVP Task & PR Checklist

Below is a proposed sequence of **pull requests (PRs)** to build and ship the Collab Canvas MVP. Each PR has a checklist of subtasks with the **files you’ll create or modify**. Adjust as needed once you begin implementation.

---

## Project File Structure (current)

```
collab-canvas/
├─ src/
│  ├─ pages/
│  │  ├─ LoginPage.tsx ✅
│  │  └─ CanvasPage.tsx ✅
│  ├─ components/
│  │  ├─ ProfileMenu.tsx ✅
│  │  ├─ ProtectedRoute.tsx ✅
│  │  ├─ CanvasStage.tsx ✅
│  │  ├─ CursorLayer.tsx (planned)
│  │  ├─ PresenceList.tsx (planned)
│  │  ├─ Toolbar.tsx ✅
│  │  ├─ Shapes/ ✅
│  │  │  ├─ RectangleShape.tsx ✅
│  │  │  ├─ CircleShape.tsx ✅
│  │  │  └─ TextShape.tsx ✅
│  │  └─ providers/
│  │     └─ AuthProvider.tsx ✅
│  ├─ contexts/
│  │  └─ AuthContext.tsx ✅
│  ├─ hooks/
│  │  ├─ useAuth.ts ✅
│  │  ├─ usePanZoom.ts ✅
│  │  ├─ usePresence.ts (planned)
│  │  ├─ useShapes.ts (planned)
│  │  └─ useCanvasShortcuts.ts ✅
│  ├─ lib/
│  │  ├─ firebase/
│  │  │  ├─ client.ts ✅
│  │  │  └─ firestore.ts ✅
│  │  ├─ react-query/
│  │  │  └─ queryClient.ts ✅
│  │  ├─ health.ts ✅
│  │  ├─ schema.ts ✅
│  │  ├─ types.ts ✅
│  │  ├─ sync/ (planned)
│  │  │  ├─ objects.ts
│  │  │  └─ presence.ts
│  ├─ store/ ✅
│  │  └─ selection.ts ✅
│  ├─ App.tsx ✅
│  ├─ main.tsx ✅
│  └─ index.css ✅
├─ public/
│  └─ vite.svg ✅
├─ .github/workflows/ci.yml (planned)
├─ .env.example ✅
├─ package.json ✅
├─ tsconfig.json ✅
├─ tsconfig.app.json ✅
├─ tsconfig.node.json ✅
├─ vite.config.ts ✅
├─ postcss.config.js ✅
├─ tailwind.config.ts ✅
├─ eslint.config.js ✅
└─ README.md ✅
```

**Legend:** ✅ = Completed, (planned) = Future PRs

**Notes**

- **Vite + React + TypeScript** with React Router for navigation.
- **Tailwind CSS** for speed.
- **Konva.js** for canvas rendering (chosen for performance with multiple concurrent users).
- **Firebase (Auth + Firestore)** for sync; **React Query** for server state & optimistic updates.
- **Zustand** for local UI-only state management (selection store).
- **Shape System**: Full CRUD operations implemented with local state, ready for real-time sync in PR #6.

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

- [x] Configure Firebase client initialization.
  - Files: `lib/firebase/client.ts`

- [x] Create Firestore helpers for collections (canvas, objects, presence).
  - Files: `lib/firebase/firestore.ts`

- [x] Define app-wide types and schemas.
  - Files: `lib/types.ts`, `lib/schema.ts`

- [x] Document env vars in `.env.example` and update `README.md`.

---

## PR #3 — Authentication UI & Flow ✅ COMPLETED

**Goal:** Login page with Google OAuth, user display name, and auth provider.

**Checklist**

- [x] Auth context/provider with Firebase Auth (Google OAuth only).
  - Files: `src/components/providers/AuthProvider.tsx`, `src/contexts/AuthContext.tsx`, `src/hooks/useAuth.ts`

- [x] Build Login page (React Router route).
  - Files: `src/pages/LoginPage.tsx`

- [x] Add Google account display name and avatar in header layout.
  - Files: `src/App.tsx` (header), `src/components/ProfileMenu.tsx`

- [x] Guard `/canvas` route to require auth (redirect if not logged in).
  - Files: `src/pages/CanvasPage.tsx`, `src/components/ProtectedRoute.tsx`

---

## PR #4 — Canvas Shell (Stage, Pan/Zoom, Toolbar) ✅ COMPLETED

**Goal:** Render a large workspace with smooth pan/zoom and basic toolbar.

**Checklist**

- [x] Add `CanvasStage` (Konva Stage + Layer), responsive to viewport.
  - Files: `src/components/CanvasStage.tsx`

- [x] Implement pan/zoom hook and attach to stage.
  - Files: `src/hooks/usePanZoom.ts`, `src/components/CanvasStage.tsx`

- [x] Create minimal `Toolbar` (shape tools: select, rectangle, circle, text; delete/duplicate).
  - Files: `src/components/Toolbar.tsx`

- [x] Scaffold `/canvas` page to mount the stage and toolbar.
  - Files: `src/pages/CanvasPage.tsx`

---

## PR #5 — Shape Primitives & Selection/Transforms ✅ COMPLETED

**Goal:** Create/move/resize/rotate/delete/duplicate for rectangles, circles, and text.

**Checklist**

- [x] Implement shape components and wiring to Konva nodes.
  - Files: `src/components/Shapes/RectangleShape.tsx`, `src/components/Shapes/CircleShape.tsx`, `src/components/Shapes/TextShape.tsx`

- [x] Selection state (single + marquee). Keep UI-only selection in local store.
  - Files: `src/store/selection.ts`, `src/components/CanvasStage.tsx`

- [x] Transformer handles for selected nodes; keyboard shortcuts (delete, dup, arrow nudge).
  - Files: `src/components/CanvasStage.tsx`, `src/hooks/useCanvasShortcuts.ts`

- [ ] ~~Utilities for geometry, ids, cloning.~~ (Skipped per user request - focusing on simple shapes)
  - Files: `src/lib/utils/geometry.ts` (optional), extend `src/lib/types.ts`

**PR #5 Implementation Summary:**

- ✅ **Shape Components**: Created RectangleShape, CircleShape, and TextShape components with full Konva integration
- ✅ **Selection System**: Implemented Zustand-based selection store with single/multi-select support
- ✅ **Transform Handles**: Added Konva Transformer for resize/rotate operations on selected shapes
- ✅ **Keyboard Shortcuts**: Delete (Del), Duplicate (Cmd/Ctrl+D), Arrow key nudging (5px)
- ✅ **Shape Creation**: Click-and-drag for rectangles/circles, click-to-create for text
- ✅ **Shape Manipulation**: Drag to move, transform handles for resize/rotate, visual selection feedback
- ✅ **Type Safety**: Full TypeScript support with proper Konva event types
- ✅ **Code Quality**: All linting errors resolved, successful production build

**Key Features Delivered:**

- Create, select, move, resize, rotate, delete, and duplicate shapes
- Multi-selection with Ctrl/Cmd+click
- Visual feedback with blue selection borders and transformer handles
- Smooth pan/zoom integration with shape tools
- Toolbar state management (enable/disable buttons based on selection)
- Local shape state management ready for future real-time sync

---

## PR #6 — Real-Time Presence & Multiplayer Cursors ✅ COMPLETED

**Goal:** Show who's online and render live cursors with names.

**Checklist**

- [x] Presence service: join/leave room; heartbeat; track cursor positions.
  - Files: `src/lib/sync/presence.ts`, `src/hooks/usePresence.ts`

- [x] Cursor layer to render other users' cursors + labels.
  - Files: `src/components/CursorLayer.tsx`

- [x] Presence list UI.
  - Files: `src/components/PresenceList.tsx`, `src/pages/CanvasPage.tsx`

- [x] React Query integration for presence subscription and updates.
  - Files: `src/hooks/usePresence.ts`, `src/hooks/usePresenceQuery.ts`

**PR #6 Implementation Summary:**

- ✅ **Presence Service**: Implemented heartbeat system (30s intervals), cursor tracking with throttling (100ms), and automatic cleanup
- ✅ **Cursor Layer**: Real-time cursor rendering with user labels, proper viewport transformation, and Konva integration
- ✅ **Presence List UI**: Online user display with avatars, user count, and responsive design
- ✅ **React Query Integration**: Full integration with mutations, subscriptions, error handling, and cache management
- ✅ **Real-time Updates**: Live cursor positions and presence status updates across multiple users
- ✅ **Performance Optimized**: Throttled updates, efficient rendering, and proper memory management
- ✅ **Type Safety**: Full TypeScript support with proper error handling and type definitions

**Key Features Delivered:**

- Real-time presence tracking with heartbeat system
- Live cursor rendering with user names and avatars
- Presence list showing online users with status indicators
- Automatic room join/leave with proper cleanup
- React Query integration for state management
- Error handling and connection status indicators
- Performance optimizations with throttling and efficient updates

_Note:_ Firestore lacks `onDisconnect`; we'll use **Firestore heartbeat documents** for presence tracking. Implementation choice lives in `src/lib/sync/presence.ts`.

---

## PR #7 — Object Sync (Create/Update/Delete) with React Query ✅ COMPLETED

**Goal:** Server state for shapes with optimistic UI, conflict policy documented.

**Checklist**

- [x] Define Firestore data model: `canvases/{canvasId}`, `canvases/{canvasId}/objects/{objectId}`.
  - Files: `src/lib/schema.ts`, `src/lib/types.ts`, `src/lib/firebase/firestore.ts`

- [x] Queries & subscriptions for objects (React Query + Firestore snapshot bridge).
  - Files: `src/lib/sync/objects.ts`, `src/hooks/useShapes.ts`

- [x] Mutations for create/move/resize/rotate/delete/duplicate with optimistic updates.
  - Files: `src/hooks/useShapes.ts`, `src/components/CanvasStage.tsx`

- [x] Conflict handling: **last write wins** via `updatedAt` + `updatedBy`.
  - Files: `src/lib/sync/objects.ts`, `src/lib/types.ts`

**PR #7 Implementation Summary:**

- ✅ **Firestore Data Model**: Implemented proper data structure with `canvases/{canvasId}` and `canvases/{canvasId}/objects/{objectId}` subcollections
- ✅ **React Query Integration**: Created `ObjectSyncService` class that bridges React Query with Firestore real-time subscriptions
- ✅ **Optimistic Updates**: All CRUD operations include immediate UI feedback with automatic rollback on errors
- ✅ **Real-time Synchronization**: Objects sync across multiple users in real-time via Firestore `onSnapshot` listeners
- ✅ **Conflict Resolution**: Implemented "last write wins" policy using `updatedAt` and `updatedBy` timestamps
- ✅ **Batch Operations**: Efficient batch create/update/delete operations for multiple shapes
- ✅ **Error Handling**: Comprehensive error handling with user feedback and automatic rollback
- ✅ **Performance**: Debounced updates for smooth dragging and efficient network usage
- ✅ **Type Safety**: Full TypeScript support with proper type definitions and validation

**Key Features Delivered:**

- Real-time object synchronization across multiple users
- Optimistic updates with automatic rollback on errors
- Conflict resolution with timestamp-based "last write wins"
- Batch operations for efficient multi-shape operations
- Comprehensive error handling and user feedback
- Performance optimizations with debouncing
- Full TypeScript type safety and validation

---

## PR #8 — Persistence & Reconnect Handling ✅ COMPLETED

**Goal:** Ensure canvas state persists across refresh/disconnect, fast reconnect.

**Checklist**

- [x] Initial load path: fetch current canvas, then subscribe to live updates.
  - Files: `src/hooks/useShapes.ts`, `src/pages/CanvasPage.tsx`

- [x] Persist canvas-level metadata (viewport, default tool, etc.).
  - Files: `src/lib/firebase/firestore.ts`, `src/lib/types.ts`, `src/components/CanvasStage.tsx`

- [x] Save on navigation/unload and restore on re-entry.
  - Files: `src/components/CanvasStage.tsx`

**PR #8 Implementation Summary:**

- ✅ **Canvas Metadata Persistence**: Implemented `useCanvasMeta` hook for canvas-level metadata management with React Query integration
- ✅ **Viewport Persistence**: Created `useViewportPersistence` hook with debounced saving (500ms) and automatic restoration
- ✅ **Initial Load Path**: Enhanced `useShapes` hook to fetch current canvas state before subscribing to live updates
- ✅ **Canvas Initialization**: Automatic canvas creation if it doesn't exist with default metadata
- ✅ **Navigation/Unload Handling**: Added event listeners for `beforeunload` and `visibilitychange` to save state
- ✅ **Viewport Restoration**: Canvas viewport state is restored from saved metadata on page reload
- ✅ **Error Handling**: Comprehensive error handling for canvas metadata operations with user feedback
- ✅ **Type Safety**: Full TypeScript support with proper type definitions and validation

**Key Features Delivered:**

- Canvas state persists across page refreshes and browser sessions
- Viewport position and zoom level are automatically saved and restored
- Fast reconnect with immediate state restoration
- Automatic canvas initialization for new users
- Debounced viewport saving to prevent excessive network calls
- Navigation and tab visibility change handling for state preservation
- Comprehensive error handling and loading states
- Full integration with existing React Query and Firestore infrastructure

---

## PR #9 — Performance & Hardening ✅ COMPLETED

**Goal:** Hit target latency and FPS; avoid over-rendering.

**Checklist**

- [x] Batch/transaction writes for bursty updates; debounce drag/resize network patches.
  - Files: `src/lib/sync/objects.ts`, `src/hooks/useShapes.ts`

- [x] Throttle cursor broadcasts; interpolate cursor motion locally for smoothness.
  - Files: `src/lib/sync/presence.ts`, `src/hooks/usePresence.ts`, `src/components/CursorLayer.tsx`

- [x] Avoid excessive React re-renders (memoization; Konva refs).
  - Files: `src/components/CanvasStage.tsx`, `src/components/Shapes/*`

- [x] Stress test script (manual playbook) & profiling notes in README.
  - Files: `README.md`

**PR #9 Implementation Summary:**

- ✅ **Batch/Transaction Writes**: Implemented debounced updates (100ms) for drag/resize operations with smart batching for large operations
- ✅ **Cursor Throttling**: Enhanced cursor updates to 50ms intervals with smooth interpolation for 60fps cursor movement
- ✅ **React Memoization**: Memoized all major components (CanvasStage, CursorLayer, Shape components) to prevent unnecessary re-renders
- ✅ **Performance Testing**: Added comprehensive stress test script and profiling documentation in README
- ✅ **Type Safety**: All TypeScript errors resolved and production build successful
- ✅ **Code Quality**: All linting errors fixed and code follows project standards

**Key Performance Features Delivered:**

- Debounced shape updates with optimistic UI for smooth dragging
- Smart batch operations that chunk large updates to prevent Firestore overload
- Cursor interpolation with 60fps animation for smooth multi-user experience
- Memoized React components to minimize re-renders
- Comprehensive performance testing documentation
- Production-ready build with all optimizations

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
