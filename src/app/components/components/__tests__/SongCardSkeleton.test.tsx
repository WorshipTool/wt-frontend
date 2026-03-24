import { render, screen } from '@testing-library/react'
import SongCardSkeleton from '../RecommendedSongsList/SongCardSkeleton'

// Mock MUI components using relative path
jest.mock('../../../../common/ui', () => ({
	Box: ({ children, sx, ...props }: any) => (
		<div data-testid="skeleton-container" style={sx} {...props}>
			{children}
		</div>
	),
}))

jest.mock('../../../../common/ui/mui/Skeleton', () => ({
	Skeleton: ({ width, height, sx, ...props }: any) => (
		<div
			data-testid="skeleton-item"
			style={{ width, height }}
			{...props}
		/>
	),
}))

describe('SongCardSkeleton', () => {
	it('renders the skeleton container', () => {
		render(<SongCardSkeleton />)
		const container = screen.getByTestId('skeleton-container')
		expect(container).toBeInTheDocument()
	})

	it('renders 6 skeleton items (1 title + 5 lines)', () => {
		render(<SongCardSkeleton />)
		const skeletons = screen.getAllByTestId('skeleton-item')
		expect(skeletons).toHaveLength(6)
	})

	it('renders first skeleton wider for title', () => {
		render(<SongCardSkeleton />)
		const skeletons = screen.getAllByTestId('skeleton-item')
		expect(skeletons[0]).toHaveStyle({ width: '60%' })
	})
})
