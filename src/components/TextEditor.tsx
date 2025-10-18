import React, { useEffect, useRef, useState } from 'react'
import { sanitizeText } from '../lib/security'
import type { TextShape } from '../lib/types'

interface TextEditorProps {
  shape: TextShape
  isVisible: boolean
  onSave: (text: string) => void
  onCancel: () => void
  stagePosition: { x: number; y: number }
  stageScale: number
}

const TextEditor: React.FC<TextEditorProps> = ({
  shape,
  isVisible,
  onSave,
  onCancel,
  stagePosition,
  stageScale
}) => {
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const [text, setText] = useState(shape.text)

  // Use the shape's actual styling properties instead of design palette store

  useEffect(() => {
    if (isVisible && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isVisible])

  useEffect(() => {
    setText(shape.text)
  }, [shape.text])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSave(sanitizeText(text))
    } else if (e.key === 'Escape') {
      e.preventDefault()
      onCancel()
    }
  }

  const handleBlur = () => {
    onSave(sanitizeText(text))
  }

  if (!isVisible) return null

  // Calculate position accounting for stage transform
  // The stage position and scale are already applied to the canvas
  // We need to convert world coordinates to screen coordinates
  // Shape scale should NOT be applied to position - it's applied to content only
  const x = shape.x * stageScale + stagePosition.x
  const y = shape.y * stageScale + stagePosition.y

  return (
    <div
      className="absolute pointer-events-auto"
      style={{
        left: x,
        top: y,
        transform: `scale(${stageScale}) rotate(${shape.rotation || 0}deg)`,
        transformOrigin: 'top left'
      }}
    >
      <textarea
        ref={inputRef}
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        className="bg-transparent border-none outline-none resize-none"
        style={{
          fontSize: (shape.fontSize || 16) * (shape.scaleY || 1),
          fontFamily: shape.fontFamily || 'Inter, system-ui, sans-serif',
          fontWeight: shape.fontWeight === 'bold' ? 700 : 400,
          fontStyle: shape.fontStyle || 'normal',
          textDecoration: shape.textDecoration || 'none',
          color: shape.fill || '#374151',
          minWidth: `${100 * (shape.scaleX || 1)}px`,
          minHeight: `${20 * (shape.scaleY || 1)}px`,
          lineHeight: shape.lineHeight || 1.2,
          verticalAlign: 'bottom'
        }}
        autoComplete="off"
        spellCheck={false}
      />
    </div>
  )
}

export default TextEditor
