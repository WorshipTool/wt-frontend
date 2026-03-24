import { render, screen } from '@testing-library/react'
import GlitchText from '../GlitchText'

jest.mock('../../../../common/ui', () => ({
	Box: ({ children, component, sx, ...props }: any) => {
		const Component = component || 'div'
		return (
			<Component {...props} data-testid={props['data-testid'] || undefined}>
				{children}
			</Component>
		)
	},
}))

describe('GlitchText', () => {
	it('renders without crashing', () => {
		render(<GlitchText>Hello</GlitchText>)
	})

	it('renders children text', () => {
		render(<GlitchText>Neon Title</GlitchText>)
		const allTexts = screen.getAllByText('Neon Title')
		expect(allTexts.length).toBeGreaterThanOrEqual(1)
	})

	it('renders with custom data-testid', () => {
		render(<GlitchText data-testid="glitch-hero">Cyber</GlitchText>)
		expect(screen.getByTestId('glitch-hero')).toBeInTheDocument()
	})

	it('renders glitch layers (aria-hidden)', () => {
		const { container } = render(<GlitchText>Test</GlitchText>)
		const hiddenLayers = container.querySelectorAll('[aria-hidden="true"]')
		expect(hiddenLayers.length).toBe(2)
	})

	it('renders the text content in glitch layers', () => {
		render(<GlitchText>Glitch</GlitchText>)
		const allTexts = screen.getAllByText('Glitch')
		// Main text + 2 glitch layers = 3 total
		expect(allTexts.length).toBe(3)
	})
})
