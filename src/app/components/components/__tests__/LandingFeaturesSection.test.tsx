import { render, screen } from '@testing-library/react'
import LandingFeaturesSection from '../LandingFeaturesSection/LandingFeaturesSection'

// Mock dependencies
jest.mock('next-intl', () => ({
	useTranslations: (namespace: string) => (key: string) => {
		const translations: Record<string, Record<string, string>> = {
			home: {
				'features.title': 'Co nabízíme',
			},
			about: {
				'tools.smartSearch.title': 'Chytré vyhledávání',
				'tools.smartSearch.description': 'Najděte své písně',
				'tools.smartSearch.tryIt': 'Vyzkoušet',
				'tools.teams.title': 'Týmy',
				'tools.teams.description': 'Sestavte si tým',
				'tools.teams.learnMore': 'Dozvědět se víc',
				'tools.playlists.title': 'Tvorba playlistů',
				'tools.playlists.description': 'Vytvořte si playlist',
				'tools.playlists.tryIt': 'Vyzkoušet',
			},
		}
		return translations[namespace]?.[key] || key
	},
}))

jest.mock('../../../../common/components/ContainerGrid', () => ({
	__esModule: true,
	default: ({ children }: any) => <div data-testid="container-grid">{children}</div>,
}))

jest.mock('../../../../common/ui', () => ({
	Box: ({ children, ...props }: any) => <div {...props}>{children}</div>,
	Typography: ({ children, ...props }: any) => (
		<span {...props}>{children}</span>
	),
	useTheme: () => ({
		palette: {
			primary: { main: '#0085ff', dark: '#0066cc' },
			grey: { 700: '#616161' },
		},
		breakpoints: { down: () => '(max-width:700px)' },
	}),
}))

jest.mock('../../../../common/ui/Button', () => ({
	Button: ({ children, ...props }: any) => (
		<button data-testid={`feature-button-${props.to}`} {...props}>
			{children}
		</button>
	),
}))

jest.mock('../../../../common/ui/mui', () => ({
	useMediaQuery: () => false,
}))

jest.mock('framer-motion', () => ({
	motion: {
		div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
	},
}))

jest.mock('@mui/icons-material', () => ({
	SmartButton: () => <span data-testid="icon-smart-search">SmartButton</span>,
	Groups2: () => <span data-testid="icon-teams">Groups2</span>,
	LibraryMusic: () => <span data-testid="icon-playlists">LibraryMusic</span>,
}))

describe('LandingFeaturesSection', () => {
	it('renders the section title', () => {
		render(<LandingFeaturesSection />)
		expect(screen.getByText('Co nabízíme')).toBeInTheDocument()
	})

	it('renders all three feature cards', () => {
		render(<LandingFeaturesSection />)
		expect(screen.getByText('Chytré vyhledávání')).toBeInTheDocument()
		expect(screen.getByText('Týmy')).toBeInTheDocument()
		expect(screen.getByText('Tvorba playlistů')).toBeInTheDocument()
	})

	it('renders feature descriptions', () => {
		render(<LandingFeaturesSection />)
		expect(screen.getByText('Najděte své písně')).toBeInTheDocument()
		expect(screen.getByText('Sestavte si tým')).toBeInTheDocument()
		expect(screen.getByText('Vytvořte si playlist')).toBeInTheDocument()
	})

	it('renders action buttons for each feature', () => {
		render(<LandingFeaturesSection />)
		expect(screen.getByTestId('feature-button-home')).toBeInTheDocument()
		expect(screen.getByTestId('feature-button-teams')).toBeInTheDocument()
		expect(screen.getByTestId('feature-button-usersPlaylists')).toBeInTheDocument()
	})

	it('renders inside a ContainerGrid', () => {
		render(<LandingFeaturesSection />)
		expect(screen.getByTestId('container-grid')).toBeInTheDocument()
	})
})
