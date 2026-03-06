import '@testing-library/jest-dom'
import { act, render, screen, waitFor } from '@testing-library/react'
import React from 'react'
import { CORNER_STACK_BOTTOM_RIGHT_ID } from './constants'

/**
 * CornerStack tests use a manually-created container div to avoid needing
 * to mock CornerStackProvider's dependencies (BottomPanelProvider, useDownSize).
 * This tests CornerStack behavior in isolation.
 */
import CornerStack from './CornerStack'

const createContainer = () => {
	const container = document.createElement('div')
	container.id = CORNER_STACK_BOTTOM_RIGHT_ID
	document.body.appendChild(container)
	return container
}

describe('CornerStack', () => {
	afterEach(() => {
		document.getElementById(CORNER_STACK_BOTTOM_RIGHT_ID)?.remove()
	})

	it('returns null when the corner container does not exist in the DOM', () => {
		// No container present — portal target is missing
		render(
			<CornerStack corner="bottom-right">
				<span data-testid="child">hello</span>
			</CornerStack>
		)
		expect(screen.queryByTestId('child')).not.toBeInTheDocument()
	})

	it('portals children into the corner container when it exists', async () => {
		createContainer()

		render(
			<CornerStack corner="bottom-right">
				<span data-testid="stacked-child">stacked</span>
			</CornerStack>
		)

		await waitFor(() => {
			expect(screen.getByTestId('stacked-child')).toBeInTheDocument()
		})
	})

	it('renders children inside the corner container element', async () => {
		createContainer()

		render(
			<CornerStack corner="bottom-right">
				<span data-testid="portal-child">portal content</span>
			</CornerStack>
		)

		await waitFor(() => {
			const child = screen.getByTestId('portal-child')
			const container = document.getElementById(CORNER_STACK_BOTTOM_RIGHT_ID)
			expect(container).toContainElement(child)
		})
	})

	it('stacks multiple elements inside the same container', async () => {
		createContainer()

		render(
			<>
				<CornerStack corner="bottom-right">
					<span data-testid="first">first</span>
				</CornerStack>
				<CornerStack corner="bottom-right">
					<span data-testid="second">second</span>
				</CornerStack>
			</>
		)

		await waitFor(() => {
			expect(screen.getByTestId('first')).toBeInTheDocument()
			expect(screen.getByTestId('second')).toBeInTheDocument()
		})

		const container = document.getElementById(CORNER_STACK_BOTTOM_RIGHT_ID)
		expect(container).toContainElement(screen.getByTestId('first'))
		expect(container).toContainElement(screen.getByTestId('second'))
	})

	it('applies CSS order style to control visual stacking position', async () => {
		createContainer()

		render(
			<>
				<CornerStack corner="bottom-right" order={1}>
					<span data-testid="high-order">high</span>
				</CornerStack>
				<CornerStack corner="bottom-right" order={0}>
					<span data-testid="low-order">low</span>
				</CornerStack>
			</>
		)

		await waitFor(() => {
			expect(screen.getByTestId('high-order')).toBeInTheDocument()
			expect(screen.getByTestId('low-order')).toBeInTheDocument()
		})

		const highWrapper = screen
			.getByTestId('high-order')
			.closest('div') as HTMLDivElement
		const lowWrapper = screen
			.getByTestId('low-order')
			.closest('div') as HTMLDivElement

		expect(highWrapper.style.order).toBe('1')
		expect(lowWrapper.style.order).toBe('0')
	})

	it('uses order=0 as the default when order prop is not provided', async () => {
		createContainer()

		render(
			<CornerStack corner="bottom-right">
				<span data-testid="default-order">default</span>
			</CornerStack>
		)

		await waitFor(() => {
			expect(screen.getByTestId('default-order')).toBeInTheDocument()
		})

		const wrapper = screen
			.getByTestId('default-order')
			.closest('div') as HTMLDivElement
		expect(wrapper.style.order).toBe('0')
	})

	it('removes portal content from the DOM on unmount', async () => {
		createContainer()

		const { unmount } = render(
			<CornerStack corner="bottom-right">
				<span data-testid="unmount-child">will be removed</span>
			</CornerStack>
		)

		await waitFor(() => {
			expect(screen.getByTestId('unmount-child')).toBeInTheDocument()
		})

		act(() => {
			unmount()
		})

		expect(screen.queryByTestId('unmount-child')).not.toBeInTheDocument()
	})
})
