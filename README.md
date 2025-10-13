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

3. Set up environment variables:

   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` with your Firebase configuration values.

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open [http://localhost:5173](http://localhost:5173) in your browser.

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

## Environment Variables

See `.env.example` for all required environment variables:

- `VITE_FIREBASE_*` - Firebase configuration
- `VITE_APP_VERSION` - Application version
- `VITE_DEFAULT_CANVAS_ID` - Default canvas ID
- `VITE_CURSOR_UPDATE_INTERVAL` - Cursor update frequency (ms)
- `VITE_SHAPE_UPDATE_DEBOUNCE` - Shape update debounce (ms)

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
- **Cursor tracking**: Throttled to 50ms intervals
- **Shape updates**: Optimistic updates with conflict resolution

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
