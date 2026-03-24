import { fireEvent, render, screen } from '@testing-library/react'
import MainSearchInput from '../MainSearchInput'

// Mock dependencies
jest.mock('next-intl', () => ({
	useTranslations: () => (key: string) => {
		const translations: Record<string, string> = {
			searchByTitleOrText: 'Hledat podle názvu nebo textu',
		}
		return translations[key] || key
	},
}))

jest.mock('../../../../common/ui', () => ({
	Box: ({ children, sx, ...props }: any) => (
		<div style={sx} {...props}>
			{children}
		</div>
	),
	IconButton: ({ children, onClick, ...props }: any) => (
		<button onClick={onClick} data-testid="icon-button" {...props}>
			{children}
		</button>
	),
	useTheme: () => ({
		palette: {
			primary: { main: '#0085ff', dark: '#532ee7' },
			grey: { 400: '#c4c1bb' },
		},
	}),
}))

jest.mock('../../../../common/ui/mui', () => ({
	InputBase: ({ onChange, value, placeholder, inputProps, ...rest }: any) => (
		<input
			onChange={onChange}
			value={value}
			placeholder={placeholder}
			{...inputProps}
		/>
	),
}))

jest.mock('@mui/system', () => ({
	styled: (Component: any) => (styles: any) => {
		const StyledComponent = (props: any) => <Component {...props} />
		StyledComponent.displayName = `Styled(${
			Component.displayName || Component.name || 'Component'
		})`
		return StyledComponent
	},
}))

jest.mock('@mui/icons-material/Search', () => {
	return function MockSearchIcon() {
		return <span data-testid="search-icon" />
	}
})

jest.mock('@mui/icons-material', () => ({
	AutoAwesome: function MockAutoAwesome() {
		return <span data-testid="auto-awesome-icon" />
	},
}))

jest.mock('../../../../common/providers/FeatureFlags/useFlag', () => ({
	useFlag: () => false,
}))

jest.mock('../../../../common/providers/News', () => ({
	NewsHighlightWrapper: ({ children }: any) => <>{children}</>,
}))

jest.mock('../../../../hooks/changedelay/useChangeDelayer', () => ({
	useChangeDelayer: () => {},
}))

jest.mock('../analytics/analytics.tech', () => ({
	Analytics: { track: jest.fn() },
}))

describe('MainSearchInput', () => {
	const defaultProps = {
		gradientBorder: true,
		value: '',
		onChange: jest.fn(),
		smartSearch: false,
		onSmartSearchChange: jest.fn(),
	}

	it('renders the search container', () => {
		render(<MainSearchInput {...defaultProps} />)
		const container = screen.getByTestId('main-search-container')
		expect(container).toBeInTheDocument()
	})

	it('renders the search input with placeholder', () => {
		render(<MainSearchInput {...defaultProps} />)
		const input = screen.getByTestId('main-search-input')
		expect(input).toBeInTheDocument()
	})

	it('renders the search icon', () => {
		render(<MainSearchInput {...defaultProps} />)
		expect(screen.getByTestId('search-icon')).toBeInTheDocument()
	})

	it('calls onChange when input value changes', () => {
		const onChange = jest.fn()
		render(<MainSearchInput {...defaultProps} onChange={onChange} />)
		const input = screen.getByTestId('main-search-input')
		fireEvent.change(input, { target: { value: 'test' } })
		expect(onChange).toHaveBeenCalledWith('test')
	})

	it('applies gradient border styling when gradientBorder is true', () => {
		render(<MainSearchInput {...defaultProps} gradientBorder={true} />)
		const container = screen.getByTestId('main-search-container')
		// jsdom doesn't fully parse complex gradient values, so check padding is applied (gradient border indicator)
		expect(container.style.padding).toBe('2.5px')
	})

	it('does not apply gradient border when gradientBorder is false', () => {
		render(<MainSearchInput {...defaultProps} gradientBorder={false} />)
		const container = screen.getByTestId('main-search-container')
		expect(container.style.background).toBe('transparent')
	})

	it('applies vibrant box-shadow with gradient border', () => {
		render(<MainSearchInput {...defaultProps} gradientBorder={true} />)
		const container = screen.getByTestId('main-search-container')
		expect(container.style.boxShadow).toContain('rgba(0, 133, 255')
	})

	it('displays the provided value', () => {
		render(<MainSearchInput {...defaultProps} value="hello" />)
		const input = screen.getByTestId('main-search-input') as HTMLInputElement
		expect(input.value).toBe('hello')
	})
})
