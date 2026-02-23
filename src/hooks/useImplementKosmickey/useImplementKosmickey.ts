'use client'

import { useEffect, useRef } from 'react'

const IMPLEMENT_SEQUENCE = ['i', 'm', 'p', 'l', 'e', 'm', 'e', 'n', 't']

export function useImplementKosmickey(onTriggered: () => void) {
	const progress = useRef(0)
	const onTriggeredRef = useRef(onTriggered)

	useEffect(() => {
		onTriggeredRef.current = onTriggered
	}, [onTriggered])

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			const key = event.key.toLowerCase()
			const expected = IMPLEMENT_SEQUENCE[progress.current]

			if (key === expected) {
				progress.current += 1
				if (progress.current === IMPLEMENT_SEQUENCE.length) {
					progress.current = 0
					onTriggeredRef.current()
				}
			} else {
				// Allow restarting from index 1 if the key matches the first letter
				progress.current = key === IMPLEMENT_SEQUENCE[0] ? 1 : 0
			}
		}

		window.addEventListener('keydown', handleKeyDown)
		return () => {
			window.removeEventListener('keydown', handleKeyDown)
		}
	}, [])
}
