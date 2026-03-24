import { render, screen } from '@testing-library/react'
import LandingAboutTeaser from '../LandingAboutTeaser/LandingAboutTeaser'

// Mock dependencies
jest.mock('next-intl', () => ({
	useTranslations: (namespace: string) => (key: string) => {
		const translations: Record<string, Record<string, string>> = {
			home: {
				'aboutTeaser.title': 'Kdo za tím stojí?',
				'aboutTeaser.learnMore': 'Více o nás',
				'aboutTeaser.contact': 'Kontaktujte nás',
			},
			about: {
				description: 'Jsme uživatelsky přívětivá platforma',
				'graphics.sheepAlt': 'Ovečka',
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
			grey: { 800: '#424242' },
		},
		breakpoints: { down: () => '(max-width:700px)' },
	}),
}))

jest.mock('../../../../common/ui/Button', () => ({
	Button: ({ children, ...props }: any) => (
		<button data-testid={`teaser-button-${props.to}`} {...props}>
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

jest.mock('next/image', () => ({
	__esModule: true,
	// eslint-disable-next-line jsx-a11y/alt-text, @next/next/no-img-element
	default: (props: any) => <img {...props} />,
}))

jest.mock('../../../../tech/paths.tech', () => ({
	getAssetUrl: (path: string) => `/assets/${path}`,
}))

describe('LandingAboutTeaser', () => {
	it('renders the teaser title', () => {
		render(<LandingAboutTeaser />)
		expect(screen.getByText('Kdo za tím stojí?')).toBeInTheDocument()
	})

	it('renders the platform description', () => {
		render(<LandingAboutTeaser />)
		expect(screen.getByText('Jsme uživatelsky přívětivá platforma')).toBeInTheDocument()
	})

	it('renders the learn more button', () => {
		render(<LandingAboutTeaser />)
		expect(screen.getByTestId('teaser-button-about')).toBeInTheDocument()
		expect(screen.getByText('Více o nás')).toBeInTheDocument()
	})

	it('renders the contact button', () => {
		render(<LandingAboutTeaser />)
		expect(screen.getByTestId('teaser-button-contact')).toBeInTheDocument()
		expect(screen.getByText('Kontaktujte nás')).toBeInTheDocument()
	})

	it('renders the sheep illustration on desktop', () => {
		render(<LandingAboutTeaser />)
		const sheepImg = screen.getByAltText('Ovečka')
		expect(sheepImg).toBeInTheDocument()
		expect(sheepImg).toHaveAttribute('src', '/assets/sheeps/ovce3.svg')
	})

	it('renders inside a ContainerGrid', () => {
		render(<LandingAboutTeaser />)
		expect(screen.getByTestId('container-grid')).toBeInTheDocument()
	})
})
