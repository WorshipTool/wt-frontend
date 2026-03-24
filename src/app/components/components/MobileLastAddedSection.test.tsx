import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import React from 'react'

const mockData = [
	{
		packAlias: 'test-song-1',
		packGuid: 'guid-1',
		title: 'Test Song 1',
		publishedAt: new Date('2024-01-01'),
		sheetData: '',
		songGuid: 'sg-1',
		verified: true,
		public: true,
		publishApprovalStatus: 0,
		language: 'cs',
		translationType: 0,
		translationLikes: 0,
		ggValidated: false,
		createdAt: new Date(),
		updatedAt: new Date(),
		createdByGuid: 'user-1',
		createdByLoader: false,
	},
	{
		packAlias: 'test-song-2',
		packGuid: 'guid-2',
		title: 'Test Song 2',
		publishedAt: null,
		sheetData: '',
		songGuid: 'sg-2',
		verified: true,
		public: true,
		publishApprovalStatus: 0,
		language: 'cs',
		translationType: 0,
		translationLikes: 0,
		ggValidated: false,
		createdAt: new Date(),
		updatedAt: new Date(),
		createdByGuid: 'user-2',
		createdByLoader: false,
	},
]

jest.mock('next-intl', () => ({
	useTranslations: () => (key: string) => key,
}))

jest.mock('../../../common/ui', () => ({
	Box: ({ children, ...props }: any) => <div {...props}>{children}</div>,
	Typography: ({ children, ...props }: any) => (
		<span {...props}>{children}</span>
	),
	Clickable: ({ children }: any) => <div>{children}</div>,
	useTheme: () => ({
		palette: {
			primary: { main: '#0085ff', dark: '#532ee7' },
			grey: { 100: '#f5f5f5', 200: '#eee', 300: '#ddd', 400: '#bbb', 900: '#212121' },
		},
	}),
}))

jest.mock('../../../common/ui/Link/Link', () => ({
	Link: ({ children }: any) => <div>{children}</div>,
}))

jest.mock('../../../common/ui/mui/Skeleton', () => ({
	Skeleton: () => <div data-testid="skeleton" />,
}))

jest.mock('../../../tech/date/date.tech', () => ({
	getSmartDateAgoString: () => 'recently',
}))

jest.mock('../../../tech/song/variant/variant.utils', () => ({
	parseVariantAlias: (alias: string) => ({ alias }),
}))

jest.mock('../../../types/song', () => ({}))

jest.mock('@mui/icons-material/AccessTimeRounded', () => ({
	__esModule: true,
	default: () => <span data-testid="time-icon">time</span>,
}))

const mockUseLastAddedSongs = jest.fn()
jest.mock('./LastAddedSongsList/hooks/useLastAddedSongs', () => ({
	__esModule: true,
	default: () => mockUseLastAddedSongs(),
}))

const mockUseFlag = jest.fn()
jest.mock('../../../common/providers/FeatureFlags/useFlag', () => ({
	useFlag: () => mockUseFlag(),
}))

import MobileLastAddedSection from './MobileLastAddedSection'

describe('MobileLastAddedSection', () => {
	beforeEach(() => {
		mockUseLastAddedSongs.mockReturnValue({
			data: mockData,
			isLoading: false,
		})
		mockUseFlag.mockReturnValue(true)
	})

	it('renders section with title when feature flag is enabled', () => {
		render(<MobileLastAddedSection />)
		expect(
			screen.getByTestId('mobile-last-added-section')
		).toBeInTheDocument()
		expect(screen.getByText('lastAdded.title')).toBeInTheDocument()
	})

	it('returns null when feature flag is disabled', () => {
		mockUseFlag.mockReturnValue(false)
		const { container } = render(<MobileLastAddedSection />)
		expect(container.firstChild).toBeNull()
	})

	it('renders song cards with titles', () => {
		render(<MobileLastAddedSection />)
		expect(screen.getByText('Test Song 1')).toBeInTheDocument()
		expect(screen.getByText('Test Song 2')).toBeInTheDocument()
	})

	it('renders time info for songs with publishedAt', () => {
		render(<MobileLastAddedSection />)
		const timeIcons = screen.getAllByTestId('time-icon')
		expect(timeIcons.length).toBe(1)
		expect(screen.getByText('recently')).toBeInTheDocument()
	})

	it('shows skeletons while loading', () => {
		mockUseLastAddedSongs.mockReturnValue({
			data: [],
			isLoading: true,
		})
		render(<MobileLastAddedSection />)
		const skeletons = screen.getAllByTestId('skeleton')
		expect(skeletons.length).toBe(4)
	})

	it('renders cards with colored accent bars', () => {
		render(<MobileLastAddedSection />)
		expect(screen.getByText('Test Song 1')).toBeInTheDocument()
		expect(screen.getByText('Test Song 2')).toBeInTheDocument()
	})
})
