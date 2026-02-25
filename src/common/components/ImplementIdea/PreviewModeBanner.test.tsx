import '@testing-library/jest-dom'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'

jest.mock('next-intl', () => ({
	useTranslations: () => (key: string, params?: Record<string, string>) => {
		// Return param values joined for easy partial text matching in tests
		if (params) return Object.values(params).join(' ')
		return key
	},
}))

jest.mock('../../../app/providers/BottomPanelProvider', () => ({
	__esModule: true,
	default: () => ({ height: 0 }),
}))

jest.mock('../../../common/hooks/useDownSize', () => ({
	useDownSize: () => false,
}))

jest.mock('../../ui', () => ({
	Box: ({ children, onClick, onKeyDown, role, tabIndex }: { children: React.ReactNode; onClick?: () => void; onKeyDown?: React.KeyboardEventHandler; role?: string; tabIndex?: number }) => (
		<div data-testid="banner" role={role} tabIndex={tabIndex} onClick={onClick} onKeyDown={onKeyDown}>{children}</div>
	),
}))

jest.mock('@mui/icons-material', () => ({
	Visibility: () => <span data-testid="visibility-icon">👁</span>,
}))

jest.mock('../../ui/mui', () => ({
	alpha: () => 'rgba(0,0,0,0.1)',
}))

// Variables starting with `mock` can be referenced in hoisted jest.mock factories
let mockPrTitle: string | null = null
let mockPrNumber: string | null = null

jest.mock('../../../tech/preview/previewMode', () => ({
	getPreviewPrTitle: () => mockPrTitle,
	getPreviewPrNumber: () => mockPrNumber,
}))

import PreviewModeBanner from './PreviewModeBanner'

describe('PreviewModeBanner', () => {
	beforeEach(() => {
		mockPrTitle = null
		mockPrNumber = null
	})

	it('renders with PR title when available', () => {
		mockPrTitle = 'My Feature'
		mockPrNumber = '42'

		render(<PreviewModeBanner onClick={jest.fn()} />)

		expect(screen.getByTestId('banner')).toHaveTextContent('My Feature')
	})

	it('renders fallback with PR number when title is not available', () => {
		mockPrTitle = null
		mockPrNumber = '99'

		render(<PreviewModeBanner onClick={jest.fn()} />)

		expect(screen.getByTestId('banner')).toHaveTextContent('99')
	})

	it('renders fallback text when neither title nor number is available', () => {
		mockPrTitle = null
		mockPrNumber = null

		render(<PreviewModeBanner onClick={jest.fn()} />)

		expect(screen.getByTestId('banner')).toHaveTextContent('Preview')
	})

	it('calls onClick when banner is clicked', () => {
		mockPrTitle = 'My Feature'
		mockPrNumber = '1'
		const onClick = jest.fn()

		render(<PreviewModeBanner onClick={onClick} />)
		fireEvent.click(screen.getByTestId('banner'))

		expect(onClick).toHaveBeenCalledTimes(1)
	})

	it('renders an icon inside the banner', () => {
		render(<PreviewModeBanner onClick={jest.fn()} />)
		expect(screen.getByTestId('banner').firstChild).not.toBeNull()
	})

	it('has role="button" for accessibility', () => {
		render(<PreviewModeBanner onClick={jest.fn()} />)
		expect(screen.getByRole('button', { hidden: true })).toBeInTheDocument()
	})

	it('calls onClick on Enter key press', () => {
		const onClick = jest.fn()
		render(<PreviewModeBanner onClick={onClick} />)
		fireEvent.keyDown(screen.getByTestId('banner'), { key: 'Enter' })
		expect(onClick).toHaveBeenCalledTimes(1)
	})

	it('calls onClick on Space key press', () => {
		const onClick = jest.fn()
		render(<PreviewModeBanner onClick={onClick} />)
		fireEvent.keyDown(screen.getByTestId('banner'), { key: ' ' })
		expect(onClick).toHaveBeenCalledTimes(1)
	})

	it('does not call onClick on other key press', () => {
		const onClick = jest.fn()
		render(<PreviewModeBanner onClick={onClick} />)
		fireEvent.keyDown(screen.getByTestId('banner'), { key: 'Tab' })
		expect(onClick).not.toHaveBeenCalled()
	})
})
