'use client'

import { createStory } from '@/app/(layout)/storybook/createStory'
import useLastAddedSongs from '@/app/components/components/LastAddedSongsList/hooks/useLastAddedSongs'
import useRecommendedSongs from '@/app/components/components/RecommendedSongsList/hooks/useRecommendedSongs'
import { GROUP_CARD_SX, SongGroup } from '@/common/ui/GroupList'
import { Box, Clickable, Image, Typography } from '@/common/ui'
import { getSmartDateAgoString } from '@/tech/date/date.tech'
import { getAssetUrl } from '@/tech/paths.tech'
import { ChevronRightRounded, SearchRounded } from '@mui/icons-material'
import { useTranslations } from 'next-intl'
import { Fragment, ReactNode } from 'react'

/** Phone width the concept is drawn at, so it reads correctly in the gallery. */
const FRAME_WIDTH = 390
/** Sheep size; it peeks out from behind the search field below it. */
const SHEEP_SIZE = 96
/** How far the sheep reaches past the header. Its front paws sit at about 30%
 * of the illustration's height, so the field's top edge lands just under them —
 * they rest on it rather than being swallowed by it. */
const SHEEP_TUCK = Math.round(SHEEP_SIZE * 0.22)
/** Extra left inset for the title/slogan, past the app's normal content edge. */
const TITLE_INSET = 2.5
const PREVIEW_LINES = 2
const TEXT_DIVIDER_INSET = 1.75

/**
 * Playground for the phone home's header: the plain large title with the app's
 * sheep next to it, and the search field returned underneath.
 *
 * The header keeps the canvas background it has today — no tint, no new colour.
 * Everything below is today's home screen, unchanged.
 *
 * Concept only — it does not touch HomeMobile.
 */
const HomeHeroConceptStory = () => {
	const tHome = useTranslations('home')
	const tSearch = useTranslations('search')
	const recommended = useRecommendedSongs()
	const lastAdded = useLastAddedSongs()

	const sectionLabel = (text: string, action?: ReactNode) => (
		<Box
			sx={{
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'space-between',
				gap: 1,
				paddingX: 0.5,
				paddingBottom: 1,
			}}
		>
			<Typography small strong uppercase color="grey.700">
				{text}
			</Typography>
			{action}
		</Box>
	)

	const dateOf = (publishedAt?: Date | null) =>
		publishedAt ? getSmartDateAgoString(publishedAt) : ''

	return (
		<Box
			data-testid="home-hero-concept"
			sx={{
				width: FRAME_WIDTH,
				maxWidth: '100%',
				bgcolor: 'grey.50',
				borderRadius: 3,
				overflow: 'hidden',
				border: '1px solid',
				borderColor: 'grey.300',
			}}
		>
			{/* ===== header: the canvas as before, with the sheep added =====
			    No overflow clipping: the sheep deliberately hangs past the bottom
			    edge so the search field below can cover its feet — the same trick
			    the desktop RightSheepPanel uses. */}
			<Box
				sx={{
					position: 'relative',
					paddingTop: 4,
					paddingX: 2.5,
					paddingBottom: 2,
				}}
			>
				<Box
					sx={{
						position: 'absolute',
						right: 16,
						bottom: -SHEEP_TUCK,
						width: SHEEP_SIZE,
						height: SHEEP_SIZE,
						pointerEvents: 'none',
					}}
				>
					<Image
						src={getAssetUrl('/sheeps/ovce3.svg')}
						alt={tHome('hero.title')}
						fill
						sizes={`${SHEEP_SIZE}px`}
						style={{ objectFit: 'contain', objectPosition: 'bottom center' }}
					/>
				</Box>

				{/* the two title lines are deliberately inset past the app's left
				    padding — they read as a slogan rather than as content */}
				<Box
					sx={{
						position: 'relative',
						maxWidth: '60%',
						paddingLeft: TITLE_INSET,
						paddingBottom: 2.5,
					}}
				>
					<Typography
						strong={900}
						size="2.1rem"
						sx={{ lineHeight: 1.1, letterSpacing: '-0.5px' }}
					>
						{tHome('hero.title')}
					</Typography>
					<Typography small strong={500} color="grey.600" sx={{ marginTop: 0.5 }}>
						{tHome('hero.lead')}
					</Typography>
				</Box>
			</Box>

			{/* ===== the search field — sits on top of the sheep's feet ===== */}
			<Box sx={{ position: 'relative', zIndex: 1, paddingX: 2 }}>
				<Box
					sx={{
						display: 'flex',
						alignItems: 'center',
						gap: 1.5,
						bgcolor: 'background.paper',
						border: '1px solid',
						borderColor: 'grey.300',
						borderRadius: 2.5,
						paddingX: 2,
						paddingY: 1.5,
						boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
					}}
				>
					<SearchRounded sx={{ color: 'grey.500' }} />
					<Typography color="grey.500" noWrap>
						{tSearch('searchByTitleOrText')}
					</Typography>
				</Box>
			</Box>

			{/* ===== below here: today's home screen, unchanged ===== */}
			<Box
				sx={{
					display: 'flex',
					flexDirection: 'column',
					gap: 3,
					paddingX: 2,
					paddingTop: 2.5,
					paddingBottom: 3,
				}}
			>
				<Box>
					{sectionLabel(
						tHome('recommended.idea'),
						<Clickable>
							<Typography small strong uppercase color="primary.main">
								{tHome('allList.browse')}
							</Typography>
						</Clickable>
					)}
					<SongGroup
						songs={recommended.data.slice(0, 5)}
						previewLines={PREVIEW_LINES}
					/>
				</Box>

				<Box>
					{sectionLabel(tHome('lastAdded.title'))}
					<Box sx={GROUP_CARD_SX}>
						{lastAdded.data.slice(0, 5).map((song, i) => (
							<Fragment key={song.packGuid}>
								<Box
									sx={{
										display: 'flex',
										alignItems: 'center',
										gap: 1.5,
										paddingX: 1.75,
										paddingY: 1.25,
									}}
								>
									<Typography noWrap sx={{ flex: 1 }}>
										{song.title}
									</Typography>
									<Typography small color="grey.600" noWrap>
										{dateOf(song.publishedAt)}
									</Typography>
									<ChevronRightRounded
										fontSize="small"
										sx={{ color: 'grey.400' }}
									/>
								</Box>
								{i < Math.min(lastAdded.data.length, 5) - 1 && (
									<Box
										sx={{
											height: '1px',
											bgcolor: 'grey.200',
											marginLeft: TEXT_DIVIDER_INSET,
										}}
									/>
								)}
							</Fragment>
						))}
					</Box>
				</Box>
			</Box>
		</Box>
	)
}

createStory(HomeHeroConceptStory, HomeHeroConceptStory)
