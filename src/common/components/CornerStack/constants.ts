import { Z_INDEX } from '@/common/constants/zIndex'

/**
 * DOM element ID for the bottom-right corner stack container.
 * Used by CornerStackProvider (renders the container) and
 * CornerStack (portals into it).
 */
export const CORNER_STACK_BOTTOM_RIGHT_ID = 'corner-stack-bottom-right'

/**
 * Z-index for corner stack containers.
 * Intentionally below overlays & popups — corner buttons should not
 * obscure popup content. The admin FloatingEditButton has its own
 * higher z-index (Z_INDEX.FLOATING_EDIT).
 *
 * @see {@link Z_INDEX} in `@/common/constants/zIndex` for the full layer map.
 */
export const CORNER_STACK_Z_INDEX = Z_INDEX.CORNER_STACK

/**
 * Gap between stacked elements inside a corner (px).
 */
export const CORNER_STACK_GAP = 12
