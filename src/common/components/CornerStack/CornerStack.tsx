'use client'
import { ReactNode, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { CORNER_STACK_BOTTOM_RIGHT_ID } from './constants'

/**
 * Corner positions supported by the CornerStack system.
 * Currently only bottom-right is implemented; add more as needed.
 */
export type CornerPosition = 'bottom-right'

const CORNER_CONTAINER_IDS: Record<CornerPosition, string> = {
	'bottom-right': CORNER_STACK_BOTTOM_RIGHT_ID,
}

interface CornerStackProps {
	corner: CornerPosition
	children: ReactNode
	/**
	 * CSS flex `order` value controlling the visual stacking position.
	 * Lower values appear closer to the corner (bottom), higher values
	 * appear further from the corner (above). Does not depend on DOM
	 * insertion order or effect timing.
	 *
	 * Default: 0
	 */
	order?: number
}

/**
 * CornerStack portals its children into the corner container rendered by
 * CornerStackProvider. Multiple elements using the same corner will be
 * stacked vertically (column) above each other, never overlapping.
 *
 * Use the `order` prop to explicitly control the visual stacking position.
 * Lower order = closer to the corner; higher order = further from the corner.
 *
 * Usage:
 * ```tsx
 * <CornerStack corner="bottom-right" order={0}>
 *   <MyFloatingButton />
 * </CornerStack>
 * <CornerStack corner="bottom-right" order={1}>
 *   <MyAdminButton />  {/* appears above MyFloatingButton *\/}
 * </CornerStack>
 * ```
 */
export default function CornerStack({
	corner,
	children,
	order = 0,
}: CornerStackProps) {
	const containerRef = useRef<HTMLElement | null>(null)
	const [mounted, setMounted] = useState(false)

	useEffect(() => {
		const containerId = CORNER_CONTAINER_IDS[corner]
		containerRef.current = document.getElementById(containerId)
		setMounted(true)
		return () => {
			setMounted(false)
		}
	}, [corner])

	if (!containerRef.current || !mounted) return null

	return createPortal(
		<div style={{ pointerEvents: 'auto', order }}>{children}</div>,
		containerRef.current
	)
}
