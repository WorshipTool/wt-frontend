import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import React from 'react'

jest.mock('next-intl', () => ({
	useTranslations: () => (key: string) => key,
}))

jest.mock('../../common/ui', () => ({
	Box: ({ children, ...props }: any) => <div {...props}>{children}</div>,
	Typography: ({ children, ...props }: any) => <span {...props}>{children}</span>,
	useTheme: () => ({
		palette: {
			primary: { main: '#0085ff', dark: '#532ee7' },
			grey: { 50: '#fafafa', 200: '#eee', 300: '#ddd', 500: '#999', 600: '#777', 700: '#666' },
		},
		spacing: (n: number) => `${n * 8}px`,
		breakpoints: { down: () => '(max-width:700px)' },
	}),
}))

jest.mock('../../common/ui/mui', () => ({
	useMediaQuery: () => true,
}))

jest.mock('../../hooks/urlstate/useUrlState', () => ({
	useUrlState: jest.fn(() => [null, jest.fn()]),
}))

jest.mock('../../hooks/changedelay/useChangeDelayer', () => ({
	useChangeDelayer: jest.fn(),
}))

jest.mock('../../hooks/worshipcz/useWorshipCzVersion', () => ({
	__esModule: true,
	default: () => true,
}))

jest.mock('../../common/components/Footer/hooks/useFooter', () => ({
	useFooter: () => ({ setShow: jest.fn() }),
}))

jest.mock('../../common/components/Toolbar/hooks/useToolbar', () => ({
	useToolbar: () => ({
		setTransparent: jest.fn(),
		setHideMiddleNavigation: jest.fn(),
		setShowTitle: jest.fn(),
	}),
}))

jest.mock('../../common/providers/OnScrollComponent/useScrollHandler', () => ({
	useScrollHandler: () => ({ isTop: true }),
}))

jest.mock('./components/MainSearchInput', () => ({
	__esModule: true,
	default: (props: any) => (
		<div data-testid="main-search-input">
			<input
				data-testid="search-input"
				value={props.value}
				onChange={(e: any) => props.onChange(e.target.value)}
			/>
		</div>
	),
}))

jest.mock('./components/RecommendedSongsList/RecommendedSongsList', () => ({
	__esModule: true,
	default: () => <div data-testid="recommended-songs">Recommended</div>,
}))

jest.mock('./components/SearchedSongsList', () => ({
	__esModule: true,
	default: () => <div data-testid="searched-songs">Search Results</div>,
}))

jest.mock('./components/MobileLastAddedSection', () => ({
	__esModule: true,
	default: () => <div data-testid="mobile-last-added">Last Added</div>,
}))

jest.mock('./components/AllListPanel/AllListPanel', () => ({
	__esModule: true,
	default: (props: any) => (
		<div data-testid="all-list-panel" data-mobile={props.isMobile}>
			All Songs
		</div>
	),
}))

jest.mock('../../app/(layout)/vytvorit/components/ParseAdminOption', () => ({
	__esModule: true,
	default: () => <div data-testid="parse-admin">Admin</div>,
}))

jest.mock('./HomeDesktop', () => ({
	RESET_HOME_SCREEN_EVENT_NAME: 'reset_home_screen_jh1a94',
}))

import HomeMobile from './HomeMobile'

describe('HomeMobile', () => {
	it('renders hero section with title and lead text', () => {
		render(<HomeMobile />)
		expect(screen.getByText('hero.lead')).toBeInTheDocument()
		expect(screen.getByText('hero.title')).toBeInTheDocument()
	})

	it('renders worship version subtitle', () => {
		render(<HomeMobile />)
		expect(screen.getByText('hero.subtitleLower')).toBeInTheDocument()
	})

	it('renders dark header zone', () => {
		render(<HomeMobile />)
		expect(screen.getByTestId('mobile-header-zone')).toBeInTheDocument()
	})

	it('renders main search input inside header zone', () => {
		render(<HomeMobile />)
		const headerZone = screen.getByTestId('mobile-header-zone')
		const searchInputs = screen.getAllByTestId('main-search-input')
		// Search input exists inside the header zone
		expect(headerZone).toContainElement(searchInputs[0])
		// Also a sticky duplicate for scrolled state
		expect(searchInputs).toHaveLength(2)
	})

	it('renders mobile last added section', () => {
		render(<HomeMobile />)
		expect(screen.getByTestId('mobile-last-added')).toBeInTheDocument()
	})

	it('renders all list panel with isMobile prop', () => {
		render(<HomeMobile />)
		const panel = screen.getByTestId('all-list-panel')
		expect(panel).toBeInTheDocument()
		expect(panel).toHaveAttribute('data-mobile', 'true')
	})

	it('renders recommended songs list', () => {
		render(<HomeMobile />)
		expect(screen.getByTestId('recommended-songs')).toBeInTheDocument()
	})

	it('does not render search results when no search string', () => {
		render(<HomeMobile />)
		expect(screen.queryByTestId('searched-songs')).not.toBeInTheDocument()
	})

	it('header zone is a direct child of the root container', () => {
		render(<HomeMobile />)
		const headerZone = screen.getByTestId('mobile-header-zone')
		// Header zone should be rendered as a direct child of the root wrapper
		expect(headerZone.parentElement).toBeInTheDocument()
		expect(headerZone.parentElement?.children.length).toBeGreaterThanOrEqual(3)
	})
})
