# PR #24 — Layers Panel with Drag-to-Reorder

**Goal:** Implement a comprehensive layers panel with drag-to-reorder functionality, hierarchy visualization, and toolbar integration for better layer management.

## Overview

Add a left sidebar layers panel that displays all canvas objects in a hierarchical list with drag-to-reorder capabilities. The panel will integrate with the existing toolbar and leverage the current zIndex-based layer system.

## ⚠️ CRITICAL: Existing Layer System Analysis

**Current zIndex Implementation:**

- **Schema**: `zIndex?: number` field in `ShapeBase` interface (`src/lib/types.ts:37`)
- **Rendering**: Shapes sorted by `(a.zIndex || 0) - (b.zIndex || 0)` in `CanvasStage.tsx:1280`
- **New Shapes**: Get `maxZIndex + 1` assignment in `CanvasStage.tsx:590-594` and `CanvasPage.tsx:251-255`
- **Duplication**: Duplicated shapes get `maxZIndex + 1` to appear on top (`CanvasPage.tsx:255-261`)

**Existing Layer Operations (DesignPaletteMUI.tsx):**

- **Bring Forward**: Finds next shape's zIndex, sets `newZIndex = (nextShape.zIndex || 0) + 1` (lines 310-313)
- **Send Backward**: Finds previous shape's zIndex, sets `newZIndex = Math.max(0, (prevShape.zIndex || 0) - 1)` (lines 331-334)
- **Layer Info**: Calculates position, total layers, and canBringForward/canSendBackward flags (lines 270-291)

**Key Implementation Notes:**

1. **zIndex Strategy**: Uses incremental values, not gaps (bring forward adds +1, send backward subtracts -1)
2. **Sorting**: Always ascending order `(a.zIndex || 0) - (b.zIndex || 0)` for rendering
3. **Bounds**: `Math.max(0, ...)` prevents negative zIndex values
4. **Default**: `zIndex || 0` handles undefined values (shapes created before zIndex system)
5. **Batch Operations**: Layer operations use individual `onShapeUpdate` calls, not batch updates

**Architecture Constraints:**

- **No Layer Groups**: Current system is flat, no parent-child relationships
- **No Layer Names**: Shapes use auto-generated names, no custom naming
- **No Layer Locking**: No visibility or lock state in current schema
- **Selection Integration**: Layer operations work with current selection system
- **Real-time Sync**: All zIndex changes go through existing React Query mutations

**Performance Considerations:**

- **Sorting**: Happens on every render in CanvasStage (line 1280)
- **Layer Info**: Recalculated on every selection change in DesignPalette
- **No Virtualization**: Current layer list in DesignPalette is small, no performance issues
- **Batch Updates**: Layer operations use individual updates, not batched (potential optimization)

## Phase 1: Core Infrastructure Setup (4 points)

**Checklist**

- [ ] Create `LayersPanel.tsx` component with basic structure
- [ ] Add layers panel toggle button to `ToolbarMUI.tsx`
- [ ] Implement left sidebar layout in `CanvasPage.tsx`
- [ ] Add state management for layers panel visibility
- [ ] Create layer item component with shape type icons
- [ ] Implement basic layer list rendering

**Files to Create/Modify**

- `src/components/LayersPanel.tsx` (new)
- `src/components/ToolbarMUI.tsx` (modify)
- `src/pages/CanvasPage.tsx` (modify)

## Phase 2: Drag-to-Reorder Implementation (4 points)

**Checklist**

- [ ] Implement drag-and-drop functionality using react-beautiful-dnd
- [ ] Add visual feedback during drag operations
- [ ] Create zIndex recalculation logic for reordering
- [ ] Handle drag-to-reorder with batch updates
- [ ] Add selection highlighting for dragged items
- [ ] Implement drop zones and visual indicators

**⚠️ CRITICAL: zIndex Recalculation Strategy**

- **Follow Existing Pattern**: Use same logic as `handleBringForward`/`handleSendBackward` in DesignPaletteMUI
- **Incremental Updates**: Don't reassign all zIndex values, just adjust the moved shape
- **Batch Updates**: Use `batchUpdateShapes` for multiple shape updates during drag
- **Bounds Checking**: Ensure `Math.max(0, newZIndex)` to prevent negative values
- **Real-time Updates**: Use `debouncedBatchUpdate` for smooth drag experience

**Files to Create/Modify**

- `src/components/LayersPanel.tsx` (modify)
- `src/hooks/useShapes.ts` (modify - add reorder functions)
- `src/lib/sync/objects.ts` (modify - add batch reorder)

## Phase 3: Layer Hierarchy & Visual Features (3 points)

**Checklist**

- [ ] Display shapes sorted by zIndex (top to bottom in panel)
- [ ] Show shape type icons and auto-generated names
- [ ] Add layer position indicators (e.g., "Layer 3 of 8")
- [ ] Implement layer visibility toggles
- [ ] Add layer locking functionality
- [ ] Create layer grouping/folder support

**⚠️ CRITICAL: Layer Display Strategy**

- **Sorting Order**: Display shapes in **descending zIndex order** (top layer first in panel)
- **Layer Names**: Use auto-generated names like "Rectangle 1", "Circle 2" (no custom naming yet)
- **Position Indicators**: Show "Layer 3 of 8" using same logic as `getLayerInfo()` in DesignPaletteMUI
- **Shape Icons**: Reuse existing shape type icons from toolbar or create consistent set
- **No Groups**: Keep flat hierarchy, no folder/group support in initial implementation

**Files to Create/Modify**

- `src/components/LayersPanel.tsx` (modify)
- `src/lib/schema.ts` (modify - add optional name field)
- `src/hooks/useShapes.ts` (modify - add layer operations)

## Phase 4: Integration & Polish (2 points)

**Checklist**

- [ ] Integrate with existing selection system
- [ ] Add keyboard shortcuts for layer operations
- [ ] Implement smooth animations for panel open/close
- [ ] Add tooltips and help text
- [ ] Handle edge cases (empty canvas, single layer)
- [ ] Add responsive design for mobile/tablet

**Files to Create/Modify**

- `src/components/LayersPanel.tsx` (modify)
- `src/hooks/useCanvasShortcuts.ts` (modify)
- `src/pages/CanvasPage.tsx` (modify)

## Technical Requirements

**Dependencies**

- `react-beautiful-dnd` for drag-and-drop
- Existing shape system and zIndex infrastructure
- MUI components for consistent styling
- React Query for state management

**Performance Considerations**

- Virtual scrolling for large layer counts (100+ layers)
- Debounced updates during drag operations
- Optimistic UI updates for smooth reordering
- Efficient zIndex recalculation algorithms

**User Experience**

- Intuitive drag-and-drop with visual feedback
- Clear layer hierarchy visualization
- Consistent with existing design patterns
- Accessible keyboard navigation
- Mobile-friendly touch interactions

**Estimated Time**: 12-15 hours for intermediate developer
**Difficulty**: Intermediate-Advanced
**Dependencies**: Existing shape system, MUI components, react-beautiful-dnd, zIndex infrastructure
