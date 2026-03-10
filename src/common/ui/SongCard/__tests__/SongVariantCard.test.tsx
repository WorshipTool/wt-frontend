import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import React from 'react'
import { BasicVariantPack, PublishApprovalStatus } from '@/api/dtos'
import { PackTranslationType } from '@/types/song'

// Mock next-intl
jest.mock('next-intl', () => ({
	useTranslations: () => (key: string) => key,
}))

// Mock useAuth
jest.mock('../../../../hooks/auth/useAuth', () => ({
	__esModule: true,
	default: () => ({ user: null, isAdmin: () => false }),
}))

// Mock useApiState
jest.mock('../../../../tech/ApiState', () => ({
	useApiState: () => ({
		fetchApiState: jest.fn(),
		apiState: { loading: false },
	}),
}))

// Mock useTranslationLike
jest.mock('../hooks/useTranslationLike', () => ({
	__esModule: true,
	default: () => ({ isLiked: false, addLike: jest.fn(), removeLike: jest.fn() }),
}))

// Mock useTranslationLikesCount
jest.mock('../hooks/useTranslationLikesCount', () => ({
	useTranslationLikesCount: () => 0,
}))

// Mock DraggableSong (just renders children)
jest.mock('../../../../hooks/dragsong/DraggableSong', () => ({
	__esModule: true,
	default: ({ children }: { children: React.ReactNode }) => (
		<div>{children}</div>
	),
}))

// Mock parseVariantAlias
jest.mock('../../../../tech/song/variant/variant.utils', () => ({
	parseVariantAlias: () => ({}),
}))

// Mock Link (avoids SubdomainPathnameAliasProvider requirement)
jest.mock('../../../../common/ui/Link/Link', () => ({
	Link: ({ children }: { children: React.ReactNode }) => (
		<div>{children}</div>
	),
}))

// Mock SongCardAdditional (avoids FavouritesProvider requirement)
jest.mock('../components/SongCardAdditional', () => ({
	__esModule: true,
	default: () => <div data-testid="song-card-additional" />,
}))

import { SongVariantCard } from '../SongVariantCard'

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

describe('SongVariantCard', () => {
	describe('ChordKeyBadge visibility', () => {
		it('shows ChordKeyBadge when song has chords and HIDE_CHORD_KEY is not set', () => {
			render(<SongVariantCard data={songWithChords} />)
			expect(screen.getByLabelText(/chord key/i)).toBeInTheDocument()
		})

		it('does not show ChordKeyBadge when song has no chords', () => {
			render(<SongVariantCard data={songWithoutChords} />)
			expect(
				screen.queryByLabelText(/chord key/i)
			).not.toBeInTheDocument()
		})

		it('hides ChordKeyBadge when HIDE_CHORD_KEY property is set', () => {
			render(
				<SongVariantCard
					data={songWithChords}
					properties={['HIDE_CHORD_KEY']}
				/>
			)
			expect(
				screen.queryByLabelText(/chord key/i)
			).not.toBeInTheDocument()
		})

		it('still shows ChordKeyBadge when other properties are set but HIDE_CHORD_KEY is not', () => {
			render(
				<SongVariantCard
					data={songWithChords}
					properties={['SHOW_PRIVATE_LABEL']}
				/>
			)
			expect(screen.getByLabelText(/chord key/i)).toBeInTheDocument()
		})
	})

	it('renders the song title', () => {
		render(<SongVariantCard data={baseSong} />)
		expect(screen.getByText('Test Song')).toBeInTheDocument()
	})
})
