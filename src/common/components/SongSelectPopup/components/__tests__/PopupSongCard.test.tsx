import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import React from 'react'
import { BasicVariantPack, PublishApprovalStatus } from '@/api/dtos'
import { PackTranslationType } from '@/types/song'

// Mock next-intl
jest.mock('next-intl', () => ({
	useTranslations: () => (key: string) => key,
}))

// Mock DraggableSong (just renders children)
jest.mock('../../../../../hooks/dragsong/DraggableSong', () => ({
	__esModule: true,
	default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

// Mock IconButton
jest.mock('../../../../../common/ui/IconButton', () => ({
	IconButton: ({ children }: { children: React.ReactNode }) => <button>{children}</button>,
}))

// Mock parseVariantAlias
jest.mock('../../../../../tech/song/variant/variant.utils', () => ({
	parseVariantAlias: () => ({}),
}))

// Mock theme
jest.mock('../../../../../common/constants/theme', () => ({
	theme: {
		palette: {
			primary: { main: '#1976d2' },
		},
	},
}))

import PopupSongCard from '../PopupSongCard'

const baseSong: BasicVariantPack = {
	packGuid: 'test-guid' as any,
	packAlias: 'test-alias' as any,
	title: 'Test Song',
	sheetData: '{V1}First line of text',
	songGuid: 'song-guid' as any,
	verified: false,
	public: true,
	publishApprovalStatus: PublishApprovalStatus.None,
	publishedAt: null,
	language: 'cs',
	translationType: PackTranslationType.Original,
	translationLikes: 0,
	ggValidated: false,
	createdAt: new Date(),
	updatedAt: new Date(),
	createdByGuid: 'user-guid' as any,
	createdByLoader: false,
}

const songWithChords: BasicVariantPack = {
	...baseSong,
	sheetData: '{V1}Lorem ipsum[C]\nSecond line[Am]',
}

const songWithoutChords: BasicVariantPack = {
	...baseSong,
	sheetData: '{V1}Lorem ipsum\nSecond line without chords',
}

describe('PopupSongCard chord badge', () => {
	it('shows ChordKeyBadge when song has chords', () => {
		render(
			<PopupSongCard
				song={songWithChords}
				onSelect={jest.fn()}
				onDeselect={jest.fn()}
			/>
		)
		expect(screen.getByLabelText(/chord key/i)).toBeInTheDocument()
	})

	it('does not show ChordKeyBadge when song has no chords', () => {
		render(
			<PopupSongCard
				song={songWithoutChords}
				onSelect={jest.fn()}
				onDeselect={jest.fn()}
			/>
		)
		expect(screen.queryByLabelText(/chord key/i)).not.toBeInTheDocument()
	})

	it('renders the song title', () => {
		render(
			<PopupSongCard
				song={baseSong}
				onSelect={jest.fn()}
				onDeselect={jest.fn()}
			/>
		)
		expect(screen.getByText('Test Song')).toBeInTheDocument()
	})
})
