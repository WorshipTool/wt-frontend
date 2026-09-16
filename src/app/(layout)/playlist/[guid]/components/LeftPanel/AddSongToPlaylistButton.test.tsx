import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import AddSongToPlaylistButton from './AddSongToPlaylistButton'

let mockCanUserEdit = false

jest.mock('next-intl', () => ({
	useTranslations: () => (key: string) => key,
}))

jest.mock('../../hooks/useInnerPlaylist', () => ({
	__esModule: true,
	default: () => ({
		addItem: jest.fn(),
		items: [],
		loading: false,
		canUserEdit: mockCanUserEdit,
	}),
}))

jest.mock('../../../../../../common/components/SongSelectPopup/SongSelectPopup', () => ({
	__esModule: true,
	default: () => null,
}))

describe('AddSongToPlaylistButton', () => {
	it('renders the add button for a user who may edit the playlist', () => {
		mockCanUserEdit = true
		render(<AddSongToPlaylistButton />)
		expect(screen.getByRole('button')).toBeInTheDocument()
	})

	it('renders nothing for a user who may not edit the playlist', () => {
		mockCanUserEdit = false
		const { container } = render(<AddSongToPlaylistButton />)
		expect(container).toBeEmptyDOMElement()
	})
})
