# **Product Requirements Document (PRD) — Collab Canvas MVP**

## **1. Overview**

**Product Goal:**
Collab Canvas is a real-time collaborative design tool — a simplified Figma-like experience — allowing multiple authenticated users to simultaneously interact with a shared visual workspace. The MVP focuses on rock-solid multiplayer synchronization and basic shape manipulation, serving as the foundation for future AI-assisted canvas operations.

**Primary Objective:**
Deliver a **deployed, real-time collaborative canvas** that enables users to:

- Authenticate and identify themselves.
- Create, move, and edit simple shapes and text.
- Observe others’ live cursors and presence.
- Maintain a synchronized shared state across sessions and reconnects.

---

## **2. User Roles and Stories**

### **User Roles**

- **Guest User:** Unauthenticated visitor (limited or no edit access).
- **Authenticated User:** Registered user with edit privileges and presence awareness.
- **Collaborator (Real-time):** Multiple authenticated users editing the same canvas.

### **User Stories**

| Role               | As a...      | I want to...                                                      | So that I can...                                |
| ------------------ | ------------ | ----------------------------------------------------------------- | ----------------------------------------------- |
| Guest              | guest        | view the canvas in read-only mode                                 | preview shared designs without logging in       |
| Authenticated User | user         | sign in with Google OAuth                                         | identify myself and join collaborative sessions |
| Authenticated User | user         | create, move, resize, and delete shapes (rectangle, circle, text) | visually compose elements on the canvas         |
| Collaborator       | collaborator | see other users’ cursors and names in real time                   | know who is editing and where                   |
| Collaborator       | collaborator | see updates to objects instantly as others edit                   | maintain a consistent shared workspace          |
| Collaborator       | collaborator | rejoin and see my work persist                                    | avoid data loss from refreshes or disconnects   |

---

## **3. Key MVP Features**

### **Canvas Features**

- Large 2D workspace with **smooth pan and zoom**.
- **Basic shape support:** rectangle, circle, and text.
- **Transformations:** move, resize, rotate, delete, duplicate.
- **Selection tools:** single-click and drag-to-select.
- **Layer awareness:** z-index management for overlapping shapes.

### **Collaboration Features**

- **Real-time synchronization** across 2+ users via Firestore.
- **React Query** for local state synchronization and optimistic updates.
- **Multiplayer cursors** showing live position and user names.
- **Presence awareness** (online user list) via Firestore heartbeat documents.
- **Conflict resolution:** "Last write wins" approach documented.
- **Persistent state:** canvas state saved and restored on reconnects.

### **Authentication**

- **Google OAuth** authentication only.
- **User display names** from Google account visible in the session.
- Basic session management.

### **Deployment**

- Fully **deployed and publicly accessible** environment (e.g., Vercel + Firebase).

---

## **4. Tech Stack (Proposed)**

### **Frontend**

- **React + TypeScript** for predictable UI development.
- **Konva.js** for canvas manipulation and shape rendering (chosen for performance with multiple concurrent users).
- **React Query** for local state and data synchronization.

### **Backend**

- **Firebase** (preferred for MVP speed):
  - **Firestore** or **Realtime Database** for syncing canvas state.
  - **Firebase Auth** for Google OAuth authentication.
  - Built-in **WebSocket-like** sync eliminates manual socket management.

- Alternatively: **Supabase** or **custom Node.js WebSocket server** using Socket.IO if more control is required.

### **AI Integration (Post-MVP)**

- **OpenAI GPT-4 or Anthropic Claude** with **function calling** to interpret natural language commands into canvas actions.

### **Hosting & Deployment**

- **Frontend:** Vercel, Netlify, or Firebase Hosting (Vite builds to static files).
- **Backend:** Firebase (single environment for MVP).

---

## **5. Technical Pitfalls and Considerations**

| Category                | Potential Pitfall                                                 | Mitigation                                                                     |
| ----------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| **Sync Architecture**   | Firestore sync latency or race conditions between multiple users. | Use `onSnapshot` listeners and batch updates; test with throttled connections. |
| **Performance**         | Rendering hundreds of shapes could drop FPS.                      | Virtualize rendering and debounce update events; maintain under 60 FPS.        |
| **Conflict Resolution** | Concurrent updates to same object can overwrite data.             | Use “last write wins” with timestamps; later enhance with CRDTs.               |
| **Persistence**         | Session disconnects causing lost state.                           | Persist full canvas snapshot every few seconds or on `onDisconnect`.           |
| **Authentication UX**   | Delays in auth initialization on Firebase.                        | Use preloading spinner and store user in local state once loaded.              |
| **Scalability**         | Firestore costs or performance at scale.                          | Consider migration to custom WebSocket server once MVP stabilizes.             |

---

## **6. Performance Targets (from Gauntlet AI Spec)**

- **Canvas FPS:** Maintain 60 FPS for pan, zoom, and object manipulation.
- **Sync Speed:**
  - Object changes < 100ms latency
  - Cursor positions < 50ms latency

- **Load:** Handle 500+ simple objects per canvas and 5+ concurrent users without degradation.

---

## **7. Next Steps**

1. **Phase 1:** Set up Firebase project, user auth, and basic real-time connection.
2. **Phase 2:** Implement real-time cursor and object sync.
3. **Phase 3:** Add transformations, persistence, and deploy MVP.
4. **Phase 4 (Post-MVP):** Begin AI agent integration and higher-order commands.
