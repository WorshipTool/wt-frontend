import '@testing-library/jest-dom'
import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'

const mockUpdateUserAsync = jest.fn().mockResolvedValue(undefined)
const mockInitializeAsync = jest.fn().mockResolvedValue(undefined)
const mockFlush = jest.fn().mockResolvedValue(undefined)
const mock$on = jest.fn()
const mockOff = jest.fn()
const mockStatsigClient = {
	updateUserAsync: mockUpdateUserAsync,
	initializeAsync: mockInitializeAsync,
	flush: mockFlush,
	$on: mock$on,
	off: mockOff,
	loadingStatus: 'Ready',
}

jest.mock('@statsig/js-client', () => ({
	StatsigClient: jest.fn(() => mockStatsigClient),
}))

jest.mock('@statsig/session-replay', () => ({
	StatsigSessionReplayPlugin: jest.fn(),
}))

jest.mock('@statsig/web-analytics', () => ({
	StatsigAutoCapturePlugin: jest.fn(),
}))

jest.mock('../../../hooks/auth/useAuth', () => ({
	__esModule: true,
	default: jest.fn(() => ({ user: null })),
}))

jest.mock('./flags.tech', () => ({
	getEnvironmentStatsigConfig: jest.fn(() => ({
		environment: { tier: 'development' },
	})),
	userDtoToStatsigUser: jest.fn((user: { guid?: string } | undefined) => ({
		userID: user?.guid,
	})),
}))

import { FeatureFlagsProvider, useStatsigClient } from './FeatureFlagsProvider'
import { StatsigClient } from '@statsig/js-client'

describe('FeatureFlagsProvider', () => {
	beforeEach(() => {
		jest.clearAllMocks()
	})

	it('renders children immediately before Statsig loads', () => {
		const { getByText } = render(
			<FeatureFlagsProvider>
				<span>Test Child</span>
			</FeatureFlagsProvider>,
		)
		expect(getByText('Test Child')).toBeInTheDocument()
	})

	it('uses a stable tree structure (custom context, no StatsigProvider)', () => {
		const { container, getByText } = render(
			<FeatureFlagsProvider>
				<span>Test Child</span>
			</FeatureFlagsProvider>,
		)
		expect(
			container.querySelector('[data-testid="statsig-provider"]'),
		).toBeNull()
		expect(getByText('Test Child')).toBeInTheDocument()
	})

	it('creates client with plugins from dynamic imports', async () => {
		render(
			<FeatureFlagsProvider>
				<span>Test</span>
			</FeatureFlagsProvider>,
		)

		await waitFor(() => {
			expect(StatsigClient).toHaveBeenCalled()
		})

		const options = (StatsigClient as unknown as jest.Mock).mock.calls[0][2]
		expect(options.plugins).toHaveLength(2)
		expect(options.environment).toEqual({ tier: 'development' })
	})

	it('calls initializeAsync after creating the client', async () => {
		render(
			<FeatureFlagsProvider>
				<span>Test</span>
			</FeatureFlagsProvider>,
		)

		await waitFor(() => {
			expect(mockInitializeAsync).toHaveBeenCalled()
		})
	})

	it('subscribes to values_updated after initialization', async () => {
		render(
			<FeatureFlagsProvider>
				<span>Test</span>
			</FeatureFlagsProvider>,
		)

		await waitFor(() => {
			expect(mock$on).toHaveBeenCalledWith(
				'values_updated',
				expect.any(Function),
			)
		})
	})

	it('cleans up listener and flushes on unmount', async () => {
		const { unmount } = render(
			<FeatureFlagsProvider>
				<span>Test</span>
			</FeatureFlagsProvider>,
		)

		await waitFor(() => {
			expect(mock$on).toHaveBeenCalled()
		})

		unmount()

		expect(mockOff).toHaveBeenCalledWith(
			'values_updated',
			expect.any(Function),
		)
		expect(mockFlush).toHaveBeenCalled()
	})

	it('re-renders consumers when values_updated fires', async () => {
		// Capture the values_updated handler so we can trigger it manually
		let valuesUpdatedHandler: (() => void) | null = null
		mock$on.mockImplementation((event: string, handler: () => void) => {
			if (event === 'values_updated') valuesUpdatedHandler = handler
		})

		const mockCheckGate = jest.fn()
			.mockReturnValueOnce(false) // first render: flag off (anonymous user)
			.mockReturnValue(true)      // after values_updated: flag on (logged-in user)
		;(mockStatsigClient as any).checkGate = mockCheckGate

		function Consumer() {
			const client = useStatsigClient()
			const value = client ? client.checkGate('enable_smart_search') : false
			return <span data-testid="flag">{value ? 'on' : 'off'}</span>
		}

		render(
			<FeatureFlagsProvider>
				<Consumer />
			</FeatureFlagsProvider>,
		)

		// Wait until client is initialized and consumer first renders with flag=false
		await waitFor(() => {
			expect(screen.getByTestId('flag').textContent).toBe('off')
		})

		// Simulate Statsig resolving flag values for the logged-in user
		await waitFor(() => expect(valuesUpdatedHandler).not.toBeNull())
		valuesUpdatedHandler!()

		// Consumer must re-render and pick up the new flag value without any other trigger
		await waitFor(() => {
			expect(screen.getByTestId('flag').textContent).toBe('on')
		})
	})
})
