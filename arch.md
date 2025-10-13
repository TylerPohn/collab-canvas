flowchart LR
%% ========= CLIENT APP =========
subgraph Client
direction TB
A1[app - App Router - layout tsx - auth login or signup - canvas page tsx]
A2[components - CanvasStage Konva - Shapes - CursorLayer - PresenceList - Toolbar - AuthProvider]
A3[hooks - usePanZoom - useShapes React Query - usePresence React Query - useCanvasShortcuts]
A4[store - selection ts UI only]
A5[lib - types ts and schema ts - sync objects - sync presence - firebase client - firebase firestore - react query client]
A6[styles - globals css - Tailwind CSS]
end

%% ========= TESTING TOOLING =========
subgraph Tooling
direction TB
T1[Vitest and RTL unit component - tests unit]
T2[Playwright e2e - tests e2e]
T3[Firebase Emulators - Auth - Firestore]
T4[GitHub Actions CI - dot github workflows ci yml]
end

%% ========= BACKEND =========
subgraph Backend
direction TB
F1[Auth - Google OAuth - currentUser - displayName]
F2[Firestore synced state - canvases id - objects objectId - metadata viewport]
F3[Firestore presence - heartbeat documents - cursor positions]
end

%% ========= HOSTING DELIVERY =========
subgraph Hosting
direction TB
H1[Vercel Next js hosting]
H2[Firebase Hosting optional]
H3[NPM scripts build - pnpm build start test]
end

%% ========= DATA FLOWS =========
A2 -->|Render and Input| A3
A3 -->|mutations and queries| A5
A5 -->|subscribe onSnapshot| F2
A5 -->|write deltas create move resize rotate delete| F2
A3 -->|cursor and presence updates throttled| F2
F2 -->|presence feed and other cursors| A2

A2 -->|Auth state and guards| F1
F1 -->|currentUser| A2

%% Hosting and CI relations
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
T4 -->|run unit then emulators then e2e| T1
T4 --> T2
T4 --> T3

%% Developer loop
Dev[Developer or Coding Agent] -->|PRs| Repo[(GitHub Repo)]
Repo -->|CI| T4
T4 -->|status checks| Repo
Repo -->|deploy| H1
