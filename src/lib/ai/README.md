# AI Agent API Layer

This module provides the foundational API layer for AI agents to manipulate the collaborative canvas through natural language commands.

## Overview

The AI Agent API Layer enables AI agents to:

- Create and manipulate shapes on the canvas
- Perform complex layout operations
- Execute multi-step commands
- Maintain context across operations
- Ensure real-time synchronization across all users

## Architecture

```
src/lib/ai/
├── agent.ts          # Main AI agent service
├── tools.ts          # AI tool definitions and schemas
├── validation.ts     # Command validation and sanitization
├── context.ts        # Context management for multi-step operations
├── security.ts       # Rate limiting and security measures
├── types.ts          # TypeScript type definitions
└── index.ts          # Main exports
```

## Usage

### Basic Usage

```typescript
import { useAIAgent } from '../hooks/useAIAgent'

function MyComponent() {
  const { executeCommand, isExecuting } = useAIAgent(canvasId, userId)

  const handleCreateShape = async () => {
    await executeCommand('createShape', {
      type: 'rect',
      position: { x: 100, y: 100 },
      size: { width: 150, height: 80 },
      fill: '#3B82F6'
    })
  }

  return (
    <button onClick={handleCreateShape} disabled={isExecuting}>
      Create Rectangle
    </button>
  )
}
```

### Complex Commands

```typescript
const { executeComplexCommand } = useAIAgent(canvasId, userId)

const handleCreateForm = async () => {
  await executeComplexCommand('createLoginForm', {
    position: { x: 400, y: 100 },
    styling: {
      backgroundColor: '#FFFFFF',
      borderColor: '#D1D5DB'
    }
  })
}
```

## Available Commands

### Creation Commands

- `createShape` - Create rectangles, circles, or text with full styling support
- `createText` - Create text elements with typography controls
- `createLoginForm` - Create a login form with fields
- `createNavigationBar` - Create a navigation bar

### Manipulation Commands

- `moveShape` - Move shapes to new positions
- `resizeShape` - Resize shapes
- `rotateShape` - Rotate shapes by degrees
- `changeColor` - Change fill or stroke colors
- `copyStyle` - Copy style properties between shapes
- `duplicateShape` - Duplicate shapes with offset positioning

### Layout Commands

- `arrangeInGrid` - Arrange shapes in a grid layout
- `arrangeInRow` - Arrange shapes in a horizontal row
- `arrangeInColumn` - Arrange shapes in a vertical column
- `alignShapes` - Align shapes to left/center/right or top/middle/bottom
- `distributeShapes` - Distribute shapes evenly with specified spacing

### Context Commands

- `getCanvasState` - Get current canvas state
- `findShapes` - Find shapes by criteria

## Visual Effects Support

The AI agent supports advanced visual effects for enhanced design capabilities:

### Blend Modes

All shapes support 12 Canvas 2D blend modes for advanced layering effects:

- `normal` (default) - Standard blending
- `multiply` - Darkens overlapping areas
- `overlay` - Combines multiply and screen
- `screen` - Lightens overlapping areas
- `darken` - Keeps darker pixels
- `lighten` - Keeps lighter pixels
- `color-dodge` - Brightens base color
- `color-burn` - Darkens base color
- `hard-light` - Strong overlay effect
- `soft-light` - Gentle overlay effect
- `difference` - Inverts overlapping areas
- `exclusion` - Softer difference effect

### Opacity Control

- Full opacity control from 0 (transparent) to 1 (opaque)
- Real-time opacity changes with visual feedback
- Opacity affects all shape properties (fill, stroke, text)

### Usage Examples

```typescript
// Create shape with blend mode and opacity
await executeCommand('createShape', {
  type: 'rect',
  position: { x: 100, y: 100 },
  size: { width: 150, height: 80 },
  fill: '#3B82F6',
  blendMode: 'multiply',
  opacity: 0.7
})

// Create text with opacity
await executeCommand('createText', {
  text: 'Hello World',
  position: { x: 200, y: 200 },
  fill: '#000000',
  opacity: 0.8
})
```

## Security Features

- **Rate Limiting**: 30 requests per minute, 500 per hour per user
- **Parameter Validation**: Strict validation using Zod schemas
- **Content Filtering**: Basic protection against malicious content
- **Position Limits**: Reasonable bounds on coordinates and sizes

## Performance

- **Latency Target**: < 2 seconds for single-step commands
- **Batch Operations**: Efficient batch creation and updates
- **Context Management**: Automatic cleanup of expired contexts
- **Optimistic Updates**: Immediate UI feedback with rollback on errors

## Integration

The AI agent integrates seamlessly with the existing canvas system:

1. **Real-time Sync**: All AI-generated changes sync across all users
2. **React Query**: Uses existing query client for state management
3. **Firebase**: Leverages existing Firestore operations
4. **Security**: Integrates with existing security logging

## Demo Component

The AI agent functionality is available through the `useAIAgent` hook and can be integrated into any component as needed.

## Future Enhancements

- Advanced layout algorithms
- Template system for common UI patterns
- Learning system based on user preferences
- Voice command support

## Error Handling

The AI agent provides comprehensive error handling:

- Validation errors for invalid parameters
- Rate limit exceeded errors
- Network errors with automatic retry
- Context errors for expired sessions

All errors are logged and can be handled gracefully in the UI.
