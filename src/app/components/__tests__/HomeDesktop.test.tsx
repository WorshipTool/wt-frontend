import { render, screen } from '@testing-library/react'

jest.mock('next-intl', () => ({
	useTranslations: () => (key: string) => {
		const translations: Record<string, string> = {
			'hero.lead': 'Jsi-li ovce, tak...',
			'hero.title': 'Chval Otce',
			'hero.subtitle': 'Na worship.cz',
			'hero.subtitleLower': 'na worship.cz',
			backgroundShape: 'Tvar na pozadí',
			'recommended.idea': 'Nějaký nápad:',
			'floatingAdd.label': 'Vytvořit',
		}
		return translations[key] || key
	},
}))

jest.mock('framer-motion', () => ({
	motion: {
		div: ({ children, style, ...props }: any) => (
			<div style={style} data-testid="motion-div" {...props}>
				{children}
			</div>
		),
	},
	AnimatePresence: ({ children }: any) => <>{children}</>,
}))

jest.mock('../../../common/ui', () => ({
	Box: ({ children, sx, ...props }: any) => (
		<div {...props}>{children}</div>
	),
	Typography: ({ children, sx, ...props }: any) => (
		<span {...props}>{children}</span>
	),
	useTheme: () => ({
		palette: {
			primary: { main: '#0085ff', dark: '#532ee7' },
			grey: {
				400: '#c4c1bb',
				500: '#9e9b95',
				600: '#75726c',
				700: '#5c5a55',
				900: '#1f1e1b',
			},
		},
		spacing: (n: number) => `${n * 8}px`,
		breakpoints: { down: () => '(max-width: 700px)' },
	}),
}))

jest.mock('../../../common/ui/mui', () => ({
	useMediaQuery: () => false,
}))

jest.mock('../../../common/components/ContainerGrid', () => {
	const ContainerGrid = ({ children }: any) => <div>{children}</div>
	ContainerGrid.displayName = 'ContainerGrid'
	return {
		__esModule: true,
		default: ContainerGrid,
		containerMaxWidth: 1320,
	}
})

jest.mock('../components/MainSearchInput', () => {
	return function MockMainSearchInput() {
		return <div data-testid="main-search-input-component" />
	}
})

jest.mock('../components/RecommendedSongsList/RecommendedSongsList', () => {
	return function MockRecommendedSongsList() {
		return <div data-testid="recommended-songs" />
	}
})

jest.mock('../components/RightSheepPanel/RightSheepPanel', () => {
	return function MockRightSheepPanel() {
		return <div data-testid="right-sheep-panel" />
	}
})

jest.mock('../components/FloatingAddButton', () => {
	return function MockFloatingAddButton() {
		return <div data-testid="floating-add-button" />
	}
})

jest.mock('../components/LandingFeaturesSection/LandingFeaturesSection', () => {
	return function MockLandingFeaturesSection() {
		return <div data-testid="landing-features-section" />
	}
})

jest.mock('../components/LandingAboutTeaser/LandingAboutTeaser', () => {
	return function MockLandingAboutTeaser() {
		return <div data-testid="landing-about-teaser" />
	}
})

jest.mock('../components/SearchedSongsList', () => {
	return function MockSearchedSongsList() {
		return <div data-testid="searched-songs" />
	}
})

jest.mock('../components/GlitchText', () => {
	return function MockGlitchText({ children }: any) {
		return <span data-testid="glitch-text">{children}</span>
	}
})

jest.mock('../../(layout)/vytvorit/components/ParseAdminOption', () => {
	return function MockParseAdminOption() {
		return <div data-testid="parse-admin-option" />
	}
})

jest.mock('../../../common/components/Footer/hooks/useFooter', () => ({
	useFooter: () => ({ setShow: jest.fn() }),
}))

jest.mock('../../../common/components/Toolbar/hooks/useToolbar', () => ({
	useToolbar: () => ({
		setTransparent: jest.fn(),
		setHideMiddleNavigation: jest.fn(),
		setShowTitle: jest.fn(),
	}),
}))

jest.mock('../../../common/providers/OnScrollComponent/useScrollHandler', () => ({
	useScrollHandler: () => ({ isTop: true }),
}))

jest.mock('../../../hooks/changedelay/useChangeDelayer', () => ({
	useChangeDelayer: jest.fn(),
}))

jest.mock('../../../hooks/urlstate/useUrlState', () => ({
	useUrlState: jest.fn(() => [null, jest.fn()]),
}))

jest.mock('../../../hooks/worshipcz/useWorshipCzVersion', () => ({
	__esModule: true,
	default: () => true,
}))

import HomeDesktop from '../HomeDesktop'

describe('HomeDesktop', () => {
	it('renders without crashing', () => {
		render(<HomeDesktop />)
	})

	it('renders the hero title text', () => {
		render(<HomeDesktop />)
		expect(screen.getByText('Chval Otce')).toBeInTheDocument()
	})

	it('renders the hero lead text', () => {
		render(<HomeDesktop />)
		expect(screen.getByText('Jsi-li ovce, tak...')).toBeInTheDocument()
	})

	it('renders the search input component', () => {
		render(<HomeDesktop />)
		expect(screen.getByTestId('main-search-input-component')).toBeInTheDocument()
	})

	it('renders recommended songs section', () => {
		render(<HomeDesktop />)
		expect(screen.getByTestId('recommended-songs')).toBeInTheDocument()
	})

	it('renders the floating add button on desktop', () => {
		render(<HomeDesktop />)
		expect(screen.getByTestId('floating-add-button')).toBeInTheDocument()
	})

	it('renders the right sheep panel on desktop', () => {
		render(<HomeDesktop />)
		expect(screen.getByTestId('right-sheep-panel')).toBeInTheDocument()
	})
})
