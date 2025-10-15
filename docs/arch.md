flowchart LR
%% ========= CLIENT APP =========
subgraph Client
direction TB
A1[src - main tsx - App tsx - pages - auth login - canvas page]
A2[components - CanvasStage Konva - Shapes - CursorLayer - PresenceList - Toolbar shadcn/ui - DesignPalette with object info - AuthProvider]
A3[hooks - usePanZoom - useShapes React Query - usePresence React Query - useCanvasShortcuts]
A4[store - selection ts - designPalette ts UI state]
A5[lib - types ts and schema ts - sync objects - sync presence - firebase client - firebase firestore - react query client]
A6[styles - globals css - Tailwind CSS - shadcn/ui components]
end

%% ========= DEVELOPMENT TOOLING =========
subgraph Tooling
direction TB
T1[ESLint - Code linting and formatting]
T2[Prettier - Code formatting]
T3[TypeScript - Type checking]
T4[Vite - Build tool and dev server]
end

%% ========= BACKEND =========
subgraph Backend
direction TB
F1[Auth - Google OAuth - currentUser - displayName]
F2[Firestore Canvas Documents - canvases/{id} with meta and objects subcollections]
F3[Firestore Objects - canvases/{id}/objects/{objectId} - shapes with metadata]
F4[Firestore Presence - canvases/{id}/presence/{userId} - heartbeat and cursors]
end

%% ========= HOSTING DELIVERY =========
subgraph Hosting
direction TB
H1[Vercel - Deployed and publicly accessible]
H2[NPM scripts - dev build preview lint format typecheck]
H3[Environment Variables - Firebase config via VITE_*]
end

%% ========= DATA FLOWS =========
A2 -->|Render and Input| A3
A3 -->|mutations and queries| A5
A5 -->|subscribe onSnapshot| F2
A5 -->|write deltas create move resize rotate delete| F3
A3 -->|cursor and presence updates throttled| F4
F4 -->|presence feed and other cursors| A2
F3 -->|object updates real-time| A2

A2 -->|Auth state and guards| F1
F1 -->|currentUser| A2

%% Hosting and deployment relations
A1 --> H1
A2 --> H1
A3 --> H1
H1 -->|deployed app| A1

T1 --> A2
T1 --> A3
T1 --> A5
T2 --> A1
T3 --> F1
T3 --> F2
T3 --> F3
T3 --> F4

%% Developer loop
Dev[Developer or Coding Agent] -->|PRs| Repo[(GitHub Repo)]
Repo -->|deploy| H1
