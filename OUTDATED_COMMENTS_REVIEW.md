# Outdated Comments Review

This document tracks all outdated comments found in the codebase during the review on October 18, 2025.

---

## 1. CanvasStage.tsx

### Line 134

**Comment:** `// Keyboard shortcuts will be added after function declarations`
**Why Outdated:** Keyboard shortcuts are already implemented via the `useCanvasShortcuts` hook (line 428-437).
**Suggested Change:** Remove this comment or update to: `// Keyboard shortcuts are handled by useCanvasShortcuts hook`

### Lines 450, 510

**Comment:** `// TODO: Show error toast`
**Why Outdated:** Toast system is fully implemented and imported (`useToast` hook). Similar error handling with toasts exists elsewhere in the file (e.g., lines 307-309).
**Suggested Change:** Implement the toast error handling:

```typescript
// Line 450:
showError('Image paste failed', 'Failed to paste image from clipboard')

// Line 510:
showError('Image upload failed', 'Failed to upload image')
```

### Line 1830

**Comment:** `// PR #9: Add display name for debugging`
**Why Outdated:** This is a reference to an old PR that has already been merged. The display name is already set.
**Suggested Change:** Remove the PR reference. Update to: `// Display name for React DevTools debugging`

---

## 2. CanvasPage.tsx

### Line 77

**Comment:** `// PR #8: Canvas metadata and persistence`
**Why Outdated:** Old PR reference for implemented feature.
**Suggested Change:** Remove or update to: `// Canvas metadata and viewport persistence`

### Line 96

**Comment:** `// PR #7: Use React Query hooks for shape management`
**Why Outdated:** Old PR reference for implemented feature.
**Suggested Change:** Remove or update to: `// Shape management with React Query for real-time sync`

### Line 136

**Comment:** `// PR #8: Initialize canvas on mount (only if user has access)`
**Why Outdated:** Old PR reference.
**Suggested Change:** Remove or update to: `// Initialize canvas metadata when user has access`

### Line 148

**Comment:** `// PR #8: Save viewport on navigation/unload`
**Why Outdated:** Old PR reference.
**Suggested Change:** Remove or update to: `// Save viewport state when user navigates away or closes tab`

### Line 219

**Comment:** `// PR #7: Handle shape creation with React Query`
**Why Outdated:** Old PR reference.
**Suggested Change:** Remove or update to: `// Create shape with optimistic updates via React Query`

### Line 246

**Comment:** `// PR #7: Handle shape updates with React Query`
**Why Outdated:** Old PR reference.
**Suggested Change:** Remove or update to: `// Update shape with optimistic updates`

### Line 261

**Comment:** `// PR #13.1: Handle debounced shape updates for real-time drag`
**Why Outdated:** Old PR reference.
**Suggested Change:** Remove or update to: `// Debounced updates for smooth real-time dragging`

### Line 270

**Comment:** `// PR #15.3: Handle debounced batch updates for multi-object movement`
**Why Outdated:** Old PR reference.
**Suggested Change:** Remove or update to: `// Debounced batch updates for efficient multi-object operations`

### Line 279

**Comment:** `// PR #7: Handle shape deletion with React Query`
**Why Outdated:** Old PR reference.
**Suggested Change:** Remove or update to: `// Delete shapes with optimistic updates`

### Line 300

**Comment:** `// PR #7: Handle shape duplication with React Query`
**Why Outdated:** Old PR reference.
**Suggested Change:** Remove or update to: `// Duplicate shapes with offset positioning`

---

## 3. useShapes.ts (hooks/useShapes.ts)

### Line 11

**Comment:** `// PR #7: React Query hooks for object sync with optimistic updates`
**Why Outdated:** Old PR reference.
**Suggested Change:** Remove or update to: `// React Query hooks for real-time object synchronization with optimistic updates`

### Line 64

**Comment:** `// PR #7: Mutations with optimistic updates`
**Why Outdated:** Old PR reference.
**Suggested Change:** Remove or update to: `// Shape mutations with optimistic updates for responsive UI`

### Line 201

**Comment:** `// PR #7: Conflict resolution`
**Why Outdated:** Old PR reference.
**Suggested Change:** Remove or update to: `// Conflict resolution using last-write-wins strategy`

### Line 266

**Comment:** `// PR #9: Use the new debounced update from ObjectSyncService`
**Why Outdated:** Old PR reference.
**Suggested Change:** Remove or update to: `// Debounced updates for smooth drag/resize operations`

### Line 277

**Comment:** `// PR #15.3: Debounced batch update for multi-object movement`
**Why Outdated:** Old PR reference.
**Suggested Change:** Remove or update to: `// Debounced batch updates for multi-object operations`

### Line 290

**Comment:** `// PR #9: Use smart batch update for large operations`
**Why Outdated:** Old PR reference.
**Suggested Change:** Remove or update to: `// Smart batch updates with automatic chunking for large operations`

### Line 325

**Comment:** `// PR #8: Canvas metadata hooks for persistence and reconnect handling`
**Why Outdated:** Old PR reference.
**Suggested Change:** Remove or update to: `// Canvas metadata hooks for viewport persistence and state management`

### Line 420

**Comment:** `// PR #8: Viewport persistence hook`
**Why Outdated:** Old PR reference.
**Suggested Change:** Remove or update to: `// Viewport persistence with debounced saves`

---

## 4. objects.ts (lib/sync/objects.ts)

### Line 32

**Comment:** `// PR #7: React Query + Firestore snapshot bridge`
**Why Outdated:** Old PR reference.
**Suggested Change:** Remove or update to: `// Bridge between React Query cache and Firestore real-time snapshots`

### Line 47

**Comment:** `// PR #15.3: Batch update system for multi-object movement`
**Why Outdated:** Old PR reference.
**Suggested Change:** Remove or update to: `// Batch update system for efficient multi-object operations`

### Line 61

**Comment:** `// PR #27: Track pending optimistic updates for cache merging`
**Why Outdated:** Old PR reference.
**Suggested Change:** Remove or update to: `// Track pending optimistic updates to prevent flashing during sync`

### Line 65

**Comment:** `// PR #13.9.5: Operation queuing for offline scenarios`
**Why Outdated:** Old PR reference.
**Suggested Change:** Remove or update to: `// Operation queue for offline persistence and retry logic`

### Line 83

**Comment:** `// PR #13.9.5: Setup network monitoring for offline/online detection`
**Why Outdated:** Old PR reference.
**Suggested Change:** Remove or update to: `// Network monitoring for offline/online state detection`

### Line 106

**Comment:** `// PR #13.9.5: Add operation to queue`
**Why Outdated:** Old PR reference.
**Suggested Change:** Remove or update to: `// Queue operation for offline execution`

### Line 129

**Comment:** `// PR #13.9.5: Process queued operations when back online`
**Why Outdated:** Old PR reference.
**Suggested Change:** Remove or update to: `// Process queued operations after network reconnection`

### Line 170

**Comment:** `// TODO: Could emit an event here for UI to show failed operations`
**Why Outdated:** This TODO should be evaluated if it's still needed or if error handling is sufficient.
**Suggested Change:** Either implement the event emission or remove if current error handling is adequate.

### Line 183

**Comment:** `// PR #13.9.5: Execute a queued operation`
**Why Outdated:** Old PR reference.
**Suggested Change:** Remove or update to: `// Execute a queued operation from offline queue`

### Line 216

**Comment:** `// PR #13.9.5: Check if error is network-related`
**Why Outdated:** Old PR reference.
**Suggested Change:** Remove or update to: `// Detect network-related errors for offline queue handling`

### Line 267

**Comment:** `// PR #27: Merge Firestore data with pending optimistic updates`
**Why Outdated:** Old PR reference.
**Suggested Change:** Remove or update to: `// Merge server data with pending optimistic updates to prevent flashing`

### Line 333

**Comment:** `// PR #27: Clean up pending optimistic updates`
**Why Outdated:** Old PR reference.
**Suggested Change:** Remove or update to: `// Clean up optimistic update tracking`

### Line 337

**Comment:** `// PR #7: Optimistic updates with conflict resolution`
**Why Outdated:** Old PR reference.
**Suggested Change:** Remove or update to: `// Create object with optimistic updates and offline support`

### Line 381

**Comment:** `// PR #13.9.5: If offline, queue the operation instead of failing`
**Why Outdated:** Old PR reference.
**Suggested Change:** Remove or update to: `// Queue operation if offline for later execution`

### Line 396

**Comment:** `// PR #13.9.5: If network error, queue the operation instead of rolling back`
**Why Outdated:** Old PR reference.
**Suggested Change:** Remove or update to: `// Queue operation on network error instead of rolling back`

### Line 439, 449, 500, 522, 535, 582, 622, 632

**Comment:** Multiple instances of `// PR #13.9.5:` and `// PR #27:` references
**Why Outdated:** Old PR references.
**Suggested Change:** Remove PR numbers and update to descriptive comments about the functionality.

### Line 461

**Comment:** `// PR #9: Debounced update for smooth dragging/resizing`
**Why Outdated:** Old PR reference.
**Suggested Change:** Remove or update to: `// Debounced updates for smooth dragging and resizing`

### Line 729

**Comment:** `// PR #9: Smart batch update that chunks large updates`
**Why Outdated:** Old PR reference.
**Suggested Change:** Remove or update to: `// Smart batch update with automatic chunking for large datasets`

### Line 786

**Comment:** `// PR #7: Conflict resolution - last write wins`
**Why Outdated:** Old PR reference.
**Suggested Change:** Remove or update to: `// Conflict resolution using last-write-wins strategy`

### Line 1317

**Comment:** `// NEW: Column Layout (PR #25)`
**Why Outdated:** "NEW" marker is no longer appropriate for merged features. PR reference is outdated.
**Suggested Change:** Remove "NEW" and PR reference. Update to: `// Arrange shapes in vertical column with alignment`

### Line 1360

**Comment:** `// NEW: Advanced Alignment (PR #25)`
**Why Outdated:** "NEW" marker and PR reference outdated.
**Suggested Change:** Remove "NEW" and PR reference. Update to: `// Advanced shape alignment (left/center/right/top/middle/bottom)`

### Line 1510

**Comment:** `// NEW: Style Manipulation (PR #25)`
**Why Outdated:** "NEW" marker and PR reference outdated.
**Suggested Change:** Remove "NEW" and PR reference. Update to: `// Style manipulation (color, opacity, blend mode)`

### Line 1571

**Comment:** `// NEW: Duplication (PR #25)`
**Why Outdated:** "NEW" marker and PR reference outdated.
**Suggested Change:** Remove "NEW" and PR reference. Update to: `// Duplicate shape with offset positioning`

### Line 1602

**Comment:** `// NEW: AI-friendly multi-shape creation (PR #25)`
**Why Outdated:** "NEW" marker and PR reference outdated.
**Suggested Change:** Remove "NEW" and PR reference. Update to: `// AI-friendly batch shape creation with layout options`

### Line 1730

**Comment:** `// NEW: Alternating Shape Creation (PR #25)`
**Why Outdated:** "NEW" marker and PR reference outdated.
**Suggested Change:** Remove "NEW" and PR reference. Update to: `// Create alternating pattern of shapes`

---

## 5. AIPanel.tsx

### Lines 114, 143, 150, 416, 461, 511, 524, 604, 982, 1000, 1038, 1076, 1095, 1132

**Comment:** Multiple instances of `// NEW: ... (PR #25)` and similar PR references
**Why Outdated:** "NEW" markers and PR references are outdated for merged features.
**Suggested Change:** Remove "NEW" markers and PR references throughout the file.

---

## 6. lib/ai/tools.ts

### Lines 143, 192, 982, 1000, 1038, 1076, 1095, 1132, 1166, 1192, 1258, 1283, 1305, 1359

**Comment:** Multiple instances of `// NEW: ... (PR #25)` comments
**Why Outdated:** "NEW" markers and PR references are outdated.
**Suggested Change:** Remove "NEW" markers and PR references. Keep only the descriptive part of the comments.

---

## 7. DashboardPage.tsx

### Line 98

**Comment:** `// TODO: Open canvas settings dialog`
**Why Outdated:** Feature may be pending implementation or the TODO is stale.
**Suggested Change:** Either implement the canvas settings dialog or remove if not planned.

### Line 103

**Comment:** `// TODO: Show delete confirmation dialog`
**Why Outdated:** Feature may be pending implementation or the TODO is stale.
**Suggested Change:** Implement delete confirmation dialog (similar to the one in AIPanel for deleteAllShapes).

### Line 108

**Comment:** `// TODO: Open share dialog`
**Why Outdated:** Feature may be pending implementation or the TODO is stale.
**Suggested Change:** Either implement the share dialog or remove if not planned.

---

## 8. DesignPaletteMUI.tsx

### Line 926

**Comment:** `// TODO: Implement image replacement`
**Why Outdated:** Feature is pending implementation.
**Suggested Change:** Either implement image replacement functionality or add a note about when it will be implemented.

---

## 9. lib/ai/agent.ts

### Line 63

**Comment:** `.substr(2, 9)` used in ID generation
**Why Outdated:** `substr()` is deprecated. Should use `substring()` or `slice()`.
**Suggested Change:** Replace with `.slice(2, 11)` throughout the codebase where `.substr()` is used.

**Note:** This same pattern appears in multiple files:

- objects.ts: lines 113, 363, 663, 1587
- CanvasPage.tsx: line 93
- DashboardPage.tsx: line 93

---

## Summary

**Total Issues Found:** 80+ outdated comments

**Categories:**

1. **Old PR References (60+):** Comments referencing "PR #X" that should be removed or updated
2. **"NEW" Markers (10+):** Features marked as "NEW" that are now implemented
3. **TODO Comments (7):** Pending implementations or stale TODOs
4. **Deprecated API Usage (5+):** Use of `.substr()` instead of `.slice()`
5. **Misleading Comments (2):** Comments that don't accurately describe current implementation

**Priority Levels:**

- **High:** TODOs in CanvasStage.tsx for error toast (lines 450, 510) - easy fix with existing toast system
- **High:** Deprecated `.substr()` usage - should be updated to modern API
- **Medium:** Remove all "PR #X" references for cleaner codebase
- **Medium:** Implement or remove pending TODOs in DashboardPage.tsx
- **Low:** Remove "NEW" markers from implemented features
- **Low:** Update misleading comment on line 134 of CanvasStage.tsx

---

## Recommended Actions

1. **Immediate:** Replace all `.substr()` with `.slice()` for future compatibility
2. **Immediate:** Implement toast error handling on lines 450 and 510 of CanvasStage.tsx
3. **Short-term:** Remove all "PR #X" references and update with descriptive comments
4. **Short-term:** Remove all "NEW" markers from comments
5. **Long-term:** Evaluate and implement or remove pending TODO items in DashboardPage.tsx and DesignPaletteMUI.tsx

