# PR #27: Fix Bulk Update Flashing Issue

## Problem Description

When updating multiple shapes (e.g., changing border color or moving 27 selected circles), users experience:

1. **Initial flash** - All shapes briefly show the correct updated state
2. **Reversion** - Shapes revert to original state
3. **Incremental updates** - Shapes update one by one instead of all at once
4. **Excessive network requests** - 9-20+ individual Firestore writes instead of 1 batch

This creates a jarring UX that makes bulk operations feel broken and causes performance issues.

## Root Cause Analysis

### Issue 1: Throttling Creates Multiple Batch Calls

- Drag operations trigger `debouncedBatchUpdateObjects` every 16ms (60fps)
- Each throttled call creates separate Firestore batch writes
- 100ms drag = ~6 separate batch calls
- **Location**: `src/components/CanvasStage.tsx:1048-1058`

### Issue 2: Chunked Batch Processing Amplifies Problem

- Each batch call splits 27 shapes into chunks of `MAX_BATCH_SIZE = 10`
- 27 shapes = 3 sequential batches per call
- 6 calls × 3 chunks = 18+ individual network requests
- **Location**: `src/lib/sync/objects.ts:670-677`

### Issue 3: Firestore Subscription Overwrites Optimistic Updates

- Each network request triggers Firestore snapshot
- `subscribeToObjects` completely replaces React Query cache
- No merge strategy to preserve pending optimistic updates
- **Location**: `src/lib/sync/objects.ts:247`

### Issue 4: No Batch Coalescing

- Multiple throttled calls don't merge into single operation
- Each call processes independently, creating redundant writes
- No accumulation of updates during drag operations

## Solution Strategy

### Phase 1: Fix Throttling and Batch Coalescing (Critical Fix)

- [ ] **Task 1.1**: Implement proper batch accumulation
  - Accumulate all updates during drag operation
  - Send single batch at drag end instead of multiple throttled calls
  - Modify `handleShapeDragMove` to collect updates without sending
  - **Location**: `src/components/CanvasStage.tsx:997-1078`

- [ ] **Task 1.2**: Increase batch size to handle large selections
  - Research Firestore batch write limits (likely 500+ operations)
  - Update `MAX_BATCH_SIZE` from 10 to 100+ (handle 27+ shapes in single batch)
  - Test with 50+ shapes to find optimal limit
  - **Location**: `src/lib/sync/objects.ts:18`

- [ ] **Task 1.3**: Optimize throttling logic
  - Remove 16ms throttling during drag (causes multiple calls)
  - Implement single update at drag end
  - Preserve smooth UI updates with optimistic updates only
  - **Location**: `src/components/CanvasStage.tsx:1048-1058`

### Phase 2: Implement Smart Cache Merging (Robust Fix)

- [x] **Task 2.1**: Design merge strategy
  - Create function to merge Firestore data with pending optimistic updates
  - Preserve optimistic updates that haven't been written to Firestore yet
  - Handle conflicts between optimistic and server state

- [x] **Task 2.2**: Implement cache merge logic
  - Modify `subscribeToObjects` to use merge instead of replace
  - Add pending update tracking to `ObjectSyncService`
  - Implement conflict resolution for concurrent updates

- [x] **Task 2.3**: Add optimistic update tracking
  - Track which updates are still pending Firestore write
  - Mark updates as "confirmed" when Firestore snapshot includes them
  - Clean up confirmed updates from pending list

### Phase 3: Testing & Validation

- [ ] **Task 3.1**: Test border color updates
  - Select 27+ circles
  - Change border color
  - Verify: No flashing, all update simultaneously
  - Monitor network requests: should be 1 batch write, not 9-20
  - Test with different border colors

- [ ] **Task 3.2**: Test multi-shape movement
  - Select 27+ shapes
  - Drag to new position
  - Verify: Smooth movement, no reversion
  - Monitor network requests: should be 1 batch write at drag end
  - Test with different selection sizes

- [ ] **Task 3.3**: Test other property updates (if extending)
  - Fill color changes
  - Stroke width changes
  - Opacity changes
  - Verify consistent behavior across all properties

### Phase 4: Fix Property Change Flashing (Additional Work Required)

- [x] **Task 4.1**: Update DesignPaletteMUI to use batch updates
  - Modify `updateSelectedShapes` function to use `onShapeBatchUpdateDebounced`
  - Replace individual `onShapeUpdateDebounced` calls with single batch call
  - Test with 27+ shapes changing border color, fill color, stroke width
  - **Location**: `src/components/DesignPaletteMUI.tsx:154-161`

- [x] **Task 4.2**: Update AI Panel property changes
  - Ensure AI commands that change multiple shapes use batch updates
  - Verify `changeColor` command works with multiple selections
  - Test `copyStyle` command with large selections
  - **Location**: `src/components/AIPanel.tsx` and related AI tools

- [x] **Task 4.3**: Update any other property change handlers
  - Search for other uses of `onShapeUpdateDebounced` with multiple shapes
  - Convert to batch updates where appropriate
  - Ensure consistent behavior across all property changes

- [ ] **Task 4.4**: Test comprehensive property changes
  - Border color changes (27+ shapes)
  - Fill color changes (27+ shapes)
  - Stroke width changes (27+ shapes)
  - Opacity changes (27+ shapes)
  - Font changes (27+ shapes)
  - Verify: No flashing, single network request per operation
  - Monitor network requests: should be 1 batch write per property change

## Implementation Details

### Files to Modify

- `src/lib/sync/objects.ts` - Main sync service ✅
- `src/hooks/useShapes.ts` - React Query integration ✅
- `src/components/CanvasStage.tsx` - Drag handling logic ✅
- `src/lib/firebase/firestore.ts` - Firestore operations ✅
- `src/components/DesignPaletteMUI.tsx` - Property change handlers (NEW)
- `src/components/AIPanel.tsx` - AI command handlers (NEW)

### Key Changes

#### 1. Fix Throttling Logic

```typescript
// In CanvasStage.tsx - handleShapeDragMove
// Remove throttling, accumulate updates instead
const handleShapeDragMove = useCallback(e => {
  // Accumulate updates in ref, don't send immediately
  batchUpdateRef.current.push({ objectId, updates })
  // Send only at drag end
})
```

#### 2. Increase Batch Size

```typescript
// In objects.ts
const MAX_BATCH_SIZE = 100 // Increase from 10 to handle large selections
```

#### 3. Smart Cache Merging

```typescript
// In objects.ts - subscribeToObjects method
const unsubscribe = subscribeToObjects(canvasId, objects => {
  // Merge with pending optimistic updates instead of replacing
  this.mergeWithPendingUpdates(queryKey, objects)
})
```

#### 4. Batch Accumulation

```typescript
// Add to ObjectSyncService class
private pendingUpdates: Map<string, Shape> = new Map()

private mergeWithPendingUpdates(queryKey: string, firestoreData: Shape[]) {
  // Implementation details...
}
```

#### 5. Fix Property Change Handlers (NEW)

```typescript
// In DesignPaletteMUI.tsx - updateSelectedShapes function
// OLD (causes flashing):
const updateSelectedShapes = useCallback(
  (updates: Partial<Shape>) => {
    selectedShapes.forEach(shape => {
      onShapeUpdateDebounced(shape.id, updates) // Individual calls!
    })
  },
  [selectedShapes, onShapeUpdateDebounced]
)

// NEW (single batch call):
const updateSelectedShapes = useCallback(
  (updates: Partial<Shape>) => {
    const batchUpdates = selectedShapes.map(shape => ({
      objectId: shape.id,
      updates
    }))
    onShapeBatchUpdateDebounced(batchUpdates) // Single batch call!
  },
  [selectedShapes, onShapeBatchUpdateDebounced]
)
```

#### 6. Update AI Commands (NEW)

```typescript
// In AI tools - ensure multi-shape operations use batch updates
// Example: changeColor command with multiple selections
const batchUpdates = selectedShapeIds.map(shapeId => ({
  objectId: shapeId,
  updates: { fill: newColor }
}))
await objectSync.smartBatchUpdateObjects(canvasId, batchUpdates, userId)
```

## Testing Checklist

### Basic Functionality

- [ ] Single shape updates still work
- [ ] Small batch updates (1-10 shapes) work
- [ ] Large batch updates (27+ shapes) work without flashing
- [ ] Real-time collaboration still works
- [ ] Undo/redo functionality preserved

### Network Performance

- [ ] 27-shape drag produces 1 network request (not 9-20)
- [ ] Border color change produces 1 batch write (not multiple)
- [ ] No redundant Firestore subscription management requests
- [ ] Network requests complete within 200ms

### Edge Cases

- [ ] Network disconnection during bulk update
- [ ] Concurrent updates from multiple users
- [ ] Very large selections (50+ shapes)
- [ ] Mixed property updates (border + fill simultaneously)

### Performance

- [ ] No significant performance degradation
- [ ] Memory usage remains reasonable
- [ ] Firestore write limits not exceeded
- [ ] Smooth 60fps during drag operations

## Success Criteria

1. **No Flashing**: Bulk updates appear instantly and stay consistent
2. **Single Network Request**: 27+ shapes update in one batch operation
3. **No Incremental Updates**: All shapes update simultaneously
4. **Preserved Functionality**: All existing features continue to work
5. **Performance**: No noticeable slowdown with large selections
6. **Property Changes Fixed**: Border color, fill color, stroke width, opacity, and font changes work without flashing
7. **AI Commands Fixed**: Multi-shape AI operations use batch updates

## Rollback Plan

If issues arise:

1. Revert `MAX_BATCH_SIZE` to 10
2. Restore 16ms throttling logic
3. Remove cache merging logic
4. Restore original `subscribeToObjects` implementation
5. Test with small batches to ensure stability

## Future Enhancements

- [ ] Extend to all property types (fill, stroke, opacity, etc.)
- [ ] Add progress indicators for very large operations
- [ ] Implement update queuing for offline scenarios
- [ ] Add user feedback for bulk operation completion

## Related Issues

- Fixes the flashing issue described in user feedback
- Improves UX for bulk operations
- Maintains real-time collaboration functionality
- Preserves existing performance optimizations
- Reduces network overhead significantly

---

**Estimated Time**:

- Phase 1-3 (Movement fixes): 6-8 hours ✅ COMPLETED
- Phase 4 (Property changes): 4-6 hours (NEW)
- **Total**: 10-14 hours

**Difficulty**: Intermediate
**Dependencies**: None
**Risk Level**: Low (with rollback plan)

## Current Status

✅ **COMPLETED**: Movement operations (drag, resize, rotate)
✅ **COMPLETED**: Property changes (border color, fill color, stroke width, opacity, blend mode, etc.)

**Note**: Phase 4 implementation is now complete. All property changes now use batch updates to prevent flashing when updating multiple shapes.
