# CollabCanvas Demo Script (2-3 minutes)

## Opening (15 seconds)

"I'm Tyler Pohn and this is my CollabCanvas built with React, Konva.js, and Firebase. Deployed to vercel.

## Authentication & Setup (20 seconds)

"We use Google OAuth, and once you log in display name and avatar is immediately visible to other collaborators.

_[Show login page, then switch to canvas]_

## Core Canvas Features (45 seconds)

"Here's our main canvas interface. We have a large, infinite workspace with smooth pan and zoom.

\*demo each tool

_[Create several shapes, demonstrate transformations]_

## Real-Time Collaboration (45 seconds)

The presence system shows live cursors with user names.

-Demo log in with moblin and creating shape on other device

We debounce cursor location updates until the cursor stops moving. It even tracks slow moving cursors, but I blew up my free tier with more aggeressive tracking, so it'll remain like this for now.

We use a 'last write wins' conflict resolution for simultaneous edits
\*demo simultaneous edit

_[Show presence list, cursor movement, simultaneous editing]_

## Advanced Features (30 seconds)

"CollabCanvas includes several productivity features:

- Keyboard shortcuts: Delete key to remove objects, Cmd+D to duplicate
- Arrow keys for precise 5-pixel nudging
- Double-click text to edit inline
- Persistent state - if I refresh the page, all my work is preserved

_[Demonstrate keyboard shortcuts, text editing, refresh to show persistence]_

## Architecture & Performance (30 seconds)

"Under the hood, CollabCanvas uses a sophisticated architecture:

- React 19 + TypeScript with Konva.js for high-performance 2D rendering
- React Query provides optimistic updates and intelligent caching
- Custom ObjectSyncService bridges React Query with Firebase Firestore
- Debounced updates give us smooth interactions without overwhelming the database
- PresenceService manages real-time cursors with 50ms throttling
- Last-write-wins conflict resolution with automatic rollback
- Memoized components and WebGL acceleration ensure 60fps performance

The system supports 500+ objects and 5+ concurrent users. This solid foundation is ready for AI-powered canvas manipulation through natural language commands."
