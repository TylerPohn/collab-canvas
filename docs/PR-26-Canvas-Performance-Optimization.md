# PR #26: Canvas Performance Optimization for 200+ Shapes

## Overview

This PR optimizes the canvas state management to efficiently handle 200+ shapes by eliminating O(n²) operations, implementing spatial indexing, and adding strategic memoization. The changes are designed to maintain 60fps performance even with large numbers of shapes.

## Problem Statement

The current canvas implementation has several performance bottlenecks that become problematic with 200+ shapes:

1. **O(n²) Array Operations**: Multiple `shapes.find()` and `array.includes()` calls
2. **Repeated Sorting**: Shapes array sorted on every render
3. **Linear Selection**: Selection rectangle checks all shapes linearly
4. **Inefficient Multi-Drag**: Creates new arrays on every mouse move
5. **No Spatial Indexing**: No fast way to find shapes in a region

## Solution Approach

We'll implement optimizations in 3 phases:

- **Phase 1**: Quick wins with memoization and Map-based lookups
- **Phase 2**: Structural improvements with spatial indexing
- **Phase 3**: Advanced optimizations for edge cases

## Implementation Steps

### Phase 1: Quick Wins (Start Here)

#### Step 1.1: Add Shape Map to useShapes Hook

**File**: `src/hooks/useShapes.ts`

```typescript
// Add this import at the top
import { useMemo } from 'react'

// Update the useShapes function return type
export function useShapes(canvasId: string) {
  // ... existing code ...

  // Add this after the existing return statement
  const shapeMap = useMemo(() => {
    const map = new Map<string, Shape>()
    shapes.forEach(shape => {
      map.set(shape.id, shape)
    })
    return map
  }, [shapes])

  return {
    shapes,
    shapeMap, // Add this line
    isLoading,
    error,
    refetch
  }
}
```

**Testing**: Verify that `shapeMap.get(shapeId)` returns the correct shape.

#### Step 1.2: Replace Array.includes() with Set Lookups

**File**: `src/lib/sync/objects.ts`

Find these functions and replace the filter patterns:

```typescript
// BEFORE (line ~897 in arrangeShapesInGrid)
const targetShapes = shapes.filter(shape => shapeIds.includes(shape.id))

// AFTER
const shapeIdSet = new Set(shapeIds)
const targetShapes = shapes.filter(shape => shapeIdSet.has(shape.id))
```

**Functions to update**:

- `arrangeShapesInGrid` (line ~897)
- `arrangeShapesInRow` (line ~978)
- `spaceShapesEvenly` (line ~1019)
- `arrangeShapesInColumn` (line ~1119)
- `alignShapes` (line ~1163)
- `distributeShapes` (line ~1253)

**Testing**: Create 100+ shapes and test each layout function. Should be noticeably faster.

#### Step 1.3: Memoize Sorted Shapes Array

**File**: `src/components/CanvasStage.tsx`

```typescript
// Add this import at the top
import { useMemo } from 'react'

// Replace the existing shapes.sort() call (around line 1428)
// BEFORE:
{shapes
  .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))
  .map(shape => {

// AFTER:
const sortedShapes = useMemo(() =>
  [...shapes].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0)),
  [shapes]
)

// Then use sortedShapes instead of shapes.sort()
{sortedShapes.map(shape => {
```

**Testing**: Open React DevTools Profiler, create 200 shapes, and verify no unnecessary re-sorts.

#### Step 1.4: Fix Repeated shape.find() in Nudge Handler

**File**: `src/components/CanvasStage.tsx`

```typescript
// Find the handleNudge function (around line 226)
// BEFORE:
selectedIds.forEach(id => {
  onShapeUpdate(id, {
    x: shapes.find(s => s.id === id)!.x + deltaX,
    y: shapes.find(s => s.id === id)!.y + deltaY
  })
})

// AFTER:
const shapeMap = new Map(shapes.map(s => [s.id, s]))
selectedIds.forEach(id => {
  const shape = shapeMap.get(id)
  if (shape) {
    onShapeUpdate(id, {
      x: shape.x + deltaX,
      y: shape.y + deltaY
    })
  }
})
```

**Testing**: Select multiple shapes and use arrow keys to nudge. Should be smoother.

#### Step 1.5: Optimize Transformer Updates

**File**: `src/components/CanvasStage.tsx`

```typescript
// Find the useEffect around line 187
// BEFORE:
useEffect(() => {
  if (transformerRef.current && selectedIds.length > 0) {
    const selectedNodes = selectedIds
      .map(id => stageRef.current?.findOne(`#${id}`))
      .filter(Boolean) as Konva.Node[]
    // ... rest of the code
  }
}, [selectedIds, shapes]) // Remove shapes dependency

// AFTER:
const selectedNodes = useMemo(() => {
  if (selectedIds.length === 0) return []
  return selectedIds
    .map(id => stageRef.current?.findOne(`#${id}`))
    .filter(Boolean) as Konva.Node[]
}, [selectedIds])

useEffect(() => {
  if (transformerRef.current && selectedNodes.length > 0) {
    transformerRef.current.nodes(selectedNodes)
    transformerRef.current.getLayer()?.batchDraw()
  } else if (transformerRef.current) {
    transformerRef.current.nodes([])
    transformerRef.current.getLayer()?.batchDraw()
  }
}, [selectedNodes]) // Only depend on selectedNodes
```

**Testing**: Select/deselect shapes rapidly. Transformer should update smoothly.

#### Step 1.6: Cache Max ZIndex Calculation

**File**: `src/pages/CanvasPage.tsx`

```typescript
// Add this import
import { useMemo } from 'react'

// Add this after the shapes hook
const maxZIndex = useMemo(
  () => shapes.reduce((max, shape) => Math.max(max, shape.zIndex || 0), 0),
  [shapes]
)

// Then replace all instances of:
// shapes.reduce((max, shape) => Math.max(max, shape.zIndex || 0), 0)
// with: maxZIndex
```

**Testing**: Create shapes and verify zIndex calculations are correct.

### Phase 2: Structural Optimizations

#### Step 2.1: Install Spatial Index Library

```bash
npm install rbush
npm install --save-dev @types/rbush
```

#### Step 2.2: Create Spatial Index Hook

**New File**: `src/hooks/useSpatialIndex.ts`

```typescript
import { useMemo, useRef, useEffect } from 'react'
import RBush from 'rbush'
import type { Shape } from '../lib/types'

interface SpatialShape {
  minX: number
  minY: number
  maxX: number
  maxY: number
  shape: Shape
}

export function useSpatialIndex(shapes: Shape[]) {
  const rtree = useRef(new RBush<SpatialShape>())

  const spatialShapes = useMemo(() => {
    return shapes.map(shape => {
      const bounds = getShapeBounds(shape)
      return {
        minX: bounds.x,
        minY: bounds.y,
        maxX: bounds.x + bounds.width,
        maxY: bounds.y + bounds.height,
        shape
      }
    })
  }, [shapes])

  useEffect(() => {
    rtree.current.clear()
    rtree.current.load(spatialShapes)
  }, [spatialShapes])

  const queryShapes = (bounds: {
    x: number
    y: number
    width: number
    height: number
  }) => {
    const results = rtree.current.search({
      minX: bounds.x,
      minY: bounds.y,
      maxX: bounds.x + bounds.width,
      maxY: bounds.y + bounds.height
    })
    return results.map(item => item.shape)
  }

  return { queryShapes }
}

function getShapeBounds(shape: Shape) {
  switch (shape.type) {
    case 'rect':
      return {
        x: shape.x,
        y: shape.y,
        width: shape.width || 0,
        height: shape.height || 0
      }
    case 'circle':
      const radius = shape.radius || 0
      return {
        x: shape.x - radius,
        y: shape.y - radius,
        width: radius * 2,
        height: radius * 2
      }
    case 'text':
      // Estimate text bounds
      const fontSize = shape.fontSize || 16
      const textLength = shape.text?.length || 0
      return {
        x: shape.x,
        y: shape.y,
        width: textLength * fontSize * 0.6,
        height: fontSize * 1.2
      }
    default:
      return { x: shape.x, y: shape.y, width: 100, height: 100 }
  }
}
```

#### Step 2.3: Use Spatial Index for Selection

**File**: `src/components/CanvasStage.tsx`

```typescript
// Add import
import { useSpatialIndex } from '../hooks/useSpatialIndex'

// Add this hook
const { queryShapes } = useSpatialIndex(shapes)

// Replace the selection rectangle logic (around line 687)
// BEFORE:
const shapesInSelection = shapes.filter(shape => {
  const shapeBounds = {
    x: shape.x,
    y: shape.y,
    width: shape.type === 'circle' ? shape.radius * 2 : shape.width || 0,
    height: shape.type === 'circle' ? shape.radius * 2 : shape.height || 0
  }
  // ... intersection logic
})

// AFTER:
const shapesInSelection = selectionRect ? queryShapes(selectionRect) : []
```

**Testing**: Create 200+ shapes and test selection rectangle. Should be much faster.

#### Step 2.4: Optimize Multi-Drag Updates

**File**: `src/components/CanvasStage.tsx`

```typescript
// Add this ref for batch updates
const batchUpdateRef = useRef<
  Array<{ objectId: string; updates: Partial<Shape> }>
>([])

// In handleShapeDragMove, replace the batch update creation:
// BEFORE:
const batchUpdates = selectedIds.map(selectedId => {
  // ... create updates
})

// AFTER:
// Clear previous updates
batchUpdateRef.current = []

selectedIds.forEach(selectedId => {
  const initialPos = initialShapePositions.get(selectedId)
  if (initialPos) {
    batchUpdateRef.current.push({
      objectId: selectedId,
      updates: {
        x: initialPos.x + offsetX,
        y: initialPos.y + offsetY
      }
    })
  }
})

// Only create final array when sending
if (batchUpdateRef.current.length > 0) {
  onShapeBatchUpdateDebounced([...batchUpdateRef.current])
}
```

### Phase 3: Advanced Optimizations

#### Step 3.1: Implement Virtual Rendering

**File**: `src/components/CanvasStage.tsx`

```typescript
// Add this hook for visible shapes
const visibleShapes = useMemo(() => {
  if (shapes.length < 100) return sortedShapes // No optimization needed for small canvases

  const margin = 200 // Render shapes slightly outside viewport
  const viewportBounds = {
    x: -viewport.x / viewport.scale - margin,
    y: -viewport.y / viewport.scale - margin,
    width: (width / viewport.scale) + margin * 2,
    height: (height / viewport.scale) + margin * 2
  }

  return queryShapes(viewportBounds)
}, [sortedShapes, viewport, width, height, queryShapes])

// Replace sortedShapes with visibleShapes in the render
{visibleShapes.map(shape => {
```

#### Step 3.2: Add Performance Monitoring

**New File**: `src/hooks/usePerformanceMonitor.ts`

```typescript
import { useEffect, useRef } from 'react'

export function usePerformanceMonitor() {
  const frameCount = useRef(0)
  const lastTime = useRef(performance.now())

  useEffect(() => {
    const measureFrame = () => {
      frameCount.current++
      const now = performance.now()

      if (now - lastTime.current >= 1000) {
        const fps = frameCount.current
        console.log(`Canvas FPS: ${fps}`)

        if (fps < 50) {
          console.warn('Canvas performance below 50fps')
        }

        frameCount.current = 0
        lastTime.current = now
      }

      requestAnimationFrame(measureFrame)
    }

    requestAnimationFrame(measureFrame)
  }, [])
}
```

## Testing Strategy

### Performance Tests

1. **Create Test Data**:

```typescript
// Add this to a test file or console
const createTestShapes = (count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    id: `test-${i}`,
    type: 'rect' as const,
    x: Math.random() * 2000,
    y: Math.random() * 2000,
    width: 50 + Math.random() * 100,
    height: 50 + Math.random() * 100,
    fill: '#3B82F6',
    stroke: '#1E40AF',
    strokeWidth: 2,
    zIndex: i,
    createdAt: Date.now(),
    createdBy: 'test',
    updatedAt: Date.now(),
    updatedBy: 'test'
  }))
}
```

2. **Measure Performance**:

```typescript
// Test selection performance
console.time('selection')
// Perform selection operation
console.timeEnd('selection')

// Test render performance
console.time('render')
// Trigger re-render
console.timeEnd('render')
```

### Manual Testing Checklist

- [ ] Create 200+ shapes and verify smooth scrolling
- [ ] Test selection rectangle with 100+ shapes
- [ ] Drag 20+ shapes simultaneously
- [ ] Test all layout functions with large shape counts
- [ ] Verify no memory leaks during extended use
- [ ] Test on lower-end devices

## Performance Targets

- **Render time**: < 16ms for 200 shapes (60fps)
- **Selection time**: < 50ms for selecting 50 shapes
- **Drag update**: < 16ms for dragging 20 shapes simultaneously
- **Memory**: < 10MB additional overhead

## Rollback Plan

If performance degrades:

1. **Phase 1 rollback**: Remove memoization, revert to original array operations
2. **Phase 2 rollback**: Remove spatial index, use linear selection
3. **Phase 3 rollback**: Remove virtual rendering, render all shapes

## Files Modified

- `src/hooks/useShapes.ts` - Add shape map
- `src/lib/sync/objects.ts` - Set-based filters
- `src/components/CanvasStage.tsx` - Memoization, spatial index, virtual rendering
- `src/pages/CanvasPage.tsx` - Cached calculations
- `src/hooks/useSpatialIndex.ts` - New spatial index hook
- `src/hooks/usePerformanceMonitor.ts` - New performance monitoring

## Dependencies Added

- `rbush` - Spatial indexing library
- `@types/rbush` - TypeScript definitions

## Breaking Changes

None. All changes are backward compatible.

## Future Improvements

1. **Web Workers**: Move heavy calculations to background threads
2. **Canvas Caching**: Cache rendered shapes as images
3. **Incremental Updates**: Only update changed shapes
4. **Memory Pooling**: Reuse shape objects to reduce GC pressure

---

**Remember**: Test each step thoroughly before moving to the next. Performance optimizations can introduce subtle bugs, so comprehensive testing is essential.

"Measure twice, optimize once - the way of the wise developer it is." - Yoda (probably)
