# CollabCanvas Demo Script (2-3 minutes)

## Opening (15 seconds)

"I'm Tyler Pohn and this is my CollabCanvas built with React, Konva.js, and Firebase.

## Authentication & Setup (20 seconds)

"First, let me show you the authentication flow. Users sign in with Google OAuth, and their display names and avatars are immediately visible to other collaborators. The presence system tracks who's online in real-time, which we'll see in a minute."

_[Show login page, then switch to canvas]_

## Core Canvas Features (45 seconds)

"Here's our main canvas interface. We have a large, infinite workspace with smooth pan and zoom capabilities. The toolbar provides four essential tools: select, rectangle, circle, and text.

Let me demonstrate the shape creation workflow:

- Select the rectangle tool and click-drag to create shapes
- Switch to circle tool for circular elements
- Use the text tool to add labels
- The select tool allows you to move, resize, and rotate any object

Notice the real-time visual feedback - every action is smooth and responsive, maintaining 60 FPS even with multiple objects."

_[Create several shapes, demonstrate transformations]_

## Real-Time Collaboration (60 seconds)

"This is where CollabCanvas truly shines. Let me open this same canvas on another device to show you the multiplayer experience.

_[Switch to second browser/device]_

Watch what happens when I create a shape on the other device... _[create shape]_ ...it appears instantly on this screen. Now let me move this circle... _[move shape]_ ...and you can see the movement is synchronized in real-time.

The presence system shows live cursors with user names. See how my cursor appears on both screens as I move around? This gives collaborators immediate awareness of who's working where.

The firebase updates to a cursor's coordinates are debounced in the UI such that it won't update until the cursor stops moving. I blew up my free tier tracking moving cursors, so it'll remain like this for now. 

Let me demonstrate simultaneous editing - I'll resize a shape on both devices at the same time... _[create shapes simultaneously]_ ...and watch how the system handles concurrent updates without conflicts. 

The 'last write wins' conflict resolution ensures data consistency while maintaining the collaborative experience."

_[Show presence list, cursor movement, simultaneous editing]_

## Advanced Features (30 seconds)

"CollabCanvas includes several productivity features:

- Keyboard shortcuts: Delete key to remove objects, Cmd+D to duplicate
- Arrow keys for precise 5-pixel nudging
- Double-click text to edit inline
- Persistent state - if I refresh the page, all my work is preserved

The system uses React Query for optimistic updates and Firebase Firestore for real-time synchronization, ensuring durability."

_[Demonstrate keyboard shortcuts, text editing, refresh to show persistence]_

## Architecture & Performance (20 seconds)

"Under the hood, CollabCanvas is built for scale:

- Konva.js provides high-performance 2D rendering
- Firebase handles real-time sync with sub-100ms latency
- React Query manages local state
- The system supports 500+ objects and 5+ concurrent users without performance degradation

This solid foundation is ready for the next phase: AI-powered canvas manipulation through natural language commands."

---

## Demo Flow Checklist:

- [ ] Open app in two different browsers/devices
- [ ] Show authentication flow
- [ ] Demonstrate shape creation (rectangle, circle, text)
- [ ] Show transformations (move, resize, rotate)
- [ ] Demonstrate real-time sync between devices
- [ ] Show presence awareness and live cursors
- [ ] Test simultaneous editing
- [ ] Demonstrate keyboard shortcuts
- [ ] Show text editing capability
- [ ] Test persistence (refresh page)
- [ ] Mention AI future vision

## Technical Notes for Demo:

- Ensure both devices are logged in with different Google accounts
- Have shapes pre-created for faster demo flow
- Test network connection stability
- Have backup plan if real-time sync has issues
- Keep demo focused on core collaborative features
- Emphasize the technical achievement of real-time multiplayer canvas
