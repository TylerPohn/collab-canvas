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
│  │  ├─ CursorLayer.tsx ✅
│  │  ├─ PresenceList.tsx ✅
│  │  ├─ Toolbar.tsx ✅
│  │  ├─ EmptyCanvasState.tsx ✅
│  │  ├─ TextEditor.tsx ✅
│  │  ├─ Toast.tsx ✅
│  │  ├─ Shapes/ ✅
│  │  │  ├─ RectangleShape.tsx ✅
│  │  │  ├─ CircleShape.tsx ✅
│  │  │  └─ TextShape.tsx ✅
│  │  └─ providers/
│  │     └─ AuthProvider.tsx ✅
│  ├─ contexts/
│  │  ├─ AuthContext.tsx ✅
│  │  ├─ ToastContext.tsx ✅
│  │  └─ ToastContextDefinition.tsx ✅
│  ├─ hooks/
│  │  ├─ useAuth.ts ✅
│  │  ├─ usePanZoom.ts ✅
│  │  ├─ usePresence.ts ✅
│  │  ├─ usePresenceQuery.ts ✅
│  │  ├─ useShapes.ts ✅
│  │  ├─ useCanvasShortcuts.ts ✅
│  │  └─ useToast.ts ✅
│  ├─ lib/
│  │  ├─ firebase/
│  │  │  ├─ client.ts ✅
│  │  │  └─ firestore.ts ✅
│  │  ├─ react-query/
│  │  │  └─ queryClient.ts ✅
│  │  ├─ health.ts ✅
│  │  ├─ schema.ts ✅
│  │  ├─ types.ts ✅
│  │  ├─ sync/ ✅
│  │  │  ├─ objects.ts ✅
│  │  │  └─ presence.ts ✅
│  │  └─ toastTypes.ts ✅
│  ├─ store/ ✅
│  │  └─ selection.ts ✅
│  ├─ App.tsx ✅
│  ├─ main.tsx ✅
│  └─ index.css ✅
├─ public/
│  └─ vite.svg ✅
├─ .env.example ✅
├─ package.json ✅
├─ tsconfig.json ✅
├─ tsconfig.app.json ✅
├─ tsconfig.node.json ✅
├─ vite.config.ts ✅
├─ postcss.config.js ✅
├─ tailwind.config.ts ✅
├─ eslint.config.js ✅
├─ vercel.json ✅
└─ README.md ✅
```

**Legend:** ✅ = Completed and Deployed

**Notes**

- **Vite + React + TypeScript** with React Router for navigation.
- **Tailwind CSS** for styling and responsive design.
- **Konva.js** for canvas rendering (chosen for performance with multiple concurrent users).
- **Firebase (Auth + Firestore)** for sync; **React Query** for server state & optimistic updates.
- **Zustand** for local UI-only state management (selection store).
- **Real-time Collaboration**: Full multiplayer support with presence, cursors, and object synchronization.
- **Deployed**: Publicly accessible on Vercel with Firebase backend.

---

## PR #1 — Project Scaffold & Tooling ✅ COMPLETED

**Goal:** Initialize repo, baseline tooling, styling, and development environment.

**Checklist**

- [x] Create Vite React app (TS) and install deps: `vite react react-dom react-router-dom @tanstack/react-query firebase konva tailwindcss` and utilities.
  - Files: `package.json`, `tsconfig.json`, `vite.config.ts`

- [x] Configure Tailwind and global styles.
  - Files: `tailwind.config.ts`, `postcss.config.js`, `src/index.css`

- [x] Add React Query provider and base app shell with React Router.
  - Files: `src/lib/react-query/queryClient.ts`, `src/App.tsx`, `src/main.tsx`

- [x] Add health check utility for monitoring.
  - Files: `src/lib/health.ts`

- [x] Add ESLint/Prettier configs and scripts for development.
  - Files: `eslint.config.js`, `prettier` configuration

- [x] Add `README.md` and `.env.example`.

---

## PR #2 — Firebase Integration (Auth + Firestore) ✅ COMPLETED

**Goal:** Initialize Firebase client, env wiring, and comprehensive Firestore helpers.

**Checklist**

- [x] Configure Firebase client initialization with environment validation.
  - Files: `lib/firebase/client.ts`

- [x] Create comprehensive Firestore helpers for collections (canvas, objects, presence).
  - Files: `lib/firebase/firestore.ts`

- [x] Define app-wide types and schemas with full TypeScript support.
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

## PR #10 — Deployment, Env, and Polishing ✅ COMPLETED

**Goal:** Public deploy + environment configuration + UI polish for production.

**Checklist**

- [x] Hook up Vercel project; configure Firebase env vars.
  - Files: `README.md`, `.env.example`, `vercel.json`, Vercel project settings

- [x] Verify client-side Firebase usage and environment configuration.
  - Files: `src/lib/firebase/client.ts`, environment setup

- [x] Final UI polish (empty states, loading spinners, error toasts).
  - Files: `src/pages/CanvasPage.tsx`, `src/components/*`

- [x] Add comprehensive deployment documentation and setup guides.
  - Files: `README.md`

**PR #10 Implementation Summary:**

- ✅ **Environment Variables**: Created comprehensive `.env.example` with all required Firebase configuration variables
- ✅ **Vercel Configuration**: Added `vercel.json` with proper build settings, routing, and environment variable mapping
- ✅ **Deployment Documentation**: Updated README with detailed Vercel deployment instructions, environment setup, and Firebase production configuration
- ✅ **Environment Variable Validation**: Verified Firebase client properly validates all required environment variables
- ✅ **Production Setup Guide**: Added comprehensive guide for Firebase production setup including authentication, Firestore, and security rules
- ✅ **Build Configuration**: Configured Vercel for optimal Vite build with proper caching and routing

**Key Features Delivered:**

- Complete environment variable documentation and examples
- Vercel deployment configuration with proper routing and caching
- Step-by-step deployment guide for Vercel
- Firebase production setup instructions
- Environment variable validation and error handling
- Production-ready build configuration

---

## PR #11 — Modern UI with shadcn/ui (Complete UI Overhaul) 🚧 PLANNED

**Goal:** Implement shadcn/ui components with Radix + Tailwind and lucide-react icons for a professional, modern UI across the entire application.

### Phase 1: Setup and Foundation

- [x] **Step 1.1**: Install and configure shadcn/ui with Radix primitives and Tailwind CSS.
  - Files: `package.json`, `components.json`, `tailwind.config.ts`
  - Run: `npx shadcn@latest init`

- [x] **Step 1.2**: Install lucide-react for consistent iconography.
  - Files: `package.json`
  - Run: `npm install lucide-react`

- [x] **Step 1.3**: Install core shadcn/ui components needed for the overhaul.
  - Files: `src/components/ui/` (auto-generated)
  - Run: `npx shadcn@latest add button card input label separator tooltip`

### Phase 2: Homepage Redesign ✅ COMPLETED

- [x] **Step 2.1**: Create modern hero section with shadcn/ui Card component.
  - Files: `src/App.tsx` (LandingPage component)
  - Replace basic div with Card, CardHeader, CardContent
  - **COMPLETED**: Implemented modern hero section with gradient background, large typography, and professional layout

- [x] **Step 2.2**: Add feature showcase with icon grid using lucide-react.
  - Files: `src/App.tsx` (LandingPage component)
  - Use icons: Users, Zap, Palette, Shield, Globe, Heart
  - **COMPLETED**: Created 6-feature grid with centered layout, lucide-react icons, and hover effects

- [x] **Step 2.3**: Implement call-to-action buttons with proper styling.
  - Files: `src/App.tsx` (LandingPage component)
  - Use Button component with variants (default, outline, ghost)
  - **COMPLETED**: Implemented properly sized CTA buttons with no underlines, modern styling, and hover effects

- [x] **Step 2.4**: Add responsive layout with proper spacing and typography.
  - Files: `src/App.tsx` (LandingPage component)
  - Use Tailwind responsive classes (sm:, md:, lg:)
  - **COMPLETED**: Added responsive design with proper spacing, modern typography (Inter font), and mobile-first approach

**Additional Improvements Made:**

- [x] **Modern Design System**: Updated color palette with softer grays and modern primary colors
- [x] **Enhanced Typography**: Implemented Inter font family with proper weights and spacing
- [x] **Visual Polish**: Added subtle shadows, gradients, and backdrop blur effects
- [x] **Header Modernization**: Added translucency and blur effects for app-like feel
- [x] **Feature Card Redesign**: Changed from left-aligned to centered layout with better icon presentation
- [x] **Button Optimization**: Fine-tuned button sizing and removed underlines for professional appearance

### Phase 3: Login Page Redesign ✅ COMPLETED

- [x] **Step 3.1**: Create centered login card with shadcn/ui Card component.
  - Files: `src/pages/LoginPage.tsx`
  - Replace basic form with Card, CardHeader, CardContent, CardFooter
  - **COMPLETED**: Implemented modern card-based layout with proper shadcn/ui components

- [x] **Step 3.2**: Add Google OAuth button with proper styling and Google icon.
  - Files: `src/pages/LoginPage.tsx`
  - Use Button component with Google branding colors
  - **COMPLETED**: Used shadcn/ui Button component with Google icon and proper styling

- [x] **Step 3.3**: Implement loading states with shadcn/ui components.
  - Files: `src/pages/LoginPage.tsx`
  - Add loading spinner and disabled states
  - **COMPLETED**: Implemented loading states with Loader2 icon and proper disabled button states

- [x] **Step 3.4**: Add error handling with proper visual feedback.
  - Files: `src/pages/LoginPage.tsx`
  - Use Alert component for error messages
  - **COMPLETED**: Added Alert component with destructive variant for error messages

**Additional Improvements Made:**

- [x] **Modern Design System**: Updated to use design system colors (background, foreground, muted-foreground)
- [x] **Enhanced Loading State**: Loading state now uses Card component for consistency
- [x] **Professional Layout**: Centered card layout with proper spacing and typography
- [x] **Accessibility**: Proper ARIA labels and semantic HTML structure
- [x] **Responsive Design**: Mobile-first approach with proper responsive classes

### Phase 4: Toolbar Redesign ✅ COMPLETED

- [x] **Step 4.1**: Create modern toolbar component with shadcn/ui components.
  - Files: `src/components/Toolbar.tsx` (refactor existing)
  - Use Button components with proper variants
  - **COMPLETED**: Replaced custom buttons with shadcn/ui Button components using proper variants (default, ghost)

- [x] **Step 4.2**: Implement tool selection with proper visual states and hover effects.
  - Files: `src/components/Toolbar.tsx`, `src/components/ui/button.tsx`
  - Add active states and hover effects
  - **COMPLETED**: Implemented proper visual states with default variant for selected tools and ghost variant for unselected tools

- [x] **Step 4.3**: Add tool groups and separators for better organization.
  - Files: `src/components/Toolbar.tsx`, `src/components/ui/separator.tsx`
  - Group related tools with visual separators
  - **COMPLETED**: Added tool groups with labels ("Tools" and "Actions") and vertical separators for better organization

- [x] **Step 4.4**: Implement keyboard shortcuts display and tooltips.
  - Files: `src/components/Toolbar.tsx`, `src/components/ui/tooltip.tsx`
  - Add tooltips showing keyboard shortcuts
  - **COMPLETED**: Added comprehensive tooltips showing tool names and keyboard shortcuts for all tools

**Additional Improvements Made:**

- [x] **Modern Icons**: Replaced emoji icons with professional lucide-react icons (MousePointer2, Hand, Square, Circle, Type, Copy, Trash2, Info)
- [x] **Compact Design**: Changed to icon-only buttons (9x9) for a cleaner, more professional look
- [x] **Enhanced Tooltips**: Added keyboard shortcuts display in tooltips (V, H, R, C, T, ⌘D, Del)
- [x] **Better Organization**: Grouped tools logically with "Tools" and "Actions" sections
- [x] **Responsive Design**: Added responsive labels that show on larger screens
- [x] **Improved Info Panel**: Enhanced tool info display with icon and better styling
- [x] **Design System Integration**: Used design system colors and spacing consistently

### Phase 5: Component Updates ✅ COMPLETED

- [x] **Step 5.1**: Update ProfileMenu with shadcn/ui components.
  - Files: `src/components/ProfileMenu.tsx`
  - Use DropdownMenu, Avatar, Button components
  - **COMPLETED**: Replaced custom dropdown with shadcn/ui DropdownMenu, Avatar, and Button components

- [x] **Step 5.2**: Update PresenceList with modern styling.
  - Files: `src/components/PresenceList.tsx`
  - Use Badge, Avatar, Card components
  - **COMPLETED**: Modernized with Card, Badge, and Avatar components for professional appearance

- [x] **Step 5.3**: Add responsive design for mobile and tablet views.
  - Files: `src/components/Toolbar.tsx`, `src/pages/LoginPage.tsx`, `src/App.tsx`
  - Implement mobile-first responsive design
  - **COMPLETED**: All components now use responsive design with proper mobile/tablet breakpoints

- [ ] **Step 5.4**: Add dark mode support (optional enhancement).
  - Files: `tailwind.config.ts`, `src/components/` (various)
  - Implement dark mode toggle and theme switching
  - **SKIPPED**: Dark mode support is optional and not implemented in this phase

**Additional Improvements Made:**

- [x] **Modern ProfileMenu**: Clean dropdown with proper avatar handling and logout functionality
- [x] **Enhanced PresenceList**: Professional card-based design with user avatars and online indicators
- [x] **Better Avatar Handling**: Proper fallbacks and initials generation for both components
- [x] **Consistent Design**: All components now use the design system consistently
- [x] **Improved UX**: Better visual hierarchy and user feedback throughout

**PR #11 Implementation Plan:**

- **Complete UI Overhaul**: Modernize entire application with shadcn/ui
- **Homepage Redesign**: Professional landing page with hero section and features
- **Login Page Redesign**: Modern authentication experience with proper styling
- **Toolbar Redesign**: Figma-like toolbar with proper tool grouping
- **Component Library**: Build reusable UI components using Radix primitives
- **Responsive Design**: Mobile-first design for all screen sizes
- **Accessibility**: Implement proper ARIA labels and keyboard navigation
- **Visual Polish**: Consistent design system with hover states and animations

**Key Features to Deliver:**

- **Homepage**: Professional hero section, feature showcase, call-to-action
- **Login Page**: Modern card-based design, Google OAuth styling, error handling
- **Toolbar**: Figma-like design with tool grouping, shortcuts, and tooltips
- **Components**: Consistent iconography with lucide-react
- **Responsive**: Mobile-first design for all devices
- **Accessibility**: Enhanced keyboard navigation and ARIA support
- **Design System**: Unified visual language across the application

**Junior Developer Guidance:**

Each step is designed to be:

- **Small and focused**: One component or feature at a time
- **Well-documented**: Clear file paths and specific instructions
- **Testable**: Each step can be tested independently
- **Incremental**: Build upon previous steps without breaking existing functionality
- **Educational**: Learn shadcn/ui, Radix, and modern React patterns

---

## PR #12 — Design Palette Panel (Right Sidebar) ✅ COMPLETED

**Goal:** Implement a comprehensive design palette panel on the right side of the canvas for shape styling, layer management, and design controls.

### Phase 1: Panel Structure and Layout ✅ COMPLETED

- [x] **Step 1.1**: Create DesignPalette component with shadcn/ui Card layout.
  - Files: `src/components/DesignPalette.tsx` (new file)
  - **COMPLETED**: Modern card-based layout with proper shadcn/ui components
  - **COMPLETED**: Fixed right sidebar positioning (320px width)
  - **COMPLETED**: Black border with rounded edges (12px border radius)

- [x] **Step 1.2**: Add panel toggle functionality and responsive behavior.
  - Files: `src/components/DesignPalette.tsx`, `src/pages/CanvasPage.tsx`
  - **COMPLETED**: Toggle button in toolbar with PanelLeft icon
  - **COMPLETED**: Responsive behavior with proper mobile breakpoints
  - **COMPLETED**: Panel visibility state management

- [x] **Step 1.3**: Create collapsible sections for different design categories.
  - Files: `src/components/DesignPalette.tsx`
  - **COMPLETED**: Collapsible sections: "Fill & Stroke", "Effects", "Layer", "Text"
  - **COMPLETED**: ChevronDown icons and proper spacing
  - **COMPLETED**: Clean section organization with proper visual hierarchy

### Phase 2: Fill and Stroke Controls ✅ COMPLETED

- [x] **Step 2.1**: Implement color picker for fill color with preset swatches.
  - Files: `src/components/DesignPalette.tsx`
  - **COMPLETED**: Added 12 color preset swatches with circular design
  - **COMPLETED**: Main color preview with click-to-toggle functionality
  - **COMPLETED**: Clean circular swatches without borders or shadows

- [x] **Step 2.2**: Add stroke color and width controls.
  - Files: `src/components/DesignPalette.tsx`
  - **COMPLETED**: Stroke color picker with 12 preset swatches
  - **COMPLETED**: Stroke width slider control (0-10px) with precise adjustment
  - **COMPLETED**: Enhanced slider with larger thumb (h-8 w-8) and thicker track (h-4)
  - **COMPLETED**: Connected to shape properties with real-time updates

- [ ] **Step 2.3**: Implement opacity slider for fill and stroke.
  - Files: `src/components/DesignPalette.tsx`
  - Use Slider component (0-100%)
  - Separate controls for fill opacity and stroke opacity
  - Show percentage value next to slider

### Phase 3: Shape Effects and Transformations ✅ COMPLETED

- [x] **Step 3.1**: Add rotation control with visual indicator.
  - Files: `src/components/DesignPalette.tsx`
  - **COMPLETED**: Rotation slider with visual progress indicator
  - **COMPLETED**: Reset to 0° button with RotateCcw icon
  - **COMPLETED**: Rotation preset buttons (0°, 90°, 180°, 270°)
  - **COMPLETED**: Real-time rotation updates to selected shapes

- [x] **Step 3.2**: Implement corner radius control for rectangles.
  - Files: `src/components/DesignPalette.tsx`
  - **COMPLETED**: Corner radius slider control (0-100px) with precise adjustment
  - **COMPLETED**: Always visible when shapes are selected (with helpful "rectangles only" note)
  - **COMPLETED**: Enhanced slider with larger thumb (h-8 w-8) and thicker track (h-4)
  - **COMPLETED**: Connected to RectangleShape component
  - **COMPLETED**: Real-time corner radius updates

- [ ] **Step 3.3**: Add shadow and blur effects controls.
  - Files: `src/components/DesignPalette.tsx`
  - Toggle for drop shadow on/off
  - Controls for shadow offset, blur, and color
  - Toggle for blur effect with intensity slider

### Phase 4: Layer Management ✅ COMPLETED

- [x] **Step 4.1**: Implement bring forward/backward controls.
  - Files: `src/components/DesignPalette.tsx`
  - **COMPLETED**: "Bring Forward" and "Send Backward" buttons
  - **COMPLETED**: Connected to zIndex-based layer management system
  - **COMPLETED**: Buttons disabled when no shapes selected
  - **COMPLETED**: Real-time layer reordering with proper zIndex calculation

- [ ] **Step 4.2**: Add layer list with drag-and-drop reordering.
  - Files: `src/components/DesignPalette.tsx`
  - List all shapes in current canvas with thumbnails
  - Drag-and-drop to reorder layers
  - Show selected shapes highlighted
  - Click to select shape from layer list

- [ ] **Step 4.3**: Implement layer visibility and lock controls.
  - Files: `src/components/DesignPalette.tsx`
  - Eye icon toggle for visibility
  - Lock icon toggle for editing protection
  - Show layer names and types

### Phase 5: Text Styling (for Text Shapes) ✅ COMPLETED

- [x] **Step 5.1**: Add font family selector with common fonts.
  - Files: `src/components/DesignPalette.tsx`
  - **COMPLETED**: Dropdown with 12 web-safe fonts (Arial, Helvetica, Times New Roman, Georgia, etc.)
  - **COMPLETED**: Font preview in dropdown options
  - **COMPLETED**: Connected to shape fontFamily property

- [x] **Step 5.2**: Implement font size, weight, and style controls.
  - Files: `src/components/DesignPalette.tsx`
  - **COMPLETED**: Font size controls with +/- buttons (8-72px)
  - **COMPLETED**: Bold, Italic, Underline toggle buttons with lucide-react icons
  - **COMPLETED**: Connected to shape fontWeight, fontStyle, and textDecoration properties
  - **COMPLETED**: Real-time text styling updates

- [ ] **Step 5.3**: Add text spacing controls.
  - Files: `src/components/DesignPalette.tsx`
  - Number inputs for line height and letter spacing
  - Text spacing controls for better typography

### Phase 6: State Management and Integration ✅ COMPLETED

- [x] **Step 6.1**: Create design palette state management with Zustand.
  - Files: `src/store/designPalette.ts` (new file)
  - **COMPLETED**: Integrated with existing selection store
  - **COMPLETED**: Real-time state synchronization with selected shapes
  - **COMPLETED**: Proper state management for all palette controls

- [x] **Step 6.2**: Integrate palette with shape selection and updates.
  - Files: `src/components/DesignPalette.tsx`, `src/components/CanvasStage.tsx`
  - **COMPLETED**: Palette updates when shapes are selected
  - **COMPLETED**: Palette changes apply to selected shapes in real-time
  - **COMPLETED**: Multi-selection support for all controls

- [x] **Step 6.3**: Implement default settings for new shapes.
  - Files: `src/store/designPalette.ts`, `src/components/CanvasStage.tsx`
  - **COMPLETED**: New shapes get proper default properties (zIndex, font properties, etc.)
  - **COMPLETED**: Palette resets to defaults when no shapes selected
  - **COMPLETED**: Consistent property initialization across all shape types

### Phase 7: Advanced Features and Polish ✅ COMPLETED

- [x] **Step 7.1**: Add preset style templates and quick styles.
  - Files: `src/components/DesignPalette.tsx`
  - **COMPLETED**: 12 color preset swatches for quick color selection
  - **COMPLETED**: Rotation preset buttons (0°, 90°, 180°, 270°)
  - **COMPLETED**: Quick style application for common design patterns

- [x] **Step 7.2**: Implement copy/paste styles between shapes.
  - Files: `src/components/DesignPalette.tsx`
  - **COMPLETED**: "Copy Style" and "Paste Style" buttons with Copy and Clipboard icons
  - **COMPLETED**: Style clipboard state management
  - **COMPLETED**: Copy/paste functionality for all shape properties

- [x] **Step 7.3**: Add keyboard shortcuts for common palette actions.
  - Files: `src/hooks/useCanvasShortcuts.ts`
  - **COMPLETED**: Ctrl/Cmd+C for copy style, Ctrl/Cmd+V for paste style
  - **COMPLETED**: Arrow keys for bring forward/backward (Up/Down arrows)
  - **COMPLETED**: Number keys for quick color selection (1-9, 0, -, =)

- [x] **Step 7.4**: Add responsive design and mobile optimization.
  - Files: `src/components/DesignPalette.tsx`
  - **COMPLETED**: Responsive design with proper mobile breakpoints
  - **COMPLETED**: Touch-friendly controls with appropriate sizing
  - **COMPLETED**: Mobile-optimized layout and spacing

**PR #12 Implementation Summary:**

- ✅ **Design Palette Panel**: Comprehensive right sidebar for shape styling with modern UI
- ✅ **Fill & Stroke Controls**: Color pickers with 12 preset swatches, stroke width controls
- ✅ **Layer Management**: Bring forward/backward controls with zIndex-based system
- ✅ **Text Styling**: Font family, size, weight, style controls for text shapes
- ✅ **State Management**: Integrated with existing selection store for real-time updates
- ✅ **Advanced Features**: Style presets, copy/paste functionality, keyboard shortcuts
- ✅ **Responsive Design**: Mobile-optimized with proper breakpoints and touch-friendly controls

**Key Features Delivered:**

- ✅ **Right Sidebar Panel**: Fixed 320px width with black border and rounded edges
- ✅ **Fill & Stroke**: 12 color preset swatches, stroke width slider (0-10px), corner radius slider (0-100px)
- ✅ **Enhanced Sliders**: Larger thumbs (32px) and thicker tracks (16px) for better usability
- ✅ **Layer Controls**: Bring forward/backward with proper zIndex management
- ✅ **Text Styling**: Font family dropdown, size controls, Bold/Italic/Underline toggles
- ✅ **Default Settings**: Proper property initialization for new shapes
- ✅ **Style Presets**: Color swatches and rotation presets for quick styling
- ✅ **Copy/Paste Styles**: Full style transfer between shapes with clipboard state
- ✅ **Keyboard Shortcuts**: Copy/paste styles, layer management, quick color selection
- ✅ **Responsive Design**: Mobile-friendly with touch-optimized controls
- ✅ **Font Defaults**: New text objects automatically use current design palette settings
- ✅ **Real-Time Text Editing**: Inline editor shows current styling as you type

**Additional Improvements Made Today:**

- ✅ **Slider UX Enhancements**: Replaced +/- buttons with smooth sliders for stroke width and corner radius
- ✅ **Corner Radius Visibility**: Made corner radius section always visible (not just for rectangles) with helpful labeling
- ✅ **Slider Component Updates**: Enhanced shadcn/ui slider with larger thumbs and thicker tracks
- ✅ **Font Defaults System**: Created design palette store to apply current font settings to new text objects
- ✅ **Inline Text Editor Styling**: Real-time application of design palette settings during text editing
- ✅ **TypeScript Error Fixes**: Resolved unused parameter warnings in shape components
- ✅ **Build Optimization**: All changes compile successfully with no errors
- ✅ **Slider Performance**: Added debouncing (100ms) to prevent lag during fast slider dragging
- ✅ **Stroke Width Zero Fix**: Fixed critical bug where stroke width slider jumped to 2px when trying to set 0px

**Advanced Features Implemented:**

- ✅ **Design Palette Store**: Zustand-based state management for design settings persistence
- ✅ **Default Properties System**: New shapes automatically inherit current design palette settings
- ✅ **Real-Time Text Editing**: Inline text editor shows current styling as you type
- ✅ **Cross-Component Integration**: Design palette, canvas stage, and text editor work seamlessly together
- ✅ **Type-Safe Font Properties**: Full TypeScript support for all font styling properties
- ✅ **Robust Value Handling**: Fixed nullish coalescing operators to properly handle zero values in numeric properties

**Junior Developer Guidance:**

Each step is designed to be:

- **Component-focused**: One UI section or feature at a time
- **State-driven**: Clear separation between UI and state management
- **Incremental**: Build upon existing shape system without breaking functionality
- **Testable**: Each control can be tested independently
- **Educational**: Learn advanced React patterns, state management, and UI design

---

## PR #13 — Section 1: Core Collaborative Infrastructure (30 points)

**Goal:** Enhance real-time synchronization, conflict resolution, and persistence to achieve excellent rubric scores.

### Real-Time Synchronization (12 points) - Target: Excellent (11-12 points)

**Current Status:** Good (9-10 points) - Consistent sync under 150ms, occasional minor delays with heavy load

**Steps to Achieve Excellent:**

- [ ] **Step 13.1**: Optimize sync latency to sub-100ms for object changes.
  - Files: `src/lib/sync/objects.ts`, `src/hooks/useShapes.ts`
  - Reduce debounce from 100ms to 50ms for critical operations
  - Implement priority-based sync (immediate for create/delete, debounced for move/resize)
  - **Test**: Measure sync latency with browser dev tools during rapid edits

- [ ] **Step 13.2**: Achieve sub-50ms cursor sync with interpolation.
  - Files: `src/lib/sync/presence.ts`, `src/components/CursorLayer.tsx`
  - Reduce cursor throttling from 50ms to 25ms
  - Implement client-side cursor interpolation for smooth movement
  - **Test**: Verify cursor lag is imperceptible during rapid movement

- [ ] **Step 13.3**: Eliminate visible lag during rapid multi-user edits.
  - Files: `src/lib/sync/objects.ts`, `src/hooks/useShapes.ts`
  - Implement optimistic updates with immediate visual feedback
  - Add conflict resolution indicators for simultaneous edits
  - **Test**: Two users rapidly editing same object simultaneously

### Conflict Resolution & State Management (9 points) - Target: Excellent (8-9 points)

**Current Status:** Good (6-7 points) - Simultaneous edits resolve correctly 90%+ of time, strategy documented

**Steps to Achieve Excellent:**

- [ ] **Step 13.4**: Implement object lock mechanism for conflict resolution.
  - Files: `src/lib/types.ts`, `src/lib/sync/locks.ts` (new file), `src/store/selection.ts`
  - Add ObjectLock interface with lockedBy, lockedByDisplayName, lockedAt, expiresAt fields
  - Create LockService class with methods: acquireLock, releaseLock, isLocked, getLockInfo
  - Store locks in Firestore subcollection: `canvases/{canvasId}/locks/{objectId}`
  - Update selection store to track locked objects and prevent selection of locked objects
  - Implement lock expiration (5 minutes) and automatic cleanup
  - **Test**: Two users try to select same object - one gets lock, other sees lock indicator

- [ ] **Step 13.5**: Add visual lock indicators and user feedback.
  - Files: `src/components/CanvasStage.tsx`, `src/components/Shapes/*.tsx`, `src/components/LockIndicator.tsx` (new file)
  - Create LockIndicator component showing lock icon and user name
  - Show lock indicator overlay on locked objects with user avatar and name
  - Disable editing for locked objects (except for lock owner) - disable transform handles
  - Add visual feedback when trying to edit locked object (toast notification)
  - Implement lock status in shape components (RectangleShape, CircleShape, TextShape)
  - **Test**: Verify lock indicators appear and editing is properly restricted

- [ ] **Step 13.6**: Implement comprehensive conflict resolution testing.
  - Files: `src/lib/sync/objects.ts`, `src/lib/types.ts`
  - Add conflict resolution logging and metrics
  - Implement visual feedback for conflict resolution
  - **Test**: Simultaneous move, rapid edit storm, delete vs edit, create collision scenarios

- [ ] **Step 13.7**: Enhance conflict resolution strategy documentation.
  - Files: `docs/conflict-resolution.md` (new file)
  - Document last-write-wins implementation with examples
  - Add conflict resolution flow diagrams including lock mechanism
  - **Test**: Verify documentation covers all edge cases including locks

- [ ] **Step 13.8**: Implement conflict resolution visual feedback.
  - Files: `src/components/CanvasStage.tsx`, `src/components/Toast.tsx`
  - Show brief visual indicator when conflicts are resolved
  - Add toast notification for significant conflicts and lock acquisitions
  - **Test**: Visual feedback appears during simultaneous edits and lock operations

### Persistence & Reconnection (9 points) - Target: Excellent (8-9 points)

**Current Status:** Good (6-7 points) - Refresh preserves 95%+ of state, reconnection works but may lose last 1-2 operations

**Steps to Achieve Excellent:**

- [ ] **Step 13.9**: Implement operation queuing during disconnect.
  - Files: `src/lib/sync/objects.ts`, `src/hooks/useShapes.ts`
  - Queue operations when offline and sync on reconnect
  - Implement retry logic for failed operations
  - Handle lock expiration during disconnect
  - **Test**: Disconnect network, make edits, reconnect - verify all operations sync

- [ ] **Step 13.10**: Add comprehensive connection status indicators.
  - Files: `src/components/CanvasStage.tsx`, `src/hooks/usePresence.ts`
  - Show connection status in UI (connected/disconnected/reconnecting)
  - Add visual indicators for sync status and lock status
  - **Test**: Network throttling to verify status indicators work

- [ ] **Step 13.11**: Implement robust reconnection with complete state restoration.
  - Files: `src/lib/sync/objects.ts`, `src/hooks/useShapes.ts`
  - Ensure 100% state preservation on refresh
  - Implement incremental sync for large canvases
  - Handle lock restoration and cleanup on reconnect
  - **Test**: Refresh mid-edit, total disconnect scenarios, network simulation

**Testing Scenarios for PR #13:**

1. **Object Lock Acquisition**: User A selects object, User B tries to select same object - User B sees lock indicator
2. **Race Condition Test**: User A and User B click same object simultaneously - only one gets lock, other sees immediate feedback
3. **Lock Expiration**: User A locks object, goes offline, lock expires, User B can now edit
4. **Simultaneous Move**: Two users drag same rectangle simultaneously (with lock mechanism)
5. **Rapid Edit Storm**: User A resizes while User B changes color while User C moves (with locks)
6. **Delete vs Edit**: User A deletes object while User B is editing it (lock prevents deletion)
7. **Create Collision**: Two users create objects at nearly identical timestamps
8. **Mid-Operation Refresh**: User drags object, refreshes browser mid-drag
9. **Total Disconnect**: All users close browsers, wait 2 minutes, return
10. **Network Simulation**: Throttle network to 0 for 30 seconds, restore
11. **Lock Visual Feedback**: Verify lock indicators show user name and prevent editing

**Object Lock Mechanism Implementation Details:**

The object lock system will prevent conflicts by ensuring only one user can edit an object at a time:

1. **Lock Acquisition**: When a user selects an object, attempt to acquire a lock
2. **Lock Storage**: Store locks in Firestore as `canvases/{canvasId}/locks/{objectId}`
3. **Lock Expiration**: Locks expire after 5 minutes to prevent permanent locks
4. **Visual Feedback**: Show lock indicator with user name and avatar on locked objects
5. **Edit Prevention**: Disable transform handles and editing for locked objects (except owner)
6. **Lock Release**: Automatically release locks when user deselects or leaves canvas
7. **Conflict Resolution**: If lock acquisition fails, show toast notification and prevent selection

**Race Condition Handling (Multiple Users Locking Simultaneously):**

When multiple users attempt to lock the same object at nearly the same time:

1. **Atomic Lock Operations**: Use Firestore transactions to ensure atomic lock acquisition
2. **First-Write-Wins**: The first user to successfully write the lock document wins
3. **Immediate Feedback**: Failed lock attempts receive immediate feedback (toast notification)
4. **Optimistic UI**: Show temporary "acquiring lock" state while lock request is in flight
5. **Lock Status Subscription**: All users subscribe to lock changes and update UI immediately
6. **Graceful Degradation**: If lock acquisition fails, user can still view the object but cannot edit

**Lock Acquisition Flow:**

```
User A clicks object → Optimistic UI shows "acquiring lock" → Firestore transaction attempts lock
User B clicks same object → Optimistic UI shows "acquiring lock" → Firestore transaction attempts lock

Result: Only one transaction succeeds (first-write-wins)
- Winner: Gets lock, UI shows "locked by you"
- Loser: Gets failure response, UI shows "locked by [User A]" with lock indicator
```

**Lock Service API:**

```typescript
interface LockService {
  acquireLock(
    canvasId: string,
    objectId: string,
    userId: string
  ): Promise<LockResult>
  releaseLock(canvasId: string, objectId: string, userId: string): Promise<void>
  isLocked(canvasId: string, objectId: string): Promise<boolean>
  getLockInfo(canvasId: string, objectId: string): Promise<ObjectLock | null>
  subscribeToLocks(
    canvasId: string,
    callback: (locks: ObjectLock[]) => void
  ): () => void
}

interface LockResult {
  success: boolean
  lock?: ObjectLock
  error?: 'ALREADY_LOCKED' | 'TRANSACTION_FAILED' | 'NETWORK_ERROR'
  lockedBy?: string
}
```

**Firestore Transaction Implementation:**

```typescript
async acquireLock(canvasId: string, objectId: string, userId: string): Promise<LockResult> {
  const lockRef = doc(db, 'canvases', canvasId, 'locks', objectId)

  return await runTransaction(db, async (transaction) => {
    const lockDoc = await transaction.get(lockRef)

    if (lockDoc.exists()) {
      const existingLock = lockDoc.data() as ObjectLock
      // Check if lock is expired
      if (existingLock.expiresAt > Date.now()) {
        return {
          success: false,
          error: 'ALREADY_LOCKED',
          lockedBy: existingLock.lockedByDisplayName
        }
      }
    }

    // Create new lock
    const newLock: ObjectLock = {
      objectId,
      lockedBy: userId,
      lockedByDisplayName: getCurrentUser().displayName,
      lockedAt: Date.now(),
      expiresAt: Date.now() + (5 * 60 * 1000) // 5 minutes
    }

    transaction.set(lockRef, newLock)
    return { success: true, lock: newLock }
  })
}
```

---

## PR #14 — Section 2: Canvas Features & Performance (20 points)

**Goal:** Enhance canvas functionality and achieve excellent performance scores.

### Canvas Functionality (8 points) - Target: Excellent (7-8 points)

**Current Status:** Good (5-6 points) - All basic requirements met, 2+ shapes, transforms work well

**Steps to Achieve Excellent:**

- [ ] **Step 14.1**: Add shift-click for multi-select (drag-to-select marquee already implemented).
  - Files: `src/components/CanvasStage.tsx`, `src/store/selection.ts`
  - Implement shift-click functionality for adding objects to selection
  - Ensure shift-click works with existing drag-to-select marquee
  - **Test**: Select multiple objects with shift-click and verify it works with marquee selection

- [ ] **Step 14.2**: Add visual layer position indicators to design palette.
  - Files: `src/components/DesignPalette.tsx`, `src/store/designPalette.ts`
  - Add layer position display showing "Layer X of Y" when objects are selected
  - Show visual indicators for bring forward/backward button states (enabled/disabled)
  - Add layer depth information in the Layer section of the palette
  - Implement real-time updates when layer order changes
  - **Test**: Select objects and verify layer position indicators appear in palette

- [ ] **Step 14.3**: Enhance text formatting capabilities.
  - Files: `src/components/Shapes/TextShape.tsx`, `src/components/DesignPalette.tsx`
  - Add text alignment options (left, center, right)
  - Implement text wrapping and line height controls
  - **Test**: Format text with various alignment and spacing options

### Performance & Scalability (12 points) - Target: Excellent (11-12 points)

**Current Status:** Good (9-10 points) - Consistent performance with 300+ objects, handles 4-5 users

**Steps to Achieve Excellent:**

- [ ] **Step 14.4**: Optimize for 500+ objects with consistent performance.
  - Files: `src/components/CanvasStage.tsx`, `src/lib/sync/objects.ts`
  - Implement object culling for off-screen shapes
  - Add performance monitoring and metrics
  - **Test**: Create 500+ shapes and verify 60fps maintained

- [ ] **Step 14.5**: Support 5+ concurrent users without degradation.
  - Files: `src/lib/sync/presence.ts`, `src/lib/sync/objects.ts`
  - Optimize presence updates for multiple users
  - Implement user-specific update batching
  - **Test**: 5+ users simultaneously editing canvas

- [ ] **Step 14.6**: Implement performance monitoring and optimization.
  - Files: `src/lib/performance.ts` (new file), `src/components/CanvasStage.tsx`
  - Add FPS monitoring and performance metrics
  - Implement automatic performance degradation handling
  - **Test**: Monitor performance during stress testing

**Layer Position Indicator Implementation Details:**

The layer position indicators will provide clear visual feedback about object layering:

1. **Layer Position Display**: Show "Layer X of Y" where X is current position and Y is total layers
2. **Button State Indicators**: Visual feedback for bring forward/backward buttons
   - Disabled state when object is already at front/back
   - Enabled state when movement is possible
3. **Real-time Updates**: Position indicators update immediately when layer order changes
4. **Multi-selection Handling**: Show layer info for multiple selected objects

**Implementation Example:**

```typescript
// In DesignPalette.tsx
const LayerSection = () => {
  const { selectedIds, shapes } = useSelectionStore()
  const selectedShapes = shapes.filter(shape => selectedIds.includes(shape.id))

  const getLayerInfo = () => {
    if (selectedShapes.length === 0) return null
    if (selectedShapes.length === 1) {
      const shape = selectedShapes[0]
      const allShapes = Object.values(shapes).sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))
      const position = allShapes.findIndex(s => s.id === shape.id) + 1
      return `Layer ${position} of ${allShapes.length}`
    }
    return `${selectedShapes.length} objects selected`
  }

  return (
    <div className="layer-section">
      <div className="layer-info">{getLayerInfo()}</div>
      <Button disabled={isAtFront}>Bring Forward</Button>
      <Button disabled={isAtBack}>Send Backward</Button>
    </div>
  )
}
```

**Performance Testing for PR #14:**

1. **Object Load Test**: Create 500+ shapes and verify 60fps
2. **Multi-User Test**: 5+ users simultaneously editing
3. **Stress Test**: Rapid shape creation, movement, and deletion
4. **Memory Test**: Monitor memory usage during extended sessions

---

## PR #15 — Section 3: Advanced Figma-Inspired Features (15 points)

**Goal:** Implement advanced features to achieve excellent rubric scores.

### Tier 1 Features (2 points each, max 3 features = 6 points)

**Current Status:** Some features implemented, need to complete and add more

**Steps to Achieve Excellent:**

- [ ] **Step 15.1**: Implement comprehensive undo/redo system.
  - Files: `src/hooks/useUndoRedo.ts` (new file), `src/hooks/useCanvasShortcuts.ts`
  - Add keyboard shortcuts (Cmd+Z/Cmd+Shift+Z)
  - Implement command pattern for undo/redo operations
  - **Test**: Undo/redo various operations (create, move, resize, delete)

- [ ] **Step 15.2**: Add Command+D keyboard shortcut for duplicate.
  - Files: `src/hooks/useCanvasShortcuts.ts`, `src/components/CanvasStage.tsx`
  - Implement Command+D (Mac) / Ctrl+D (Windows) for duplicating selected objects
  - Add keyboard shortcut to existing shortcuts (Delete, Arrow keys for nudging)
  - Ensure duplicate works with single and multi-selection
  - **Test**: Select objects and press Command+D to duplicate, verify keyboard shortcuts work

- [ ] **Step 15.3**: Implement export canvas functionality.
  - Files: `src/lib/export.ts` (new file), `src/components/Toolbar.tsx`
  - Add export button to toolbar for exporting entire canvas
  - Implement PNG export functionality for the canvas
  - Add export options (PNG, SVG formats)
  - **Test**: Export canvas as PNG/SVG, verify exported image matches canvas content

### Tier 2 Features (3 points each, max 2 features = 6 points)

**Steps to Achieve Excellent:**

- [ ] **Step 15.4**: Implement comprehensive layers panel.
  - Files: `src/components/LayersPanel.tsx` (new file), `src/components/DesignPalette.tsx`
  - Add drag-to-reorder layer hierarchy
  - Implement layer visibility and lock controls
  - **Test**: Reorder layers by dragging, toggle visibility and locks

- [ ] **Step 15.5**: Add alignment tools and distribution.
  - Files: `src/lib/alignment.ts` (new file), `src/components/Toolbar.tsx`
  - Implement align left/right/center, distribute evenly
  - Add alignment tools to toolbar
  - **Test**: Align multiple objects, distribute objects evenly

### Tier 3 Features (3 points each, max 1 feature = 3 points)

**Steps to Achieve Excellent:**

- [ ] **Step 15.6**: Implement collaborative comments system.
  - Files: `src/lib/sync/comments.ts` (new file), `src/components/CommentsPanel.tsx` (new file), `src/components/CanvasStage.tsx`
  - Add comments panel for collaborative feedback
  - Implement comment creation, editing, and replies
  - Add comment indicators on canvas objects
  - **Test**: Multiple users create comments, reply to comments, verify real-time sync

**Feature Implementation Priority:**

1. **Tier 1**: Undo/redo, keyboard shortcuts (Command+D), export canvas (6 points)
2. **Tier 2**: Layers panel, alignment tools (6 points)
3. **Tier 3**: Collaborative comments (3 points)
4. **Total**: 15 points (Excellent score)

**Command+D Keyboard Shortcut Implementation:**

The Command+D shortcut will integrate with the existing keyboard shortcut system:

```typescript
// In useCanvasShortcuts.ts
const handleKeyDown = (event: KeyboardEvent) => {
  // Existing shortcuts: Delete, Arrow keys
  if (event.key === 'Delete' || event.key === 'Backspace') {
    // Delete selected objects
  }

  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
    // Nudge objects
  }

  // New shortcut: Command+D / Ctrl+D
  if ((event.metaKey || event.ctrlKey) && event.key === 'd') {
    event.preventDefault()
    duplicateSelectedObjects()
  }
}

const duplicateSelectedObjects = () => {
  const { selectedIds } = useSelectionStore.getState()
  if (selectedIds.length === 0) return

  // Use existing duplicate functionality from useShapes hook
  selectedIds.forEach(id => {
    duplicateShape(id)
  })
}
```

**Keyboard Shortcuts Summary:**

- **Delete/Backspace**: Delete selected objects
- **Arrow Keys**: Nudge objects (5px)
- **Command+D / Ctrl+D**: Duplicate selected objects
- **Command+Z / Ctrl+Z**: Undo (planned)
- **Command+Shift+Z / Ctrl+Shift+Z**: Redo (planned)

**Export Canvas Implementation:**

The export functionality will allow users to save their canvas work:

```typescript
// In export.ts
export interface ExportOptions {
  format: 'png' | 'svg'
  quality?: number
  scale?: number
  backgroundColor?: string
}

export const exportCanvas = async (
  canvasRef: React.RefObject<HTMLCanvasElement>,
  options: ExportOptions
): Promise<void> => {
  if (!canvasRef.current) throw new Error('Canvas not found')

  const canvas = canvasRef.current
  const dataURL = canvas.toDataURL(`image/${options.format}`, options.quality)

  // Create download link
  const link = document.createElement('a')
  link.download = `canvas-export.${options.format}`
  link.href = dataURL
  link.click()
}

// In Toolbar.tsx
const ExportButton = () => {
  const handleExport = () => {
    exportCanvas(canvasRef, { format: 'png', quality: 1.0 })
  }

  return (
    <Button onClick={handleExport} variant="outline">
      <Download className="h-4 w-4" />
      Export
    </Button>
  )
}
```

**Export Features:**

- **PNG Export**: High-quality raster export of entire canvas
- **SVG Export**: Vector export for scalable graphics
- **Quality Options**: Configurable export quality and scale
- **Background Options**: Include/exclude canvas background
- **One-click Export**: Simple export button in toolbar

**Collaborative Comments Implementation:**

The comments system will enable real-time collaborative feedback on canvas objects:

```typescript
// In types.ts
export interface Comment {
  id: string
  objectId: string
  authorId: string
  authorName: string
  content: string
  position: { x: number; y: number }
  createdAt: number
  updatedAt: number
  replies: Comment[]
  isResolved: boolean
}

// In sync/comments.ts
export class CommentsService {
  async createComment(
    canvasId: string,
    objectId: string,
    content: string,
    position: { x: number; y: number }
  ): Promise<Comment>

  async replyToComment(
    canvasId: string,
    commentId: string,
    content: string
  ): Promise<Comment>

  async resolveComment(canvasId: string, commentId: string): Promise<void>

  subscribeToComments(
    canvasId: string,
    callback: (comments: Comment[]) => void
  ): () => void
}

// In CommentsPanel.tsx
const CommentsPanel = () => {
  const [comments, setComments] = useState<Comment[]>([])
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null)

  return (
    <div className="comments-panel">
      <div className="comments-header">
        <h3>Comments</h3>
        <Button onClick={createComment}>Add Comment</Button>
      </div>
      <div className="comments-list">
        {comments.map(comment => (
          <CommentItem key={comment.id} comment={comment} />
        ))}
      </div>
    </div>
  )
}
```

**Comments Features:**

- **Object-specific Comments**: Comments attached to specific canvas objects
- **Real-time Sync**: Comments sync across all users in real-time
- **Threaded Replies**: Support for comment replies and discussions
- **Visual Indicators**: Comment badges on canvas objects
- **Resolve Comments**: Mark comments as resolved
- **User Attribution**: Show comment author with avatar
- **Position Tracking**: Comments positioned relative to objects

**Firestore Structure:**

```
canvases/{canvasId}/comments/{commentId}
- objectId: string
- authorId: string
- authorName: string
- content: string
- position: { x: number; y: number }
- createdAt: number
- updatedAt: number
- replies: Comment[]
- isResolved: boolean
```

---

## PR #16 — Section 5: Technical Implementation (10 points)

**Goal:** Enhance architecture quality and security to achieve excellent scores.

### Architecture Quality (5 points) - Target: Excellent (5 points)

**Current Status:** Good (4 points) - Solid structure, minor organizational issues

**Steps to Achieve Excellent:**

- [ ] **Step 16.1**: Implement comprehensive error handling.
  - Files: `src/lib/errorHandling.ts` (new file), `src/components/CanvasStage.tsx`
  - Add global error boundary for canvas operations
  - Implement graceful degradation for network issues
  - **Test**: Simulate network errors and verify graceful handling

- [ ] **Step 16.2**: Enhance code organization and modularity.
  - Files: `src/lib/` (various), `src/components/` (various)
  - Refactor large components into smaller, focused modules
  - Implement proper separation of concerns
  - **Test**: Verify components are focused and reusable

- [ ] **Step 16.3**: Verify/add comprehensive TypeScript types and validation.
  - Files: `src/lib/types.ts`, `src/lib/schema.ts`
  - Verify strict TypeScript configuration
  - **Test**: Verify type safety and runtime validation

### Authentication & Security (5 points) - Target: Excellent (5 points)

**Current Status:** Good (4 points) - Functional auth, minor security considerations

**Steps to Achieve Excellent:**

- [ ] **Step 16.4**: Implement robust session handling.
  - Files: `src/contexts/AuthContext.tsx`, `src/hooks/useAuth.ts`
  - Add session timeout and refresh logic
  - Implement secure token storage
  - **Test**: Verify session handling and token security

- [ ] **Step 16.5**: Enhance security with proper route protection.
  - Files: `src/components/ProtectedRoute.tsx`, `src/pages/CanvasPage.tsx`
  - Implement role-based access control
  - Add security headers and CSRF protection
  - **Test**: Verify route protection and security measures

- [ ] **Step 16.6**: Implement comprehensive security audit.
  - Files: `docs/security.md` (new file), `src/lib/security.ts` (new file)
  - Document security measures and best practices
  - Add security monitoring and logging
  - **Test**: Security audit and penetration testing

---

## PR #17 — Section 6: Documentation & Submission Quality (5 points)

**Goal:** Enhance documentation and deployment to achieve excellent scores.

### Repository & Setup (3 points) - Target: Excellent (3 points)

**Current Status:** Good (2 points) - Adequate documentation, setup mostly clear

**Steps to Achieve Excellent:**

- [ ] **Step 17.1**: Update and enhance existing architecture documentation.
  - Files: `docs/arch.md`, `docs/runtime-arch.md`
  - Review and update system architecture documentation
  - Add component diagrams and data flow charts to existing docs
  - Ensure documentation reflects current implementation
  - **Test**: Verify documentation is complete and accurate

- [ ] **Step 17.2**: Verify and update README.md for comprehensive setup guide.
  - Files: `README.md`
  - Verify README.md is up-to-date and comprehensive
  - Ensure setup guide includes all dependencies and steps
  - Add troubleshooting section for common issues
  - Verify environment-specific setup instructions are complete
  - **Test**: Follow setup guide from scratch to verify completeness

- [ ] **Step 17.3**: Verify and enhance dependency documentation in README.md.
  - Files: `README.md`, `package.json`
  - Verify all dependencies are documented with their purposes
  - Ensure version compatibility information is included
  - Add dependency update and maintenance guidelines
  - **Test**: Verify all dependencies are properly documented and explained

### Deployment (2 points) - Target: Excellent (2 points)

**Current Status:** Good (1 point) - Deployed, minor stability issues

**Steps to Achieve Excellent:**

- [ ] **Step 17.4**: Optimize deployment for stability and performance.
  - Files: `vercel.json`, `docs/deployment.md` (new file)
  - Configure CDN and caching strategies
  - Implement health checks and monitoring
  - **Test**: Verify deployment stability and performance

- [ ] **Step 17.5**: Implement comprehensive monitoring and logging.
  - Files: `src/lib/monitoring.ts` (new file), `docs/monitoring.md` (new file)
  - Add performance monitoring and error tracking
  - Implement user analytics and usage metrics
  - **Test**: Verify monitoring and logging functionality

**Documentation Requirements for PR #17:**

1. **Architecture Documentation**: Update existing `docs/arch.md` and `docs/runtime-arch.md`
2. **Setup Guide**: Verify and enhance `README.md` with comprehensive setup instructions
3. **Dependency Documentation**: Ensure all dependencies are documented with purposes
4. **Deployment Guide**: Production deployment and monitoring (existing)
5. **Troubleshooting Guide**: Add common issues and solutions to README.md

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

## Milestone Acceptance Criteria (MVP) ✅ ACHIEVED

- ✅ Authenticated users can join `/canvas` and see **presence list** and **live cursors**.
- ✅ Users can **create/move/resize/rotate/delete/duplicate** rectangles, circles, and text.
- ✅ **Edits sync** across 2+ users with debounced updates (100ms); cursors in <50ms (throttled).
- ✅ **Canvas state persists** on refresh and reconnect with viewport restoration.
- ✅ Deployed app is **publicly accessible** on Vercel with Firebase backend.
- ⚠️ CI pipeline not implemented (testing infrastructure planned for future).

---

## Testing Infrastructure Status

**Current Status: NOT IMPLEMENTED**

The following testing infrastructure was planned but not implemented:

- **Unit/Component:** Vitest + React Testing Library (RTL) - Not implemented
- **Integration/E2E (browser):** Playwright - Not implemented
- **Backend emulation:** Firebase Emulators (Auth, Firestore) - Not implemented
- **CI:** GitHub Actions workflow - Not implemented

**Future Testing Plan:**

```
/tests
  /unit
  /integration
  /e2e
playwright.config.ts
vitest.config.ts
setupTests.ts   // RTL + JSDOM setup
```

### Future Testing Implementation Plan

**Priority 1: Unit Tests**

- Component rendering tests for core UI components
- Hook testing for custom hooks (useAuth, useShapes, usePresence)
- Utility function testing for sync services

**Priority 2: Integration Tests**

- Firebase emulator-based tests for data operations
- Real-time sync testing with multiple clients
- Authentication flow testing

**Priority 3: E2E Tests**

- Full user journey testing with Playwright
- Multi-user collaboration scenarios
- Performance and load testing

**Priority 4: CI/CD Pipeline**

- GitHub Actions workflow setup
- Automated testing on PRs
- Deployment automation

**Note:** All testing infrastructure is currently planned but not implemented. The application is fully functional and deployed without automated tests.

---

## Next Development Priorities

### Immediate (PR #11)

- **Modern UI Implementation**: shadcn/ui with Figma-like toolbar
- **Icon System**: lucide-react for consistent iconography
- **Component Library**: Radix primitives for accessibility

### Short-term (Post-PR #11)

- **Testing Infrastructure**: Unit tests, e2e tests, CI/CD pipeline
- **Performance Testing**: Load testing with 500+ shapes and 5+ users
- **Mobile Optimization**: Touch gestures and responsive design

### Long-term (Future PRs)

- **AI Integration**: Natural language commands and shape suggestions
- **Advanced Features**: Export, animations, offline mode
- **Enterprise Features**: Comments, version history, team management
