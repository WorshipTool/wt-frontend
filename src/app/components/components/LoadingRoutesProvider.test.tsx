import React from 'react'
import { render, act } from '@testing-library/react'
import LoadingRoutesProvider, {
	_resetLoadingFlag,
} from './LoadingRoutesProvider'

// Mock the LoadingScreen component
jest.mock('../../(layout)/vytvorit/loading', () => {
	return function MockLoadingScreen({
		isVisible,
	}: {
		isVisible?: boolean
	}) {
		return (
			<div data-testid="loading-screen" data-visible={String(!!isVisible)} />
		)
	}
})

// jsdom doesn't have requestIdleCallback — the component falls back to setTimeout
beforeEach(() => {
	jest.useFakeTimers()
	_resetLoadingFlag()
})

afterEach(() => {
	jest.useRealTimers()
})

describe('LoadingRoutesProvider', () => {
	it('shows loading screen initially when show=true', () => {
		const { getByTestId } = render(
			<LoadingRoutesProvider show={true}>
				<div>content</div>
			</LoadingRoutesProvider>,
		)
		expect(getByTestId('loading-screen').dataset.visible).toBe('true')
	})

	it('hides loading screen after fallback timeout', () => {
		const { getByTestId } = render(
			<LoadingRoutesProvider show={true}>
				<div>content</div>
			</LoadingRoutesProvider>,
		)

		act(() => {
			jest.advanceTimersByTime(400)
		})

		expect(getByTestId('loading-screen').dataset.visible).toBe('false')
	})

	it('does not show loading screen on remount after dismissal', () => {
		const { getByTestId, unmount } = render(
			<LoadingRoutesProvider show={true}>
				<div>content</div>
			</LoadingRoutesProvider>,
		)

		act(() => {
			jest.advanceTimersByTime(400)
		})
		expect(getByTestId('loading-screen').dataset.visible).toBe('false')

		// Unmount (simulates Suspense recovery or provider tree restructuring)
		unmount()

		// Remount — should NOT show loading again
		const { getByTestId: getByTestId2 } = render(
			<LoadingRoutesProvider show={true}>
				<div>content</div>
			</LoadingRoutesProvider>,
		)
		expect(getByTestId2('loading-screen').dataset.visible).toBe('false')
	})

	it('does not show loading screen when show=false', () => {
		const { getByTestId } = render(
			<LoadingRoutesProvider show={false}>
				<div>content</div>
			</LoadingRoutesProvider>,
		)
		expect(getByTestId('loading-screen').dataset.visible).toBe('false')
	})
})
