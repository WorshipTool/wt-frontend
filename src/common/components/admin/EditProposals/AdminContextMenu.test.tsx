import '@testing-library/jest-dom'
import { fireEvent, render, screen } from '@testing-library/react'
import React from 'react'
import AdminContextMenu, { ContextMenuState } from './AdminContextMenu'
import { ElementCapture } from './types'

const makeCapture = (overrides: Partial<ElementCapture> = {}): ElementCapture => ({
	type: 'text-selection',
	selectedText: 'Hello world',
	elementTag: 'p',
	elementPath: 'main / p',
	pageUrl: 'http://localhost/',
	...overrides,
})

const makeState = (overrides: Partial<ContextMenuState> = {}): ContextMenuState => ({
	x: 100,
	y: 200,
	capture: makeCapture(),
	...overrides,
})

describe('AdminContextMenu', () => {
	it('renders the "Navrhnout úpravu" action button', () => {
		render(
			<AdminContextMenu
				state={makeState()}
				onEdit={jest.fn()}
				onClose={jest.fn()}
			/>
		)
		expect(screen.getByText('Navrhnout úpravu')).toBeInTheDocument()
	})

	it('calls onEdit with the capture when action button is clicked', () => {
		const onEdit = jest.fn()
		const capture = makeCapture({ selectedText: 'specific text' })
		render(
			<AdminContextMenu
				state={makeState({ capture })}
				onEdit={onEdit}
				onClose={jest.fn()}
			/>
		)
		fireEvent.click(screen.getByText('Navrhnout úpravu'))
		expect(onEdit).toHaveBeenCalledWith(capture)
	})

	it('calls onClose after the action button is clicked', () => {
		const onClose = jest.fn()
		render(
			<AdminContextMenu
				state={makeState()}
				onEdit={jest.fn()}
				onClose={onClose}
			/>
		)
		fireEvent.click(screen.getByText('Navrhnout úpravu'))
		expect(onClose).toHaveBeenCalled()
	})

	it('closes on Escape key', () => {
		const onClose = jest.fn()
		render(
			<AdminContextMenu
				state={makeState()}
				onEdit={jest.fn()}
				onClose={onClose}
			/>
		)
		fireEvent.keyDown(document, { key: 'Escape' })
		expect(onClose).toHaveBeenCalled()
	})

	it('closes when text selection is cleared (selectionchange)', () => {
		const onClose = jest.fn()

		// Mock getSelection to return empty string
		const originalGetSelection = window.getSelection
		window.getSelection = jest.fn().mockReturnValue({ toString: () => '' })

		render(
			<AdminContextMenu
				state={makeState()}
				onEdit={jest.fn()}
				onClose={onClose}
			/>
		)

		fireEvent(document, new Event('selectionchange'))
		expect(onClose).toHaveBeenCalled()

		window.getSelection = originalGetSelection
	})

	it('does NOT close when text selection still has content (selectionchange)', () => {
		const onClose = jest.fn()

		// Mock getSelection to return non-empty string
		const originalGetSelection = window.getSelection
		window.getSelection = jest.fn().mockReturnValue({ toString: () => 'still selected' })

		render(
			<AdminContextMenu
				state={makeState()}
				onEdit={jest.fn()}
				onClose={onClose}
			/>
		)

		fireEvent(document, new Event('selectionchange'))
		expect(onClose).not.toHaveBeenCalled()

		window.getSelection = originalGetSelection
	})

	it('is positioned with fixed positioning', () => {
		const { container } = render(
			<AdminContextMenu
				state={makeState({ x: 300, y: 450 })}
				onEdit={jest.fn()}
				onClose={jest.fn()}
			/>
		)
		const menu = container.firstChild as HTMLElement
		expect(menu.style.position).toBe('fixed')
	})

	it('has data-edit-proposals-ui attribute so it does not trigger captures', () => {
		const { container } = render(
			<AdminContextMenu
				state={makeState()}
				onEdit={jest.fn()}
				onClose={jest.fn()}
			/>
		)
		const menu = container.firstChild as HTMLElement
		expect(menu).toHaveAttribute('data-edit-proposals-ui')
	})
})
