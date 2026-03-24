'use client'

import useLastAddedSongs from '@/app/components/components/LastAddedSongsList/hooks/useLastAddedSongs'
import { useFlag } from '@/common/providers/FeatureFlags/useFlag'
import { Box, Chip, Clickable, Typography, useTheme } from '@/common/ui'
import { Link } from '@/common/ui/Link/Link'
import { Skeleton } from '@/common/ui/mui/Skeleton'
import { getSmartDateAgoString } from '@/tech/date/date.tech'
import { parseVariantAlias } from '@/tech/song/variant/variant.utils'
import { BasicVariantPack } from '@/types/song'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'

export default function MobileLastAddedSection() {
	const { data, isLoading } = useLastAddedSongs()
	const showLastAdded = useFlag('show_last_added_songs')
	const tHome = useTranslations('home')
	const theme = useTheme()

	const [init, setInit] = useState(false)
	useEffect(() => {
		setInit(true)
	}, [])

	if (!showLastAdded) return null

	const isLoadingState = isLoading || !init

	return (
		<Box
			data-testid="mobile-last-added-section"
			sx={{
				display: 'flex',
				flexDirection: 'column',
				gap: 1,
				paddingLeft: 2,
			}}
		>
			<Typography
				strong
				sx={{
					color: 'grey.700',
				}}
			>
				{tHome('lastAdded.title')}
			</Typography>

			<Box
				sx={{
					display: 'flex',
					gap: 1.5,
					overflowX: 'auto',
					paddingBottom: 1,
					paddingRight: 2,
					scrollSnapType: 'x mandatory',
					WebkitOverflowScrolling: 'touch',
					'&::-webkit-scrollbar': {
						display: 'none',
					},
					scrollbarWidth: 'none',
				}}
			>
				{isLoadingState
					? Array.from({ length: 4 }).map((_, i) => (
							<Skeleton
								key={i}
								variant="rounded"
								sx={{
									minWidth: 200,
									height: 72,
									borderRadius: 2,
									bgcolor: theme.palette.grey[200],
									flexShrink: 0,
								}}
							/>
					  ))
					: data.slice(0, 6).map((song) => (
							<MobileLastAddedCard key={song.packAlias} data={song} />
					  ))}
			</Box>
		</Box>
	)
}

function MobileLastAddedCard({ data: s }: { data: BasicVariantPack }) {
	return (
		<Clickable>
			<Link to="variant" params={parseVariantAlias(s.packAlias)}>
				<Box
					sx={{
						minWidth: 200,
						maxWidth: 240,
						padding: 1.5,
						paddingX: 2,
						backgroundColor: 'grey.100',
						borderRadius: 2,
						border: `1.5px solid`,
						borderColor: 'grey.300',
						flexShrink: 0,
						scrollSnapAlign: 'start',
						display: 'flex',
						flexDirection: 'column',
						gap: 0.5,
						transition: 'border-color 0.15s ease',
						'&:hover': {
							borderColor: 'primary.main',
						},
					}}
				>
					<Typography
						strong
						sx={{
							overflow: 'hidden',
							textOverflow: 'ellipsis',
							whiteSpace: 'nowrap',
						}}
					>
						{s.title}
					</Typography>

					{s.publishedAt && (
						<Chip
							label={getSmartDateAgoString(s.publishedAt)}
							size="small"
							variant="filled"
							sx={{
								alignSelf: 'flex-start',
								fontSize: '0.7rem',
							}}
						/>
					)}
				</Box>
			</Link>
		</Clickable>
	)
}
