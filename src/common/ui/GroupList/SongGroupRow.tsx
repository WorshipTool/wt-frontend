'use client'

import { Box } from '@/common/ui/Box'
import { SongRow } from '@/common/ui/GroupList/GroupList'
import TranslationsSelectPopup from '@/common/ui/SongCard/components/TranslationsSelectPopup'
import { Typography } from '@/common/ui/Typography'
import { BasicVariantPack } from '@/types/song'
import { ChevronRightRounded, TranslateRounded } from '@mui/icons-material'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

/**
 * A song and its translations as one row — the phone's SongGroupCard.
 *
 * The desktop card gathers a song's translations into a stack and lets you pull
 * another one off it; a phone list has no room for a stack, so the group is one
 * ordinary row with the count of translations at its end. Tapping the row opens
 * the one on top, exactly as the card's face does; tapping the count opens the
 * same chooser the card opens.
 *
 * Without it, a search for a wedding song answered with five rows all called
 * "Svatební" and nothing saying which of them were the same song.
 */
export default function SongGroupRow({
	packs,
	previewLines,
	withIcon = true,
	highlight,
}: {
	/** The song's translations, the first of which is the one the row shows. */
	packs: BasicVariantPack[]
	previewLines?: number
	withIcon?: boolean
	highlight?: string
}) {
	const t = useTranslations('song.translations')
	const [choosing, setChoosing] = useState(false)

	// a group of one is a song like any other: nothing to choose between
	const hasOthers = packs.length > 1

	return (
		<>
			<SongRow
				song={packs[0]}
				previewLines={previewLines}
				withIcon={withIcon}
				highlight={highlight}
				trailing={
					hasOthers ? (
						<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
							<Box
								component="button"
								type="button"
								aria-label={t('selectOther')}
								onClick={(e: React.MouseEvent) => {
									// the row is a link to the song; this is not
									e.preventDefault()
									e.stopPropagation()
									setChoosing(true)
								}}
								sx={{
									display: 'flex',
									alignItems: 'center',
									gap: 0.25,
									height: 32,
									paddingX: 1,
									border: '1px solid',
									borderColor: 'grey.300',
									borderRadius: 2,
									bgcolor: 'grey.50',
									color: 'grey.700',
									font: 'inherit',
									cursor: 'pointer',
									'&:active': { bgcolor: 'grey.200' },
								}}
							>
								<TranslateRounded sx={{ fontSize: 16 }} />
								<Typography small strong color="grey.700">
									{packs.length}
								</Typography>
							</Box>
							<ChevronRightRounded sx={{ color: 'grey.400' }} />
						</Box>
					) : undefined
				}
			/>

			<TranslationsSelectPopup
				open={choosing}
				onClose={() => setChoosing(false)}
				packs={packs}
			/>
		</>
	)
}
