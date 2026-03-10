import '@testing-library/jest-dom'
import { act, fireEvent, render, screen } from '@testing-library/react'
import React from 'react'
import FloatingEditButton, { FloatingEditButtonState } from './FloatingEditButton'
import { AnchorRect, ElementCapture } from './types'

const makeCapture = (overrides: Partial<ElementCapture> = {}): ElementCapture => ({
	type: 'text-selection',
	selectedText: 'Hello world',
	elementTag: 'p',
	elementPath: 'main / p',
	pageUrl: 'http://localhost/',
	...overrides,
})

const makeSelectionRect = (overrides: Partial<AnchorRect> = {}): AnchorRect => ({
	top: 100,
	left: 200,
	right: 400,
	bottom: 120,
	width: 200,
	height: 20,
	...overrides,
})

const makeState = (
	overrides: Partial<FloatingEditButtonState> = {}
): FloatingEditButtonState => ({
	selectionRect: makeSelectionRect(),
	capture: makeCapture(),
	...overrides,
})

describe('FloatingEditButton', () => {
	beforeEach(() => {
		jest.useFakeTimers()
	})

	afterEach(() => {
		jest.useRealTimers()
	})

	it('renders the "Upravit" button text', () => {
		render(
			<FloatingEditButton
				state={makeState()}
				onEdit={jest.fn()}
				onClose={jest.fn()}
			/>
		)
		expect(screen.getByText('Upravit')).toBeInTheDocument()
	})

	it('has data-edit-proposals-ui attribute so it does not trigger captures', () => {
		render(
			<FloatingEditButton
				state={makeState()}
				onEdit={jest.fn()}
				onClose={jest.fn()}
			/>
		)
		const btn = screen.getByTestId('floating-edit-button')
		expect(btn).toHaveAttribute('data-edit-proposals-ui')
	})

	it('calls onEdit with the capture when clicked', () => {
		const onEdit = jest.fn()
		const capture = makeCapture({ selectedText: 'specific text' })
		render(
			<FloatingEditButton
				state={makeState({ capture })}
				onEdit={onEdit}
				onClose={jest.fn()}
			/>
		)
		fireEvent.click(screen.getByText('Upravit'))
		expect(onEdit).toHaveBeenCalledWith(capture)
	})

	it('calls onClose after the button is clicked', () => {
		const onClose = jest.fn()
		render(
			<FloatingEditButton
				state={makeState()}
				onEdit={jest.fn()}
				onClose={onClose}
			/>
		)
		fireEvent.click(screen.getByText('Upravit'))
		expect(onClose).toHaveBeenCalled()
	})

	it('is positioned with fixed positioning above the selection', () => {
		render(
			<FloatingEditButton
				state={makeState({ selectionRect: makeSelectionRect({ top: 200 }) })}
				onEdit={jest.fn()}
				onClose={jest.fn()}
			/>
		)
		const btn = screen.getByTestId('floating-edit-button')
		expect(btn.style.position).toBe('fixed')
		// Should be above the selection top (200 - height - gap)
		const top = parseInt(btn.style.top)
		expect(top).toBeLessThan(200)
	})

	it('falls below the selection when not enough space above', () => {
		render(
			<FloatingEditButton
				state={makeState({
					selectionRect: makeSelectionRect({ top: 10, bottom: 30 }),
				})}
				onEdit={jest.fn()}
				onClose={jest.fn()}
			/>
		)
		const btn = screen.getByTestId('floating-edit-button')
		const top = parseInt(btn.style.top)
		// Should fall below: bottom (30) + gap
		expect(top).toBeGreaterThanOrEqual(30)
	})

	it('closes on Escape key', () => {
		const onClose = jest.fn()
		render(
			<FloatingEditButton
				state={makeState()}
				onEdit={jest.fn()}
				onClose={onClose}
			/>
		)
		fireEvent.keyDown(document, { key: 'Escape' })
		expect(onClose).toHaveBeenCalled()
	})

	it('auto-dismisses after 10 seconds', () => {
		const onClose = jest.fn()
		render(
			<FloatingEditButton
				state={makeState()}
				onEdit={jest.fn()}
				onClose={onClose}
			/>
		)
		expect(onClose).not.toHaveBeenCalled()
		act(() => {
			jest.advanceTimersByTime(10_000)
		})
		expect(onClose).toHaveBeenCalled()
	})

	it('closes on scroll', () => {
		const onClose = jest.fn()
		render(
			<FloatingEditButton
				state={makeState()}
				onEdit={jest.fn()}
				onClose={onClose}
			/>
		)
		fireEvent.scroll(window)
		expect(onClose).toHaveBeenCalled()
	})

	it('closes on resize', () => {
		const onClose = jest.fn()
		render(
			<FloatingEditButton
				state={makeState()}
				onEdit={jest.fn()}
				onClose={onClose}
			/>
		)
		fireEvent.resize(window)
		expect(onClose).toHaveBeenCalled()
	})

	it('does NOT close on mousedown within the grace period', () => {
		const onClose = jest.fn()
		// Mock Date.now to return a consistent value
		const realDateNow = Date.now
		let now = 1000
		Date.now = jest.fn(() => now)

		render(
			<FloatingEditButton
				state={makeState()}
				onEdit={jest.fn()}
				onClose={onClose}
			/>
		)

		// Mousedown within 600ms grace period
		now = 1200 // 200ms after mount
		fireEvent.mouseDown(document.body)
		expect(onClose).not.toHaveBeenCalled()

		Date.now = realDateNow
	})

	it('closes on mousedown outside after grace period', () => {
		const onClose = jest.fn()
		const realDateNow = Date.now
		let now = 1000
		Date.now = jest.fn(() => now)

		render(
			<FloatingEditButton
				state={makeState()}
				onEdit={jest.fn()}
				onClose={onClose}
			/>
		)

		// Mousedown after grace period
		now = 2000 // 1000ms after mount
		fireEvent.mouseDown(document.body)
		expect(onClose).toHaveBeenCalled()

		Date.now = realDateNow
	})

	it('works with element-type capture (no text selected)', () => {
		const onEdit = jest.fn()
		const capture = makeCapture({
			type: 'element',
			selectedText: undefined,
			elementText: 'Click me',
			elementTag: 'button',
			elementPath: 'main / button',
		})
		render(
			<FloatingEditButton
				state={makeState({ capture })}
				onEdit={onEdit}
				onClose={jest.fn()}
			/>
		)
		fireEvent.click(screen.getByText('Upravit'))
		expect(onEdit).toHaveBeenCalledWith(capture)
	})

	it('positions correctly with zero-size rect (cursor position for element clicks)', () => {
		render(
			<FloatingEditButton
				state={makeState({
					selectionRect: makeSelectionRect({
						top: 300,
						left: 400,
						right: 400,
						bottom: 300,
						width: 0,
						height: 0,
					}),
				})}
				onEdit={jest.fn()}
				onClose={jest.fn()}
			/>
		)
		const btn = screen.getByTestId('floating-edit-button')
		expect(btn.style.position).toBe('fixed')
		// Should be above the cursor point (300 - height - gap)
		const top = parseInt(btn.style.top)
		expect(top).toBeLessThan(300)
	})
})
