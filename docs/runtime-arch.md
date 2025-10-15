sequenceDiagram
autonumber
participant U1 as User A (Browser)
participant U2 as User B (Browser)
participant CL1 as Client App (React + Konva)
participant CL2 as Client App (React + Konva)
participant AUTH as Firebase Auth
participant FS_CANVAS as Firestore (canvases/{id})
participant FS_OBJECTS as Firestore (canvases/{id}/objects/{objectId})
participant FS_PRESENCE as Firestore (canvases/{id}/presence/{userId})

Note over U1,AUTH: Google OAuth Login
U1->>AUTH: Sign in with Google
AUTH-->>CL1: currentUser (id, displayName, email)
U1->>CL1: Open /canvas

Note over U2,AUTH: Google OAuth Login
U2->>AUTH: Sign in with Google
AUTH-->>CL2: currentUser (id, displayName, email)
U2->>CL2: Open /canvas

Note over CL1,FS_OBJECTS: Initial load & subscriptions
CL1->>FS_CANVAS: subscribe canvases/{id} (onSnapshot)
FS_CANVAS-->>CL1: canvas metadata snapshot
CL1->>FS_OBJECTS: subscribe canvases/{id}/objects (onSnapshot)
FS_OBJECTS-->>CL1: current objects snapshot
CL1->>FS_PRESENCE: set presence (user online), start cursor heartbeats
FS_PRESENCE-->>CL1: presence/cursor updates from others
CL1->>CL1: design palette ready to show object info (updatedAt/updatedBy)

Note over CL2,FS_OBJECTS: Initial load & subscriptions
CL2->>FS_CANVAS: subscribe canvases/{id} (onSnapshot)
FS_CANVAS-->>CL2: canvas metadata snapshot
CL2->>FS_OBJECTS: subscribe canvases/{id}/objects (onSnapshot)
FS_OBJECTS-->>CL2: current objects snapshot
CL2->>FS_PRESENCE: set presence (user online), start cursor heartbeats
FS_PRESENCE-->>CL2: presence/cursor updates from others

Note over CL1,FS_OBJECTS: Object mutation (optimistic)
U1->>CL1: Drag rectangle (move/resize)
CL1->>CL1: Optimistic update (React Query cache)
CL1->>FS_OBJECTS: write object delta (updatedAt/updatedBy)
FS_OBJECTS-->>CL1: confirm snapshot
FS_OBJECTS-->>CL2: broadcast snapshot
CL2->>CL2: reconcile update

Note over CL1,FS_PRESENCE: Cursor broadcast (throttled 50ms)
CL1->>FS_PRESENCE: cursor position (throttled)
FS_PRESENCE-->>CL2: cursor position for User A
CL2->>CL2: smooth render (interpolate)

Note over CL1,CL2: Conflict policy (last-write-wins)
CL2->>FS_OBJECTS: move same object (near-same time)
FS_OBJECTS-->>CL1: snapshot (last-write-wins by updatedAt)
FS_OBJECTS-->>CL2: snapshot (winner reconciled everywhere)
CL1->>CL1: display "Last edited by [name] at [time]" in design palette
CL2->>CL2: display "Last edited by [name] at [time]" in design palette

Note over CL1,FS_OBJECTS: Refresh / reconnect
U1->>CL1: Refresh page
CL1->>FS_CANVAS: resubscribe canvas metadata
CL1->>FS_OBJECTS: resubscribe and hydrate objects
FS_OBJECTS-->>CL1: latest snapshot
CL1->>FS_PRESENCE: presence re-join + heartbeat
