import { useEffect } from 'react'
import { useSelectionStore } from '../store/selection'

interface UseCanvasShortcutsProps {
  onDelete: () => void
  onDuplicate: () => void
  onNudge: (direction: 'up' | 'down' | 'left' | 'right') => void
  onCopy?: () => void
  onPaste?: () => void
  onToolSelect?: (tool: string) => void
  onToggleLayers?: () => void
  onBringForward?: () => void
  onSendBackward?: () => void
}

export const useCanvasShortcuts = ({
  onDelete,
  onDuplicate,
  onNudge,
  onCopy,
  onPaste,
  onToolSelect,
  onToggleLayers,
  onBringForward,
  onSendBackward
}: UseCanvasShortcutsProps) => {
  const { hasSelection } = useSelectionStore()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if user is typing in a text input element
      const activeElement = document.activeElement
      const isTextInput =
        activeElement &&
        (activeElement.tagName === 'TEXTAREA' ||
          activeElement.tagName === 'INPUT' ||
          (activeElement as HTMLElement).contentEditable === 'true' ||
          activeElement.getAttribute('contenteditable') === 'true')

      // Handle tool selection shortcuts (only when not typing in text input)
      if (
        onToolSelect &&
        !e.metaKey &&
        !e.ctrlKey &&
        !e.altKey &&
        !isTextInput
      ) {
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

      // Prevent default behavior for our shortcuts
      const isDelete = e.key === 'Delete' || e.key === 'Backspace'
      const isDuplicate = (e.metaKey || e.ctrlKey) && e.key === 'd'
      const isCopy = (e.metaKey || e.ctrlKey) && e.key === 'c'
      const isPaste = (e.metaKey || e.ctrlKey) && e.key === 'v'
      const isArrowKey = [
        'ArrowUp',
        'ArrowDown',
        'ArrowLeft',
        'ArrowRight'
      ].includes(e.key)

      // Handle paste first (doesn't require selection)
      if (isPaste && onPaste) {
        e.preventDefault()
        onPaste()
        return
      }

      // Handle layers panel toggle (Cmd/Ctrl + L)
      if (e.key === 'l' && (e.metaKey || e.ctrlKey) && onToggleLayers) {
        e.preventDefault()
        onToggleLayers()
        return
      }

      // Handle layer ordering shortcuts (Cmd/Ctrl + Shift + Up/Down)
      if ((e.metaKey || e.ctrlKey) && e.shiftKey) {
        if (e.key === 'ArrowUp' && onBringForward) {
          e.preventDefault()
          onBringForward()
          return
        }
        if (e.key === 'ArrowDown' && onSendBackward) {
          e.preventDefault()
          onSendBackward()
          return
        }
      }

      // Only handle other shortcuts if we have a selection
      if (!hasSelection()) return

      if (isDelete || isDuplicate || isCopy || isArrowKey) {
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

      // Handle copy (Cmd/Ctrl + C)
      if (isCopy && onCopy) {
        onCopy()
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
  }, [
    hasSelection,
    onDelete,
    onDuplicate,
    onNudge,
    onCopy,
    onPaste,
    onToolSelect
  ])
}
