import React from 'react'

const EllipseIcon: React.FC<{ sx?: any }> = ({ sx }) => {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 44 44"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Ellipse icon"
      style={sx}
    >
      {/* ellipse glyph - made twice as big */}
      <ellipse
        cx="22"
        cy="22"
        rx="19"
        ry="15"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  )
}

export default EllipseIcon
