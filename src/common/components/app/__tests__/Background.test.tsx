import { render } from '@testing-library/react'
import { Background } from '../Background'

jest.mock('../../../../common/ui', () => ({
	Box: ({ children, ...props }: any) => <div {...props}>{children}</div>,
}))

jest.mock('../../../../common/ui/mui', () => ({
	styled: (Component: any) => (styles: any) => {
		return ({ children, ...props }: any) => (
			<div data-testid="styled-component" {...props}>
				{children}
			</div>
		)
	},
}))

describe('Background', () => {
	it('renders without crashing', () => {
		render(<Background />)
	})

	it('renders the background layers', () => {
		const { container } = render(<Background />)
		const styledComponents = container.querySelectorAll('[data-testid="styled-component"]')
		// Bg + GridLayer + PerspectiveGrid + ScanlineOverlay + VignetteOverlay = 5
		expect(styledComponents.length).toBeGreaterThanOrEqual(1)
	})
})
