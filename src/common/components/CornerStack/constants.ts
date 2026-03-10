/**
 * DOM element ID for the bottom-right corner stack container.
 * Used by CornerStackProvider (renders the container) and
 * CornerStack (portals into it).
 */
export const CORNER_STACK_BOTTOM_RIGHT_ID = 'corner-stack-bottom-right'

/**
 * Z-index for corner stack containers.
 * Must sit ABOVE popups (PopupProvider uses 1360) so admin controls
 * (proposal corner button, idea submission) are always accessible.
 */
export const CORNER_STACK_Z_INDEX = 1400

/**
 * Gap between stacked elements inside a corner (px).
 */
export const CORNER_STACK_GAP = 12
