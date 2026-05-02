'use client'

import useLastAddedSongs from '@/app/components/components/LastAddedSongsList/hooks/useLastAddedSongs'
import { useFlag } from '@/common/providers/FeatureFlags/useFlag'
import { Box, Clickable, Typography, useTheme } from '@/common/ui'
import { Link } from '@/common/ui/Link/Link'
import { Skeleton } from '@/common/ui/mui/Skeleton'
import { getSmartDateAgoString } from '@/tech/date/date.tech'
import { parseVariantAlias } from '@/tech/song/variant/variant.utils'
import { BasicVariantPack } from '@/types/song'
import AccessTimeRounded from '@mui/icons-material/AccessTimeRounded'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'

const ACCENT_COLORS = [
	'#0085FF',
	'#532EE7',
	'#E91E63',
	'#00BCD4',
	'#FF9800',
	'#4CAF50',
]

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
				gap: 1.5,
				paddingLeft: 2.5,
			}}
		>
			<Typography
				strong
				sx={{
					color: 'grey.700',
					fontSize: '0.8rem',
					letterSpacing: '0.06em',
					textTransform: 'uppercase',
				}}
			>
				{tHome('lastAdded.title')}
			</Typography>

			<Box
				sx={{
					display: 'flex',
					gap: 1.25,
					overflowX: 'auto',
					paddingBottom: 1,
					paddingRight: 2.5,
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
									minWidth: 160,
									height: 80,
									borderRadius: 3,
									bgcolor: theme.palette.grey[200],
									flexShrink: 0,
								}}
							/>
					  ))
					: data.slice(0, 6).map((song, index) => (
							<MobileLastAddedCard
								key={song.packAlias}
								data={song}
								accentColor={ACCENT_COLORS[index % ACCENT_COLORS.length]}
							/>
					  ))}
			</Box>
		</Box>
	)
}

function MobileLastAddedCard({
	data: s,
	accentColor,
}: {
	data: BasicVariantPack
	accentColor: string
}) {
	const theme = useTheme()

	return (
		<Clickable>
			<Link to="variant" params={parseVariantAlias(s.packAlias)}>
				<Box
					sx={{
						minWidth: 160,
						maxWidth: 200,
						padding: 1.75,
						backgroundColor: 'white',
						borderRadius: 3,
						border: '1px solid',
						borderColor: 'grey.100',
						boxShadow: '0 2px 8px rgba(0,0,0,0.04), 0 0.5px 1px rgba(0,0,0,0.06)',
						flexShrink: 0,
						scrollSnapAlign: 'start',
						display: 'flex',
						flexDirection: 'column',
						gap: 1,
						position: 'relative',
						overflow: 'hidden',
						transition: 'transform 0.15s ease, box-shadow 0.15s ease',
						'&:active': {
							transform: 'scale(0.97)',
						},
						'&::before': {
							content: '""',
							position: 'absolute',
							top: 0,
							left: 0,
							right: 0,
							height: '3px',
							background: accentColor,
							borderRadius: '3px 3px 0 0',
						},
					}}
				>
					<Typography
						strong
						sx={{
							overflow: 'hidden',
							textOverflow: 'ellipsis',
							whiteSpace: 'nowrap',
							fontSize: '0.85rem',
							color: theme.palette.grey[900],
						}}
					>
						{s.title}
					</Typography>

					{s.publishedAt && (
						<Box
							sx={{
								display: 'flex',
								alignItems: 'center',
								gap: 0.5,
							}}
						>
							<AccessTimeRounded
								sx={{
									fontSize: '0.7rem',
									color: theme.palette.grey[400],
								}}
							/>
							<Typography
								sx={{
									fontSize: '0.7rem',
									color: theme.palette.grey[400],
									fontWeight: 500,
								}}
							>
								{getSmartDateAgoString(s.publishedAt)}
							</Typography>
						</Box>
					)}
				</Box>
			</Link>
		</Clickable>
	)
}
