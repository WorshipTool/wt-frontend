'use client'

import useLastAddedSongs from '@/app/components/components/LastAddedSongsList/hooks/useLastAddedSongs'
import useRecommendedSongs from '@/app/components/components/RecommendedSongsList/hooks/useRecommendedSongs'
import { MAIN_SEARCH_EVENT_NAME } from '@/app/components/components/MainSearchInput'
import MobileSearchBody, {
	MobileSearchBar,
} from '@/app/components/MobileSearch'
import { setMobileSearchOpen } from '@/common/components/MobileAppTabBar/mobileSearchState'
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
import { ChevronRightRounded, CloudOffRounded } from '@mui/icons-material'
import { useTranslations } from 'next-intl'
import { useSearchParams } from 'next/navigation'
import {
	Fragment,
	ReactNode,
	useCallback,
	useEffect,
	useLayoutEffect,
	useRef,
	useState,
} from 'react'

const PREVIEW_LINES = 2 // lyric preview lines shown on the song cards

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
/** How long the hero takes to fold away when search opens, carrying the bar up
 * to the top with it. */
const HERO_COLLAPSE_MS = 260
/** How far you scroll before the bar pins itself to the top, i.e. where the band
 * sits in the flow — the hero's height less the pull-up. Only the CSS scroll
 * timeline needs it, to know when to draw the hairline; keep it in step with the
 * paddings and type above. The status-bar inset is not part of it: the bar
 * sticks below that, so it cancels out. */
const HERO_TEXT_HEIGHT = 56 // measured: title + slogan
const HERO_HEIGHT = HERO_TOP_SPACE * 8 + HERO_TEXT_HEIGHT + HERO_BOTTOM_SPACE * 8

type HomeMobileProps = {
	searchInputValue: string
	onSearchValueChange: (value: string) => void
	searchString: string | null
	smartSearch: boolean
}

/**
 * Native-feeling mobile home: a flat light-grey canvas with white grouped lists
 * (recommended picks, a quiet "last added") under the shell's large title, which
 * is the desktop hero in a phone's clothes.
 *
 * Searching is a mode of this screen rather than a layer over it — see
 * MobileSearch. The desktop layout stays in HomeDesktop; this component owns
 * the phone view.
 */
export default function HomeMobile({
	searchInputValue,
	onSearchValueChange,
	searchString,
	smartSearch,
}: HomeMobileProps) {
	const tHome = useTranslations('home')
	const theme = useTheme()

	const recommended = useRecommendedSongs()
	const lastAdded = useLastAddedSongs()
	const rec = recommended.data
	const last = lastAdded.data

	// `?hledat=` is how the tab bar's Hledat asks for search: it arrives with the
	// navigation, by which time the MAIN_SEARCH_EVENT it also fires has gone
	// unheard — this screen wasn't mounted yet to hear it. Read once, on mount,
	// before the delayer starts writing the param back on its own.
	//
	// An empty one means Hledat was tapped and the keyboard is wanted; one with a
	// query is a shared or reloaded link, which should show its results rather
	// than cover them with a keyboard.
	const [openedByUrl] = useState(() => {
		if (typeof window === 'undefined') return null
		const params = new URLSearchParams(window.location.search)
		if (!params.has('hledat')) return null
		return { query: params.get('hledat') || '' }
	})
	const [searchOpen, setSearchOpen] = useState(() => openedByUrl !== null)

	// The tab bar's Hledat links here and fires MAIN_SEARCH_EVENT, exactly like the
	// desktop toolbar's "Hledat" item does. Only MainSearchInput listened for it,
	// and that is desktop-only — so on a phone the bar's primary action used to do
	// nothing visible.
	//
	// Focusing the field is what opens search, so the event focuses it rather than
	// flipping the mode behind its back; a tap has already focused it by the time
	// this runs, and focusing twice costs nothing.
	const searchInputRef = useRef<HTMLInputElement>(null)
	const openSearch = useCallback(() => {
		setSearchOpen(true)
		searchInputRef.current?.focus()
	}, [])

	useEffect(() => {
		window.addEventListener(MAIN_SEARCH_EVENT_NAME, openSearch)
		return () => window.removeEventListener(MAIN_SEARCH_EVENT_NAME, openSearch)
	}, [openSearch])

	// …and when the tab bar asked from another tab, the field is focused here
	// instead, once this screen exists to focus it.
	useEffect(() => {
		if (openedByUrl && !openedByUrl.query) searchInputRef.current?.focus()
	}, [openedByUrl])

	// Tapping a tab is the way out of search. Písně and Účet leave this route and
	// unmount the screen on their own, but Domů navigates to the route we are
	// already on, so nothing would take the mode down — the query param dropping
	// out of the URL is the signal. Typing edits the URL with replaceState, which
	// does not update this hook, so it cannot fire mid-search.
	//
	// Guarded on search actually being open: clearing the value writes the
	// (empty) query param back through useUrlState, so running this on a plain
	// visit to `/` would put ?hledat= in the URL and make the bar light up as if
	// search were open.
	const searchParams = useSearchParams()
	useEffect(() => {
		if (searchParams.has('hledat')) return
		if (!searchOpen) return
		setSearchOpen(false)
		onSearchValueChange('')
	}, [searchParams, searchOpen, onSearchValueChange])

	// Let the tab bar reflect the mode (it has no other way to know — see
	// mobileSearchState), and make sure it doesn't stay lit if we unmount.
	useEffect(() => {
		setMobileSearchOpen(searchOpen)
		return () => setMobileSearchOpen(false)
	}, [searchOpen])

	// The Back gesture should leave search too, so opening it pushes a history
	// entry. useUrlState edits the query with replaceState, so typing re-labels
	// that entry instead of stacking more.
	const pushedHistoryRef = useRef(false)
	useEffect(() => {
		if (!searchOpen) return
		window.history.pushState({ mobileSearch: true }, '')
		pushedHistoryRef.current = true
		const onPop = () => {
			pushedHistoryRef.current = false
			setSearchOpen(false)
			onSearchValueChange('')
		}
		window.addEventListener('popstate', onPop)
		return () => window.removeEventListener('popstate', onPop)
	}, [searchOpen, onSearchValueChange])

	const heroRef = useRef<HTMLDivElement>(null)
	const heroInnerRef = useRef<HTMLDivElement>(null)

	// Cancel goes back through that entry rather than around it, so the Back
	// gesture afterwards isn't a step that appears to do nothing.
	const closeSearch = useCallback(() => {
		// let go of the field first, or the keyboard stays up over the home screen
		searchInputRef.current?.blur()
		if (pushedHistoryRef.current) {
			window.history.back()
			return
		}
		setSearchOpen(false)
		onSearchValueChange('')
	}, [onSearchValueChange])

	// The hero collapses instead of disappearing, so the bar below it rides up to
	// the top instead of jumping there.
	//
	// Its height is always an explicit length, never `auto`: a transition has
	// nothing to interpolate from `auto`, so letting it size itself between
	// toggles would make the collapse a jump. The natural size comes from the
	// block inside, which an observer keeps up to date (rotation, text scaling,
	// a longer slogan in another language).
	useLayoutEffect(() => {
		const outer = heroRef.current
		const inner = heroInnerRef.current
		if (!outer || !inner) return
		const apply = () => {
			// the inner block's own box: the sheep hangs past its bottom edge and
			// would otherwise count as hero height, pushing the bar down
			outer.style.height = searchOpen ? '0px' : `${inner.offsetHeight}px`
		}
		apply()
		const observer = new ResizeObserver(apply)
		observer.observe(inner)
		return () => observer.disconnect()
	}, [searchOpen])

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
	// and reaches past the hero's bottom edge, where the hero — a clipping box,
	// since folding away is how it collapses — tucks her paws out of sight.

	const hero = (
		<Box
			ref={heroRef}
			// height is animated between the inner block's size and zero — see the
			// layout effect above
			sx={{
				overflow: 'hidden',
				opacity: searchOpen ? 0 : 1,
				transition: `height ${HERO_COLLAPSE_MS}ms ease, opacity ${
					HERO_COLLAPSE_MS / 2
				}ms ease`,
			}}
		>
			<Box
				ref={heroInnerRef}
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
					// Searching has no hero to reach anything, so there is nothing to
					// take back.
					marginTop: searchOpen ? 0 : `-${BAND_PAD * 8}px`,
					// The band is only a header once it has arrived at the top and content
					// starts passing under it — that is when it needs to mask what passes,
					// and to draw the line saying so. Before that it is just the strip the
					// field sits in, and it stays out of the way: an opaque full-width
					// plate on the canvas is a rectangle in front of everything, over the
					// sheep and over the scrollbar's lane.
					//
					// Searching has no hero, so the bar is pinned from the start and both
					// are simply on. Otherwise a scroll-driven animation turns them on — a
					// scroll timeline is the browser's own, so this too stays in step
					// without anything measuring the scroll. The plain values below are
					// what a browser without one falls back to: solid throughout, the way
					// it looked before.
					bgcolor: 'grey.50',
					borderBottom: '1px solid',
					borderColor: searchOpen ? 'grey.200' : 'transparent',
					...(searchOpen
						? {}
						: {
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
						  }),
				}}
			>
				<MobileSearchBar
					value={searchInputValue}
					onValueChange={onSearchValueChange}
					active={searchOpen}
					onActivate={openSearch}
					onCancel={closeSearch}
					inputRef={searchInputRef}
				/>
			</Box>

			<Box
				// keyed so the incoming body fades in rather than replacing the other
				// one between two frames
				key={searchOpen ? 'search' : 'home'}
				sx={{
					'@keyframes bodyIn': { from: { opacity: 0 }, to: { opacity: 1 } },
					animation: `bodyIn ${HERO_COLLAPSE_MS / 2}ms ease`,
					display: 'flex',
					flexDirection: 'column',
					gap: 3,
					marginTop: SECTIONS_TOP_SPACE,
				}}
			>
				{searchOpen ? (
					<MobileSearchBody searchString={searchString} smartSearch={smartSearch} />
				) : (
					<>
						{picks}
						{recent}
					</>
				)}
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
