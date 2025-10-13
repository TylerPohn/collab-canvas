import { create } from 'zustand'
import type { SelectionState } from '../lib/types'

interface SelectionStore extends SelectionState {
  selectShape: (id: string) => void
  selectMultiple: (ids: string[]) => void
  toggleSelection: (id: string) => void
  clearSelection: () => void
  isSelected: (id: string) => boolean
  hasSelection: () => boolean
}

export const useSelectionStore = create<SelectionStore>((set, get) => ({
  selectedIds: [],
  isMultiSelect: false,

  selectShape: (id: string) => {
    set({ selectedIds: [id], isMultiSelect: false })
  },

  selectMultiple: (ids: string[]) => {
    set({ selectedIds: ids, isMultiSelect: ids.length > 1 })
  },

  toggleSelection: (id: string) => {
    const { selectedIds } = get()
    const isCurrentlySelected = selectedIds.includes(id)

    if (isCurrentlySelected) {
      // Remove from selection
      const newSelection = selectedIds.filter(selectedId => selectedId !== id)
      set({
        selectedIds: newSelection,
        isMultiSelect: newSelection.length > 1
      })
    } else {
      // Add to selection
      const newSelection = [...selectedIds, id]
      set({
        selectedIds: newSelection,
        isMultiSelect: newSelection.length > 1
      })
    }
  },

  clearSelection: () => {
    set({ selectedIds: [], isMultiSelect: false })
  },

  isSelected: (id: string) => {
    return get().selectedIds.includes(id)
  },

  hasSelection: () => {
    return get().selectedIds.length > 0
  }
}))
