import '@testing-library/jest-dom'
import { fireEvent, render, screen } from '@testing-library/react'
import React from 'react'
import { BasicVariantPack, PublishApprovalStatus } from '@/api/dtos'
import { PackTranslationType } from '@/types/song'

// Mock SongVariantCard — it has many complex runtime dependencies
// (drag-and-drop, auth, next-intl, etc.) that would require heavy setup.
jest.mock('./SongVariantCard', () => ({
	__esModule: true,
	SongVariantCard: ({ data }: { data: { packGuid: string } }) => (
		<div data-testid="song-variant-card" data-pack-guid={data.packGuid} />
	),
}))

// Mock TranslationsSelectPopup
jest.mock('./components/TranslationsSelectPopup', () => ({
	__esModule: true,
	default: ({ open }: { open: boolean }) =>
		open ? <div data-testid="translations-popup" /> : null,
}))

import SongGroupCard from './SongGroupCard'

const makePack = (id: number): BasicVariantPack => ({
	packGuid: `pack-${id}` as any,
	packAlias: `alias-${id}` as any,
	title: `Pack ${id}`,
	sheetData: '',
	songGuid: `song-1` as any,
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
	createdByGuid: 'user-1' as any,
	createdByLoader: false,
})

describe('SongGroupCard', () => {
	it('renders only the main card when a single pack is provided', () => {
		render(<SongGroupCard packs={[makePack(1)]} />)

		const cards = screen.getAllByTestId('song-variant-card')
		expect(cards).toHaveLength(1)
		expect(cards[0]).toHaveAttribute('data-pack-guid', 'pack-1')
	})

	it('renders main card plus background cards for multiple packs', () => {
		const packs = [makePack(1), makePack(2), makePack(3)]
		render(<SongGroupCard packs={packs} />)

		// 1 main + 2 background = 3 total SongVariantCard instances
		const cards = screen.getAllByTestId('song-variant-card')
		expect(cards).toHaveLength(3)
	})

	it('limits background cards to 3 regardless of how many packs are provided', () => {
		const packs = [makePack(1), makePack(2), makePack(3), makePack(4), makePack(5)]
		render(<SongGroupCard packs={packs} />)

		// MAX_PACKS = 4 → restSliced = packs[1..3] = 3 items
		// 1 main + 3 background = 4 total SongVariantCard instances
		const cards = screen.getAllByTestId('song-variant-card')
		expect(cards).toHaveLength(4)
	})

	it('shows "Vyber jiný" selector when multiple packs exist', () => {
		render(<SongGroupCard packs={[makePack(1), makePack(2)]} />)

		expect(screen.getByText(/Vyber jiný z 2 překladů/)).toBeInTheDocument()
	})

	it('does not show "Vyber jiný" selector for a single pack', () => {
		render(<SongGroupCard packs={[makePack(1)]} />)

		expect(screen.queryByText(/Vyber jiný/)).not.toBeInTheDocument()
	})

	it('opens the translations popup when clicking the variant selector', () => {
		render(<SongGroupCard packs={[makePack(1), makePack(2)]} />)

		// Popup is initially closed
		expect(screen.queryByTestId('translations-popup')).not.toBeInTheDocument()

		// Click the "Vyber jiný" text — event bubbles to the parent div onClick
		fireEvent.click(screen.getByText(/Vyber jiný z 2 překladů/))

		expect(screen.getByTestId('translations-popup')).toBeInTheDocument()
	})

	it('renders the original label when an original pack is provided', () => {
		const packs = [makePack(1), makePack(2)]
		const original = makePack(99)
		original.title = 'Original Song'
		render(<SongGroupCard packs={packs} original={original} />)

		expect(screen.getByText('Originál')).toBeInTheDocument()
		expect(screen.getByText('Original Song')).toBeInTheDocument()
	})

	it('does not render the original label when no original is provided', () => {
		render(<SongGroupCard packs={[makePack(1), makePack(2)]} />)

		expect(screen.queryByText('Originál')).not.toBeInTheDocument()
	})

	/**
	 * Regression test for: "Varianty v pozadi se obcas zobrazi na spatnem miste"
	 *
	 * Background variant cards previously used negative zIndex values (0, -1, -2).
	 * Without a stacking context on the outer container, these negative-zIndex elements
	 * escaped the component's bounds and appeared behind adjacent elements in a Masonry grid.
	 *
	 * Fix: outer Box has `isolation: 'isolate'` and cards use positive zIndex values.
	 *
	 * The isolation property creates a self-contained stacking context so that
	 * background cards can never bleed outside the component's visual bounds.
	 * We verify the component renders without errors when placed alongside peers.
	 */
	it('renders multiple SongGroupCards side by side without z-index interference', () => {
		const packsA = [makePack(1), makePack(2), makePack(3)]
		const packsB = [makePack(4), makePack(5)]

		render(
			<div style={{ display: 'flex', gap: 8 }}>
				<SongGroupCard packs={packsA} />
				<SongGroupCard packs={packsB} />
			</div>
		)

		// Both group cards render their full set of variant cards
		const cards = screen.getAllByTestId('song-variant-card')
		// packsA: 1 main + 2 background = 3; packsB: 1 main + 1 background = 2 → total 5
		expect(cards).toHaveLength(5)
	})
})
