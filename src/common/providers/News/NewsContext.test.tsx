import { renderHook, act, waitFor } from '@testing-library/react'
import { NewsProvider, useNews } from './NewsContext'
import React from 'react'

// Mock useAuth hook
const mockIsLoggedIn = jest.fn()
jest.mock('../../../hooks/auth/useAuth', () => ({
	__esModule: true,
	default: () => ({
		isLoggedIn: mockIsLoggedIn,
		apiConfiguration: {},
	}),
}))

// Mock useApi hook
const mockGetNewsState = jest.fn()
const mockMarkAsSeen = jest.fn()
const mockMarkAsTried = jest.fn()

jest.mock('../../../api/tech-and-hooks/useApi', () => ({
	useApi: () => ({
		getNewsState: mockGetNewsState,
		markAsSeen: mockMarkAsSeen,
		markAsTried: mockMarkAsTried,
	}),
}))

// Mock useFlagChecker hook
const mockCheckFlag = jest.fn()
jest.mock('../FeatureFlags/useFlag', () => ({
	useFlagChecker: () => mockCheckFlag,
}))

// Mock getActiveNews
jest.mock('./news.config', () => ({
	getActiveNews: () => [
		{
			id: 'test-news-1',
			title: 'Test News',
			description: 'Test description',
			targetComponent: 'smart-search-toggle',
		},
	],
}))

describe('NewsContext', () => {
	const wrapper = ({ children }: { children: React.ReactNode }) => (
		<NewsProvider>{children}</NewsProvider>
	)

	beforeEach(() => {
		jest.clearAllMocks()
		mockIsLoggedIn.mockReturnValue(true)
		mockCheckFlag.mockReturnValue(true)
	})

	describe('Error handling - popup should not open on errors', () => {
		it('should not show news popup when API returns HTTP 500 error', async () => {
			mockGetNewsState.mockRejectedValue(new Error('Internal Server Error'))

			const { result } = renderHook(() => useNews(), { wrapper })

			// Wait for the effect to run
			await act(async () => {
				await new Promise((resolve) => setTimeout(resolve, 100))
			})

			expect(result.current.isPopupOpen).toBe(false)
			expect(result.current.newsToShow).toBeNull()
		})

		it('should not show news popup when API returns HTTP 401 Unauthorized', async () => {
			mockGetNewsState.mockRejectedValue(new Error('Unauthorized'))

			const { result } = renderHook(() => useNews(), { wrapper })

			await act(async () => {
				await new Promise((resolve) => setTimeout(resolve, 100))
			})

			expect(result.current.isPopupOpen).toBe(false)
			expect(result.current.newsToShow).toBeNull()
		})

		it('should not show news popup when API returns HTTP 403 Forbidden', async () => {
			mockGetNewsState.mockRejectedValue(new Error('Forbidden'))

			const { result } = renderHook(() => useNews(), { wrapper })

			await act(async () => {
				await new Promise((resolve) => setTimeout(resolve, 100))
			})

			expect(result.current.isPopupOpen).toBe(false)
			expect(result.current.newsToShow).toBeNull()
		})

		it('should not show news popup when network error occurs (fetch fails)', async () => {
			mockGetNewsState.mockRejectedValue(new Error('Network Error'))

			const { result } = renderHook(() => useNews(), { wrapper })

			await act(async () => {
				await new Promise((resolve) => setTimeout(resolve, 100))
			})

			expect(result.current.isPopupOpen).toBe(false)
			expect(result.current.newsToShow).toBeNull()
		})

		it('should not show news popup when user is not logged in', async () => {
			mockIsLoggedIn.mockReturnValue(false)

			const { result } = renderHook(() => useNews(), { wrapper })

			await act(async () => {
				await new Promise((resolve) => setTimeout(resolve, 100))
			})

			expect(result.current.isPopupOpen).toBe(false)
			expect(result.current.newsToShow).toBeNull()
			// API should not even be called
			expect(mockGetNewsState).not.toHaveBeenCalled()
		})

		it('should not show news popup when API returns canShowNews: false', async () => {
			mockGetNewsState.mockResolvedValue({
				state: [],
				canShowNews: false,
			})

			const { result } = renderHook(() => useNews(), { wrapper })

			await act(async () => {
				await new Promise((resolve) => setTimeout(resolve, 100))
			})

			expect(result.current.isPopupOpen).toBe(false)
			expect(result.current.newsToShow).toBeNull()
		})

		it('should not show news popup when API times out', async () => {
			mockGetNewsState.mockRejectedValue(new Error('Request timeout'))

			const { result } = renderHook(() => useNews(), { wrapper })

			await act(async () => {
				await new Promise((resolve) => setTimeout(resolve, 100))
			})

			expect(result.current.isPopupOpen).toBe(false)
			expect(result.current.newsToShow).toBeNull()
		})
	})

	describe('Success cases', () => {
		it('should show news popup when API returns valid unseen news', async () => {
			mockGetNewsState.mockResolvedValue({
				state: [],
				canShowNews: true,
			})

			const { result } = renderHook(() => useNews(), { wrapper })

			// Wait for newsToShow to be set
			await waitFor(() => {
				expect(result.current.newsToShow).not.toBeNull()
			})

			expect(result.current.newsToShow?.id).toBe('test-news-1')

			// Wait for popup to open (POPUP_AUTO_SHOW_DELAY_MS = 500ms)
			await waitFor(
				() => {
					expect(result.current.isPopupOpen).toBe(true)
				},
				{ timeout: 1000 }
			)
		})

		it('should not show popup for already seen news', async () => {
			mockGetNewsState.mockResolvedValue({
				state: [
					{
						newsId: 'test-news-1',
						seen: true,
						tried: true,
					},
				],
				canShowNews: true,
			})

			const { result } = renderHook(() => useNews(), { wrapper })

			await act(async () => {
				await new Promise((resolve) => setTimeout(resolve, 600))
			})

			expect(result.current.newsToShow).toBeNull()
			expect(result.current.isPopupOpen).toBe(false)
		})
	})
})
