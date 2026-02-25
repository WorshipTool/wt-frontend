import '@testing-library/jest-dom'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import PreviewModeDialog from './PreviewModeDialog'

jest.mock('next-intl', () => ({
	useTranslations: () => (key: string) => key,
}))

jest.mock('../Popup/Popup', () => ({
	__esModule: true,
	default: ({ children, open }: { children: React.ReactNode; open: boolean }) =>
		open ? <div data-testid="popup">{children}</div> : null,
}))

jest.mock('../../ui', () => ({
	Box: ({ children, onClick, sx, onKeyDown }: { children: React.ReactNode; onClick?: () => void; sx?: unknown; onKeyDown?: React.KeyboardEventHandler }) => (
		<div onClick={onClick} onKeyDown={onKeyDown}>{children}</div>
	),
	Button: ({ children, disabled }: { children: React.ReactNode; disabled?: boolean }) => (
		<button disabled={disabled}>{children}</button>
	),
	TextField: ({ value, onChange, placeholder }: { value?: string; onChange?: (v: string) => void; placeholder?: string }) => (
		<textarea
			data-testid="update-textarea"
			value={value}
			placeholder={placeholder}
			onChange={e => onChange?.(e.target.value)}
		/>
	),
	IconButton: ({ children, onClick, 'aria-label': ariaLabel, disabled }: { children: React.ReactNode; onClick?: () => void; 'aria-label'?: string; disabled?: boolean }) => (
		<button onClick={onClick} aria-label={ariaLabel} disabled={disabled}>{children}</button>
	),
}))

jest.mock('../../ui/Typography', () => ({
	Typography: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
}))

jest.mock('../../ui/Gap', () => ({ Gap: () => null }))

jest.mock('../../ui/mui', () => ({
	alpha: () => 'rgba(0,0,0,0.1)',
	Tab: ({ label, onClick }: { label: React.ReactNode; onClick?: () => void }) => (
		<button role="tab" onClick={onClick}>{label}</button>
	),
	Tabs: ({ children, onChange }: { children: React.ReactNode; onChange?: (e: unknown, v: number) => void }) => (
		<div role="tablist">
			{React.Children.map(children as React.ReactElement[], (child, i) =>
				React.cloneElement(child, { onClick: () => onChange?.(null, i) })
			)}
		</div>
	),
}))

jest.mock('@mui/icons-material', () => ({
	Close: () => null,
	Refresh: () => <span>refresh-icon</span>,
	Visibility: () => null,
}))

describe('PreviewModeDialog', () => {
	const defaultProps = { open: true, onClose: jest.fn() }

	beforeEach(() => {
		jest.clearAllMocks()
	})

	it('renders both tabs', () => {
		render(<PreviewModeDialog {...defaultProps} />)
		const tabs = screen.getAllByRole('tab')
		expect(tabs).toHaveLength(2)
		expect(tabs[0]).toHaveTextContent('updateTab')
		expect(tabs[1]).toHaveTextContent('historyTab')
	})

	it('shows update tab content by default', () => {
		render(<PreviewModeDialog {...defaultProps} />)
		expect(screen.getByTestId('update-textarea')).toBeInTheDocument()
	})

	it('textarea is enabled (not disabled)', () => {
		render(<PreviewModeDialog {...defaultProps} />)
		const textarea = screen.getByTestId('update-textarea')
		expect(textarea).not.toBeDisabled()
	})

	it('submit button is disabled', () => {
		render(<PreviewModeDialog {...defaultProps} />)
		const button = screen.getByRole('button', { name: 'submitButton' })
		expect(button).toBeDisabled()
	})

	it('shows coming soon note below submit button', () => {
		render(<PreviewModeDialog {...defaultProps} />)
		expect(screen.getByText('submitComingSoon')).toBeInTheDocument()
	})

	it('shows empty history state in history tab', () => {
		render(<PreviewModeDialog {...defaultProps} />)
		fireEvent.click(screen.getAllByRole('tab')[1])
		expect(screen.getByText('noHistory')).toBeInTheDocument()
	})

	it('does not show textarea in history tab', () => {
		render(<PreviewModeDialog {...defaultProps} />)
		fireEvent.click(screen.getAllByRole('tab')[1])
		expect(screen.queryByTestId('update-textarea')).not.toBeInTheDocument()
	})

	it('shows disabled refresh button in history tab', () => {
		render(<PreviewModeDialog {...defaultProps} />)
		fireEvent.click(screen.getAllByRole('tab')[1])
		expect(screen.getByRole('button', { name: 'refreshHistory' })).toBeDisabled()
	})

	it('calls onClose when close button is clicked', () => {
		const onClose = jest.fn()
		render(<PreviewModeDialog open={true} onClose={onClose} />)
		// All buttons: tabs (updateTab, historyTab), submit button, close IconButton
		const buttons = screen.getAllByRole('button')
		// Close button has no text content (only the Close icon which is mocked to null)
		const closeButton = buttons.find(b =>
			!['updateTab', 'historyTab', 'submitButton'].includes(b.textContent ?? '')
		)
		expect(closeButton).toBeDefined()
		if (closeButton) fireEvent.click(closeButton)
		expect(onClose).toHaveBeenCalled()
	})

	it('does not render when closed', () => {
		render(<PreviewModeDialog open={false} onClose={jest.fn()} />)
		expect(screen.queryByTestId('popup')).not.toBeInTheDocument()
	})

	it('textarea accepts input', () => {
		render(<PreviewModeDialog {...defaultProps} />)
		const textarea = screen.getByTestId('update-textarea')
		fireEvent.change(textarea, { target: { value: 'Change the header color' } })
		expect((textarea as HTMLTextAreaElement).value).toBe('Change the header color')
	})
})
