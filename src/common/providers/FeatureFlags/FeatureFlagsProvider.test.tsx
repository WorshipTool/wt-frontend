import '@testing-library/jest-dom'
import React from 'react'
import { render, act, waitFor } from '@testing-library/react'

// Mock dependencies
const mockUpdateUserAsync = jest.fn().mockResolvedValue(undefined)
const mockInitializeAsync = jest.fn().mockResolvedValue(undefined)
const mockStatsigClient = {
	updateUserAsync: mockUpdateUserAsync,
	initializeAsync: mockInitializeAsync,
	loadingStatus: 'Ready',
}

jest.mock('@statsig/js-client', () => ({
	StatsigClient: jest.fn(() => mockStatsigClient),
}))

jest.mock('@statsig/react-bindings', () => ({
	StatsigProvider: ({ children }: { children: React.ReactNode }) => (
		<div data-testid="statsig-provider">{children}</div>
	),
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

import { FeatureFlagsProvider } from './FeatureFlagsProvider'
import { StatsigClient } from '@statsig/js-client'

describe('FeatureFlagsProvider', () => {
	beforeEach(() => {
		jest.clearAllMocks()
	})

	it('renders children immediately (before Statsig loads)', () => {
		const { getByText } = render(
			<FeatureFlagsProvider>
				<span>Test Child</span>
			</FeatureFlagsProvider>
		)

		// Children should be visible immediately without waiting for Statsig
		expect(getByText('Test Child')).toBeInTheDocument()
	})

	it('renders children inside StatsigProvider after initialization', async () => {
		const { getByText, getByTestId } = render(
			<FeatureFlagsProvider>
				<span>Test Child</span>
			</FeatureFlagsProvider>
		)

		// After async init, StatsigProvider should wrap the children
		await waitFor(() => {
			expect(getByTestId('statsig-provider')).toBeInTheDocument()
		})
		expect(getByText('Test Child')).toBeInTheDocument()
	})

	it('dynamically imports and creates plugins', async () => {
		render(
			<FeatureFlagsProvider>
				<span>Test</span>
			</FeatureFlagsProvider>
		)

		// Wait for dynamic imports and client initialization
		await waitFor(() => {
			expect(StatsigClient).toHaveBeenCalled()
		})

		const constructorCall = (StatsigClient as jest.Mock).mock.calls[0]
		const options = constructorCall[2]

		// Plugins should be created from dynamic imports
		expect(options.plugins).toHaveLength(2)
		expect(options.environment).toEqual({ tier: 'development' })
	})

	it('passes NEXT_PUBLIC_STATSIG_API_KEY as the first argument', async () => {
		render(
			<FeatureFlagsProvider>
				<span>Test</span>
			</FeatureFlagsProvider>
		)

		await waitFor(() => {
			expect(StatsigClient).toHaveBeenCalled()
		})

		const constructorCall = (StatsigClient as jest.Mock).mock.calls[0]
		expect(constructorCall[0]).toBe(process.env.NEXT_PUBLIC_STATSIG_API_KEY)
	})

	it('calls initializeAsync after creating the client', async () => {
		render(
			<FeatureFlagsProvider>
				<span>Test</span>
			</FeatureFlagsProvider>
		)

		await waitFor(() => {
			expect(mockInitializeAsync).toHaveBeenCalled()
		})
	})
})
