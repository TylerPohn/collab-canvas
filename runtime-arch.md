sequenceDiagram
autonumber
participant U1 as User A (Browser)
participant U2 as User B (Browser)
participant CL1 as Client App (React/Next + Konva)
participant CL2 as Client App (React/Next + Konva)
participant AUTH as Firebase Auth
participant FS as Firestore (objects, canvas meta)
participant FS_PRESENCE as Firestore (presence + cursors)

Note over U1,AUTH: Google OAuth Login
U1->>AUTH: Sign in with Google
AUTH-->>CL1: currentUser (id, displayName, email)
U1->>CL1: Open /canvas

Note over U2,AUTH: Google OAuth Login
U2->>AUTH: Sign in with Google
AUTH-->>CL2: currentUser (id, displayName, email)
U2->>CL2: Open /canvas

Note over CL1,FS: Initial load & subscriptions
CL1->>FS: subscribe canvases/{id}/objects (onSnapshot)
FS-->>CL1: current objects snapshot
CL1->>FS_PRESENCE: set presence (user online), start cursor heartbeats
FS_PRESENCE-->>CL1: presence/cursor updates from others

Note over CL2,FS: Initial load & subscriptions
CL2->>FS: subscribe canvases/{id}/objects (onSnapshot)
FS-->>CL2: current objects snapshot
CL2->>FS_PRESENCE: set presence (user online), start cursor heartbeats
FS_PRESENCE-->>CL2: presence/cursor updates from others

Note over CL1,FS: Object mutation (optimistic)
U1->>CL1: Drag rectangle (move/resize)
CL1->>CL1: Optimistic update (React Query cache)
CL1->>FS: write object delta (updatedAt/updatedBy)
FS-->>CL1: confirm snapshot
FS-->>CL2: broadcast snapshot
CL2->>CL2: reconcile update

Note over CL1,FS_PRESENCE: Cursor broadcast (throttled)
CL1->>FS_PRESENCE: cursor position (throttle)
FS_PRESENCE-->>CL2: cursor position for User A
CL2->>CL2: smooth render (interpolate)

Note over CL1,CL2: Conflict policy
CL2->>FS: move same object (near-same time)
FS-->>CL1: snapshot (last-write-wins by updatedAt)
FS-->>CL2: snapshot (winner reconciled everywhere)

Note over CL1,FS: Refresh / reconnect
U1->>CL1: Refresh page
CL1->>FS: resubscribe and hydrate objects
FS-->>CL1: latest snapshot
CL1->>FS_PRESENCE: presence re-join + heartbeat
