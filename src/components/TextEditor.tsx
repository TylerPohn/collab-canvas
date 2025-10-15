import React, { useEffect, useRef, useState } from 'react'
import type { TextShape } from '../lib/types'
import { useDesignPaletteStore } from '../store/designPalette'

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

  // Get current design palette settings
  const {
    fontSize,
    fontFamily,
    fontWeight,
    fontStyle,
    textDecoration,
    selectedFillColor
  } = useDesignPaletteStore()

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
  // The stage position and scale are already applied to the canvas
  // We need to convert world coordinates to screen coordinates
  const x = shape.x * stageScale + stagePosition.x
  const y = shape.y * stageScale + stagePosition.y

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
        className="bg-transparent border-none outline-none resize-none"
        style={{
          fontSize: fontSize,
          fontFamily: fontFamily,
          fontWeight: fontWeight === 'bold' ? 700 : 400,
          fontStyle: fontStyle,
          textDecoration: textDecoration,
          color: selectedFillColor,
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
