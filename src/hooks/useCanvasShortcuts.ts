import { useEffect } from 'react'
import { useSelectionStore } from '../store/selection'

interface UseCanvasShortcutsProps {
  onDelete: () => void
  onDuplicate: () => void
  onNudge: (direction: 'up' | 'down' | 'left' | 'right') => void
  onToolSelect?: (tool: string) => void
}

export const useCanvasShortcuts = ({
  onDelete,
  onDuplicate,
  onNudge,
  onToolSelect
}: UseCanvasShortcutsProps) => {
  const { hasSelection } = useSelectionStore()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Handle tool selection shortcuts (always available)
      if (onToolSelect && !e.metaKey && !e.ctrlKey && !e.altKey) {
        const toolShortcuts: Record<string, string> = {
          v: 'select',
          h: 'pan',
          r: 'rectangle',
          c: 'circle',
          t: 'text',
          m: 'mermaid'
        }

        const tool = toolShortcuts[e.key.toLowerCase()]
        if (tool) {
          e.preventDefault()
          onToolSelect(tool)
          return
        }
      }

      // Only handle other shortcuts if we have a selection
      if (!hasSelection()) return

      // Prevent default behavior for our shortcuts
      const isDelete = e.key === 'Delete' || e.key === 'Backspace'
      const isDuplicate = (e.metaKey || e.ctrlKey) && e.key === 'd'
      const isArrowKey = [
        'ArrowUp',
        'ArrowDown',
        'ArrowLeft',
        'ArrowRight'
      ].includes(e.key)

      if (isDelete || isDuplicate || isArrowKey) {
        e.preventDefault()
      }

      // Handle delete
      if (isDelete) {
        onDelete()
        return
      }

      // Handle duplicate (Cmd/Ctrl + D)
      if (isDuplicate) {
        onDuplicate()
        return
      }

      // Handle arrow key nudging
      if (isArrowKey) {
        switch (e.key) {
          case 'ArrowUp':
            onNudge('up')
            break
          case 'ArrowDown':
            onNudge('down')
            break
          case 'ArrowLeft':
            onNudge('left')
            break
          case 'ArrowRight':
            onNudge('right')
            break
        }
      }
    }

    // Add event listener
    document.addEventListener('keydown', handleKeyDown)

    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [hasSelection, onDelete, onDuplicate, onNudge, onToolSelect])
}
