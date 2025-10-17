/**
 * Blend mode utilities for Canvas 2D globalCompositeOperation
 * Maps CSS blend modes to Canvas 2D supported modes
 */

// Supported Canvas 2D blend modes
export const SUPPORTED_BLEND_MODES = [
  'normal', // source-over
  'multiply', // multiply
  'overlay', // overlay
  'screen', // screen
  'darken', // darken
  'lighten', // lighten
  'color-dodge', // color-dodge
  'color-burn', // color-burn
  'hard-light', // hard-light
  'soft-light', // soft-light
  'difference', // difference
  'exclusion' // exclusion
] as const

export type SupportedBlendMode = (typeof SUPPORTED_BLEND_MODES)[number]

/**
 * Maps CSS blend modes to Canvas 2D globalCompositeOperation values
 * @param cssBlendMode - CSS blend mode string
 * @returns Canvas 2D globalCompositeOperation value
 */
export function getCanvasBlendMode(
  cssBlendMode: string
):
  | 'source-over'
  | 'multiply'
  | 'overlay'
  | 'screen'
  | 'darken'
  | 'lighten'
  | 'color-dodge'
  | 'color-burn'
  | 'hard-light'
  | 'soft-light'
  | 'difference'
  | 'exclusion' {
  const modeMap: Record<
    string,
    | 'source-over'
    | 'multiply'
    | 'overlay'
    | 'screen'
    | 'darken'
    | 'lighten'
    | 'color-dodge'
    | 'color-burn'
    | 'hard-light'
    | 'soft-light'
    | 'difference'
    | 'exclusion'
  > = {
    normal: 'source-over',
    multiply: 'multiply',
    overlay: 'overlay',
    screen: 'screen',
    darken: 'darken',
    lighten: 'lighten',
    'color-dodge': 'color-dodge',
    'color-burn': 'color-burn',
    'hard-light': 'hard-light',
    'soft-light': 'soft-light',
    difference: 'difference',
    exclusion: 'exclusion'
  }
  return modeMap[cssBlendMode] || 'source-over'
}

/**
 * Validates if a blend mode is supported by Canvas 2D
 * @param blendMode - Blend mode to validate
 * @returns true if supported, false otherwise
 */
export function isSupportedBlendMode(
  blendMode: string
): blendMode is SupportedBlendMode {
  return SUPPORTED_BLEND_MODES.includes(blendMode as SupportedBlendMode)
}

/**
 * Gets the default blend mode for new shapes
 * @returns Default blend mode
 */
export function getDefaultBlendMode(): SupportedBlendMode {
  return 'normal'
}
