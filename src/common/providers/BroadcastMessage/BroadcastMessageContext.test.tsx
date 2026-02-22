import { renderHook, act, waitFor } from '@testing-library/react'
import {
	BroadcastMessageProvider,
	useBroadcastMessage,
} from './BroadcastMessageContext'
import React from 'react'

// Mock next-intl (not used in context but required by popup)
jest.mock('next-intl', () => ({
	useTranslations: () => (key: string) => key,
}))

// Mock useAuth hook
const mockIsLoggedIn = jest.fn()
jest.mock('../../../hooks/auth/useAuth', () => ({
	__esModule: true,
	default: () => ({
		isLoggedIn: mockIsLoggedIn,
		apiConfiguration: {},
	}),
}))

// Mock useDownSize hook
const mockUseDownSize = jest.fn()
jest.mock('../../hooks/useDownSize', () => ({
	useDownSize: () => mockUseDownSize(),
}))

// Mock getActiveBroadcastMessages
jest.mock('./broadcast-message.config', () => ({
	getActiveBroadcastMessages: jest.fn(),
}))
import { getActiveBroadcastMessages } from './broadcast-message.config'
const mockGetActiveBroadcastMessages =
	getActiveBroadcastMessages as jest.MockedFunction<
		typeof getActiveBroadcastMessages
	>

const ACTIVE_MESSAGE = {
	id: 'test-msg-1',
	title: 'Test Title',
	description: 'Test body',
	createdAt: '2026-01-01T00:00:00Z',
	active: true,
}

describe('BroadcastMessageContext', () => {
	const wrapper = ({ children }: { children: React.ReactNode }) => (
		<BroadcastMessageProvider>{children}</BroadcastMessageProvider>
	)

	beforeEach(() => {
		jest.clearAllMocks()
		mockIsLoggedIn.mockReturnValue(true)
		mockUseDownSize.mockReturnValue(false)
		localStorage.clear()
		mockGetActiveBroadcastMessages.mockReturnValue([ACTIVE_MESSAGE])
	})

	describe('Error & edge cases – popup should not open', () => {
		it('should not show message when user is not logged in', async () => {
			mockIsLoggedIn.mockReturnValue(false)

			const { result } = renderHook(() => useBroadcastMessage(), { wrapper })

			await act(async () => {
				await new Promise((resolve) => setTimeout(resolve, 100))
			})

			expect(result.current.isPopupOpen).toBe(false)
			expect(result.current.messageToShow).toBeNull()
		})

		it('should not show message on small devices', async () => {
			mockUseDownSize.mockReturnValue(true)

			const { result } = renderHook(() => useBroadcastMessage(), { wrapper })

			await act(async () => {
				await new Promise((resolve) => setTimeout(resolve, 100))
			})

			expect(result.current.isPopupOpen).toBe(false)
			expect(result.current.messageToShow).toBeNull()
		})

		it('should not show message when there are no active messages', async () => {
			mockGetActiveBroadcastMessages.mockReturnValue([])

			const { result } = renderHook(() => useBroadcastMessage(), { wrapper })

			await act(async () => {
				await new Promise((resolve) => setTimeout(resolve, 100))
			})

			expect(result.current.isPopupOpen).toBe(false)
			expect(result.current.messageToShow).toBeNull()
		})

		it('should not show already dismissed message (from localStorage)', async () => {
			localStorage.setItem(
				'broadcast-messages-seen',
				JSON.stringify([ACTIVE_MESSAGE.id]),
			)

			const { result } = renderHook(() => useBroadcastMessage(), { wrapper })

			await act(async () => {
				await new Promise((resolve) => setTimeout(resolve, 100))
			})

			expect(result.current.messageToShow).toBeNull()
			expect(result.current.isPopupOpen).toBe(false)
		})
	})

	describe('Success cases', () => {
		it('should show popup for unseen message after delay', async () => {
			const { result } = renderHook(() => useBroadcastMessage(), { wrapper })

			await waitFor(
				() => {
					expect(result.current.isPopupOpen).toBe(true)
				},
				{ timeout: 2000 },
			)

			expect(result.current.messageToShow?.id).toBe(ACTIVE_MESSAGE.id)
		})

		it('should dismiss message and persist to localStorage', async () => {
			const { result } = renderHook(() => useBroadcastMessage(), { wrapper })

			await waitFor(() => {
				expect(result.current.isPopupOpen).toBe(true)
			}, { timeout: 2000 })

			act(() => {
				result.current.dismissMessage()
			})

			expect(result.current.isPopupOpen).toBe(false)
			expect(result.current.messageToShow).toBeNull()

			// Verify localStorage was updated
			const stored = JSON.parse(
				localStorage.getItem('broadcast-messages-seen') ?? '[]',
			)
			expect(stored).toContain(ACTIVE_MESSAGE.id)
		})

		it('should close popup without persisting on closePopup', async () => {
			const { result } = renderHook(() => useBroadcastMessage(), { wrapper })

			await waitFor(() => {
				expect(result.current.isPopupOpen).toBe(true)
			}, { timeout: 2000 })

			act(() => {
				result.current.closePopup()
			})

			expect(result.current.isPopupOpen).toBe(false)
			// messageToShow is still set – not dismissed, just closed
			expect(result.current.messageToShow).not.toBeNull()
			// localStorage should NOT be updated
			expect(localStorage.getItem('broadcast-messages-seen')).toBeNull()
		})
	})
})
