'use client'

import useLastAddedSongs from '@/app/components/components/LastAddedSongsList/hooks/useLastAddedSongs'
import useRecommendedSongs from '@/app/components/components/RecommendedSongsList/hooks/useRecommendedSongs'
import { GROUP_CARD_SX, SongGroup } from '@/common/ui/GroupList'
import {
	MobileAppHeader,
	TOOLBAR_SPACER,
} from '@/common/components/MobileAppHeader'
import { Box, Clickable, Image, Typography, useTheme } from '@/common/ui'
import { Link } from '@/common/ui/Link/Link'
import { Skeleton } from '@/common/ui/mui/Skeleton'
import { getSmartDateAgoString } from '@/tech/date/date.tech'
import { getAssetUrl } from '@/tech/paths.tech'
import { parseVariantAlias } from '@/tech/song/variant/variant.utils'
import {
	ChevronRightRounded,
	CloudOffRounded,
	SearchRounded,
} from '@mui/icons-material'
import { handOffSearchFocus } from '@/app/(layout)/pisne/searchHandoff'
import { useChangeDelayer } from '@/hooks/changedelay/useChangeDelayer'
import { routesPaths } from '@/routes'
import { useSmartNavigate } from '@/routes/useSmartNavigate'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { ChangeEvent, Fragment, ReactNode, useRef, useState } from 'react'

const PREVIEW_LINES = 2 // lyric preview lines shown on the song cards

/** How long home's field waits after the last letter before it opens the
 * catalog. Long enough that a word arrives whole — the screens swap around the
 * caret, and a letter typed during the swap has no field to land in. */
const LAUNCH_DELAY_MS = 400

const TEXT_DIVIDER_INSET = 1.75
/** Sheep size in the hero. Sized to the gap between the title and the search
 * bar, so it starts level with the title and its paws land on the bar. */
const SHEEP_SIZE = 94
/** Where the sheep starts relative to the title block, so it sits level with the
 * title and reaches far enough down for the hero to clip it at the search bar. */
const SHEEP_TOP = -3
/** Extra left inset for the title/slogan, past the app's normal content edge. */
const TITLE_INSET = 2.5
/** Hero title size (rem) — the shell's large-title size, since this is one. */
const TITLE_SIZE = 1.85
/** Breathing room above the title, below the status bar. */
const HERO_TOP_SPACE = 4
/** Gap between the hero and the search field — it also sets how deep the sheep
 * is tucked, since the hero clips it at this edge. Part of the hero, so it folds
 * away with it and leaves the bar sitting evenly in the header. */
const HERO_BOTTOM_SPACE = 1.5
/** The strip the search field sits in, above and below it. That space is the
 * header's breathing room once the bar pins — it is not a gap over the field
 * before that, so the hero reaches down through it and the band is pulled back
 * up by the same amount. Otherwise the sheep is cut this far short of the field
 * and the strip shows as an empty grey band under her. */
const BAND_PAD = 1
/** Gap between the search bar and the first section, so the hero reads as its
 * own block rather than running straight into the lists. */
const SECTIONS_TOP_SPACE = 2
/** How far you scroll before the bar pins itself to the top, i.e. where the band
 * sits in the flow — the hero's height less the pull-up. Only the CSS scroll
 * timeline needs it, to know when to draw the hairline; keep it in step with the
 * paddings and type above. The status-bar inset is not part of it: the bar
 * sticks below that, so it cancels out. */
const HERO_TEXT_HEIGHT = 56 // measured: title + slogan
const HERO_HEIGHT = HERO_TOP_SPACE * 8 + HERO_TEXT_HEIGHT + HERO_BOTTOM_SPACE * 8

/**
 * Native-feeling mobile home: a flat light-grey canvas with white grouped lists
 * (recommended picks, a quiet "last added") under the shell's large title, which
 * is the desktop hero in a phone's clothes.
 *
 * The bar under the title is a door, not a field: it opens the catalog with its
 * own field asking for the caret. Searching used to be a second mode of this
 * screen, which is how two tabs came to point at one route and the songs list
 * came to have no search of its own. The desktop layout stays in HomeDesktop;
 * this component owns the phone view.
 */
export default function HomeMobile() {
	const tHome = useTranslations('home')
	const tSearch = useTranslations('search')
	const theme = useTheme()

	const recommended = useRecommendedSongs()
	const lastAdded = useLastAddedSongs()
	const rec = recommended.data
	const last = lastAdded.data

	const label = (text: string, action?: ReactNode) => (
		<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, paddingX: 0.5 }}>
			<Typography small strong uppercase color="grey.700">
				{text}
			</Typography>
			{action}
		</Box>
	)

	const browseAction = (
		<Clickable>
			<Link to="songsList" params={{ s: undefined, hledat: undefined }}>
				<Typography small strong uppercase color="primary.main">
					{tHome('allList.browse')}
				</Typography>
			</Link>
		</Clickable>
	)

	// ---- picks: one white S5 group on the grey canvas ----------------

	const picks = (
		<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
			{label(tHome('recommended.idea'), browseAction)}
			{recommended.isLoading ? (
				<Skeleton variant="rounded" sx={{ height: 288, borderRadius: 3, bgcolor: 'grey.200' }} />
			) : recommended.isError ? (
				<SectionError message={tHome('recommended.error')} />
			) : (
				<SongGroup songs={rec.slice(0, 5)} previewLines={PREVIEW_LINES} />
			)}
		</Box>
	)

	// ---- recent: quiet text-only S5 group (like the playlists list) ---

	const dateOf = (publishedAt?: Date | null) => (publishedAt ? getSmartDateAgoString(publishedAt) : '')

	const recentInner = lastAdded.isLoading ? (
		<Skeleton variant="rounded" sx={{ height: 220, borderRadius: 3, bgcolor: 'grey.200' }} />
	) : lastAdded.isError ? (
		<SectionError message={tHome('recommended.error')} />
	) : (
		<Box sx={GROUP_CARD_SX}>
			{last.slice(0, 5).map((s, i) => (
				<Fragment key={s.packGuid}>
					<Clickable>
						<Link to="variant" params={parseVariantAlias(s.packAlias)}>
							<Box
								sx={{
									display: 'flex',
									alignItems: 'center',
									gap: 1.5,
									paddingX: 1.75,
									paddingY: 1.25,
									transition: 'background-color 0.15s ease',
									'&:active': { bgcolor: 'grey.100' },
								}}
							>
								<Typography noWrap sx={{ flex: 1 }}>
									{s.title}
								</Typography>
								<Typography small color="grey.600" noWrap>
									{dateOf(s.publishedAt)}
								</Typography>
								<ChevronRightRounded fontSize="small" sx={{ color: 'grey.400' }} />
							</Box>
						</Link>
					</Clickable>
					{i < Math.min(last.length, 5) - 1 && (
						<Box sx={{ height: '1px', bgcolor: 'grey.200', marginLeft: TEXT_DIVIDER_INSET }} />
					)}
				</Fragment>
			))}
		</Box>
	)

	const recent = (
		<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
			{label(tHome('lastAdded.title'))}
			{recentInner}
		</Box>
	)

	// ---- hero: ordinary content, so it scrolls away at the page's own speed and
	// leaves the search bar behind at the top. The sheep sits level with the title
	// and reaches past the hero's bottom edge, where the hero — a clipping box —
	// tucks her paws out of sight.

	const hero = (
		<Box sx={{ overflow: 'hidden' }}>
			<Box
				sx={{
					paddingTop: `calc(${TOOLBAR_SPACER} + ${HERO_TOP_SPACE * 8}px)`,
					// down to the field itself, not to the strip around it — the band
					// takes the extra back with a matching negative margin
					paddingBottom: HERO_BOTTOM_SPACE + BAND_PAD,
					paddingLeft: TITLE_INSET,
				}}
			>
				<Box sx={{ position: 'relative' }}>
					<Box
						sx={{
							fontSize: `${TITLE_SIZE}rem`,
							fontWeight: 800,
							letterSpacing: '-0.4px',
							lineHeight: 1.15,
							color: 'grey.900',
						}}
					>
						{tHome('hero.title')}
					</Box>
					<Box sx={{ marginTop: 0.25 }}>
						<Typography small strong={500} color="grey.600">
							{tHome('hero.lead')}
						</Typography>
					</Box>

					<Box
						sx={{
							position: 'absolute',
							// the header's own inset already holds it off the screen edge
							right: 0,
							top: SHEEP_TOP,
							width: SHEEP_SIZE,
							height: SHEEP_SIZE,
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
				</Box>
			</Box>
		</Box>
	)

	return (
		// Searching is a mode of this screen, not a layer over it, and not a
		// different screen either: the hero folds away, the bar it sat under rides up
		// to the top, and the body swaps recommendations for results. The tab bar
		// stays uncovered, so the tabs remain a way out.
		//
		// The hero is ordinary content and the bar below it is `position: sticky`,
		// so the browser keeps it in step with the page itself — nothing here reads
		// the scroll position, which is the only way the bar can never lag behind
		// the content it is pinned over.
		<MobileAppHeader>
			{hero}

			<Box
				sx={{
					position: 'sticky',
					// under the status bar, whose scrim the shell draws above it
					top: TOOLBAR_SPACER,
					zIndex: 2,
					// full width, like a header's: the scroller's inset is added back
					// inside, so content passes under all of the band
					marginX: -2,
					paddingX: 2,
					paddingY: BAND_PAD,
					// The strip above the field belongs to the hero until the bar pins,
					// so the hero can reach the field and tuck the sheep behind it. Sticky
					// clamps the band at the top either way, so nothing below it moves.
					marginTop: `-${BAND_PAD * 8}px`,
					// The band is only a header once it has arrived at the top and content
					// starts passing under it — that is when it needs to mask what passes,
					// and to draw the line saying so. Before that it is just the strip the
					// field sits in, and it stays out of the way: an opaque full-width
					// plate on the canvas is a rectangle in front of everything, over the
					// sheep and over the scrollbar's lane.
					//
					// A scroll-driven animation turns them on — a scroll timeline is the
					// browser's own, so this stays in step without anything measuring the
					// scroll. The plain values below are what a browser without one falls
					// back to: solid throughout, the way it looked before.
					bgcolor: 'grey.50',
					borderBottom: '1px solid',
					borderColor: 'transparent',
					'@supports (animation-timeline: scroll())': {
						'@keyframes homeBarPinned': {
							from: {
								backgroundColor: 'transparent',
								borderBottomColor: 'transparent',
							},
							to: {
								backgroundColor: theme.palette.grey[50],
								borderBottomColor: theme.palette.grey[200],
							},
						},
						animationName: 'homeBarPinned',
						animationTimeline: 'scroll(nearest block)',
						animationRange: `${HERO_HEIGHT - 8}px ${HERO_HEIGHT}px`,
						animationFillMode: 'both',
						animationTimingFunction: 'linear',
					},
				}}
			>
				<SearchLauncher label={tSearch('searchSongs')} />
			</Box>

			<Box
				sx={{
					display: 'flex',
					flexDirection: 'column',
					gap: 3,
					marginTop: SECTIONS_TOP_SPACE,
				}}
			>
				{picks}
				{recent}
			</Box>
		</MobileAppHeader>
	)
}

/**
 * A home section whose data failed to load. Home used to render an empty white
 * card in this case, with nothing telling the user what happened.
 */
function SectionError({ message }: { message: string }) {
	return (
		<Box
			sx={{
				...GROUP_CARD_SX,
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				gap: 1,
				paddingY: 4,
				paddingX: 3,
				textAlign: 'center',
			}}
		>
			<CloudOffRounded sx={{ fontSize: 40, color: 'grey.400' }} />
			<Typography color="grey.600">{message}</Typography>
		</Box>
	)
}

/**
 * Home's search bar: a real field, and a door.
 *
 * Tapping it does nothing but put the caret in it — home is where you are, and
 * leaving it before a word has been typed costs a screen for nothing. The first
 * letter is the answer to "am I searching?", and that is when the catalog
 * opens, with the letter already in it and the caret handed over (see
 * searchHandoff), so the word is finished there.
 *
 * The catalog is still the one screen that searches: this field never shows a
 * result, it only carries what you typed to the screen that can.
 */
function SearchLauncher({ label }: { label: string }) {
	const navigate = useSmartNavigate()
	const router = useRouter()
	const [value, setValue] = useState('')
	const barRef = useRef<HTMLDivElement>(null)

	// …when you pause, not on the first letter: the two screens swap around the
	// caret, and a letter typed mid-swap has no field to land in.
	useChangeDelayer(
		value,
		(next) => {
			if (next.trim() === '') return
			// the bar's own place goes with the caret: the catalog's field arrives
			// where this one was rather than appearing (see searchHandoff)
			handOffSearchFocus(barRef.current)
			navigate('songsList', { hledat: next, s: undefined })
		},
		// no dependencies: `navigate` is a new function on every render, and a
		// dependency that changes every render restarts the wait every render —
		// the field would then only ever open the catalog when the page went quiet
		[],
		LAUNCH_DELAY_MS
	)

	return (
		<Box
			ref={barRef}
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
				transition: 'background-color 0.15s ease',
				'&:focus-within': { borderColor: 'grey.400' },
			}}
		>
			<SearchRounded sx={{ color: 'grey.500' }} />
			<Box
				component="input"
				type="search"
				value={value}
				onChange={(e: ChangeEvent<HTMLInputElement>) => setValue(e.target.value)}
				// the screen you are about to need, fetched while you type into this
				// one, so the swap is as short as it can be
				onFocus={() => router.prefetch(routesPaths.songsList)}
				placeholder={label}
				aria-label={label}
				enterKeyHint="search"
				sx={{
					flexGrow: 1,
					minWidth: 0,
					border: 0,
					outline: 'none',
					background: 'transparent',
					font: 'inherit',
					fontSize: '1rem',
					color: 'grey.900',
					'&::placeholder': { color: 'grey.600', opacity: 1 },
				}}
			/>
		</Box>
	)
}
