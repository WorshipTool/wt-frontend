// Common mocks for ESM modules that jest cannot handle
jest.mock('statsig-node', () => ({}))
jest.mock('@statsig/js-client', () => ({ StatsigClient: jest.fn() }))
jest.mock('@statsig/session-replay', () => ({ StatsigSessionReplayPlugin: jest.fn() }))
jest.mock('@statsig/web-analytics', () => ({ StatsigAutoCapturePlugin: jest.fn() }))
jest.mock('next-intl', () => ({
	useTranslations: () => (key: string) => key,
}))
jest.mock('use-intl', () => ({
	useTranslations: () => (key: string) => key,
}))
jest.mock('react-masonry', () => ({
	Masonry: ({ children }: { children: React.ReactNode }) => children,
}))
jest.mock('framer-motion', () => ({
	motion: new Proxy(
		{},
		{
			get: (_target, prop) => {
				return ({ children, ...props }: any) => {
					const React = require('react')
					return React.createElement(prop as string, props, children)
				}
			},
		}
	),
	AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
}))

export {}
