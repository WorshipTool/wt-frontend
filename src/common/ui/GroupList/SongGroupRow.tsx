'use client'

import { Box } from '@/common/ui/Box'
import { GroupCard, SongRow } from '@/common/ui/GroupList/GroupList'
import { SxProps } from '@/common/ui/mui'
import TranslationsSelectPopup from '@/common/ui/SongCard/components/TranslationsSelectPopup'
import { BasicVariantPack } from '@/types/song'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

/** How many cards can show under the top one, however many translations there
 * are — the desktop card stacks the same handful. */
const MAX_EDGES = 3
/** The sliver of each card left showing, and how far it is tucked in at each
 * side, so the pile narrows as it goes down. */
const EDGE_HEIGHT = 6
const EDGE_INSET = 8
/** …and how much deeper each one is than the card above it. A card behind is a
 * card in shadow: on a desktop the same pile is drawn by taking the brightness
 * down a step per card. */
const EDGE_SHADES = ['grey.100', 'grey.200', 'grey.300'] as const

/**
 * A song and its translations as one row — the phone's SongGroupCard.
 *
 * The desktop card gathers a song's translations into a pile, the top one face
 * up and the others' edges showing beneath it. This is the same pile with a row
 * as its face: the song is an ordinary list row on its own card, and the
 * translations under it are the edges below. Tapping the row opens the one on
 * top, exactly as the card's face does; tapping the pile opens the same chooser
 * the card opens.
 *
 * It carries its own card rather than sitting in the list's shared surface,
 * because a pile needs something to be a pile *of*: a row flush in a surface has
 * no edge for anything to peek out from under.
 *
 * Without it, a search for a wedding song answered with five rows all called
 * "Svatební" and nothing saying which of them were the same song.
 */
export default function SongGroupRow({
	packs,
	previewLines,
	withIcon = true,
	highlight,
	sx,
}: {
	/** The song's translations, the first of which is the one the row shows. */
	packs: BasicVariantPack[]
	previewLines?: number
	withIcon?: boolean
	highlight?: string
	/** The card's own styling — corners, where the list carries on past it. */
	sx?: SxProps
}) {
	const t = useTranslations('song.translations')
	const [choosing, setChoosing] = useState(false)

	const edges = Math.min(packs.length - 1, MAX_EDGES)

	return (
		<>
			<Box>
				<GroupCard sx={sx}>
					<SongRow
						song={packs[0]}
						previewLines={previewLines}
						withIcon={withIcon}
						highlight={highlight}
					/>
				</GroupCard>

				{edges > 0 && (
					<Box
						role="button"
						aria-label={t('selectOther')}
						onClick={() => setChoosing(true)}
						// the air belongs under the pile rather than around the whole
						// group: what follows is the next line of the same list
						sx={{ cursor: 'pointer', marginBottom: 0.5 }}
					>
						{Array.from({ length: edges }).map((_, i) => (
							<Box
								key={i}
								sx={{
									height: EDGE_HEIGHT,
									// each card a little further under the one above it, and a
									// shade deeper, which is the whole of how a pile reads
									marginX: `${(i + 1) * EDGE_INSET}px`,
									bgcolor: EDGE_SHADES[i],
									borderBottomLeftRadius: 12,
									borderBottomRightRadius: 12,
									...(i === edges - 1 && {
										boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
									}),
								}}
							/>
						))}
					</Box>
				)}
			</Box>

			<TranslationsSelectPopup
				open={choosing}
				onClose={() => setChoosing(false)}
				packs={packs}
			/>
		</>
	)
}
