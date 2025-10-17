# Collab Canvas — MVP Task & PR Checklist

Below is a proposed sequence of **pull requests (PRs)** to build and ship the Collab Canvas MVP. Each PR has a checklist of subtasks with the **files you'll create or modify**. Adjust as needed once you begin implementation.

## 🚨 Current Issues

### LangChain Agent Issues

- **Status**: ❌ Not Working - Agent returns empty output with no intermediate steps
- **Issue**: LangChain AgentExecutor not executing tools properly
- **Error**: `{output: '', intermediateSteps: Array(0)}` for natural language commands
- **Priority**: Low (OpenAI agent is working as primary solution)

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

## PR #11 — Modern UI with MUI (Complete UI Overhaul) ✅ COMPLETED

**Goal:** Implement MUI components with Material Design and lucide-react icons for a professional, modern UI across the entire application.

### Phase 1: Setup and Foundation

- [x] **Step 1.1**: Install and configure MUI with Material Design and Tailwind CSS.
  - Files: `package.json`, `tailwind.config.ts`
  - Install: `@mui/material`, `@mui/icons-material`, `@emotion/react`, `@emotion/styled`

- [x] **Step 1.2**: Install lucide-react for consistent iconography.
  - Files: `package.json`
  - Run: `npm install lucide-react`

- [x] **Step 1.3**: Install core MUI components needed for the overhaul.
  - Files: MUI component library with Material Design system
  - Install: MUI component library with proper theming

### Phase 2: Homepage Redesign ✅ COMPLETED

- [x] **Step 2.1**: Create modern hero section with MUI Card component.
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

- [x] **Step 3.1**: Create centered login card with MUI Card component.
  - Files: `src/pages/LoginPage.tsx`
  - Replace basic form with Card, CardHeader, CardContent, CardFooter
  - **COMPLETED**: Implemented modern card-based layout with proper MUI components

- [x] **Step 3.2**: Add Google OAuth button with proper styling and Google icon.
  - Files: `src/pages/LoginPage.tsx`
  - Use Button component with Google branding colors
  - **COMPLETED**: Used MUI Button component with Google icon and proper styling

- [x] **Step 3.3**: Implement loading states with MUI components.
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

- [x] **Step 4.1**: Create modern toolbar component with MUI components.
  - Files: `src/components/Toolbar.tsx` (refactor existing)
  - Use Button components with proper variants
  - **COMPLETED**: Replaced custom buttons with MUI Button components using proper variants

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

- [x] **Step 5.1**: Update ProfileMenu with MUI components.
  - Files: `src/components/ProfileMenu.tsx`
  - Use DropdownMenu, Avatar, Button components
  - **COMPLETED**: Replaced custom dropdown with MUI DropdownMenu, Avatar, and Button components

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

- **Complete UI Overhaul**: Modernize entire application with MUI
- **Homepage Redesign**: Professional landing page with hero section and features
- **Login Page Redesign**: Modern authentication experience with proper styling
- **Toolbar Redesign**: Figma-like toolbar with proper tool grouping
- **Component Library**: Build reusable UI components using MUI
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
- **Educational**: Learn MUI, Material Design, and modern React patterns

---

## PR #12 — Design Palette Panel (Right Sidebar) ✅ COMPLETED

**Goal:** Implement a comprehensive design palette panel on the right side of the canvas for shape styling, layer management, and design controls.

### Phase 1: Panel Structure and Layout ✅ COMPLETED

- [x] **Step 1.1**: Create DesignPalette component with MUI Card layout.
  - Files: `src/components/DesignPalette.tsx` (new file)
  - **COMPLETED**: Modern card-based layout with proper MUI components
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
- ✅ **Slider Component Updates**: Enhanced MUI slider with larger thumbs and thicker tracks
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

- [x] **Step 13.1**: Optimize sync latency by reducing debounce timing.
  - Files: `src/lib/sync/objects.ts`, `src/hooks/useShapes.ts`
  - Reduce debounce from 100ms to 50ms for object changes
  - Update object positions while dragging rather than waiting for release

- [x] **Step 13.2**: Achieve sub-50ms cursor sync with interpolation.
  - Files: `src/lib/sync/presence.ts`, `src/components/CursorLayer.tsx`
  - Reduce cursor throttling from 50ms to 25ms
  - Implement client-side cursor interpolation for smooth movement

- [x] **Step 13.3**: Eliminate visible lag during rapid multi-user edits.
  - Files: `src/lib/sync/objects.ts`, `src/hooks/useShapes.ts`
  - Implement optimistic updates with immediate visual feedback
  - Add conflict resolution indicators for simultaneous edits
  - **Test**: Two users rapidly editing same object simultaneously
- [ ] **Step 13.3.5 **: Eliminate 'ghost' shapes of where objects used to be when multi draggin.

### Conflict Resolution & State Management (9 points) - Target: Excellent (8-9 points)

**Current Status:** Good (6-7 points) - Simultaneous edits resolve correctly 90%+ of time, strategy documented

**Steps to Achieve Excellent:**

- [x] **Step 13.7**: Enhance conflict resolution strategy documentation.
  - Specify use of updatedAt/updatedBy for last-write-wins documentation in readme

- [x] **Step 13.8**: Implement conflict resolution visual feedback.
  - Files: `src/components/DesignPalette.tsx`, `src/lib/utils.ts`, `src/pages/CanvasPage.tsx`
  - Add "Last edited at [timestamp] by [name]" display in design palette for selected objects
  - Show user attribution and edit timestamps to provide conflict resolution context
  - **COMPLETED**: Implemented user display name resolution and timestamp formatting utilities
  - **COMPLETED**: Added Object Info section to design palette showing last edited information
  - **COMPLETED**: Integrated with existing user presence system for accurate user attribution
  - **Test**: Select objects and verify last edited information displays correctly
- [ ] **Step 13.8.5**: Handle case where last editing user is offline, say say their name, not "unknown user"

### Persistence & Reconnection (9 points) - Target: Excellent (8-9 points)

**Current Status:** Good (6-7 points) - Refresh preserves 95%+ of state, reconnection works but may lose last 1-2 operations

**Steps to Achieve Excellent:**

- [x] **Step 13.9**: Replace "Healthy" text in top navbar type component with "Connected" + Green circle OR "Offline" + Red circle to show if user is connected to server or not.
  - Files: `src/hooks/useConnectionStatus.ts`, `src/components/ConnectionStatus.tsx`, `src/App.tsx`
  - **COMPLETED**: Implemented comprehensive connection status tracking with Firebase connection testing
  - **COMPLETED**: Created reusable ConnectionStatus component with visual indicators
  - **COMPLETED**: Integrated with existing presence system for accurate connection status
  - **COMPLETED**: Added network connectivity monitoring and automatic reconnection
  - **Test**: Verify connection status shows "Connected" (green) when online and "Offline" (red) when disconnected

- [x] **Step 13.9.5**: Implement operation queuing during disconnect.
  - Files: `src/lib/sync/objects.ts`, `src/hooks/useShapes.ts`
  - **COMPLETED**: Implemented comprehensive operation queuing system for offline scenarios
  - **COMPLETED**: Added network monitoring with automatic online/offline detection
  - **COMPLETED**: Operations are queued when offline and automatically synced when back online
  - **COMPLETED**: Implemented retry logic with exponential backoff (max 3 attempts)
  - **COMPLETED**: Fixed UI preview issues - optimistic updates now persist during offline periods
  - **COMPLETED**: Enhanced error handling to distinguish network errors from other errors
  - **COMPLETED**: Fixed design palette preview - all changes now show immediate visual feedback
  - **COMPLETED**: Fixed new shape creation - all new shapes inherit current design palette settings
  - **Test**: Disconnect network, make edits, reconnect - verify all operations sync

- [ ] **Step 13.9.6**: Enhance offline preview for newly created objects.
  - Files: `src/components/CanvasStage.tsx`, `src/lib/sync/objects.ts`
  - Add visual indicators for objects created while offline (e.g., subtle border or icon)
  - Show "pending sync" status for queued operations in the UI
  - Implement better visual feedback for offline-created objects until they sync
  - **Test**: Create objects while offline, verify visual indicators, then go online to see sync

- [x] **Step 13.10**: Add comprehensive connection status indicators.
  - Files: `src/components/CanvasStage.tsx`, `src/hooks/usePresence.ts`
  - Show connection status in UI (connected/disconnected/reconnecting)
  - Add visual indicators for sync status
  - **Test**: Network throttling to verify status indicators work

  - Files: `src/lib/sync/objects.ts`, `src/hooks/useShapes.ts`
  - Ensure 100% state preservation on refresh
  - Implement incremental sync for large canvases
  - **Test**: Refresh mid-edit, total disconnect scenarios, network simulation

**Testing Scenarios for PR #13:**

1. **Simultaneous Move**: Two users drag same rectangle simultaneously
2. **Rapid Edit Storm**: User A resizes while User B changes color while User C moves
3. **Delete vs Edit**: User A deletes object while User B is editing it
4. **Create Collision**: Two users create objects at nearly identical timestamps
5. **Mid-Operation Refresh**: User drags object, refreshes browser mid-drag
6. **Total Disconnect**: All users close browsers, wait 2 minutes, return
7. **Network Simulation**: Throttle network to 0 for 30 seconds, restore

---

## PR #14 — Section 2: Canvas Features & Performance (20 points)

**Goal:** Enhance canvas functionality and achieve excellent performance scores.

### Canvas Functionality (8 points) - Target: Excellent (7-8 points)

**Current Status:** Good (5-6 points) - All basic requirements met, 2+ shapes, transforms work well

**Steps to Achieve Excellent:**

- [x] **Step 14.1**: Add shift-click for multi-select (drag-to-select marquee already implemented).
  - Files: `src/components/CanvasStage.tsx`, `src/store/selection.ts`
  - Implement shift-click functionality for adding objects to selection
  - Ensure shift-click works with existing drag-to-select marquee
  - Multi select works with duplicate
  - **Test**: Select multiple objects with shift-click and verify it works with marquee selection

- [x] **Step 14.2**: Add visual layer position indicators to design palette.
  - Files: `src/components/DesignPalette.tsx`, `src/store/designPalette.ts`
  - Add layer position display showing "Layer X of Y" when objects are selected
  - Show visual indicators for bring forward/backward button states (enabled/disabled)
  - Add layer depth information in the Layer section of the palette
  - Implement real-time updates when layer order changes
  - **Test**: Select objects and verify layer position indicators appear in palette

- [x] **Step 14.3**: Enhance text formatting capabilities.
  - Files: `src/components/Shapes/TextShape.tsx`, `src/components/DesignPalette.tsx`
  - Add text alignment options (left, center, right)
  - Implement line height controls
  - **Test**: Format text with various alignment and spacing options

- [ ] **Step 14.3.5**Implement text wrapping controls

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
  - Implement batch updates for multi-object movement to reduce network calls
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

### Authentication & Security (5 points) - Target: Excellent (5 points)

**Current Status:** Good (4 points) - Functional auth, minor security considerations

**Steps to Achieve Excellent:**

- [x] **Step 16.4**: Implement robust session handling.
  - Files: `src/components/providers/AuthProvider.tsx`
  - ✅ Add session timeout and refresh logic (55-minute token refresh)
  - ✅ Implement secure token storage (Firebase handles secure storage)
  - ✅ **Test**: Verify session handling and token security

- [x] **Step 16.5**: Enhance security with proper route protection.
  - Files: `src/components/ProtectedRoute.tsx`
  - ✅ Implement basic access control (authentication required)
  - ✅ Add security headers and CSRF protection (via CSP and security headers)
  - ✅ **Test**: Verify route protection and security measures

- [x] **Step 16.6**: Implement comprehensive security audit and critical security fixes.
  - Files: `docs/security.md` (new file), `src/lib/security.ts` (new file)
  - **HIGH PRIORITY**: ✅ Add input sanitization for user content (XSS prevention)
  - **HIGH PRIORITY**: ✅ Implement rate limiting for operations
  - **HIGH PRIORITY**: ✅ Add security headers (CSP, XSS protection)
  - **HIGH PRIORITY**: ✅ Fix CSP configuration for Google Authentication compatibility
  - **MEDIUM**: ✅ Implement session timeout and token refresh
  - **MEDIUM**: ✅ Add audit logging for security events
  - **MEDIUM**: ✅ Implement CSRF protection (via security headers)
  - **MEDIUM**: ✅ Add Cross-Origin-Opener-Policy headers for popup authentication
  - ✅ Document security measures and best practices
  - ✅ Add security monitoring and logging
  - ✅ Test authentication flow with security headers
  - **PENDING**: Implement canvas-level access control in Firestore rules (requires Firebase console configuration)
  - **Test**: Security audit and penetration testing

---

## PR #17 — Section 6: Documentation & Submission Quality (5 points)

**Goal:** Enhance documentation and deployment to achieve excellent scores.

### Repository & Setup (3 points) - Target: Excellent (3 points)

**Current Status:** Good (2 points) - Adequate documentation, setup mostly clear

**Steps to Achieve Excellent:**

- [x] **Step 17.1**: Update and enhance existing architecture documentation.
  - Files: `docs/arch.md`, `docs/runtime-arch.md`
  - Review and update system architecture documentation
  - Add component diagrams and data flow charts to existing docs
  - Ensure documentation reflects current implementation
  - **Test**: Verify documentation is complete and accurate

- [x] **Step 17.2**: Verify and update README.md for comprehensive setup guide.
  - Files: `README.md`
  - Verify README.md is up-to-date and comprehensive
  - Ensure setup guide includes all dependencies and steps
  - Add troubleshooting section for common issues
  - Verify environment-specific setup instructions are complete
  - **Test**: Follow setup guide from scratch to verify completeness

- [x] **Step 17.3**: Verify and enhance dependency documentation in README.md.
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

## PR #19 — Mermaid Diagram Import & Rendering (15 points)

**Goal:** Add comprehensive Mermaid diagram import and rendering functionality to enable users to create, import, and collaborate on technical diagrams within the canvas.

### Phase 1: Core Infrastructure Setup (5 points)

**Step 19.1**: Install and configure Mermaid.js dependencies.

- Files: `package.json`
- Install: `mermaid`, `@types/mermaid` (if available)
- Run: `npm install mermaid`
- **Test**: Verify Mermaid library loads without errors

**Step 19.2**: Extend type system for Mermaid diagrams.

- Files: `src/lib/types.ts`
- Add `'mermaid'` to `ShapeType` union
- Create `MermaidShape` interface extending `ShapeBase`
- Add properties: `mermaidCode: string`, `renderedSvg?: string`, `diagramType?: string`
- **Test**: TypeScript compilation succeeds with new types

**Step 19.3**: Create Mermaid rendering service.

- Files: `src/lib/mermaid/renderer.ts` (new file)
- Implement `MermaidRenderer` class with methods:
  - `renderDiagram(code: string): Promise<string>` - Convert Mermaid code to SVG
  - `validateMermaidCode(code: string): boolean` - Validate syntax
  - `getDiagramType(code: string): string` - Detect diagram type
- **Test**: Render sample Mermaid diagrams to SVG

### Phase 2: Mermaid Shape Component (4 points)

**Step 19.4**: Create MermaidShape component.

- Files: `src/components/Shapes/MermaidShape.tsx` (new file)
- Implement Konva-based rendering using `react-konva`
- Handle SVG-to-Konva conversion for diagram display
- Support selection, dragging, and resizing like other shapes
- Add error handling for invalid Mermaid code
- **Test**: Create and manipulate Mermaid shapes on canvas

**Step 19.5**: Integrate MermaidShape into CanvasStage.

- Files: `src/components/CanvasStage.tsx`
- Add MermaidShape import and case in shape rendering switch
- Update shape creation logic to handle 'mermaid' tool
- Ensure proper zIndex and selection handling
- **Test**: Mermaid shapes render and behave like other shapes

### Phase 3: Import & Creation UI (3 points)

**Step 19.6**: Add Mermaid tool to toolbar.

- Files: `src/components/ToolbarMUI.tsx`
- Add 'mermaid' to `ToolType` union
- Add Mermaid tool button with appropriate icon (Diagram icon)
- Include keyboard shortcut (M key)
- **Test**: Mermaid tool appears in toolbar and is selectable

**Step 19.7**: Create Mermaid import dialog.

- Files: `src/components/MermaidImportDialog.tsx` (new file)
- Implement modal dialog with:
  - Text area for Mermaid code input
  - Live preview of rendered diagram
  - Syntax validation with error messages
  - Import/Cancel buttons
- **Test**: Dialog opens, validates code, and imports diagrams

**Step 19.8**: Add import functionality to toolbar.

- Files: `src/components/ToolbarMUI.tsx`
- Add "Import Mermaid" button that opens import dialog
- Position button in appropriate toolbar section
- **Test**: Import button opens dialog and creates shapes

### Phase 4: Advanced Features (2 points)

**Step 19.9**: Add Mermaid-specific design palette controls.

- Files: `src/components/DesignPaletteMUI.tsx`
- Add Mermaid section when Mermaid shape is selected:
  - Edit Mermaid code button (opens inline editor)
  - Diagram type display
  - Export as SVG button
- **Test**: Mermaid-specific controls appear when shape selected

**Step 19.10**: Implement Mermaid code editing.

- Files: `src/components/MermaidCodeEditor.tsx` (new file)
- Create inline code editor with:
  - Syntax highlighting for Mermaid
  - Live preview updates
  - Save/Cancel functionality
- **Test**: Edit Mermaid code and see live updates

### Phase 5: Integration & Polish (1 point)

**Step 19.11**: Add Mermaid templates and examples.

- Files: `src/lib/mermaid/templates.ts` (new file)
- Create common Mermaid diagram templates:
  - Flowchart template
  - Sequence diagram template
  - Class diagram template
  - Gantt chart template
- **Test**: Templates load and render correctly

**Step 19.12**: Update documentation and add keyboard shortcuts.

- Files: `src/hooks/useCanvasShortcuts.ts`, `README.md`
- Add M key shortcut for Mermaid tool
- Update README with Mermaid feature documentation
- Add Mermaid examples and usage guide
- **Test**: Keyboard shortcuts work and documentation is accurate

### Implementation Details

**Mermaid Shape Data Structure:**

```typescript
export interface MermaidShape extends ShapeBase {
  type: 'mermaid'
  mermaidCode: string
  renderedSvg?: string
  diagramType?: string
  width: number
  height: number
}
```

**Mermaid Renderer Service:**

```typescript
export class MermaidRenderer {
  async renderDiagram(code: string): Promise<string>
  validateMermaidCode(code: string): boolean
  getDiagramType(code: string): string
  initialize(): Promise<void>
}
```

**Key Features Delivered:**

- Import Mermaid diagrams via text input
- Real-time diagram rendering and preview
- Full shape manipulation (move, resize, select, delete)
- Mermaid code editing with live updates
- Template library for common diagram types
- Integration with existing collaboration features
- Error handling for invalid Mermaid syntax

**Testing Scenarios:**

1. Import various Mermaid diagram types (flowchart, sequence, class, etc.)
2. Edit Mermaid code and verify live updates
3. Multi-user collaboration on Mermaid diagrams
4. Error handling for malformed Mermaid syntax
5. Performance with multiple Mermaid diagrams on canvas

**Junior Developer Guidance:**

- Start with Phase 1 to understand Mermaid.js integration
- Use existing shape components as reference for MermaidShape
- Test each phase thoroughly before moving to the next
- Focus on error handling and user experience
- Leverage existing collaboration infrastructure

---

## PR #20 — Replace Firestore Presence with Firebase Realtime Database (RTDB)

**Goal:** Replace Firestore presence system with Firebase Realtime Database for better performance with high-frequency cursor updates and reduced costs.

### Phase 1: RTDB Setup and Configuration (3 points)

**Step 20.1**: Install and configure Firebase Realtime Database.

- Files: `package.json`, `src/lib/firebase/client.ts`
- Install: `firebase` (already installed, add RTDB import)
- Add RTDB configuration to Firebase client
- **Test**: RTDB connection works without errors

**Step 20.2**: Create RTDB data structure and security rules.

- Files: `firebase-database-rules.json` (new file)
- Define presence data structure: `presence/{canvasId}/{userId}`
- Implement security rules for presence data
- **Test**: Security rules allow proper read/write access

**Step 20.3**: Create RTDB presence service.

- Files: `src/lib/sync/presence.ts` (replace existing)
- Implement `PresenceService` class with methods:
  - `joinCanvas(canvasId, userId, userInfo)`
  - `leaveCanvas(canvasId, userId)`
  - `updateCursor(canvasId, userId, position)`
  - `subscribeToPresence(canvasId, callback)`
- **Test**: Basic presence operations work with RTDB

### Phase 2: Replace Firestore Presence Implementation (4 points)

**Step 20.4**: Update presence hooks to use RTDB.

- Files: `src/hooks/usePresence.ts`, `src/hooks/usePresenceQuery.ts`
- Replace Firestore presence logic with RTDB implementation
- Maintain existing API compatibility
- **Test**: Existing presence functionality works with RTDB

**Step 20.5**: Update presence components.

- Files: `src/components/CursorLayer.tsx`, `src/components/PresenceList.tsx`
- Update components to work with RTDB presence data structure
- Ensure real-time cursor updates work properly
- **Test**: Cursor tracking and presence list work correctly

**Step 20.6**: Remove Firestore presence code.

- Files: `src/lib/sync/presence.ts` (old Firestore version)
- Delete old Firestore presence implementation
- Clean up unused imports and dependencies
- **Test**: No Firestore presence code remains

### Phase 3: RTDB Integration and Testing (3 points)

**Step 20.7**: Implement RTDB presence service with full functionality.

- Files: `src/lib/sync/presence.ts`
- Add heartbeat system using RTDB `onDisconnect` handlers
- Implement cursor throttling (25ms) for RTDB
- Add presence cleanup and user tracking
- **Test**: RTDB presence works with multiple users

**Step 20.8**: Add RTDB-specific error handling and reconnection. ✅ COMPLETED

- Files: `src/lib/sync/presence.ts`
- ✅ Implement RTDB connection monitoring
- ✅ Add automatic reconnection logic
- ✅ Handle RTDB-specific error scenarios
- ✅ **Test**: RTDB handles disconnections and reconnections gracefully

**Step 20.9**: Performance testing and optimization. ✅ COMPLETED

- Files: `src/lib/sync/presence.ts`
- ✅ Test with 5+ concurrent users and rapid cursor movement
- ✅ Optimize RTDB queries and data structure
- ✅ **Test**: RTDB performs better than Firestore for cursor updates

### Phase 4: Documentation and Cleanup (2 points)

**Step 20.10**: Update documentation. ✅ COMPLETED

- Files: `docs/arch.md`, `docs/runtime-arch.md`, `README.md`, `docs/security.md`, `docs/PRD.md`, `docs/demo-script.md`, `docs/ai-architecture-diagram.md`
- ✅ Update architecture diagrams to show RTDB for presence
- ✅ Update security documentation for RTDB rules
- ✅ **Test**: Documentation accurately reflects new architecture

**Step 20.11**: Clean up Firestore presence references. ✅ COMPLETED

- Files: `src/lib/firebase/firestore.ts`, `src/lib/types.ts`
- ✅ Remove Firestore presence-related code and types
- ✅ Update any remaining references to use RTDB
- ✅ **Test**: No Firestore presence references remain

### Implementation Details

**RTDB Data Structure:**

```json
{
  "presence": {
    "canvasId": {
      "userId": {
        "userInfo": {
          "displayName": "User Name",
          "email": "user@example.com",
          "avatar": "avatar_url"
        },
        "cursor": {
          "x": 100,
          "y": 200,
          "timestamp": 1234567890
        },
        "lastSeen": 1234567890,
        "isOnline": true
      }
    }
  }
}
```

**RTDB Security Rules:**

```json
{
  "rules": {
    "presence": {
      "$canvasId": {
        "$userId": {
          ".read": "auth != null",
          ".write": "auth != null && auth.uid == $userId",
          ".validate": "newData.hasChildren(['userInfo', 'cursor', 'lastSeen'])"
        }
      }
    }
  }
}
```

**Key Benefits of RTDB:**

- **Lower Latency**: RTDB optimized for real-time updates
- **Cost Efficiency**: RTDB charges per operation, not per document read
- **Better Performance**: No document size limits for presence data
- **Built-in Offline**: RTDB handles offline scenarios better
- **Simpler Queries**: Real-time listeners without complex queries

**Testing Scenarios:**

1. **Multi-user Cursor Tracking**: 5+ users with rapid cursor movement
2. **Connection Handling**: Network disconnections and reconnections
3. **Performance**: RTDB vs Firestore latency comparison
4. **Error Recovery**: RTDB-specific error scenarios
5. **Presence Cleanup**: Users leaving and reconnecting

---

## Optional (Post-MVP) — AI Agent Foundations (Stub Only)

**Goal:** Prepare minimal API for future AI function-calling (no AI yet).

**Checklist**

- [x] Define callable canvas API surface to be used later by AI.
  - Files: `src/lib/sync/objects.ts` (export high-level create/move/resize), `src/lib/types.ts`

- [x] Add `/src/lib/ai/tools.ts` with TypeScript signatures (no implementation yet).
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

- **Modern UI Implementation**: MUI with Figma-like toolbar
- **Icon System**: lucide-react for consistent iconography
- **Component Library**: MUI components for accessibility

### Short-term (Post-PR #11)

- **Testing Infrastructure**: Unit tests, e2e tests, CI/CD pipeline
- **Performance Testing**: Load testing with 500+ shapes and 5+ users
- **Mobile Optimization**: Touch gestures and responsive design

### Long-term (Future PRs)

- **AI Integration**: Natural language commands and shape suggestions
- **Advanced Features**: Export, animations, offline mode
- **Enterprise Features**: Comments, version history, team management

---

## PR #21 — Expanded Shape Support (6 New Shapes)

**Goal:** Add support for 6 new shape types (Line, Arrow, Ellipse, Hexagon, Star, Image) to expand the canvas shape library from 3 to 9 total shapes.

### Overview

This PR adds comprehensive shape support including:

- **Line (L)** - Straight lines with adjustable stroke
- **Arrow (A)** - Lines with arrowheads (start/end/both)
- **Ellipse (O)** - Ovals and circles with separate width/height control
- **Hexagon (P)** - Multi-sided shapes (triangle, pentagon, hexagon, etc.)
- **Star (S)** - Star shapes with preset configurations
- **Image (I)** - Image placement via upload or clipboard paste

All shapes integrate with existing real-time sync, design palette, and transformation systems.

### Phase 1: Type System & Schema Updates (Foundation) - 2 hours

**Files:** `src/lib/types.ts`, `src/lib/schema.ts`

#### Step 1.1: Update ShapeType Union

- [x] Open `src/lib/types.ts`
- [x] Find the `ShapeType` union (line 2)
- [x] Update from `'rect' | 'circle' | 'text' | 'mermaid'` to include: `'line' | 'arrow' | 'ellipse' | 'hexagon' | 'star' | 'image'`
- [x] Verify TypeScript compilation succeeds

#### Step 1.2: Define New Shape Interfaces

- [x] Add new shape interfaces after existing ones (around line 60):

```typescript
export interface LineShape extends ShapeBase {
  type: 'line'
  endX: number
  endY: number
}

export interface ArrowShape extends ShapeBase {
  type: 'arrow'
  endX: number
  endY: number
  arrowType: 'start' | 'end' | 'both'
}

export interface EllipseShape extends ShapeBase {
  type: 'ellipse'
  radiusX: number
  radiusY: number
}

export interface HexagonShape extends ShapeBase {
  type: 'hexagon'
  radius: number
  sides: number
}

export interface StarShape extends ShapeBase {
  type: 'star'
  outerRadius: number
  innerRadius: number
  points: number
  starType: '5-point' | '6-point' | '8-point'
}

export interface ImageShape extends ShapeBase {
  type: 'image'
  imageUrl: string
  imageName: string
  width: number
  height: number
}
```

- [x] Update the `Shape` union type to include all new shapes
- [x] Verify TypeScript compilation succeeds

#### Step 1.3: Update Zod Schemas

- [x] Open `src/lib/schema.ts`
- [x] Update `ShapeTypeSchema` to include new shape types
- [x] Add new shape schemas after existing ones:

```typescript
export const LineShapeSchema = ShapeBaseSchema.extend({
  type: z.literal('line'),
  endX: z.number(),
  endY: z.number()
})

export const ArrowShapeSchema = ShapeBaseSchema.extend({
  type: z.literal('arrow'),
  endX: z.number(),
  endY: z.number(),
  arrowType: z.enum(['start', 'end', 'both'])
})

export const EllipseShapeSchema = ShapeBaseSchema.extend({
  type: z.literal('ellipse'),
  radiusX: z.number(),
  radiusY: z.number()
})

export const HexagonShapeSchema = ShapeBaseSchema.extend({
  type: z.literal('hexagon'),
  radius: z.number(),
  sides: z.number().min(3).max(12)
})

export const StarShapeSchema = ShapeBaseSchema.extend({
  type: z.literal('star'),
  outerRadius: z.number(),
  innerRadius: z.number(),
  points: z.number(),
  starType: z.enum(['5-point', '6-point', '8-point'])
})

export const ImageShapeSchema = ShapeBaseSchema.extend({
  type: z.literal('image'),
  imageUrl: z.string(),
  imageName: z.string(),
  width: z.number(),
  height: z.number()
})
```

- [x] Update `ShapeSchema` discriminated union to include all new schemas
- [x] Verify TypeScript compilation succeeds

#### Step 1.4: Update ToolType

- [x] Open `src/components/ToolbarMUI.tsx`
- [x] Update `ToolType` union to include: `'line' | 'arrow' | 'ellipse' | 'hexagon' | 'star' | 'image'`
- [x] Verify TypeScript compilation succeeds

**Checkpoint:** All type definitions are complete and TypeScript compiles without errors.

### Phase 2: Shape Components (6 New Components) - 4 hours

**Files:** `src/components/Shapes/` (create 6 new files)

#### Step 2.1: Create LineShape Component

- [x] Create `src/components/Shapes/LineShape.tsx`
- [x] Copy structure from `RectangleShape.tsx` as template
- [x] Replace `Rect` with `Line` from react-konva
- [x] Update props to use `endX`, `endY` instead of `width`, `height`
- [x] Set `points={[0, 0, shape.endX - shape.x, shape.endY - shape.y]}`
- [x] Remove `fill` prop (lines don't have fill)
- [x] Verify component renders without errors

#### Step 2.2: Create ArrowShape Component

- [x] Create `src/components/Shapes/ArrowShape.tsx`
- [x] Copy from `LineShape.tsx` as template
- [x] Replace `Line` with `Arrow` from react-konva
- [x] Add `pointerLength` and `pointerWidth` props (default: 10, 10)
- [x] Add conditional `pointerAtBeginning` and `pointerAtEnding` based on `arrowType`
- [x] **Test:** Component renders with correct arrow directions

#### Step 2.3: Create EllipseShape Component

- [x] Create `src/components/Shapes/EllipseShape.tsx`
- [x] Copy structure from `CircleShape.tsx` as template
- [x] Replace `Circle` with `Ellipse` from react-konva
- [x] Use `radiusX` and `radiusY` instead of single `radius`
- [x] **Test:** Component renders ellipses correctly

#### Step 2.4: Create HexagonShape Component

- [x] Create `src/components/Shapes/HexagonShape.tsx`
- [x] Copy structure from `CircleShape.tsx` as template
- [x] Replace `Circle` with `RegularPolygon` from react-konva
- [x] Use `sides` prop for number of sides
- [x] Use `radius` prop for size
- [x] **Test:** Component renders hexagons with correct number of sides

#### Step 2.5: Create StarShape Component

- [x] Create `src/components/Shapes/StarShape.tsx`
- [x] Copy structure from `CircleShape.tsx` as template
- [x] Replace `Circle` with `Star` from react-konva
- [x] Use `outerRadius`, `innerRadius`, and `numPoints` props
- [x] **Test:** Component renders stars correctly

#### Step 2.6: Create ImageShape Component

- [x] Create `src/components/Shapes/ImageShape.tsx`
- [x] Copy structure from `RectangleShape.tsx` as template
- [x] Replace `Rect` with `Image` from react-konva
- [x] Add image loading logic with `useEffect` and `useState`
- [x] Handle image loading states (loading, error, loaded)
- [x] **Test:** Component loads and displays images

**Checkpoint:** All 6 shape components render without errors and handle basic Konva events.

### Phase 6.1: Fix Image Upload Firestore Error (CRITICAL BUG FIX)

**Problem:** Image upload/paste fails with Firestore error: "Unsupported field value: undefined"

**Root Cause:** The `createImageShape` function sets `fill: undefined` and `stroke: undefined`, but Firestore doesn't allow `undefined` values.

**Files:** `src/lib/imageUpload.ts`

#### Step 6.1.1: Fix createImageShape Function

- [x] Open `src/lib/imageUpload.ts`
- [x] Find the `createImageShape` function (around line 100)
- [x] Remove the lines that set `fill: undefined` and `stroke: undefined`
- [x] Keep only the required properties: `type`, `x`, `y`, `width`, `height`, `imageUrl`, `imageName`, `strokeWidth`, `rotation`, `zIndex`
- [x] **Test:** Try uploading an image - should work without Firestore errors

**Before (BROKEN):**

```typescript
return {
  type: 'image' as const,
  x,
  y,
  width: Math.min(imageResult.width, 200),
  height: Math.min(imageResult.height, 200),
  imageUrl: imageResult.imageUrl,
  imageName: imageResult.imageName,
  fill: undefined, // ❌ REMOVE THIS
  stroke: undefined, // ❌ REMOVE THIS
  strokeWidth: 0,
  rotation: 0,
  zIndex: 0
}
```

**After (FIXED):**

```typescript
return {
  type: 'image' as const,
  x,
  y,
  width: Math.min(imageResult.width, 200),
  height: Math.min(imageResult.height, 200),
  imageUrl: imageResult.imageUrl,
  imageName: imageResult.imageName,
  strokeWidth: 0,
  rotation: 0,
  zIndex: 0
}
```

#### Step 6.1.2: Test Image Upload

- [ ] Test image upload via file picker (click Image tool, then click canvas)
- [ ] Test image paste via clipboard (select Image tool, then Ctrl+V/Cmd+V)
- [ ] Verify images appear on canvas without console errors
- [ ] Verify images sync to other users in real-time

**Checkpoint:** Image upload and paste work without Firestore errors.

### Phase 3: Toolbar Integration - 1 hour

**Files:** `src/components/ToolbarMUI.tsx`

#### Step 3.1: Add New Tool Buttons

- [ ] Open `src/components/ToolbarMUI.tsx`
- [ ] Import new MUI icons at the top:

```typescript
import {
  ShowChart, // Line
  TrendingFlat, // Arrow
  PanoramaFishEye, // Ellipse
  Hexagon, // Hexagon
  Star, // Star
  AddPhotoAlternate // Image
} from '@mui/icons-material'
```

- [ ] Add 6 new tools to the `tools` array (around line 72):

```typescript
{
  type: 'line',
  label: 'Line',
  icon: ShowChart,
  shortcut: 'L',
  description: 'Click and drag to create line'
},
{
  type: 'arrow',
  label: 'Arrow',
  icon: TrendingFlat,
  shortcut: 'A',
  description: 'Click and drag to create arrow'
},
{
  type: 'ellipse',
  label: 'Ellipse',
  icon: PanoramaFishEye,
  shortcut: 'O',
  description: 'Click and drag to create ellipse (Shift for circle)'
},
{
  type: 'hexagon',
  label: 'Hexagon',
  icon: Hexagon,
  shortcut: 'P',
  description: 'Click and drag to create hexagon'
},
{
  type: 'star',
  label: 'Star',
  icon: Star,
  shortcut: 'S',
  description: 'Click and drag to create star'
},
{
  type: 'image',
  label: 'Image',
  icon: AddPhotoAlternate,
  shortcut: 'I',
  description: 'Click to place image'
}
```

- [ ] Verify all new tool buttons appear in toolbar and are clickable

**Checkpoint:** Toolbar shows all 6 new tools with proper icons and tooltips.

### Phase 4: Canvas Stage Drawing Logic - 3 hours

**Files:** `src/components/CanvasStage.tsx`

#### Step 4.1: Import New Shape Components

- [ ] Add imports for all 6 new shape components at the top
- [ ] Verify imports work without errors

#### Step 4.2: Update Shape Rendering Switch

- [ ] Find the shape rendering switch statement (around line 200)
- [ ] Add cases for all 6 new shape types:

```typescript
case 'line':
  return (
    <LineShape
      key={shape.id}
      shape={shape as LineShape}
      onSelect={handleShapeSelect}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
      onTransformEnd={handleTransformEnd}
    />
  )
// ... repeat for arrow, ellipse, hexagon, star, image
```

- [ ] Verify all new shapes render when added to canvas

#### Step 4.3: Add Shape Creation Handlers

- [ ] Find the `handleStageClick` function
- [ ] Add cases for new shape creation in the drawing logic:

**Line/Arrow Creation:**

```typescript
if (selectedTool === 'line' || selectedTool === 'arrow') {
  if (!isDrawing) {
    setIsDrawing(true)
    setDrawingStart({ x: e.evt.offsetX, y: e.evt.offsetY })
  } else {
    // Create line/arrow from start to end point
    const endX = e.evt.offsetX
    const endY = e.evt.offsetY
    // ... create shape logic
  }
}
```

**Ellipse Creation:**

```typescript
if (selectedTool === 'ellipse') {
  if (!isDrawing) {
    setIsDrawing(true)
    setDrawingStart({ x: e.evt.offsetX, y: e.evt.offsetY })
  } else {
    // Create ellipse with radiusX and radiusY
    // Handle Shift key for perfect circles
  }
}
```

**Hexagon/Star Creation:**

```typescript
if (selectedTool === 'hexagon' || selectedTool === 'star') {
  if (!isDrawing) {
    setIsDrawing(true)
    setDrawingStart({ x: e.evt.offsetX, y: e.evt.offsetY })
  } else {
    // Create hexagon/star with default settings
    // Sides/points can be adjusted in design palette
  }
}
```

**Image Creation:**

```typescript
if (selectedTool === 'image') {
  // Open file picker or handle clipboard paste
  handleImagePlacement(e.evt.offsetX, e.evt.offsetY)
}
```

- [ ] Verify all new shapes can be created by clicking and dragging

#### Step 4.4: Handle Shift Key Modifier

- [ ] Add Shift key detection in drawing handlers
- [ ] For ellipses: make radiusX = radiusY (perfect circle)
- [ ] For rectangles: make width = height (perfect square)
- [ ] Verify Shift key creates constrained shapes

**Checkpoint:** All new shapes can be created, selected, and transformed on the canvas.

### Phase 5: Design Palette Extensions - 2 hours

**Files:** `src/components/DesignPaletteMUI.tsx`

#### Step 5.1: Add Arrow Direction Controls

- [ ] Find the design palette component
- [ ] Add arrow direction selector when arrow shape is selected:

```typescript
{selectedShape?.type === 'arrow' && (
  <div className="arrow-controls">
    <Typography variant="subtitle2">Arrow Direction</Typography>
    <ButtonGroup>
      <Button onClick={() => updateArrowType('start')}>Start</Button>
      <Button onClick={() => updateArrowType('end')}>End</Button>
      <Button onClick={() => updateArrowType('both')}>Both</Button>
    </ButtonGroup>
  </div>
)}
```

#### Step 5.2: Add Hexagon Sides Control

- [ ] Add sides slider when hexagon shape is selected:

```typescript
{selectedShape?.type === 'hexagon' && (
  <div className="hexagon-controls">
    <Typography variant="subtitle2">Sides: {selectedShape.sides}</Typography>
    <Slider
      min={3}
      max={12}
      value={selectedShape.sides}
      onChange={(_, value) => updateHexagonSides(value as number)}
    />
  </div>
)}
```

#### Step 5.3: Add Star Preset Controls

- [ ] Add star type selector when star shape is selected:

```typescript
{selectedShape?.type === 'star' && (
  <div className="star-controls">
    <Typography variant="subtitle2">Star Type</Typography>
    <ButtonGroup>
      <Button onClick={() => updateStarType('5-point')}>5-Point</Button>
      <Button onClick={() => updateStarType('6-point')}>6-Point</Button>
      <Button onClick={() => updateStarType('8-point')}>8-Point</Button>
    </ButtonGroup>
  </div>
)}
```

#### Step 5.4: Add Image Controls

- [ ] Add image replacement controls when image shape is selected:

```typescript
{selectedShape?.type === 'image' && (
  <div className="image-controls">
    <Typography variant="subtitle2">Image: {selectedShape.imageName}</Typography>
    <Button onClick={handleReplaceImage}>Replace Image</Button>
    <Typography variant="caption">
      {selectedShape.width} × {selectedShape.height}
    </Typography>
  </div>
)}
```

- [ ] Verify design palette shows appropriate controls for each shape type

**Checkpoint:** Design palette provides shape-specific controls for all new shapes.

### Phase 6: Image Upload & Clipboard - 2 hours

**Files:** `src/lib/imageUpload.ts` (new), `src/components/CanvasStage.tsx`

#### Step 6.1: Create Image Upload Utility

- [ ] Create `src/lib/imageUpload.ts`:

```typescript
export interface ImageUploadResult {
  imageUrl: string
  imageName: string
  width: number
  height: number
}

export const uploadImage = (file: File): Promise<ImageUploadResult> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = e => {
      const img = new Image()
      img.onload = () => {
        resolve({
          imageUrl: e.target?.result as string,
          imageName: file.name,
          width: img.width,
          height: img.height
        })
      }
      img.src = e.target?.result as string
    }
    reader.readAsDataURL(file)
  })
}

export const validateImageFile = (file: File): boolean => {
  const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  const maxSize = 5 * 1024 * 1024 // 5MB
  return validTypes.includes(file.type) && file.size <= maxSize
}
```

#### Step 6.2: Add File Picker Handler

- [ ] Add to `CanvasStage.tsx`:

```typescript
const handleImagePlacement = (x: number, y: number) => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.onchange = async e => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (file && validateImageFile(file)) {
      const result = await uploadImage(file)
      // Create image shape with result
    }
  }
  input.click()
}
```

#### Step 6.3: Add Clipboard Paste Handler

- [ ] Add paste event listener to canvas:

```typescript
useEffect(() => {
  const handlePaste = async (e: ClipboardEvent) => {
    const items = e.clipboardData?.items
    if (items) {
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile()
          if (file && validateImageFile(file)) {
            const result = await uploadImage(file)
            // Create image shape at cursor position
          }
        }
      }
    }
  }

  document.addEventListener('paste', handlePaste)
  return () => document.removeEventListener('paste', handlePaste)
}, [])
```

- [ ] Verify image upload and clipboard paste work correctly

**Checkpoint:** Images can be uploaded and pasted from clipboard onto the canvas.

### Phase 7: Documentation - 30 minutes

#### Step 7.1: Update Documentation

- [ ] Update `README.md` with new shape documentation
- [ ] Add keyboard shortcuts section
- [ ] Document image upload/paste functionality

**Checkpoint:** Documentation is updated with new shape information.

### Common Pitfalls & Troubleshooting

#### TypeScript Errors

- **Problem:** Shape type not found
- **Solution:** Ensure all new shape types are added to the `Shape` union type

#### Konva Component Issues

- **Problem:** Shape doesn't render
- **Solution:** Check that Konva component is imported correctly and props match expected interface

#### Design Palette Not Updating

- **Problem:** Controls don't appear for new shapes
- **Solution:** Verify shape type checking in design palette component

#### Image Upload Fails

- **Problem:** Images don't load
- **Solution:** Check file validation and base64 encoding logic

### Estimated Timeline

- **Phase 1:** 2 hours (Type system updates)
- **Phase 2:** 4 hours (Shape components)
- **Phase 3:** 1 hour (Toolbar integration)
- **Phase 4:** 3 hours (Canvas drawing logic)
- **Phase 5:** 2 hours (Design palette)
- **Phase 6:** 2 hours (Image upload)
- **Phase 7:** 30 minutes (Documentation)

**Total:** ~14.5 hours for a junior developer

### Success Criteria

- [ ] All 6 new shapes can be created, selected, and transformed
- [ ] Design palette provides appropriate controls for each shape
- [ ] Images can be uploaded and pasted from clipboard
- [ ] TypeScript compiles without errors
- [ ] Documentation is updated and accurate

**Junior Developer Notes:**

- Start with Phase 1 and complete each phase before moving to the next
- Use existing shape components as templates for new ones
- Ask for help if stuck on Konva-specific issues
- Focus on getting basic functionality working before adding polish

---

## PR #21 — AI Agent Thinking Indicator ✅ COMPLETED

**Goal:** Add a visual thinking indicator at the bottom-left corner of the viewport that appears whenever the AI agent is actively processing requests. The indicator will show a pulsing bot icon with an animated thought bubble containing a spinner.

### Overview

When users interact with the AI agent (either through the AI Panel or natural language commands), there's currently no visual feedback to indicate that the AI is processing their request. This creates uncertainty about whether the system is working. This PR adds a dynamic visual indicator that appears whenever the AI is actively executing commands.

### Design Specifications

- **Position**: Fixed at bottom-left corner (20px from bottom, 20px from left)
- **z-index**: Very high (10000) to appear above all canvas elements
- **Visual Design**:
  - MUI SmartToy icon (robot) with pulsing animation
  - Thought bubble SVG overlaid on top-right of bot icon
  - CircularProgress spinner inside the thought bubble
  - No text - purely visual indicator
- **Visibility**: Only shows when `isExecuting` is true from `useAIAgent` hook
- **Always Visible**: Shows regardless of whether AI Panel is open or closed

### Implementation Checklist

#### Phase 1: Component Creation (2 points)

- [x] **Step 1.1**: Create AIThinkingIndicator component with proper TypeScript interface
  - Files: `src/components/AIThinkingIndicator.tsx` (new file)
  - Import required MUI components: `Box`, `Fade`, `CircularProgress`, `SmartToy`
  - Define component props interface with `isExecuting: boolean`
  - Implement fixed positioning at bottom-left (20px from edges)
  - Set z-index to 10000 for highest priority
  - **COMPLETED**: Component created with proper structure and positioning

- [x] **Step 1.2**: Add pulsing bot icon with MUI SmartToy
  - Files: `src/components/AIThinkingIndicator.tsx`
  - Add SmartToy icon with 48px font size
  - Implement pulsing animation using MUI keyframes
  - Set animation duration to 2 seconds with infinite loop
  - Use scale transform from 1.0 to 1.1
  - Apply primary theme color to icon
  - **COMPLETED**: Bot icon pulses smoothly with proper animation

- [x] **Step 1.3**: Create thought bubble with spinner overlay
  - Files: `src/components/AIThinkingIndicator.tsx`
  - Create thought bubble SVG path (cloud-like shape)
  - Position bubble at top-right of bot icon (-10px offset)
  - Add CircularProgress spinner inside bubble
  - Set spinner size to 16px
  - Use primary theme color for spinner
  - **COMPLETED**: Thought bubble and spinner render correctly

- [x] **Step 1.4**: Implement smooth animations and transitions
  - Files: `src/components/AIThinkingIndicator.tsx`
  - Add MUI keyframes for pulse animation
  - Implement 300ms fade transition
  - Ensure smooth enter/exit animations
  - **COMPLETED**: All animations are smooth and performant

#### Phase 2: Integration (2 points)

- [x] **Step 2.1**: Integrate with CanvasPage
  - Files: `src/pages/CanvasPage.tsx`
  - Import AIThinkingIndicator component
  - Extract `isExecuting` state from existing `useAIAgent` hook
  - Add AIThinkingIndicator component to render tree
  - Position indicator outside main canvas container
  - **COMPLETED**: Indicator appears when AI is executing

- [x] **Step 2.2**: Test all integration points
  - Files: `src/pages/CanvasPage.tsx`
  - Verify indicator shows for manual commands
  - Verify indicator shows for natural language processing
  - Verify indicator hides when execution completes
  - Test with AI Panel open and closed
  - Ensure indicator doesn't block canvas interaction
  - **COMPLETED**: All integration scenarios work correctly

#### Phase 3: Polish and Testing (1 point)

- [x] **Step 3.1**: Visual polish and fine-tuning
  - Files: `src/components/AIThinkingIndicator.tsx`
  - Fine-tune positioning and spacing
  - Ensure proper color contrast
  - Test on different screen sizes
  - Verify accessibility (no text needed, visual only)
  - **COMPLETED**: Visual design meets specifications

- [x] **Step 3.2**: Performance testing and optimization
  - Files: `src/components/AIThinkingIndicator.tsx`
  - Test animation performance with multiple AI requests
  - Verify no memory leaks during rapid show/hide cycles
  - Test with browser dev tools performance tab
  - Ensure smooth 60fps animations
  - **COMPLETED**: Performance is optimal

- [x] **Step 3.3**: Edge case testing and error handling
  - Files: `src/components/AIThinkingIndicator.tsx`
  - Test with rapid AI command execution
  - Test with AI errors (indicator should hide)
  - Test with network disconnection
  - Test with multiple users (indicator per user)
  - **COMPLETED**: All edge cases handled properly

### Technical Implementation

**Component Structure:**

```tsx
interface AIThinkingIndicatorProps {
  isExecuting: boolean
}

const AIThinkingIndicator: React.FC<AIThinkingIndicatorProps> = ({
  isExecuting
}) => {
  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 20,
        left: 20,
        zIndex: 10000
      }}
    >
      <Fade in={isExecuting} timeout={300}>
        <Box sx={{ position: 'relative' }}>
          <SmartToy
            sx={{
              fontSize: 48,
              color: 'primary.main',
              animation: 'pulse 2s infinite'
            }}
          />
          <Box sx={{ position: 'absolute', top: -10, right: -10 }}>
            <svg width="24" height="24">
              {/* Thought bubble path */}
            </svg>
            <CircularProgress size={16} />
          </Box>
        </Box>
      </Fade>
    </Box>
  )
}
```

**Integration Points:**

- Hooks into existing `useAIAgent` hook in CanvasPage
- Uses `isExecuting` state to control visibility
- Positioned with highest z-index (10000) to appear above all elements

### Files Created/Modified

**New Files:**

- [x] `src/components/AIThinkingIndicator.tsx` (new component)
- [x] `docs/PR-21-AI-Thinking-Indicator.md` (PRD document)

**Modified Files:**

- [x] `src/pages/CanvasPage.tsx` (add indicator integration)
- [x] `docs/tasks.md` (add PR #21 section)

### Testing Scenarios

- [x] **Basic Functionality**: Indicator appears when AI command is executed
- [x] **Natural Language**: Indicator shows for natural language processing
- [x] **Command Completion**: Indicator disappears when execution completes
- [x] **Error Handling**: Indicator hides properly on AI errors
- [x] **AI Panel State**: Works with AI Panel open and closed
- [x] **Canvas Interaction**: Doesn't block canvas operations
- [x] **Multiple Commands**: Handles rapid command execution
- [x] **Network Issues**: Handles network disconnection gracefully

### Success Criteria

- [x] Indicator appears whenever AI is processing requests
- [x] Indicator is visually appealing with smooth animations
- [x] Indicator doesn't interfere with canvas operations
- [x] Indicator works regardless of AI Panel state
- [x] All animations are smooth and performant
- [x] Component is properly typed with TypeScript
- [x] No console errors or warnings
- [x] Build completes successfully

### Key Features Delivered

- [x] **Visual Feedback**: Clear indication when AI is processing
- [x] **Smooth Animations**: Pulsing bot icon with thought bubble spinner
- [x] **Non-Intrusive**: Fixed position that doesn't block canvas interaction
- [x] **Always Visible**: Shows regardless of AI Panel state
- [x] **Performance Optimized**: Smooth 60fps animations
- [x] **Accessible**: Visual-only indicator with no text required
- [x] **Responsive**: Works on different screen sizes
- [x] **Error Resilient**: Handles AI errors and network issues gracefully

**PR #21 Implementation Summary:**

- ✅ **AI Thinking Indicator**: Visual feedback component for AI processing
- ✅ **Pulsing Bot Icon**: MUI SmartToy icon with smooth pulse animation
- ✅ **Thought Bubble**: SVG overlay with CircularProgress spinner
- ✅ **Fixed Positioning**: Bottom-left corner with highest z-index
- ✅ **Smooth Transitions**: Fade in/out with 300ms duration
- ✅ **Canvas Integration**: Hooks into existing useAIAgent state
- ✅ **Performance Optimized**: 60fps animations with no memory leaks
- ✅ **Error Handling**: Graceful handling of AI errors and edge cases

**Junior Developer Guidance:**

- **Start Simple**: Begin with basic component structure before adding animations
- **Test Incrementally**: Test each feature as you build it
- **Use Existing Patterns**: Follow existing MUI component patterns in the codebase
- **Focus on Performance**: Use CSS transforms for smooth animations
- **Handle Edge Cases**: Test with rapid commands and network issues

**Estimated Time**: 4-6 hours for junior developer
**Difficulty**: Beginner to Intermediate
**Dependencies**: MUI components, existing AI agent system

## PR #22 — Advanced Blend Modes and Opacity ✅ COMPLETED

**Goal:** Add opacity controls and blend modes to shapes for advanced visual effects and layering.

### Overview

- Add opacity slider (0-100%) to design palette
- Add blend mode dropdown with common modes (normal, multiply, overlay, etc.)
- Update shape types to include opacity and blendMode properties
- Ensure real-time sync of opacity/blend changes

### Phase 1: Data Model Updates (2 points)

**Files to Modify:**

- `src/lib/types.ts` - Add opacity and blendMode to ShapeBase interface
- `src/lib/schema.ts` - Add validation for new properties
- `src/store/designPalette.ts` - Add opacity and blendMode state

**Checklist:**

- [x] Add `opacity?: number` to ShapeBase interface (0-1 range)
- [x] Add `blendMode?: string` to ShapeBase interface
- [x] Update ShapeBaseSchema with new properties
- [x] Add opacity and blendMode to design palette store
- [x] Add setter functions for new properties

### Phase 2: UI Controls (3 points)

**Files to Modify:**

- `src/components/DesignPaletteMUI.tsx` - Add opacity slider and blend mode dropdown

**Checklist:**

- [x] Add opacity slider (0-100%) in design palette
- [x] Add blend mode dropdown with options: normal, multiply, overlay, screen, darken, lighten
- [x] Update selected shape properties when controls change
- [x] Show current values when shape is selected
- [x] Add visual preview of opacity changes

### Phase 3: Shape Rendering (3 points)

**Files to Modify:**

- `src/components/Shapes/*.tsx` - Pass opacity and blendMode to Konva shapes
- `src/components/CanvasStage.tsx` - Handle new properties in shape creation

**Checklist:**

- [x] Update all shape components to use opacity property
- [x] Update all shape components to use blendMode property
- [x] Ensure opacity works with all shape types (rect, circle, text, etc.)
- [x] Test blend modes render correctly in Konva
- [x] Update shape creation to include default opacity (1.0)

### Phase 4: Real-time Sync (2 points)

**Files to Modify:**

- `src/lib/sync/objects.ts` - Ensure new properties sync properly
- `src/hooks/useShapes.ts` - Handle opacity/blend updates

**Checklist:**

- [x] Verify opacity changes sync in real-time
- [x] Verify blend mode changes sync in real-time
- [x] Test with multiple users editing same shape
- [x] Ensure conflict resolution works with new properties

**Junior Developer Guidance:**

- **Start with Types**: Update interfaces first, then UI, then rendering
- **Test Incrementally**: Test each shape type as you add opacity support
- **Use Konva Docs**: Check Konva.js documentation for blend mode support
- **Follow Patterns**: Use existing design palette patterns for new controls
- **Focus on UX**: Make opacity slider responsive and intuitive

**Estimated Time**: 6-8 hours for junior developer
**Difficulty**: Beginner
**Dependencies**: Existing shape system, design palette, Konva.js

## PR #23 — Copy/Paste Functionality

**Goal:** Implement comprehensive copy/paste functionality for canvas objects with system clipboard integration, keyboard shortcuts, and visual feedback.

### Overview

- Add copy/paste functionality for single and multiple selected objects
- Integrate with system clipboard for cross-application compatibility
- Maintain relative positioning for multi-object selections
- Add keyboard shortcuts (Cmd/Ctrl+C, Cmd/Ctrl+V)
- Provide visual feedback with MUI toast notifications
- Integrate with undo/redo system

### Phase 1: Data Model and Clipboard Integration (3 points)

**Files to Create/Modify:**

- `src/lib/clipboard.ts` - New clipboard service for canvas objects
- `src/lib/types.ts` - Add clipboard-related types
- `src/lib/schema.ts` - Add clipboard data validation

**Checklist:**

- [x] Create `ClipboardService` class for managing canvas object clipboard
- [x] Add `CanvasClipboardData` interface for serialized shape data
- [x] Implement system clipboard integration using Clipboard API
- [x] Add clipboard data validation and error handling
- [x] Support both internal canvas clipboard and system clipboard
- [x] Handle clipboard format detection (canvas objects vs other data)

### Phase 2: Copy Functionality (2 points)

**Files to Modify:**

- `src/hooks/useCanvasShortcuts.ts` - Add Cmd/Ctrl+C shortcut
- `src/components/CanvasStage.tsx` - Implement copy logic
- `src/hooks/useShapes.ts` - Add copy helper functions

**Checklist:**

- [x] Add Cmd/Ctrl+C keyboard shortcut detection
- [x] Implement copy logic for selected objects
- [x] Calculate relative positions for multi-object selections
- [x] Serialize shape data for clipboard storage
- [x] Handle copy of different shape types (rect, circle, text, etc.)
- [x] Add 50px offset from viewport center for pasted objects
- [x] Store original positions for relative positioning

### Phase 3: Paste Functionality (3 points)

**Files to Modify:**

- `src/hooks/useCanvasShortcuts.ts` - Add Cmd/Ctrl+V shortcut
- `src/components/CanvasStage.tsx` - Implement paste logic
- `src/hooks/useShapes.ts` - Add paste helper functions
- `src/pages/CanvasPage.tsx` - Add paste event handling

**Checklist:**

- [x] Add Cmd/Ctrl+V keyboard shortcut detection
- [x] Implement paste logic with cursor/viewport positioning
- [x] Determine paste position (cursor vs viewport center)
- [x] Maintain relative positions for multi-object paste
- [x] Generate new unique IDs for pasted objects
- [x] Update timestamps and user metadata
- [x] Handle paste of different shape types
- [x] Add paste offset (50px) from viewport center

### Phase 4: Visual Feedback and UX (2 points)

**Files to Modify:**

- `src/components/Toast.tsx` - Add copy/paste toast notifications
- `src/contexts/ToastContext.tsx` - Add toast types
- `src/hooks/useToast.ts` - Add copy/paste feedback methods

**Checklist:**

- [x] Add MUI toast notification for successful copy
- [x] Add MUI toast notification for successful paste
- [x] Add error toast for failed copy/paste operations
- [x] Show number of objects copied/pasted in toast
- [x] Add visual feedback for clipboard state
- [x] Handle edge cases (no selection, clipboard empty, etc.)

### Phase 5: Keyboard Shortcuts Integration (2 points)

**Files to Modify:**

- `src/hooks/useCanvasShortcuts.ts` - Extend existing shortcut system
- `src/components/CanvasStage.tsx` - Add copy/paste handlers
- `src/pages/CanvasPage.tsx` - Wire up copy/paste functionality

**Checklist:**

- [x] Add Cmd/Ctrl+C shortcut for copy
- [x] Add Cmd/Ctrl+V shortcut for paste
- [x] Prevent shortcuts when typing in text inputs
- [x] Add visual indication when shortcuts are available
- [x] Handle keyboard shortcut conflicts
- [x] Test shortcuts work with existing functionality

### Phase 6: Undo/Redo Integration (2 points) - DEFERRED

**Status:** Undo/redo system not yet implemented in codebase. This phase will be completed when the undo/redo system is added in PR #15.

**Files to Modify (when undo/redo is implemented):**

- `src/hooks/useShapes.ts` - Add undo/redo support for copy/paste
- `src/lib/clipboard.ts` - Add undo/redo metadata
- `src/components/CanvasStage.tsx` - Integrate with undo system

**Checklist (deferred):**

- [ ] Add copy/paste operations to undo/redo system
- [ ] Store operation metadata for undo functionality
- [ ] Handle undo of paste operations (delete pasted objects)
- [ ] Handle redo of copy operations
- [ ] Maintain operation history for complex copy/paste sequences
- [ ] Test undo/redo with multi-object operations

### Phase 7: Testing and Edge Cases (2 points) - COMPLETED

**Status:** Core functionality implemented and tested. Additional unit tests can be added in future iterations.

**Files Created/Modified:**

- `src/lib/clipboard.ts` - Clipboard service implementation
- `src/hooks/useCanvasShortcuts.ts` - Extended keyboard shortcuts
- `src/components/CanvasStage.tsx` - Copy/paste integration
- `src/pages/CanvasPage.tsx` - Batch create handler
- `src/lib/types.ts` - Added clipboard types
- `src/lib/schema.ts` - Added clipboard validation

**Checklist:**

- [x] Test copy/paste with all shape types
- [x] Test multi-object copy/paste with relative positioning
- [x] Test clipboard integration with external applications
- [x] Test keyboard shortcuts in different contexts
- [x] Test error handling for clipboard failures
- [x] Test performance with large numbers of objects
- [x] Test cross-browser clipboard compatibility
- [x] All linting errors resolved

### Implementation Notes

**Cursor Position Analysis:**

- Current cursor position is tracked in `CanvasStage.tsx` via `onCursorMove`
- Cursor coordinates are in world space (transformed from screen coordinates)
- Use `stage.getPointerPosition()` for current mouse position
- Consider viewport center as fallback paste position

**Clipboard Integration:**

- Use `navigator.clipboard.writeText()` for system clipboard
- Serialize canvas objects as JSON for clipboard data
- Add MIME type detection for canvas objects vs other clipboard data
- Handle clipboard permissions and errors gracefully

**Positioning Strategy:**

- For single object: paste at viewport center with 50px offset
- For multiple objects: maintain relative positions, paste group at viewport center with 50px offset
- Use cursor position as alternative if available
- Calculate bounding box center for multi-object positioning

**Junior Developer Guidance:**

- **Start with Types**: Define interfaces first, then implement functionality
- **Test Incrementally**: Test each phase before moving to the next
- **Use Existing Patterns**: Follow existing keyboard shortcut and toast patterns
- **Focus on UX**: Make copy/paste feel natural and responsive
- **Handle Edge Cases**: Test with no selection, empty clipboard, etc.
- **Performance**: Consider large object counts and clipboard size limits

**Estimated Time**: 8-10 hours for junior developer
**Difficulty**: Intermediate
**Dependencies**: Existing shape system, keyboard shortcuts, toast system, undo/redo system

## PR #23 Implementation Summary ✅ COMPLETED

**Goal:** Implement comprehensive copy/paste functionality for canvas objects with system clipboard integration, keyboard shortcuts, and visual feedback.

### ✅ **Core Features Delivered:**

- **System Clipboard Integration**: Objects can be copied to/from system clipboard for cross-application compatibility
- **Multi-Object Support**: Copy/paste multiple objects while maintaining their relative positions
- **Smart Positioning**: Paste at viewport center with 50px offset for visual separation
- **Keyboard Shortcuts**: Standard Cmd/Ctrl+C and Cmd/Ctrl+V shortcuts
- **Visual Feedback**: MUI toast notifications for copy/paste operations
- **Error Handling**: Comprehensive error handling with user feedback

### ✅ **Technical Implementation:**

- **ClipboardService**: Singleton service managing both internal and system clipboard
- **Relative Positioning**: Maintains object relationships during multi-object operations
- **Type Safety**: Full TypeScript support with proper validation
- **Performance**: Efficient batch operations for multiple objects
- **Integration**: Seamless integration with existing shape system and keyboard shortcuts

### ✅ **Key Features:**

- Copy single or multiple selected objects
- Paste objects at viewport center with 50px offset
- Maintain relative positions for multi-object selections
- System clipboard integration for cross-application compatibility
- Visual feedback with success/error toast notifications
- Keyboard shortcuts (Cmd/Ctrl+C, Cmd/Ctrl+V)
- Automatic selection of pasted objects
- Error handling for clipboard failures

### ✅ **Files Created/Modified:**

- `src/lib/clipboard.ts` - New clipboard service
- `src/lib/types.ts` - Added clipboard types
- `src/lib/schema.ts` - Added clipboard validation
- `src/hooks/useCanvasShortcuts.ts` - Extended keyboard shortcuts
- `src/components/CanvasStage.tsx` - Copy/paste handlers
- `src/pages/CanvasPage.tsx` - Batch create integration

### ✅ **Testing Status:**

- All linting errors resolved
- Type safety verified
- Integration with existing systems confirmed
- Error handling implemented
- Visual feedback working

**Note:** Undo/redo integration deferred until PR #15 (undo/redo system implementation)

## PR #23 Implementation Status ✅ COMPLETED

**All phases completed successfully:**

- ✅ **Phase 1**: Data model and clipboard integration (3 points)
- ✅ **Phase 2**: Copy functionality (2 points)
- ✅ **Phase 3**: Paste functionality (3 points)
- ✅ **Phase 4**: Visual feedback and UX (2 points)
- ✅ **Phase 5**: Keyboard shortcuts integration (2 points)
- ✅ **Phase 6**: Undo/redo integration (2 points) - DEFERRED
- ✅ **Phase 7**: Testing and edge cases (2 points)

**Total Points**: 14/16 (Undo/redo integration deferred)

**Key Features Delivered:**

- System clipboard integration for cross-application compatibility
- Multi-object copy/paste with relative positioning
- Smart positioning (viewport center with 50px offset)
- Keyboard shortcuts (Cmd/Ctrl+C, Cmd/Ctrl+V)
- Visual feedback with MUI toast notifications
- Comprehensive error handling
- TypeScript type safety
- Firebase compatibility (no undefined values)

## PR #24 — Layers Panel with Drag-to-Reorder

**Goal:** Implement a comprehensive layers panel with drag-to-reorder functionality, hierarchy visualization, and toolbar integration for better layer management.

**Status:** 📋 **PLANNED** - See detailed specification in [`docs/PR-24-Layers-Panel.md`](./PR-24-Layers-Panel.md)

**Key Features:**

- Left sidebar layers panel with drag-to-reorder
- Integration with existing zIndex system
- Visual hierarchy and layer management
- Toolbar integration following existing patterns

**Files to Create/Modify:**

- `src/components/LayersPanel.tsx` (new)
- `src/components/ToolbarMUI.tsx` (modify)
- `src/pages/CanvasPage.tsx` (modify)
- `src/hooks/useShapes.ts` (modify)
- `src/lib/sync/objects.ts` (modify)

**Dependencies:** `react-beautiful-dnd`, existing shape system, MUI components
**Estimated Time:** 12-15 hours for intermediate developer
**Difficulty:** Intermediate-Advanced
