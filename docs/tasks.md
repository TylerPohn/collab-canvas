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

- [ ] **Step 1.1**: Install and configure shadcn/ui with Radix primitives and Tailwind CSS.
  - Files: `package.json`, `components.json`, `tailwind.config.ts`
  - Run: `npx shadcn-ui@latest init`

- [ ] **Step 1.2**: Install lucide-react for consistent iconography.
  - Files: `package.json`
  - Run: `npm install lucide-react`

- [ ] **Step 1.3**: Install core shadcn/ui components needed for the overhaul.
  - Files: `src/components/ui/` (auto-generated)
  - Run: `npx shadcn-ui@latest add button card input label separator tooltip`

### Phase 2: Homepage Redesign

- [ ] **Step 2.1**: Create modern hero section with shadcn/ui Card component.
  - Files: `src/App.tsx` (LandingPage component)
  - Replace basic div with Card, CardHeader, CardContent

- [ ] **Step 2.2**: Add feature showcase with icon grid using lucide-react.
  - Files: `src/App.tsx` (LandingPage component)
  - Use icons: Users, Zap, Palette, Shield, Globe, Heart

- [ ] **Step 2.3**: Implement call-to-action buttons with proper styling.
  - Files: `src/App.tsx` (LandingPage component)
  - Use Button component with variants (default, outline, ghost)

- [ ] **Step 2.4**: Add responsive layout with proper spacing and typography.
  - Files: `src/App.tsx` (LandingPage component)
  - Use Tailwind responsive classes (sm:, md:, lg:)

### Phase 3: Login Page Redesign

- [ ] **Step 3.1**: Create centered login card with shadcn/ui Card component.
  - Files: `src/pages/LoginPage.tsx`
  - Replace basic form with Card, CardHeader, CardContent, CardFooter

- [ ] **Step 3.2**: Add Google OAuth button with proper styling and Google icon.
  - Files: `src/pages/LoginPage.tsx`
  - Use Button component with Google branding colors

- [ ] **Step 3.3**: Implement loading states with shadcn/ui components.
  - Files: `src/pages/LoginPage.tsx`
  - Add loading spinner and disabled states

- [ ] **Step 3.4**: Add error handling with proper visual feedback.
  - Files: `src/pages/LoginPage.tsx`
  - Use Alert component for error messages

### Phase 4: Toolbar Redesign

- [ ] **Step 4.1**: Create modern toolbar component with shadcn/ui components.
  - Files: `src/components/Toolbar.tsx` (refactor existing)
  - Use Button components with proper variants

- [ ] **Step 4.2**: Implement tool selection with proper visual states and hover effects.
  - Files: `src/components/Toolbar.tsx`, `src/components/ui/button.tsx`
  - Add active states and hover effects

- [ ] **Step 4.3**: Add tool groups and separators for better organization.
  - Files: `src/components/Toolbar.tsx`, `src/components/ui/separator.tsx`
  - Group related tools with visual separators

- [ ] **Step 4.4**: Implement keyboard shortcuts display and tooltips.
  - Files: `src/components/Toolbar.tsx`, `src/components/ui/tooltip.tsx`
  - Add tooltips showing keyboard shortcuts

### Phase 5: Component Updates

- [ ] **Step 5.1**: Update ProfileMenu with shadcn/ui components.
  - Files: `src/components/ProfileMenu.tsx`
  - Use DropdownMenu, Avatar, Button components

- [ ] **Step 5.2**: Update PresenceList with modern styling.
  - Files: `src/components/PresenceList.tsx`
  - Use Badge, Avatar, Card components

- [ ] **Step 5.3**: Add responsive design for mobile and tablet views.
  - Files: `src/components/Toolbar.tsx`, `src/pages/LoginPage.tsx`, `src/App.tsx`
  - Implement mobile-first responsive design

- [ ] **Step 5.4**: Add dark mode support (optional enhancement).
  - Files: `tailwind.config.ts`, `src/components/` (various)
  - Implement dark mode toggle and theme switching

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

## PR #12 — Design Palette Panel (Right Sidebar) 🚧 PLANNED

**Goal:** Implement a comprehensive design palette panel on the right side of the canvas for shape styling, layer management, and design controls.

### Phase 1: Panel Structure and Layout

- [ ] **Step 1.1**: Create DesignPalette component with shadcn/ui Card layout.
  - Files: `src/components/DesignPalette.tsx` (new file)
  - Use Card, CardHeader, CardContent, CardTitle components
  - Position as fixed right sidebar (width: 320px)

- [ ] **Step 1.2**: Add panel toggle functionality and responsive behavior.
  - Files: `src/components/DesignPalette.tsx`, `src/pages/CanvasPage.tsx`
  - Add toggle button in toolbar, hide on mobile (< 1024px)
  - Use shadcn/ui Button with PanelLeft icon from lucide-react

- [ ] **Step 1.3**: Create collapsible sections for different design categories.
  - Files: `src/components/DesignPalette.tsx`
  - Use Collapsible component with sections: "Fill & Stroke", "Effects", "Layer", "Text"
  - Each section has ChevronDown icon and proper spacing

### Phase 2: Fill and Stroke Controls

- [ ] **Step 2.1**: Implement color picker for fill color with preset swatches.
  - Files: `src/components/DesignPalette.tsx`
  - Use shadcn/ui ColorPicker or custom color input
  - Add preset color swatches (8-12 common colors)
  - Show current fill color with visual preview

- [ ] **Step 2.2**: Add stroke color and width controls.
  - Files: `src/components/DesignPalette.tsx`
  - Color picker for stroke color
  - Number input for stroke width (0-10px)
  - Toggle for stroke on/off

- [ ] **Step 2.3**: Implement opacity slider for fill and stroke.
  - Files: `src/components/DesignPalette.tsx`
  - Use Slider component (0-100%)
  - Separate controls for fill opacity and stroke opacity
  - Show percentage value next to slider

### Phase 3: Shape Effects and Transformations

- [ ] **Step 3.1**: Add rotation control with visual indicator.
  - Files: `src/components/DesignPalette.tsx`
  - Number input for rotation angle (-360° to 360°)
  - Visual rotation indicator with arrow
  - Reset to 0° button

- [ ] **Step 3.2**: Implement corner radius control for rectangles.
  - Files: `src/components/DesignPalette.tsx`
  - Slider for corner radius (0-50px)
  - Only show for rectangle shapes
  - Visual preview of rounded corners

- [ ] **Step 3.3**: Add shadow and blur effects controls.
  - Files: `src/components/DesignPalette.tsx`
  - Toggle for drop shadow on/off
  - Controls for shadow offset, blur, and color
  - Toggle for blur effect with intensity slider

### Phase 4: Layer Management

- [ ] **Step 4.1**: Implement bring forward/backward controls.
  - Files: `src/components/DesignPalette.tsx`
  - Use Button components with ArrowUp, ArrowDown icons
  - "Bring to Front", "Send to Back", "Bring Forward", "Send Backward"
  - Disable when no shapes selected

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

### Phase 5: Text Styling (for Text Shapes)

- [ ] **Step 5.1**: Add font family selector with common fonts.
  - Files: `src/components/DesignPalette.tsx`
  - Dropdown with web-safe fonts: Arial, Helvetica, Times, Georgia, etc.
  - Only show for text shapes
  - Preview font in dropdown

- [ ] **Step 5.2**: Implement font size, weight, and style controls.
  - Files: `src/components/DesignPalette.tsx`
  - Number input for font size (8-72px)
  - Toggle buttons for Bold, Italic, Underline
  - Use lucide-react icons: Bold, Italic, Underline

- [ ] **Step 5.3**: Add text alignment and spacing controls.
  - Files: `src/components/DesignPalette.tsx`
  - Button group for text alignment (Left, Center, Right)
  - Number inputs for line height and letter spacing
  - Use AlignLeft, AlignCenter, AlignRight icons

### Phase 6: State Management and Integration

- [ ] **Step 6.1**: Create design palette state management with Zustand.
  - Files: `src/store/designPalette.ts` (new file)
  - Store current design settings (fill, stroke, effects, etc.)
  - Store default settings for new shapes
  - Store selected shape IDs and their properties

- [ ] **Step 6.2**: Integrate palette with shape selection and updates.
  - Files: `src/components/DesignPalette.tsx`, `src/components/CanvasStage.tsx`
  - Update palette when shapes are selected
  - Apply palette changes to selected shapes
  - Update shape properties in real-time

- [ ] **Step 6.3**: Implement default settings for new shapes.
  - Files: `src/store/designPalette.ts`, `src/components/CanvasStage.tsx`
  - Apply current palette settings to newly created shapes
  - Reset palette to defaults when no shapes selected
  - Persist default settings across sessions

### Phase 7: Advanced Features and Polish

- [ ] **Step 7.1**: Add preset style templates and quick styles.
  - Files: `src/components/DesignPalette.tsx`
  - Predefined style combinations (Modern, Classic, Bold, etc.)
  - Quick style buttons for common combinations
  - Save custom style presets

- [ ] **Step 7.2**: Implement copy/paste styles between shapes.
  - Files: `src/components/DesignPalette.tsx`
  - "Copy Style" and "Paste Style" buttons
  - Use Copy, Clipboard icons from lucide-react
  - Store copied styles in clipboard state

- [ ] **Step 7.3**: Add keyboard shortcuts for common palette actions.
  - Files: `src/hooks/useCanvasShortcuts.ts`
  - Ctrl/Cmd+C for copy style, Ctrl/Cmd+V for paste style
  - Arrow keys for bring forward/backward
  - Number keys for quick color selection

- [ ] **Step 7.4**: Add responsive design and mobile optimization.
  - Files: `src/components/DesignPalette.tsx`
  - Collapsible on mobile with slide-out animation
  - Touch-friendly controls and larger touch targets
  - Optimize layout for tablet portrait mode

**PR #12 Implementation Plan:**

- **Design Palette Panel**: Comprehensive right sidebar for shape styling
- **Fill & Stroke Controls**: Color pickers, opacity, stroke width
- **Layer Management**: Bring forward/backward, layer list, visibility controls
- **Text Styling**: Font controls, alignment, spacing (for text shapes)
- **State Management**: Zustand store for palette state and defaults
- **Advanced Features**: Style presets, copy/paste, keyboard shortcuts
- **Responsive Design**: Mobile-optimized with collapsible behavior

**Key Features to Deliver:**

- **Right Sidebar Panel**: Fixed 320px width with toggle functionality
- **Fill & Stroke**: Color pickers, opacity sliders, stroke controls
- **Layer Controls**: Bring forward/backward, layer list with drag-and-drop
- **Text Styling**: Font family, size, weight, alignment controls
- **Default Settings**: Apply palette settings to new shapes
- **Style Presets**: Quick style templates and custom presets
- **Copy/Paste Styles**: Transfer styles between shapes
- **Keyboard Shortcuts**: Common actions with keyboard shortcuts
- **Responsive Design**: Mobile-friendly with collapsible behavior

**Junior Developer Guidance:**

Each step is designed to be:

- **Component-focused**: One UI section or feature at a time
- **State-driven**: Clear separation between UI and state management
- **Incremental**: Build upon existing shape system without breaking functionality
- **Testable**: Each control can be tested independently
- **Educational**: Learn advanced React patterns, state management, and UI design

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
