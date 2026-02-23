import { renderHook, act } from '@testing-library/react'
import { useImplementKosmickey } from '../useImplementKosmickey'

function fireKeyDown(key: string) {
	window.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }))
}

function typeSequence(keys: string[]) {
	keys.forEach((key) => fireKeyDown(key))
}

describe('useImplementKosmickey', () => {
	it('triggers after typing I-M-P-L-E-M-E-N-T in sequence', () => {
		const onTriggered = jest.fn()
		renderHook(() => useImplementKosmickey(onTriggered))

		act(() => {
			typeSequence(['i', 'm', 'p', 'l', 'e', 'm', 'e', 'n', 't'])
		})

		expect(onTriggered).toHaveBeenCalledTimes(1)
	})

	it('is case-insensitive', () => {
		const onTriggered = jest.fn()
		renderHook(() => useImplementKosmickey(onTriggered))

		act(() => {
			typeSequence(['I', 'M', 'P', 'L', 'E', 'M', 'E', 'N', 'T'])
		})

		expect(onTriggered).toHaveBeenCalledTimes(1)
	})

	it('does not trigger for incomplete sequence', () => {
		const onTriggered = jest.fn()
		renderHook(() => useImplementKosmickey(onTriggered))

		act(() => {
			typeSequence(['i', 'm', 'p', 'l', 'e', 'm', 'e', 'n'])
		})

		expect(onTriggered).not.toHaveBeenCalled()
	})

	it('resets progress on wrong key', () => {
		const onTriggered = jest.fn()
		renderHook(() => useImplementKosmickey(onTriggered))

		act(() => {
			typeSequence(['i', 'm', 'p', 'x']) // wrong key resets
			typeSequence(['i', 'm', 'p', 'l', 'e', 'm', 'e', 'n', 't'])
		})

		expect(onTriggered).toHaveBeenCalledTimes(1)
	})

	it('restarts from index 1 when wrong key is itself the first letter', () => {
		const onTriggered = jest.fn()
		renderHook(() => useImplementKosmickey(onTriggered))

		act(() => {
			// i m p i — the last 'i' restarts as index 1
			typeSequence(['i', 'm', 'p', 'i'])
			typeSequence(['m', 'p', 'l', 'e', 'm', 'e', 'n', 't'])
		})

		expect(onTriggered).toHaveBeenCalledTimes(1)
	})

	it('can trigger multiple times', () => {
		const onTriggered = jest.fn()
		renderHook(() => useImplementKosmickey(onTriggered))

		act(() => {
			typeSequence(['i', 'm', 'p', 'l', 'e', 'm', 'e', 'n', 't'])
			typeSequence(['i', 'm', 'p', 'l', 'e', 'm', 'e', 'n', 't'])
		})

		expect(onTriggered).toHaveBeenCalledTimes(2)
	})

	it('removes event listener on unmount', () => {
		const onTriggered = jest.fn()
		const { unmount } = renderHook(() => useImplementKosmickey(onTriggered))

		unmount()

		act(() => {
			typeSequence(['i', 'm', 'p', 'l', 'e', 'm', 'e', 'n', 't'])
		})

		expect(onTriggered).not.toHaveBeenCalled()
	})

	it('uses the latest callback without re-subscribing', () => {
		const firstCallback = jest.fn()
		const secondCallback = jest.fn()

		const { rerender } = renderHook(
			({ cb }) => useImplementKosmickey(cb),
			{ initialProps: { cb: firstCallback } }
		)

		rerender({ cb: secondCallback })

		act(() => {
			typeSequence(['i', 'm', 'p', 'l', 'e', 'm', 'e', 'n', 't'])
		})

		expect(firstCallback).not.toHaveBeenCalled()
		expect(secondCallback).toHaveBeenCalledTimes(1)
	})

	it('triggers even when focus is in an input element', () => {
		const onTriggered = jest.fn()
		renderHook(() => useImplementKosmickey(onTriggered))

		act(() => {
			// Simulate keys fired from an input (e.g. the homepage search bar)
			const inputTarget = document.createElement('input')
			'implement'.split('').forEach((key) => {
				const event = new KeyboardEvent('keydown', { key, bubbles: true })
				Object.defineProperty(event, 'target', { value: inputTarget })
				window.dispatchEvent(event)
			})
		})

		expect(onTriggered).toHaveBeenCalledTimes(1)
	})
})
