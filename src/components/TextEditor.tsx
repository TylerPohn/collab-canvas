import React, { useEffect, useRef, useState } from 'react'
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
      onSave(text)
    } else if (e.key === 'Escape') {
      e.preventDefault()
      onCancel()
    }
  }

  const handleBlur = () => {
    onSave(text)
  }

  if (!isVisible) return null

  // Calculate position accounting for stage transform
  // Position at the bottom-left corner of the text
  const x = (shape.x + stagePosition.x) * stageScale
  const y = (shape.y + stagePosition.y) * stageScale

  return (
    <div
      className="absolute pointer-events-auto"
      style={{
        left: x,
        top: y,
        transform: `scale(${stageScale}) rotate(${shape.rotation || 0}deg)`,
        transformOrigin: 'bottom left'
      }}
    >
      <textarea
        ref={inputRef}
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        className="bg-transparent border-none outline-none resize-none font-inter text-gray-700"
        style={{
          fontSize: shape.fontSize || 16,
          fontFamily: 'Inter, system-ui, sans-serif',
          color: shape.fill || '#374151',
          minWidth: '100px',
          minHeight: '20px',
          lineHeight: 1.2,
          verticalAlign: 'bottom'
        }}
        autoComplete="off"
        spellCheck={false}
      />
    </div>
  )
}

export default TextEditor
