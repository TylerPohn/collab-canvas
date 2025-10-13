# Collab Canvas

A real-time collaborative canvas application built with React, TypeScript, and Firebase.

## Features

- 🎨 **Real-time collaborative canvas** with multiple users
- 🔧 **Shape creation and manipulation** (rectangles, circles, text)
- 👥 **Multi-user presence** with live cursors
- 🔐 **Firebase authentication** with Google OAuth
- ⚡ **Optimistic updates** with React Query
- 🎯 **Smooth pan/zoom** with Konva.js
- 📱 **Responsive design** with Tailwind CSS

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS
- **Canvas**: Konva.js
- **State Management**: React Query (TanStack Query)
- **Authentication**: Firebase Auth
- **Database**: Firestore
- **Routing**: React Router
- **Build Tool**: Vite
- **Linting**: ESLint + Prettier

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn
- Firebase project

### Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd collab-canvas
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up Firebase project:

   a. Go to [Firebase Console](https://console.firebase.google.com/)
   b. Create a new project or select an existing one
   c. Enable Authentication with Google provider
   d. Create a Firestore database in production mode
   e. Get your Firebase configuration from Project Settings > General > Your apps

4. Set up environment variables:

   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` with your Firebase configuration values from step 3e:

   ```env
   VITE_FIREBASE_API_KEY=your_api_key_here
   VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

5. Start the development server:

   ```bash
   npm run dev
   ```

6. Open [http://localhost:5173](http://localhost:5173) in your browser.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run typecheck` - Run TypeScript type checking

## Project Structure

```
src/
├── components/          # React components
│   ├── CanvasStage.tsx  # Main canvas component
│   ├── Toolbar.tsx      # Drawing tools
│   ├── CursorLayer.tsx  # Multi-user cursors
│   ├── PresenceList.tsx # User presence
│   └── Shapes/          # Shape components
├── hooks/               # Custom React hooks
│   ├── usePanZoom.ts    # Canvas pan/zoom logic
│   ├── usePresence.ts   # User presence management
│   ├── useShapes.ts     # Shape state management
│   └── useCanvasShortcuts.ts # Keyboard shortcuts
├── lib/                 # Utility libraries
│   ├── firebase/        # Firebase configuration
│   ├── react-query/     # React Query setup
│   ├── sync/            # Real-time sync logic
│   ├── health.ts        # Health monitoring
│   ├── types.ts         # TypeScript types
│   └── schema.ts        # Data schemas
├── pages/               # Page components
│   ├── LoginPage.tsx    # Authentication page
│   └── CanvasPage.tsx   # Main canvas page
├── store/               # Local state management
│   └── selection.ts     # Selection state
├── App.tsx              # Main app component
└── main.tsx             # App entry point
```

## Firebase Setup

### Authentication Setup

1. In Firebase Console, go to Authentication > Sign-in method
2. Enable Google provider
3. Add your domain to authorized domains (localhost:5173 for development)

### Firestore Setup

1. In Firebase Console, go to Firestore Database
2. Create database in production mode
3. Set up security rules (see below)

### Security Rules

Add these Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Canvas documents
    match /canvases/{canvasId} {
      allow read, write: if request.auth != null;

      // Objects within a canvas
      match /objects/{objectId} {
        allow read, write: if request.auth != null;
      }

      // Presence within a canvas
      match /presence/{userId} {
        allow read: if request.auth != null;
        allow write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

## Environment Variables

See `.env.example` for all required environment variables:

- `VITE_FIREBASE_API_KEY` - Firebase API key
- `VITE_FIREBASE_AUTH_DOMAIN` - Firebase auth domain
- `VITE_FIREBASE_PROJECT_ID` - Firebase project ID
- `VITE_FIREBASE_STORAGE_BUCKET` - Firebase storage bucket
- `VITE_FIREBASE_MESSAGING_SENDER_ID` - Firebase messaging sender ID
- `VITE_FIREBASE_APP_ID` - Firebase app ID

## Development

### Code Style

This project uses:

- **ESLint** for code linting
- **Prettier** for code formatting
- **TypeScript** for type safety

Run `npm run format` before committing to ensure consistent formatting.

### Health Monitoring

The application includes a health check system that monitors:

- Firebase connection status
- Firestore availability
- Authentication service status

Health status is displayed in the app header and can be accessed programmatically via `getHealthCheck()`.

## Deployment

### Vercel (Recommended)

1. Connect your repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment

1. Build the application:

   ```bash
   npm run build
   ```

2. Deploy the `dist/` folder to your hosting provider

## Performance

- **Canvas rendering**: Optimized with Konva.js for smooth 60fps
- **Real-time updates**: Debounced and batched for efficiency
- **Cursor tracking**: Throttled to 50ms intervals with interpolation
- **Shape updates**: Optimistic updates with conflict resolution
- **React optimization**: Memoized components to prevent unnecessary re-renders

### Performance Testing

#### Stress Test Script

Run the following manual stress test to verify performance under load:

```bash
# 1. Start the development server
npm run dev

# 2. Open multiple browser tabs/windows to the same canvas URL
# 3. In each tab, perform the following actions rapidly:

# Tab 1: Create many shapes
# - Switch to rectangle tool
# - Create 50+ rectangles by clicking and dragging
# - Switch to circle tool
# - Create 50+ circles
# - Switch to text tool
# - Create 50+ text elements

# Tab 2: Move and resize shapes
# - Select multiple shapes (Ctrl+click)
# - Drag them around rapidly
# - Use transform handles to resize
# - Rotate shapes

# Tab 3: Pan and zoom
# - Use mouse wheel to zoom in/out rapidly
# - Drag canvas to pan around
# - Switch between different zoom levels

# Tab 4: Multi-user interaction
# - Move cursor around rapidly
# - Create shapes while others are moving
# - Test concurrent editing
```

#### Performance Targets

- **Canvas FPS**: Maintain 60 FPS during all operations
- **Sync Latency**:
  - Object changes < 100ms
  - Cursor positions < 50ms
- **Load Capacity**: Handle 500+ shapes and 5+ concurrent users
- **Memory Usage**: Stable memory usage without leaks

#### Profiling Tools

Use these browser tools to monitor performance:

1. **Chrome DevTools Performance Tab**:
   - Record performance during stress test
   - Look for frame drops below 60fps
   - Check for excessive re-renders

2. **React DevTools Profiler**:
   - Profile component renders
   - Identify unnecessary re-renders
   - Check memoization effectiveness

3. **Network Tab**:
   - Monitor Firestore request frequency
   - Verify debouncing is working
   - Check for excessive network calls

#### Performance Monitoring

The app includes built-in performance monitoring:

- Canvas FPS counter (visible in top-left overlay)
- Network request throttling indicators
- Memory usage warnings in console
- Real-time sync latency measurements

#### Optimization Features

- **Debounced Updates**: Drag/resize operations are debounced to 100ms
- **Batch Operations**: Multiple shape updates are batched together
- **Cursor Interpolation**: Smooth cursor movement with 60fps interpolation
- **Memoized Components**: React components are memoized to prevent re-renders
- **Smart Batching**: Large operations are automatically chunked

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Roadmap

- [ ] AI-powered shape suggestions
- [ ] Advanced drawing tools (pen, brush)
- [ ] Shape animations and transitions
- [ ] Export to various formats (PNG, SVG, PDF)
- [ ] Mobile app support
- [ ] Offline mode with sync
