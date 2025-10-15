import { create } from 'zustand'

interface DesignPaletteState {
  // Fill and stroke
  selectedFillColor: string
  selectedStrokeColor: string
  strokeWidth: number

  // Effects
  rotation: number
  cornerRadius: number

  // Text styling
  fontSize: number
  fontFamily: string
  fontWeight: 'normal' | 'bold'
  fontStyle: 'normal' | 'italic'
  textDecoration: 'none' | 'underline'
  textAlign: 'left' | 'center' | 'right'
  lineHeight: number

  // Actions
  setSelectedFillColor: (color: string) => void
  setSelectedStrokeColor: (color: string) => void
  setStrokeWidth: (width: number) => void
  setRotation: (rotation: number) => void
  setCornerRadius: (radius: number) => void
  setFontSize: (size: number) => void
  setFontFamily: (family: string) => void
  setFontWeight: (weight: 'normal' | 'bold') => void
  setFontStyle: (style: 'normal' | 'italic') => void
  setTextDecoration: (decoration: 'none' | 'underline') => void
  setTextAlign: (align: 'left' | 'center' | 'right') => void
  setLineHeight: (height: number) => void

  // Get default properties for new shapes
  getDefaultTextProperties: () => {
    fontSize: number
    fontFamily: string
    fontWeight: 'normal' | 'bold'
    fontStyle: 'normal' | 'italic'
    textDecoration: 'none' | 'underline'
    textAlign: 'left' | 'center' | 'right'
    lineHeight: number
  }

  getDefaultShapeProperties: () => {
    fill: string
    stroke: string
    strokeWidth: number
    rotation: number
    cornerRadius: number
  }
}

export const useDesignPaletteStore = create<DesignPaletteState>((set, get) => ({
  // Initial state
  selectedFillColor: '#3B82F6',
  selectedStrokeColor: '#1F2937',
  strokeWidth: 2,
  rotation: 0,
  cornerRadius: 0,
  fontSize: 16,
  fontFamily: 'Arial',
  fontWeight: 'normal',
  fontStyle: 'normal',
  textDecoration: 'none',
  textAlign: 'left',
  lineHeight: 1.2,

  // Actions
  setSelectedFillColor: color => set({ selectedFillColor: color }),
  setSelectedStrokeColor: color => set({ selectedStrokeColor: color }),
  setStrokeWidth: width => set({ strokeWidth: width }),
  setRotation: rotation => set({ rotation }),
  setCornerRadius: radius => set({ cornerRadius: radius }),
  setFontSize: size => set({ fontSize: size }),
  setFontFamily: family => set({ fontFamily: family }),
  setFontWeight: weight => set({ fontWeight: weight }),
  setFontStyle: style => set({ fontStyle: style }),
  setTextDecoration: decoration => set({ textDecoration: decoration }),
  setTextAlign: align => set({ textAlign: align }),
  setLineHeight: height => set({ lineHeight: height }),

  // Helper functions
  getDefaultTextProperties: () => {
    const state = get()
    return {
      fontSize: state.fontSize,
      fontFamily: state.fontFamily,
      fontWeight: state.fontWeight,
      fontStyle: state.fontStyle,
      textDecoration: state.textDecoration,
      textAlign: state.textAlign,
      lineHeight: state.lineHeight
    }
  },

  getDefaultShapeProperties: () => {
    const state = get()
    return {
      fill: state.selectedFillColor,
      stroke: state.selectedStrokeColor,
      strokeWidth: state.strokeWidth,
      rotation: state.rotation,
      cornerRadius: state.cornerRadius
    }
  }
}))
