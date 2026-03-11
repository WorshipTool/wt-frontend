import '@testing-library/jest-dom'
import { act, renderHook } from '@testing-library/react'
import React from 'react'
import { EditProposalsProvider, useEditProposals, formatProposalsAsMessage } from './useEditProposals'
import { EditProposal } from './types'

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockEnqueueSnackbar = jest.fn()
jest.mock('notistack', () => ({
	useSnackbar: () => ({ enqueueSnackbar: mockEnqueueSnackbar }),
}))

const mockSendFeedbackMail = jest.fn()
jest.mock('../../../../api/tech-and-hooks/useApi', () => ({
	__esModule: true,
	useApi: () => ({
		mailApi: { sendFeedbackMail: mockSendFeedbackMail },
	}),
}))

jest.mock('../../../../hooks/auth/useAuth', () => ({
	__esModule: true,
	default: () => ({
		info: { firstName: 'Admin', lastName: 'User', email: 'admin@test.com' },
	}),
}))

const mockIsPreviewMode = jest.fn(() => false)
const mockGetPreviewPrNumber = jest.fn(() => null as string | null)
jest.mock('../../../../tech/preview/previewMode', () => ({
	__esModule: true,
	isPreviewMode: () => mockIsPreviewMode(),
	getPreviewPrNumber: () => mockGetPreviewPrNumber(),
}))

// ─── Helpers ─────────────────────────────────────────────────────────────────

const wrapper = ({ children }: { children: React.ReactNode }) => (
	<EditProposalsProvider>{children}</EditProposalsProvider>
)

const makeCapture = (overrides = {}) => ({
	type: 'element' as const,
	elementTag: 'p',
	elementText: 'Test text',
	elementPath: 'main / p',
	pageUrl: 'http://localhost/',
	...overrides,
})

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('useEditProposals', () => {
	beforeEach(() => {
		jest.clearAllMocks()
	})

	it('starts with empty proposals and no pending capture', () => {
		const { result } = renderHook(() => useEditProposals(), { wrapper })

		expect(result.current.proposals).toHaveLength(0)
		expect(result.current.pendingCapture).toBeNull()
		expect(result.current.isCollecting).toBe(false)
		expect(result.current.isSubmitting).toBe(false)
	})

	it('opens a pending capture via openProposalFor', () => {
		const { result } = renderHook(() => useEditProposals(), { wrapper })
		const capture = makeCapture()

		act(() => {
			result.current.openProposalFor(capture)
		})

		expect(result.current.pendingCapture).toEqual(capture)
		expect(result.current.isCollecting).toBe(true)
	})

	it('adds a proposal when confirmProposal is called with text', () => {
		const { result } = renderHook(() => useEditProposals(), { wrapper })
		const capture = makeCapture()

		act(() => {
			result.current.openProposalFor(capture)
		})

		act(() => {
			result.current.confirmProposal('Change color to red')
		})

		expect(result.current.proposals).toHaveLength(1)
		expect(result.current.proposals[0].proposalText).toBe('Change color to red')
		expect(result.current.proposals[0].capture).toEqual(capture)
		expect(result.current.pendingCapture).toBeNull()
	})

	it('clears the pending capture when cancelPendingProposal is called', () => {
		const { result } = renderHook(() => useEditProposals(), { wrapper })

		act(() => {
			result.current.openProposalFor(makeCapture())
		})

		act(() => {
			result.current.cancelPendingProposal()
		})

		expect(result.current.pendingCapture).toBeNull()
		expect(result.current.proposals).toHaveLength(0)
	})

	it('accumulates multiple proposals', () => {
		const { result } = renderHook(() => useEditProposals(), { wrapper })

		act(() => {
			result.current.openProposalFor(makeCapture({ elementText: 'First' }))
		})
		act(() => {
			result.current.confirmProposal('Fix first')
		})

		act(() => {
			result.current.openProposalFor(makeCapture({ elementText: 'Second' }))
		})
		act(() => {
			result.current.confirmProposal('Fix second')
		})

		expect(result.current.proposals).toHaveLength(2)
	})

	it('removes a proposal by id', () => {
		const { result } = renderHook(() => useEditProposals(), { wrapper })

		act(() => {
			result.current.openProposalFor(makeCapture())
		})
		act(() => {
			result.current.confirmProposal('proposal to remove')
		})

		const id = result.current.proposals[0].id

		act(() => {
			result.current.removeProposal(id)
		})

		expect(result.current.proposals).toHaveLength(0)
	})

	it('clears all proposals via clearProposals', () => {
		const { result } = renderHook(() => useEditProposals(), { wrapper })

		act(() => {
			result.current.openProposalFor(makeCapture())
		})
		act(() => { result.current.confirmProposal('first') })

		act(() => {
			result.current.openProposalFor(makeCapture())
		})
		act(() => { result.current.confirmProposal('second') })

		act(() => {
			result.current.clearProposals()
		})

		expect(result.current.proposals).toHaveLength(0)
		expect(result.current.isCollecting).toBe(false)
	})

	it('does not confirm if there is no pending capture', () => {
		const { result } = renderHook(() => useEditProposals(), { wrapper })

		act(() => {
			result.current.confirmProposal('orphan proposal')
		})

		expect(result.current.proposals).toHaveLength(0)
	})

	it('isCollecting is true when pendingCapture is set even with no proposals', () => {
		const { result } = renderHook(() => useEditProposals(), { wrapper })

		act(() => {
			result.current.openProposalFor(makeCapture())
		})

		expect(result.current.isCollecting).toBe(true)
		expect(result.current.proposals).toHaveLength(0)
	})

	it('calls mailApi when IMPLEMENT_IDEA_URL is not set and proposals exist', async () => {
		// Ensure env variable is absent
		delete (process.env as Record<string, string | undefined>).NEXT_PUBLIC_IMPLEMENT_IDEA_URL

		mockSendFeedbackMail.mockResolvedValue(undefined)

		const { result } = renderHook(() => useEditProposals(), { wrapper })

		act(() => {
			result.current.openProposalFor(makeCapture())
		})
		act(() => {
			result.current.confirmProposal('My change')
		})

		await act(async () => {
			await result.current.submitAll()
		})

		expect(mockSendFeedbackMail).toHaveBeenCalledTimes(1)
		expect(mockEnqueueSnackbar).toHaveBeenCalledWith(
			expect.stringContaining('odeslány'),
			expect.objectContaining({ variant: 'success' })
		)
		// Proposals are cleared after successful submission
		expect(result.current.proposals).toHaveLength(0)
	})

	it('shows error snackbar when submission fails', async () => {
		delete (process.env as Record<string, string | undefined>).NEXT_PUBLIC_IMPLEMENT_IDEA_URL
		mockSendFeedbackMail.mockRejectedValue(new Error('Network error'))

		const { result } = renderHook(() => useEditProposals(), { wrapper })

		act(() => {
			result.current.openProposalFor(makeCapture())
		})
		act(() => {
			result.current.confirmProposal('proposal')
		})

		await act(async () => {
			await result.current.submitAll()
		})

		expect(mockEnqueueSnackbar).toHaveBeenCalledWith(
			expect.stringContaining('Nepodařilo'),
			expect.objectContaining({ variant: 'error' })
		)
		// Proposals should still be there after a failure
		expect(result.current.proposals).toHaveLength(1)
	})

	it('sends continueInPRNumber when in preview mode', async () => {
		process.env.NEXT_PUBLIC_IMPLEMENT_IDEA_URL = 'http://test-api/tasks'
		mockIsPreviewMode.mockReturnValue(true)
		mockGetPreviewPrNumber.mockReturnValue('42')

		const mockFetch = jest.fn().mockResolvedValue({ ok: true })
		globalThis.fetch = mockFetch

		const { result } = renderHook(() => useEditProposals(), { wrapper })

		act(() => {
			result.current.openProposalFor(makeCapture())
		})
		act(() => {
			result.current.confirmProposal('Fix the title')
		})

		await act(async () => {
			await result.current.submitAll()
		})

		expect(mockFetch).toHaveBeenCalledTimes(1)
		const fetchBody = JSON.parse(mockFetch.mock.calls[0][1]!.body as string)
		expect(fetchBody.continueInPRNumber).toBe(42)
		expect(fetchBody.message).toContain('Fix the title')

		// Should show preview-specific success message
		expect(mockEnqueueSnackbar).toHaveBeenCalledWith(
			expect.stringContaining('preview'),
			expect.objectContaining({ variant: 'success' })
		)

		delete (globalThis as any).fetch
		delete (process.env as Record<string, string | undefined>).NEXT_PUBLIC_IMPLEMENT_IDEA_URL
		mockIsPreviewMode.mockReturnValue(false)
		mockGetPreviewPrNumber.mockReturnValue(null)
	})

	it('does not send continueInPRNumber when not in preview mode', async () => {
		process.env.NEXT_PUBLIC_IMPLEMENT_IDEA_URL = 'http://test-api/tasks'
		mockIsPreviewMode.mockReturnValue(false)
		mockGetPreviewPrNumber.mockReturnValue(null)

		const mockFetch = jest.fn().mockResolvedValue({ ok: true })
		globalThis.fetch = mockFetch

		const { result } = renderHook(() => useEditProposals(), { wrapper })

		act(() => {
			result.current.openProposalFor(makeCapture())
		})
		act(() => {
			result.current.confirmProposal('Change color')
		})

		await act(async () => {
			await result.current.submitAll()
		})

		expect(mockFetch).toHaveBeenCalledTimes(1)
		const fetchBody = JSON.parse(mockFetch.mock.calls[0][1]!.body as string)
		expect(fetchBody.continueInPRNumber).toBeUndefined()

		delete (globalThis as any).fetch
		delete (process.env as Record<string, string | undefined>).NEXT_PUBLIC_IMPLEMENT_IDEA_URL
	})
})

// ─── formatProposalsAsMessage ──────────────────────────────────────────────────

describe('formatProposalsAsMessage', () => {
	const makeProposal = (overrides: Partial<EditProposal> = {}): EditProposal => ({
		id: 'p-1',
		capture: {
			type: 'element',
			elementTag: 'h1',
			elementText: 'Page title',
			elementPath: 'main / h1',
			pageUrl: 'http://localhost/test',
		},
		proposalText: 'Make it bigger',
		timestamp: new Date('2024-01-15T10:00:00Z').getTime(),
		...overrides,
	})

	it('includes the proposal count header', () => {
		const msg = formatProposalsAsMessage([makeProposal()])
		expect(msg).toContain('Celkem návrhů: 1')
	})

	it('includes the element tag', () => {
		const msg = formatProposalsAsMessage([makeProposal()])
		expect(msg).toContain('<h1>')
	})

	it('includes the proposal text', () => {
		const msg = formatProposalsAsMessage([makeProposal()])
		expect(msg).toContain('Make it bigger')
	})

	it('includes the page URL', () => {
		const msg = formatProposalsAsMessage([makeProposal()])
		expect(msg).toContain('http://localhost/test')
	})

	it('includes selected text for text-selection captures', () => {
		const proposal = makeProposal({
			capture: {
				type: 'text-selection',
				selectedText: 'highlighted phrase',
				elementTag: 'p',
				elementPath: 'main / p',
				pageUrl: 'http://localhost/',
			},
		})
		const msg = formatProposalsAsMessage([proposal])
		expect(msg).toContain('highlighted phrase')
	})

	it('includes all proposals when multiple are given', () => {
		const proposals = [
			makeProposal({ id: 'p-1', proposalText: 'First change' }),
			makeProposal({ id: 'p-2', proposalText: 'Second change' }),
		]
		const msg = formatProposalsAsMessage(proposals)
		expect(msg).toContain('First change')
		expect(msg).toContain('Second change')
		expect(msg).toContain('Celkem návrhů: 2')
	})

	it('includes element identifiers when present', () => {
		const proposal = makeProposal({
			capture: {
				type: 'element',
				elementTag: 'button',
				elementText: 'Submit',
				elementPath: 'form / button',
				pageUrl: 'http://localhost/form',
				identifiers: {
					id: 'submit-btn',
					testId: 'submit-button',
					classNames: ['btn', 'btn-primary'],
					ariaLabel: 'Submit form',
					role: 'button',
					openingTag: '<button id="submit-btn" class="btn btn-primary" data-testid="submit-button">',
				},
			},
		})
		const msg = formatProposalsAsMessage([proposal])
		expect(msg).toContain('IDENTIFIKACE ELEMENTU')
		expect(msg).toContain('id: "submit-btn"')
		expect(msg).toContain('data-testid: "submit-button"')
		expect(msg).toContain('btn, btn-primary')
		expect(msg).toContain('aria-label: "Submit form"')
		expect(msg).toContain('role: "button"')
		expect(msg).toContain('HTML tag:')
	})

	it('includes nearest identifiable ancestor when element has no id', () => {
		const proposal = makeProposal({
			capture: {
				type: 'element',
				elementTag: 'p',
				elementText: 'Hello',
				elementPath: 'section / p',
				pageUrl: 'http://localhost/',
				identifiers: {
					openingTag: '<p>',
					nearestIdentifiableAncestor: '#pricing-section',
				},
			},
		})
		const msg = formatProposalsAsMessage([proposal])
		expect(msg).toContain('Nejbližší identifikovatelný rodič: #pricing-section')
	})

	it('includes data attributes in the message', () => {
		const proposal = makeProposal({
			capture: {
				type: 'element',
				elementTag: 'div',
				elementPath: 'main / div',
				pageUrl: 'http://localhost/',
				identifiers: {
					openingTag: '<div data-section="hero">',
					dataAttributes: { 'data-section': 'hero' },
				},
			},
		})
		const msg = formatProposalsAsMessage([proposal])
		expect(msg).toContain('data-section: "hero"')
	})
})
