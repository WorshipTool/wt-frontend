import '@testing-library/jest-dom'
import React from 'react'
import { render } from '@testing-library/react'

// Mock dependencies
const mockUpdateUserAsync = jest.fn()
const mockClient = { updateUserAsync: mockUpdateUserAsync }

jest.mock('@statsig/react-bindings', () => ({
	StatsigProvider: ({ children }: { children: React.ReactNode }) => (
		<div data-testid="statsig-provider">{children}</div>
	),
	useClientAsyncInit: jest.fn(() => ({ client: mockClient })),
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
import { useClientAsyncInit } from '@statsig/react-bindings'
import { StatsigAutoCapturePlugin } from '@statsig/web-analytics'
import { StatsigSessionReplayPlugin } from '@statsig/session-replay'

describe('FeatureFlagsProvider', () => {
	beforeEach(() => {
		jest.clearAllMocks()
	})

	it('renders children inside StatsigProvider', () => {
		const { getByText } = render(
			<FeatureFlagsProvider>
				<span>Test Child</span>
			</FeatureFlagsProvider>
		)

		expect(getByText('Test Child')).toBeInTheDocument()
	})

	it('includes browser plugins when window is defined (client-side)', () => {
		render(
			<FeatureFlagsProvider>
				<span>Test</span>
			</FeatureFlagsProvider>
		)

		// In jsdom test environment, typeof window !== 'undefined' is true
		const call = (useClientAsyncInit as jest.Mock).mock.calls[0]
		const options = call[2]

		expect(options.plugins).toHaveLength(2)
		expect(StatsigAutoCapturePlugin).toHaveBeenCalled()
		expect(StatsigSessionReplayPlugin).toHaveBeenCalled()
	})

	it('passes NEXT_PUBLIC_STATSIG_API_KEY as the first argument', () => {
		render(
			<FeatureFlagsProvider>
				<span>Test</span>
			</FeatureFlagsProvider>
		)

		const call = (useClientAsyncInit as jest.Mock).mock.calls[0]
		// First argument is the API key from env
		expect(call[0]).toBe(process.env.NEXT_PUBLIC_STATSIG_API_KEY)
	})

	it('passes environment config to useClientAsyncInit', () => {
		render(
			<FeatureFlagsProvider>
				<span>Test</span>
			</FeatureFlagsProvider>
		)

		const call = (useClientAsyncInit as jest.Mock).mock.calls[0]
		const options = call[2]

		expect(options.environment).toEqual({ tier: 'development' })
	})
})
