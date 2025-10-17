# PR #23 — Fix Blend Modes Implementation

**Goal:** Fix blend modes to work properly by using Canvas 2D globalCompositeOperation instead of unsupported CSS blend modes.

## Overview

- Replace `blendMode` prop with `globalCompositeOperation` in all shape components
- Map CSS blend modes to Canvas 2D supported modes
- Reduce blend mode options to only Canvas 2D supported modes
- Ensure visual blend effects are actually visible

## Phase 1: Update Shape Components (2 points)

**Files to Modify:**

- `src/components/Shapes/*.tsx` - Replace blendMode with globalCompositeOperation
- `src/lib/types.ts` - Update blendMode type to supported modes only

**Checklist:**

- [x] Replace `blendMode` prop with `globalCompositeOperation` in all shape components
- [x] Create `getCanvasBlendMode()` mapping function
- [x] Update RectangleShape, CircleShape, TextShape, EllipseShape components
- [x] Update ArrowShape, LineShape, HexagonShape, StarShape components
- [x] Update ImageShape, MermaidShape components
- [x] Test each shape type with blend modes

## Phase 2: Update Design Palette (1 point)

**Files to Modify:**

- `src/components/DesignPaletteMUI.tsx` - Reduce blend mode options
- `src/store/designPalette.ts` - Update blend mode validation

**Checklist:**

- [x] Reduce blend mode dropdown to only Canvas 2D supported modes
- [x] Update blend mode options list (12 modes instead of 12+)
- [x] Add tooltips explaining Canvas 2D limitations
- [x] Update default blend mode to 'normal'
- [x] Test dropdown functionality

## Phase 3: Blend Mode Mapping (2 points)

**Files to Create/Modify:**

- `src/lib/blendModes.ts` - New utility for blend mode mapping
- `src/components/Shapes/*.tsx` - Use mapping function

**Checklist:**

- [x] Create `getCanvasBlendMode()` function with mode mapping
- [x] Map CSS blend modes to Canvas 2D globalCompositeOperation
- [x] Handle unsupported modes gracefully (fallback to 'source-over')
- [x] Add TypeScript types for supported blend modes
- [x] Test all blend mode mappings

## Phase 4: Testing & Validation (1 point)

**Files to Create/Modify:**

- `src/components/__tests__/BlendModes.test.tsx` - Test blend mode functionality

**Checklist:**

- [x] Test each blend mode with overlapping shapes
- [x] Verify visual differences between modes
- [x] Test performance with multiple blended objects
- [x] Test blend modes with different shape types
- [x] Verify real-time sync works with blend modes
- [x] Test edge cases (no selection, invalid modes)

## Implementation Details

### Supported Canvas 2D Blend Modes:

```typescript
const SUPPORTED_BLEND_MODES = [
  'normal', // source-over
  'multiply', // multiply
  'overlay', // overlay
  'screen', // screen
  'darken', // darken
  'lighten', // lighten
  'color-dodge', // color-dodge
  'color-burn', // color-burn
  'hard-light', // hard-light
  'soft-light', // soft-light
  'difference', // difference
  'exclusion' // exclusion
]
```

### Blend Mode Mapping Function:

```typescript
function getCanvasBlendMode(cssBlendMode: string): string {
  const modeMap: Record<string, string> = {
    normal: 'source-over',
    multiply: 'multiply',
    overlay: 'overlay',
    screen: 'screen',
    darken: 'darken',
    lighten: 'lighten',
    'color-dodge': 'color-dodge',
    'color-burn': 'color-burn',
    'hard-light': 'hard-light',
    'soft-light': 'soft-light',
    difference: 'difference',
    exclusion: 'exclusion'
  }
  return modeMap[cssBlendMode] || 'source-over'
}
```

### Shape Component Update Example:

```typescript
// Before (not working):
<Rect blendMode={shape.blendMode || 'normal'} />

// After (working):
<Rect globalCompositeOperation={getCanvasBlendMode(shape.blendMode)} />
```

## Junior Developer Guidance:

- **Start with Mapping**: Create the blend mode mapping function first
- **Test Incrementally**: Test each shape type as you update it
- **Use Canvas Docs**: Check Canvas 2D globalCompositeOperation documentation
- **Focus on Visual**: Ensure blend effects are actually visible
- **Handle Edge Cases**: Test with overlapping shapes of different colors

**Estimated Time**: 4-6 hours for junior developer
**Difficulty**: Beginner to Intermediate  
**Dependencies**: Existing shape system, Konva.js, Canvas 2D context

## Expected Results:

- ✅ Visual blend mode effects will be visible
- ✅ Performance will remain good
- ✅ Real-time sync will work
- ⚠️ Limited to 12 blend modes (vs 12+ CSS modes)

## Technical Background

### Problem Analysis:

1. **Konva.js Limitation**: Konva.js uses Canvas 2D context, which has limited blend mode support
2. **Current Implementation**: We're passing `blendMode` as a prop, but Konva doesn't recognize it
3. **Canvas 2D Support**: Only supports `globalCompositeOperation` with limited modes

### Solution Rationale:

- **Canvas 2D globalCompositeOperation**: Native Canvas support, good performance, works with Konva
- **Limited but functional**: 12 blend modes vs unlimited CSS modes, but provides visual effects
- **Simple implementation**: Leverages existing Konva infrastructure
- **Performance**: No custom rendering or complex post-processing needed

### Alternative Approaches Considered:

1. **Custom Blend Mode Implementation**: Full CSS support but complex and performance-heavy
2. **Hybrid Approach**: Canvas 2D + custom for unsupported modes, but overly complex
3. **CSS-only approach**: Not compatible with Konva.js Canvas rendering

The chosen approach provides the best balance of functionality, performance, and implementation simplicity.
