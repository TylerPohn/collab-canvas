# 🎨 Collab Canvas

**🚀 LIVE DEMO:** [https://collab-canvas-chi.vercel.app](https://collab-canvas-chi.vercel.app)

A real-time collaborative canvas application built with React, TypeScript, and Firebase. Multiple users can simultaneously create, edit, and collaborate on shapes in real-time with live cursors and presence awareness.

## ✨ Features

### 🔒 **Enterprise-Grade Security**

- 🛡️ **Content Security Policy (CSP)** with Google Auth compatibility
- 🚫 **XSS Protection** with input sanitization using DOMPurify
- ⚡ **Rate Limiting** for shape creation and cursor updates
- 🔐 **Secure Headers** (X-Frame-Options, X-XSS-Protection, etc.)
- 📊 **Security Audit Logging** with structured event tracking
- 🔄 **Session Management** with automatic token refresh
- 🚪 **Cross-Origin-Opener-Policy** for secure popup authentication

### 🎨 **Collaborative Canvas**

- 🎨 **Real-time collaborative canvas** with multiple users
- 🔧 **Shape creation and manipulation** (rectangles, circles, text)
- 👥 **Multi-user presence** with live cursors and user avatars
- 🔐 **Firebase authentication** with Google OAuth
- ⚡ **Optimistic updates** with React Query and conflict resolution
- 🎯 **Smooth pan/zoom** with Konva.js (60fps)
- 📱 **Responsive design** with Tailwind CSS
- 🔄 **Real-time synchronization** with debounced updates (100ms)
- 🎪 **Live cursor tracking** with 50ms throttling
- 💾 **Persistent canvas state** across sessions
- 🎨 **Design palette** with shape styling and object information
- 📝 **Advanced text formatting** with alignment, line height, and style controls
- 📶 **Offline editing** with operation queuing and automatic sync
- 🚀 **Deployed and publicly accessible** on Vercel

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS
- **UI Components**: Material-UI (MUI) ✅ _Implemented_
- **Icons**: lucide-react ✅ _Implemented_
- **Canvas**: Konva.js with React-Konva
- **State Management**: React Query (TanStack Query) + Zustand
- **Authentication**: Firebase Auth (Google OAuth)
- **Database**: Firestore with real-time subscriptions
- **Routing**: React Router v7
- **Build Tool**: Vite
- **Linting**: ESLint + Prettier
- **Deployment**: Vercel
- **Security**: DOMPurify, CSP headers, rate limiting, input validation
- **Monitoring**: Health checks, security audit logging

## 🚀 Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn
- Firebase project (free tier available)

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

## 🔧 Troubleshooting

### Common Issues

#### Firebase Connection Issues

- **Problem**: "Firebase connection failed" error
- **Solution**:
  1. Verify your Firebase configuration in `.env.local`
  2. Check that your Firebase project has Authentication and Firestore enabled
  3. Ensure your domain is added to Firebase authorized domains
  4. Check browser console for specific error messages

#### Authentication Problems

- **Problem**: Google OAuth not working
- **Solution**:
  1. Verify Google provider is enabled in Firebase Console
  2. Add `localhost:5173` to authorized domains in Firebase
  3. Check that OAuth consent screen is configured
  4. Ensure `VITE_FIREBASE_AUTH_DOMAIN` matches your Firebase project

#### Build Errors

- **Problem**: TypeScript or build errors
- **Solution**:
  1. Run `npm run typecheck` to identify type errors
  2. Run `npm run lint:fix` to fix linting issues
  3. Ensure all dependencies are installed with `npm install`
  4. Check that Node.js version is 18.x or higher

#### Real-time Sync Issues

- **Problem**: Changes not syncing between users
- **Solution**:
  1. Check Firestore security rules are properly configured
  2. Verify users are authenticated
  3. Check browser network tab for Firestore connection errors
  4. Ensure Firestore database is in production mode

#### Performance Issues

- **Problem**: Canvas lag or slow performance
- **Solution**:
  1. Check browser performance tab for frame drops
  2. Reduce number of shapes on canvas
  3. Check for memory leaks in browser dev tools
  4. Verify rate limiting is not being exceeded

### Environment-Specific Setup

#### Development Environment

- Use `localhost:5173` for local development
- Enable Firebase emulators for offline development (optional)
- Use development Firebase project for testing

#### Production Environment

- Deploy to Vercel with production Firebase project
- Configure production domain in Firebase authorized domains
- Use production Firestore security rules
- Enable Firebase App Check for additional security (optional)

## 📜 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run typecheck` - Run TypeScript type checking

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── CanvasStage.tsx  # Main canvas component with Konva
│   ├── Toolbar.tsx      # Drawing tools and controls
│   ├── DesignPalette.tsx # Right sidebar for shape styling and object info
│   ├── CursorLayer.tsx  # Multi-user cursor rendering
│   ├── PresenceList.tsx # User presence display
│   ├── EmptyCanvasState.tsx # Empty state component
│   ├── TextEditor.tsx   # Inline text editing
│   ├── Toast.tsx        # Toast notifications
│   ├── ProfileMenu.tsx  # User profile and authentication
│   ├── ProtectedRoute.tsx # Route protection component
│   ├── ConnectionStatus.tsx # Connection status indicator
│   ├── providers/       # Context providers
│   │   └── AuthProvider.tsx
│   ├── Shapes/          # Shape components
│   │   ├── RectangleShape.tsx
│   │   ├── CircleShape.tsx
│   │   └── TextShape.tsx
│   ├── DesignPaletteMUI.tsx # MUI-based design palette
│   └── ToolbarMUI.tsx       # MUI-based toolbar
├── hooks/               # Custom React hooks
│   ├── usePanZoom.ts    # Canvas pan/zoom logic
│   ├── usePresence.ts   # User presence management
│   ├── usePresenceQuery.ts # Presence React Query hooks
│   ├── useShapes.ts     # Shape state management
│   ├── useCanvasShortcuts.ts # Keyboard shortcuts
│   ├── useToast.ts      # Toast notifications
│   ├── useAuth.ts       # Authentication hook
│   └── useConnectionStatus.ts # Connection status hook
├── lib/                 # Utility libraries
│   ├── firebase/        # Firebase configuration
│   │   ├── client.ts    # Firebase client setup
│   │   └── firestore.ts # Firestore operations
│   ├── react-query/     # React Query setup
│   ├── sync/            # Real-time sync logic
│   │   ├── objects.ts   # Object synchronization
│   │   └── presence.ts  # Presence synchronization
│   ├── health.ts        # Health monitoring
│   ├── security.ts      # Security utilities and validation
│   ├── types.ts         # TypeScript types
│   ├── schema.ts        # Data schemas
│   ├── toastTypes.ts    # Toast type definitions
│   └── utils.ts         # Utility functions
├── pages/               # Page components
│   ├── LoginPage.tsx    # Authentication page
│   └── CanvasPage.tsx   # Main canvas page
├── contexts/            # React contexts
│   ├── AuthContext.tsx  # Authentication context
│   ├── ToastContext.tsx # Toast context
│   └── ToastContextDefinition.tsx
├── store/               # Local state management
│   ├── selection.ts     # Selection state (Zustand)
│   └── designPalette.ts # Design palette state (Zustand)
├── App.tsx              # Main app component
└── main.tsx             # App entry point
```

## 🔥 Firebase Setup

### Authentication Setup

1. In Firebase Console, go to Authentication > Sign-in method
2. Enable Google provider
3. Add your domain to authorized domains:
   - `localhost:5173` for development
   - `your-app.vercel.app` for production

### Firestore Setup

1. In Firebase Console, go to Firestore Database
2. Create database in production mode
3. Set up security rules (see below)
4. The app uses subcollections structure:
   - `canvases/{canvasId}` - Canvas metadata
   - `canvases/{canvasId}/objects/{objectId}` - Individual shapes
   - `canvases/{canvasId}/presence/{userId}` - User presence and cursors

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

## 📦 Dependencies

### Core Dependencies

#### Frontend Framework

- **React 19.1.1** - Modern React with concurrent features and improved performance
- **React DOM 19.1.1** - React rendering for web browsers
- **TypeScript 5.9.3** - Type safety and enhanced developer experience

#### Build & Development Tools

- **Vite 7.1.7** - Fast build tool and development server
- **@vitejs/plugin-react 5.0.4** - React plugin for Vite
- **ESLint 9.36.0** - Code linting and quality enforcement
- **Prettier 3.6.2** - Code formatting
- **TypeScript ESLint 8.46.1** - TypeScript-specific linting rules

#### UI & Styling

- **Tailwind CSS 4.1.14** - Utility-first CSS framework
- **@tailwindcss/postcss 4.1.14** - PostCSS integration for Tailwind
- **tailwindcss-animate 1.0.7** - Animation utilities for Tailwind
- **lucide-react 0.545.0** - Beautiful, customizable SVG icons

#### Material-UI (MUI) Components

- **@mui/material 7.3.4** - Core Material-UI component library
- **@mui/icons-material 7.3.4** - Material Design icons
- **@emotion/react 11.14.0** - CSS-in-JS library for MUI
- **@emotion/styled 11.14.1** - Styled components for MUI

#### Canvas & Graphics

- **Konva 10.0.2** - 2D canvas library for high-performance graphics
- **React-Konva 19.0.10** - React bindings for Konva

#### State Management & Data Fetching

- **@tanstack/react-query 5.90.2** - Powerful data synchronization for React
- **@tanstack/react-query-devtools 5.90.2** - DevTools for React Query
- **Zustand 5.0.8** - Lightweight state management

#### Authentication & Database

- **Firebase 12.4.0** - Backend-as-a-Service for authentication and database
- **React Router DOM 7.9.4** - Declarative routing for React

#### Security & Validation

- **DOMPurify 3.3.0** - XSS sanitization library
- **@types/dompurify 3.0.5** - TypeScript definitions for DOMPurify
- **Zod 4.1.12** - TypeScript-first schema validation

#### Utilities

- **Autoprefixer 10.4.21** - CSS vendor prefixing
- **PostCSS 8.5.6** - CSS transformation tool

### Development Dependencies

#### Type Definitions

- **@types/node 24.6.0** - Node.js type definitions
- **@types/react 19.1.16** - React type definitions
- **@types/react-dom 19.1.9** - React DOM type definitions

#### Linting & Formatting

- **@eslint/js 9.36.0** - ESLint JavaScript configuration
- **eslint-plugin-react-hooks 5.2.0** - React Hooks linting rules
- **eslint-plugin-react-refresh 0.4.22** - React Refresh linting rules
- **globals 16.4.0** - Global variables for ESLint

#### Build Tools

- **babel-plugin-react-compiler 19.1.0-rc.3** - React Compiler plugin for Babel

### Dependency Management

#### Version Compatibility

- **Node.js**: 18.x or higher required
- **npm**: 8.x or higher recommended
- **React**: 19.x (latest stable)
- **TypeScript**: 5.9.x (latest stable)
- **Firebase**: 12.x (latest stable)

#### Security Considerations

- All dependencies are regularly updated to latest stable versions
- Security vulnerabilities are monitored and patched promptly
- DOMPurify provides XSS protection for user-generated content
- Firebase provides enterprise-grade security for authentication and data

#### Performance Impact

- **Bundle Size**: Optimized with Vite's tree-shaking and code splitting
- **Runtime Performance**: React 19 concurrent features improve user experience
- **Canvas Performance**: Konva provides 60fps rendering for smooth interactions
- **Network Optimization**: React Query provides intelligent caching and synchronization

#### Maintenance Guidelines

- **Regular Updates**: Dependencies are updated monthly for security and features
- **Breaking Changes**: Major version updates are tested thoroughly before deployment
- **Security Patches**: Critical security updates are applied immediately
- **Performance Monitoring**: Bundle size and runtime performance are monitored

## 🔧 Environment Variables

See `.env.example` for all required environment variables:

| Variable                            | Description                  | Example                           |
| ----------------------------------- | ---------------------------- | --------------------------------- |
| `VITE_FIREBASE_API_KEY`             | Firebase API key             | `AIzaSyC...`                      |
| `VITE_FIREBASE_AUTH_DOMAIN`         | Firebase auth domain         | `my-project.firebaseapp.com`      |
| `VITE_FIREBASE_PROJECT_ID`          | Firebase project ID          | `my-project-12345`                |
| `VITE_FIREBASE_STORAGE_BUCKET`      | Firebase storage bucket      | `my-project.appspot.com`          |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID | `123456789012`                    |
| `VITE_FIREBASE_APP_ID`              | Firebase app ID              | `1:123456789012:web:abcdef123456` |

## 💻 Development

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

### Design Palette Features

The right sidebar design palette provides comprehensive shape styling and object information:

- **Object Information**: Shows "Last edited at [timestamp] by [name]" for selected objects
- **Shape Styling**: Fill/stroke colors, stroke width, corner radius controls
- **Text Formatting**: Font family, size, weight, style, and decoration options
- **Layer Management**: Bring forward/backward controls with z-index management
- **Real-time Updates**: All changes apply immediately to selected shapes
- **Multi-selection Support**: Styling changes apply to all selected objects

### Real-time Features

The app implements sophisticated real-time collaboration:

- **Object Synchronization**: Shapes sync across users with optimistic updates
- **Presence Tracking**: Live user presence with heartbeat system (30s intervals)
- **Cursor Tracking**: Real-time cursor positions with 50ms throttling
- **Conflict Resolution**: Last-write-wins with timestamp-based resolution using `updatedAt` and `updatedBy` fields, displayed in design palette
- **Performance Optimization**: Debounced updates (100ms) and batch operations

## 🚀 Deployment

### Vercel (Recommended) ✅ DEPLOYED

**Current Status**: The app is deployed and publicly accessible at [https://collab-canvas-chi.vercel.app](https://collab-canvas-chi.vercel.app)

1. **Connect Repository**:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository
   - Select the `collab-canvas` folder as the root directory

2. **Configure Build Settings**:
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

3. **Set Environment Variables**:
   In your Vercel project settings, add these environment variables:

   ```
   VITE_FIREBASE_API_KEY=your_api_key_here
   VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

4. **Configure Firebase for Production**:
   - In Firebase Console, go to Authentication > Settings > Authorized domains
   - Add your Vercel domain (e.g., `your-app.vercel.app`)
   - Update Firestore security rules if needed for production

5. **Deploy**:
   - Click "Deploy" to trigger the first deployment
   - Future pushes to your main branch will auto-deploy

### Manual Deployment

1. Build the application:

   ```bash
   npm run build
   ```

2. Deploy the `dist/` folder to your hosting provider

### Environment Variables for Production

All environment variables must be prefixed with `VITE_` to be accessible in the browser:

| Variable                            | Description                  | Example                           |
| ----------------------------------- | ---------------------------- | --------------------------------- |
| `VITE_FIREBASE_API_KEY`             | Firebase API key             | `AIzaSyC...`                      |
| `VITE_FIREBASE_AUTH_DOMAIN`         | Firebase auth domain         | `my-project.firebaseapp.com`      |
| `VITE_FIREBASE_PROJECT_ID`          | Firebase project ID          | `my-project-12345`                |
| `VITE_FIREBASE_STORAGE_BUCKET`      | Firebase storage bucket      | `my-project.appspot.com`          |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID | `123456789012`                    |
| `VITE_FIREBASE_APP_ID`              | Firebase app ID              | `1:123456789012:web:abcdef123456` |

### Firebase Production Setup

1. **Authentication**:
   - Enable Google provider in Firebase Console
   - Add your production domain to authorized domains
   - Configure OAuth consent screen if needed

2. **Firestore**:
   - Ensure database is in production mode
   - Update security rules for production use
   - Consider setting up indexes for better performance

3. **Security Rules**:

   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /canvases/{canvasId} {
         allow read, write: if request.auth != null;

         match /objects/{objectId} {
           allow read, write: if request.auth != null;
         }

         match /presence/{userId} {
           allow read: if request.auth != null;
           allow write: if request.auth != null && request.auth.uid == userId;
         }
       }
     }
   }
   ```

## ⚡ Performance

- **Canvas rendering**: Optimized with Konva.js for smooth 60fps
- **Real-time updates**: Debounced and batched for efficiency
- **Cursor tracking**: Throttled to 50ms intervals with interpolation
- **Shape updates**: Optimistic updates with conflict resolution
- **React optimization**: Memoized components to prevent unnecessary re-renders
- **Network optimization**: Smart batching and debouncing to minimize Firestore calls

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

#### Performance Targets ✅ IMPLEMENTED

- **Canvas FPS**: ✅ Optimized for 60 FPS during all operations
- **Sync Latency**:
  - ✅ Object changes: Debounced to 100ms
  - ✅ Cursor positions: Throttled to 50ms
- **Load Capacity**: ⚠️ Theoretical capacity for 500+ shapes and 5+ concurrent users (not load tested)
- **Memory Usage**: ✅ Stable memory usage with proper cleanup

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

- Health status indicator in header (Firebase connection status)
- Network request throttling indicators
- Memory usage warnings in console
- Real-time sync latency measurements

#### Optimization Features ✅ IMPLEMENTED

- **Debounced Updates**: ✅ Drag/resize operations are debounced to 100ms
- **Batch Operations**: ✅ Multiple shape updates are batched together
- **Cursor Interpolation**: ✅ Smooth cursor movement with 60fps interpolation
- **Memoized Components**: ✅ React components are memoized to prevent re-renders
- **Smart Batching**: ✅ Large operations are automatically chunked
- **Conflict Resolution**: ✅ Last-write-wins with timestamp-based resolution using `updatedAt` and `updatedBy` fields, displayed in design palette

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🗺️ Roadmap

### Current Status: MVP Complete ✅

- ✅ Real-time collaborative canvas
- ✅ Multi-user presence and cursors
- ✅ Shape creation and manipulation
- ✅ Firebase authentication
- ✅ Optimistic updates and conflict resolution
- ✅ Deployed and publicly accessible

### Future Enhancements

#### Immediate (Next PR)

- [ ] **Complete UI Overhaul with MUI**: Modern design system across entire app
- [ ] **Homepage Redesign**: Professional landing page with hero section and features
- [ ] **Login Page Redesign**: Modern authentication experience with card-based design
- [ ] **Toolbar Redesign**: Figma-like toolbar with proper tool grouping and shortcuts
- [ ] **Icon System**: lucide-react for consistent iconography throughout the app
- [ ] **Component Library**: Accessible UI components with proper ARIA support

#### Short-term

- [x] **Design Palette Panel**: Right sidebar for shape styling, layer management, and effects ✅ COMPLETED
- [ ] **Testing Infrastructure**: Unit tests, e2e tests, CI/CD pipeline
- [ ] **Mobile optimization**: Touch gestures and responsive design
- [ ] **Performance testing**: Load testing with 500+ shapes and 5+ users

#### Long-term

- [ ] **AI-powered features**: Shape suggestions and natural language commands
- [ ] **Advanced drawing tools**: Pen, brush, freehand drawing
- [ ] **Shape animations**: Transitions and animations
- [ ] **Export functionality**: PNG, SVG, PDF export
- [ ] **Offline mode**: Local storage with sync when online
- [ ] **Advanced collaboration**: Comments, version history
