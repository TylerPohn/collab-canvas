flowchart LR
%% ========= CLIENT APP =========
subgraph Client
direction TB
A1[src - main tsx - App tsx - pages - auth login - canvas page]
A2[components - CanvasStage Konva - Shapes - CursorLayer - PresenceList - Toolbar - DesignPalette - AuthProvider - TextEditor - Toast - EmptyCanvasState]
A3[hooks - usePanZoom - useShapes React Query - usePresence React Query - useCanvasShortcuts copy/paste - useToast - useAuth - useConnectionStatus]
A4[store - selection ts - designPalette ts UI state with Zustand]
A5[lib - types ts and schema ts - sync objects - sync presence - clipboard ts - firebase client - firebase firestore - react query client - security ts - health ts - utils ts]
A6[styles - globals css - Tailwind CSS - MUI components - lucide-react icons]
A7[contexts - AuthContext - ToastContext - ToastContextDefinition]
A8[MUI components - DesignPaletteMUI ToolbarMUI with Material Design system]
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
F1[Auth - Google OAuth - currentUser - displayName - session management]
F2[Firestore Canvas Documents - canvases/{id} with meta and objects subcollections]
F3[Firestore Objects - canvases/{id}/objects/{objectId} - shapes with metadata - updatedAt/updatedBy tracking]
F4[RTDB Presence - presence/{canvasId}/{userId} - heartbeat and cursors - 30s intervals]
F5[Security - Rate limiting - Input sanitization - XSS protection - CSP headers]
F6[Health Monitoring - Connection status - Firestore availability - Auth service status]
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
A3 -->|cursor and presence updates throttled 25ms| F4
F4 -->|presence feed and other cursors| A2
F3 -->|object updates real-time with conflict resolution| A2

A2 -->|Auth state and guards| F1
F1 -->|currentUser| A2

A5 -->|Security validation and rate limiting| F5
F5 -->|Sanitized data and security events| A5
A5 -->|Health monitoring| F6
F6 -->|Connection status| A2

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

%% ========= COMPONENT ARCHITECTURE =========
subgraph ComponentArchitecture
direction TB
CA1[CanvasPage - Main page component]
CA2[CanvasStage - Konva canvas with shapes and interactions]
CA3[Toolbar - Drawing tools and controls]
CA4[DesignPalette - Right sidebar for styling and object info]
CA5[CursorLayer - Multi-user cursor rendering]
CA6[PresenceList - User presence display]
CA7[TextEditor - Inline text editing]
CA8[Toast - Notification system]
CA9[EmptyCanvasState - Empty state component]
CA10[ProfileMenu - User profile and auth]
CA11[ProtectedRoute - Route protection]
CA12[AuthProvider - Authentication context]
end

%% Component relationships
CA1 --> CA2
CA1 --> CA3
CA1 --> CA4
CA1 --> CA5
CA1 --> CA6
CA1 --> CA7
CA1 --> CA8
CA1 --> CA9
CA1 --> CA10
CA1 --> CA11
CA1 --> CA12

CA2 --> CA5
CA2 --> CA6
CA3 --> CA2
CA4 --> CA2
