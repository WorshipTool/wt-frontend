import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'

// Mock dependencies using relative paths for jest compatibility
jest.mock('next-intl', () => ({
	useTranslations: (ns: string) => (key: string) => `${ns}.${key}`,
}))

jest.mock('framer-motion', () => ({
	motion: {
		div: ({
			children,
			...rest
		}: {
			children?: React.ReactNode
			[key: string]: unknown
		}) => {
			const { initial, animate, exit, transition, whileHover, ...safe } =
				rest
			return <div {...(safe as React.HTMLAttributes<HTMLDivElement>)}>{children}</div>
		},
		p: ({
			children,
			...rest
		}: {
			children?: React.ReactNode
			[key: string]: unknown
		}) => {
			const { initial, animate, exit, transition, ...safe } = rest
			return <p {...(safe as React.HTMLAttributes<HTMLParagraphElement>)}>{children}</p>
		},
		h1: ({
			children,
			...rest
		}: {
			children?: React.ReactNode
			[key: string]: unknown
		}) => {
			const { initial, animate, exit, transition, ...safe } = rest
			return <h1 {...(safe as React.HTMLAttributes<HTMLHeadingElement>)}>{children}</h1>
		},
		button: ({
			children,
			...rest
		}: {
			children?: React.ReactNode
			[key: string]: unknown
		}) => {
			const { initial, animate, exit, transition, ...safe } = rest
			return <button {...(safe as React.ButtonHTMLAttributes<HTMLButtonElement>)}>{children}</button>
		},
		section: ({
			children,
			...rest
		}: {
			children?: React.ReactNode
			[key: string]: unknown
		}) => {
			const { initial, animate, exit, transition, ...safe } = rest
			return <section {...(safe as React.HTMLAttributes<HTMLElement>)}>{children}</section>
		},
	},
	AnimatePresence: ({ children }: { children?: React.ReactNode }) => (
		<>{children}</>
	),
}))

jest.mock('../../../../common/components/Footer/hooks/useFooter', () => ({
	useFooter: () => ({ setShow: jest.fn() }),
}))

jest.mock('../../../../common/components/Toolbar/hooks/useToolbar', () => ({
	useToolbar: () => ({
		setTransparent: jest.fn(),
		setHideMiddleNavigation: jest.fn(),
		setShowTitle: jest.fn(),
	}),
}))

jest.mock('../../../../common/ui', () => ({
	useTheme: () => ({
		breakpoints: { down: () => '(max-width: 700px)' },
	}),
}))

jest.mock('../../../../common/ui/mui', () => ({
	useMediaQuery: () => false,
}))

jest.mock('../../../../hooks/urlstate/useUrlState', () => ({
	useUrlState: (key: string, defaultValue?: unknown) => {
		const val =
			key === 'smartSearch' ? (defaultValue ?? false) : (defaultValue ?? null)
		return [val, jest.fn()]
	},
}))

jest.mock('../../../../hooks/changedelay/useChangeDelayer', () => ({
	useChangeDelayer: jest.fn(),
}))

jest.mock('../../components/SearchedSongsList', () => ({
	__esModule: true,
	default: () => <div data-testid="searched-songs-list" />,
}))

jest.mock('../../components/FloatingAddButton', () => ({
	__esModule: true,
	default: () => <div data-testid="floating-add-button" />,
}))

jest.mock('../../../(layout)/vytvorit/components/ParseAdminOption', () => ({
	__esModule: true,
	default: () => <div data-testid="parse-admin-option" />,
}))

jest.mock(
	'../../components/RecommendedSongsList/hooks/useRecommendedSongs',
	() => ({
		__esModule: true,
		default: () => ({
			data: [],
			isLoading: false,
			isError: false,
			isSuccess: true,
		}),
	})
)

jest.mock(
	'../../components/LastAddedSongsList/hooks/useLastAddedSongs',
	() => ({
		__esModule: true,
		default: () => ({
			data: [],
			isLoading: false,
			isError: false,
			isSuccess: true,
		}),
	})
)

jest.mock('../../../../common/providers/FeatureFlags/useFlag', () => ({
	useFlag: () => false,
}))

jest.mock('../../../../common/providers/News', () => ({
	NewsHighlightWrapper: ({ children }: { children: React.ReactNode }) => (
		<>{children}</>
	),
}))

jest.mock('../../components/analytics/analytics.tech', () => ({
	Analytics: { track: jest.fn() },
}))

jest.mock('../../../../common/ui/Link/Link', () => ({
	Link: ({
		children,
		to,
	}: {
		children: React.ReactNode
		to: string
		params?: unknown
	}) => <a href={`/${to}`}>{children}</a>,
}))

jest.mock('../../../../tech/song/variant/variant.utils', () => ({
	parseVariantAlias: (alias: string) => ({ hex: 'abc', alias }),
}))

jest.mock('../../../../tech/date/date.tech', () => ({
	getSmartDateAgoString: () => 'dnes',
}))

import HomeDesktopNew from '../HomeDesktopNew'

describe('HomeDesktopNew', () => {
	it('renders hero section with title and subtitle', () => {
		render(<HomeDesktopNew />)
		expect(screen.getByText('home.hero.lead')).toBeInTheDocument()
		expect(screen.getByText('home.hero.title')).toBeInTheDocument()
		expect(screen.getByText('home.hero.subtitle')).toBeInTheDocument()
	})

	it('renders search input', () => {
		render(<HomeDesktopNew />)
		const searchInput = screen.getByTestId('home-search-input')
		expect(searchInput).toBeInTheDocument()
	})

	it('renders quick search tags', () => {
		render(<HomeDesktopNew />)
		expect(screen.getByText('home.quickTags.worship')).toBeInTheDocument()
		expect(screen.getByText('home.quickTags.praise')).toBeInTheDocument()
	})

	it('renders song ideas section', () => {
		render(<HomeDesktopNew />)
		expect(screen.getByText('home.songIdeas.title')).toBeInTheDocument()
	})

	it('renders recently added section', () => {
		render(<HomeDesktopNew />)
		expect(
			screen.getByText('home.recentlyAdded.title')
		).toBeInTheDocument()
	})

	it('renders browse banner', () => {
		render(<HomeDesktopNew />)
		expect(screen.getByText('home.browseBanner.title')).toBeInTheDocument()
		expect(
			screen.getByText('home.browseBanner.button')
		).toBeInTheDocument()
	})

	it('renders floating add button on desktop', () => {
		render(<HomeDesktopNew />)
		expect(screen.getByTestId('floating-add-button')).toBeInTheDocument()
	})

	it('does not render search results when no search string', () => {
		render(<HomeDesktopNew />)
		expect(
			screen.queryByTestId('searched-songs-list')
		).not.toBeInTheDocument()
	})
})
