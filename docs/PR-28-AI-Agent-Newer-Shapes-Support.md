# PR #28: Add Full AI Agent Support for Newer Shapes

## Overview

Currently, the AI agent only has full support for `rect`, `circle`, and `text` shapes. This PR adds complete AI agent support for `ellipse`, `star`, `hexagon`, `line`, and `arrow` shapes, including creation, resizing, and finding capabilities.

## Problem Statement

- AI agent `createShape` tool only supports 3 shape types
- Resize tools (`resizeShape`, `resizeLarger`, `resizeSmaller`) don't handle newer shapes
- `findShapes` tool can't filter by newer shape types
- `createMultipleShapesWithDefaults` has incorrect property mapping for newer shapes

## Solution

Add full AI agent support for all newer shapes while maintaining backward compatibility and fixing property mapping issues.

## Files to Modify

1. `src/lib/ai/tools.ts` - Update schemas and tool implementations
2. `src/lib/sync/objects.ts` - Fix property mapping and add shape creation logic

## Step-by-Step Implementation

### Step 1: Update AI Tool Schemas

**File:** `src/lib/ai/tools.ts`

#### 1.1 Update createShape schema (around line 22)

```typescript
// BEFORE:
type: z.enum(['rect', 'circle', 'text']),

// AFTER:
type: z.enum(['rect', 'circle', 'text', 'ellipse', 'star', 'hexagon', 'line', 'arrow']),
```

#### 1.2 Update findShapes schema (around line 361)

```typescript
// BEFORE:
type: z.enum(['rect', 'circle', 'text']).optional(),

// AFTER:
type: z.enum(['rect', 'circle', 'text', 'ellipse', 'star', 'hexagon', 'line', 'arrow']).optional(),
```

### Step 2: Update createShapeWithDefaults Method

**File:** `src/lib/sync/objects.ts`

#### 2.1 Update method signature (around line 809)

```typescript
// BEFORE:
async createShapeWithDefaults(
  canvasId: string,
  type: 'rect' | 'circle' | 'text',
  position: { x: number; y: number },
  // ... rest of parameters

// AFTER:
async createShapeWithDefaults(
  canvasId: string,
  type: 'rect' | 'circle' | 'text' | 'ellipse' | 'star' | 'hexagon' | 'line' | 'arrow',
  position: { x: number; y: number },
  // ... rest of parameters
```

#### 2.2 Add shape creation logic for new types (around line 903, after the text shape logic)

```typescript
} else if (type === 'ellipse') {
  const ellipseData = {
    ...shapeData,
    radiusX: cleanOptions.size?.width || 50,
    radiusY: cleanOptions.size?.height || 30
  }
  // Ensure no undefined values
  Object.keys(ellipseData).forEach(key => {
    if ((ellipseData as any)[key] === undefined) {
      delete (ellipseData as any)[key]
    }
  })
  return this.createObject(canvasId, ellipseData as any, userId)
} else if (type === 'star') {
  const starData = {
    ...shapeData,
    outerRadius: cleanOptions.size?.width || 50,
    innerRadius: (cleanOptions.size?.width || 50) * 0.4,
    points: 5,
    starType: '5-point'
  }
  // Ensure no undefined values
  Object.keys(starData).forEach(key => {
    if ((starData as any)[key] === undefined) {
      delete (starData as any)[key]
    }
  })
  return this.createObject(canvasId, starData as any, userId)
} else if (type === 'hexagon') {
  const hexagonData = {
    ...shapeData,
    radius: cleanOptions.size?.width || 50,
    sides: 6
  }
  // Ensure no undefined values
  Object.keys(hexagonData).forEach(key => {
    if ((hexagonData as any)[key] === undefined) {
      delete (hexagonData as any)[key]
    }
  })
  return this.createObject(canvasId, hexagonData as any, userId)
} else if (type === 'line') {
  const lineData = {
    ...shapeData,
    endX: cleanOptions.size?.width || 100,
    endY: cleanOptions.size?.height || 0
  }
  // Ensure no undefined values
  Object.keys(lineData).forEach(key => {
    if ((lineData as any)[key] === undefined) {
      delete (lineData as any)[key]
    }
  })
  return this.createObject(canvasId, lineData as any, userId)
} else if (type === 'arrow') {
  const arrowData = {
    ...shapeData,
    endX: cleanOptions.size?.width || 100,
    endY: cleanOptions.size?.height || 0,
    arrowType: 'end'
  }
  // Ensure no undefined values
  Object.keys(arrowData).forEach(key => {
    if ((arrowData as any)[key] === undefined) {
      delete (arrowData as any)[key]
    }
  })
  return this.createObject(canvasId, arrowData as any, userId)
}
```

### Step 3: Update Resize Tools

**File:** `src/lib/ai/tools.ts`

#### 3.1 Update resizeShape tool (around line 614, after the text shape logic)

```typescript
} else if (currentShape.type === 'ellipse' && params.size) {
  updates.radiusX = params.size.width
  updates.radiusY = params.size.height
} else if (currentShape.type === 'star' && params.size) {
  updates.outerRadius = params.size.width
  updates.innerRadius = params.size.width * 0.4
} else if (currentShape.type === 'hexagon' && params.size) {
  updates.radius = params.size.width
} else if (currentShape.type === 'line' && params.size) {
  updates.endX = params.size.width
  updates.endY = params.size.height
} else if (currentShape.type === 'arrow' && params.size) {
  updates.endX = params.size.width
  updates.endY = params.size.height
}
```

#### 3.2 Update resizeLarger tool (around line 664, after the text shape logic)

```typescript
} else if (currentShape.type === 'ellipse') {
  const currentRadiusX = (currentShape as any).radiusX || 50
  const currentRadiusY = (currentShape as any).radiusY || 30
  updates.radiusX = Math.round(currentRadiusX * fibRatio)
  updates.radiusY = Math.round(currentRadiusY * fibRatio)
} else if (currentShape.type === 'star') {
  const currentOuterRadius = (currentShape as any).outerRadius || 50
  const currentInnerRadius = (currentShape as any).innerRadius || 20
  updates.outerRadius = Math.round(currentOuterRadius * fibRatio)
  updates.innerRadius = Math.round(currentInnerRadius * fibRatio)
} else if (currentShape.type === 'hexagon') {
  const currentRadius = (currentShape as any).radius || 50
  updates.radius = Math.round(currentRadius * fibRatio)
} else if (currentShape.type === 'line') {
  const currentEndX = (currentShape as any).endX || 100
  const currentEndY = (currentShape as any).endY || 0
  updates.endX = Math.round(currentEndX * fibRatio)
  updates.endY = Math.round(currentEndY * fibRatio)
} else if (currentShape.type === 'arrow') {
  const currentEndX = (currentShape as any).endX || 100
  const currentEndY = (currentShape as any).endY || 0
  updates.endX = Math.round(currentEndX * fibRatio)
  updates.endY = Math.round(currentEndY * fibRatio)
}
```

#### 3.3 Update resizeSmaller tool (around line 717, after the text shape logic)

```typescript
} else if (currentShape.type === 'ellipse') {
  const currentRadiusX = (currentShape as any).radiusX || 50
  const currentRadiusY = (currentShape as any).radiusY || 30
  updates.radiusX = Math.max(5, Math.round(currentRadiusX * fibRatio))
  updates.radiusY = Math.max(3, Math.round(currentRadiusY * fibRatio))
} else if (currentShape.type === 'star') {
  const currentOuterRadius = (currentShape as any).outerRadius || 50
  const currentInnerRadius = (currentShape as any).innerRadius || 20
  updates.outerRadius = Math.max(5, Math.round(currentOuterRadius * fibRatio))
  updates.innerRadius = Math.max(2, Math.round(currentInnerRadius * fibRatio))
} else if (currentShape.type === 'hexagon') {
  const currentRadius = (currentShape as any).radius || 50
  updates.radius = Math.max(5, Math.round(currentRadius * fibRatio))
} else if (currentShape.type === 'line') {
  const currentEndX = (currentShape as any).endX || 100
  const currentEndY = (currentShape as any).endY || 0
  updates.endX = Math.max(10, Math.round(currentEndX * fibRatio))
  updates.endY = Math.round(currentEndY * fibRatio)
} else if (currentShape.type === 'arrow') {
  const currentEndX = (currentShape as any).endX || 100
  const currentEndY = (currentShape as any).endY || 0
  updates.endX = Math.max(10, Math.round(currentEndX * fibRatio))
  updates.endY = Math.round(currentEndY * fibRatio)
}
```

### Step 4: Fix createMultipleShapesWithDefaults Property Mapping

**File:** `src/lib/sync/objects.ts`

#### 4.1 Update property mapping (around line 1582)

```typescript
// BEFORE:
} else if (type === 'ellipse') {
  shapeData.width = shapeWidth
  shapeData.height = shapeHeight
} else if (type === 'star') {
  shapeData.width = shapeWidth
  shapeData.height = shapeHeight
} else if (type === 'hexagon') {
  shapeData.width = shapeWidth
  shapeData.height = shapeHeight
} else if (type === 'line') {
  shapeData.width = shapeWidth
  shapeData.height = finalProperties.size?.height || 2
} else if (type === 'arrow') {
  shapeData.width = shapeWidth
  shapeData.height = finalProperties.size?.height || 20
}

// AFTER:
} else if (type === 'ellipse') {
  shapeData.radiusX = shapeWidth
  shapeData.radiusY = shapeHeight
} else if (type === 'star') {
  shapeData.outerRadius = shapeWidth
  shapeData.innerRadius = shapeWidth * 0.4
  shapeData.points = 5
  shapeData.starType = '5-point'
} else if (type === 'hexagon') {
  shapeData.radius = shapeWidth
  shapeData.sides = 6
} else if (type === 'line') {
  shapeData.endX = shapeWidth
  shapeData.endY = shapeHeight
} else if (type === 'arrow') {
  shapeData.endX = shapeWidth
  shapeData.endY = shapeHeight
  shapeData.arrowType = 'end'
}
```

#### 4.2 Update createAlternatingShapesWithDefaults property mapping (around line 1724)

```typescript
// BEFORE:
} else if (patternShape.type === 'ellipse') {
  shapeData.width = shapeWidth
  shapeData.height = shapeHeight
} else if (patternShape.type === 'star') {
  shapeData.width = shapeWidth
  shapeData.height = shapeHeight
} else if (patternShape.type === 'hexagon') {
  shapeData.width = shapeWidth
  shapeData.height = shapeHeight
} else if (patternShape.type === 'line') {
  shapeData.width = shapeWidth
  shapeData.height = finalProperties.size?.height || 2
} else if (patternShape.type === 'arrow') {
  shapeData.width = shapeWidth
  shapeData.height = finalProperties.size?.height || 20
}

// AFTER:
} else if (patternShape.type === 'ellipse') {
  shapeData.radiusX = shapeWidth
  shapeData.radiusY = shapeHeight
} else if (patternShape.type === 'star') {
  shapeData.outerRadius = shapeWidth
  shapeData.innerRadius = shapeWidth * 0.4
  shapeData.points = 5
  shapeData.starType = '5-point'
} else if (patternShape.type === 'hexagon') {
  shapeData.radius = shapeWidth
  shapeData.sides = 6
} else if (patternShape.type === 'line') {
  shapeData.endX = shapeWidth
  shapeData.endY = shapeHeight
} else if (patternShape.type === 'arrow') {
  shapeData.endX = shapeWidth
  shapeData.endY = shapeHeight
  shapeData.arrowType = 'end'
}
```

## Testing Checklist

### Manual Testing Steps

1. **Test createShape tool with new shapes:**
   - Try: "Create an ellipse"
   - Try: "Create a star"
   - Try: "Create a hexagon"
   - Try: "Create a line"
   - Try: "Create an arrow"

2. **Test resize tools with new shapes:**
   - Create a shape, then try: "Make it larger"
   - Create a shape, then try: "Make it smaller"
   - Create a shape, then try: "Resize it to 200px wide"

3. **Test findShapes tool:**
   - Create multiple shapes, then try: "Find all ellipses"
   - Try: "Find all stars"

4. **Test createMultipleShapes tool:**
   - Try: "Create 5 ellipses"
   - Try: "Create 3 stars in a row"
   - Try: "Create alternating circles and stars"

### Expected Results

- All new shapes should be created with correct properties
- Resize operations should work on all shape types
- findShapes should be able to filter by all shape types
- createMultipleShapes should create shapes with correct properties

## Notes for Junior Engineer

### Key Concepts to Understand

1. **Property Mapping**: Each shape type has specific properties:
   - Ellipse: `radiusX`, `radiusY`
   - Star: `outerRadius`, `innerRadius`, `points`, `starType`
   - Hexagon: `radius`, `sides`
   - Line/Arrow: `endX`, `endY`

2. **Fibonacci Scaling**: The resize tools use golden ratio (1.618) for larger and inverse (0.618) for smaller

3. **Type Safety**: Always use type assertions `(currentShape as any)` when accessing shape properties

4. **Undefined Value Filtering**: Always filter out undefined values before creating objects to prevent Firestore errors

### Common Pitfalls to Avoid

1. **Don't use `width/height` for all shapes** - each shape has its own properties
2. **Don't forget to handle all shape types** in resize operations
3. **Don't skip the undefined value filtering** - it prevents Firestore errors
4. **Test thoroughly** - make sure all shape types work in all scenarios

## Files Changed Summary

- `src/lib/ai/tools.ts`: Updated schemas and tool implementations
- `src/lib/sync/objects.ts`: Fixed property mapping and added shape creation logic

## Impact

- ✅ Full AI agent support for all shape types
- ✅ Backward compatibility maintained
- ✅ Property mapping issues fixed
- ✅ No breaking changes to existing functionality

---

**Ready to implement? Start with Step 1 and work through each step carefully. Test after each major change to catch issues early!**

