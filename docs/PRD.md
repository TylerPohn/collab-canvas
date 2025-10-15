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

- **Deployed and publicly accessible** on Vercel with Firebase backend.
- Environment variables configured for production Firebase project.

---

## **4. Tech Stack (Implemented)**

### **Frontend**

- **React + TypeScript** for predictable UI development.
- **Konva.js** for canvas manipulation and shape rendering (chosen for performance with multiple concurrent users).
- **React Query** for local state and data synchronization with optimistic updates.
- **Tailwind CSS** for styling and responsive design.

### **Backend**

- **Firebase** (implemented):
  - **Firestore** for syncing canvas state with subcollections structure.
  - **Firebase Auth** for Google OAuth authentication.
  - Built-in **WebSocket-like** sync eliminates manual socket management.

### **Data Model**

- **Canvas Documents:** `canvases/{id}` containing metadata and viewport state.
- **Objects Subcollection:** `canvases/{id}/objects/{objectId}` for individual shapes.
- **Presence Subcollection:** `canvases/{id}/presence/{userId}` for user presence and cursors.

### **AI Integration (Post-MVP)**

- **OpenAI GPT-4 or Anthropic Claude** with **function calling** to interpret natural language commands into canvas actions.

### **Hosting & Deployment**

- **Frontend:** Vercel (deployed and publicly accessible).
- **Backend:** Firebase (production environment configured).

---

## **5. Technical Implementation and Considerations**

| Category                | Implementation Status                        | Current Mitigation                                                          |
| ----------------------- | -------------------------------------------- | --------------------------------------------------------------------------- |
| **Sync Architecture**   | ✅ Implemented with Firestore subcollections | `onSnapshot` listeners with React Query for optimistic updates              |
| **Performance**         | ✅ Optimized with debouncing and batching    | Debounced updates (100ms), cursor throttling (50ms), batch operations       |
| **Conflict Resolution** | ✅ Implemented with last-write-wins          | Timestamp-based conflict resolution with `updatedAt` and `updatedBy` fields |
| **Persistence**         | ✅ Canvas metadata and viewport persistence  | Canvas metadata stored in Firestore, viewport state persisted on changes    |
| **Authentication UX**   | ✅ Smooth auth flow with loading states      | Loading spinners, auth state management, automatic redirects                |
| **Real-time Features**  | ✅ Full presence and cursor tracking         | Heartbeat system (30s), cursor throttling, presence cleanup on disconnect   |

---

## **6. Performance Implementation Status**

- **Canvas FPS:** ✅ Optimized rendering with Konva.js and React Query caching.
- **Sync Speed:**
  - ✅ Object changes: Debounced to 100ms for smooth interaction
  - ✅ Cursor positions: Throttled to 50ms for real-time feel

- **Load:** ⚠️ Theoretical capacity for 500+ objects and 5+ users (not load tested).
- **Optimizations Implemented:**
  - Batch operations for multiple object updates
  - Debounced viewport persistence (500ms)
  - Smart conflict resolution with timestamps
  - Efficient Firestore subcollection structure

---

## **7. Current Status and Next Steps**

### **✅ Completed (MVP)**

1. **Phase 1:** ✅ Firebase project, user auth, and real-time connection implemented.
2. **Phase 2:** ✅ Real-time cursor and object sync with React Query.
3. **Phase 3:** ✅ Transformations, persistence, and deployed MVP on Vercel.

### **🚧 Future Enhancements**

4. **Phase 4 (Post-MVP):** Begin AI agent integration and higher-order commands.
5. **Testing Infrastructure:** Add unit tests, e2e tests, and CI/CD pipeline.
6. **Performance Testing:** Load test with 500+ objects and 5+ concurrent users.
7. **Advanced Features:** Layer management, undo/redo, export functionality.
