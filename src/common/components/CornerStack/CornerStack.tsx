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
}

/**
 * CornerStack portals its children into the corner container rendered by
 * CornerStackProvider. Multiple elements using the same corner will be
 * stacked vertically (column) above each other, never overlapping.
 *
 * Elements mount in React tree order: elements that mount earlier appear
 * at the bottom (closest to the corner), later ones stack above.
 *
 * Usage:
 * ```tsx
 * <CornerStack corner="bottom-right">
 *   <MyFloatingButton />
 * </CornerStack>
 * ```
 */
export default function CornerStack({ corner, children }: CornerStackProps) {
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
		<div style={{ pointerEvents: 'auto' }}>{children}</div>,
		containerRef.current
	)
}
