'use client'

import SheetDisplay from '@/common/components/SheetDisplay/SheetDisplay'
import { Box, IconButton, Typography } from '@/common/ui'
import { PlaylistItemDto } from '@/interfaces/playlist/playlist.types'
import { Sheet } from '@pepavlin/sheet-api'
import { ChevronLeftRounded, ChevronRightRounded } from '@mui/icons-material'
import { CONTENT_CARD_SX as CARD } from '@/common/ui/GroupList'
import { useTranslations } from 'next-intl'
import { useEffect, useMemo, useRef, useState } from 'react'

// one song slide: the shared SheetDisplay on a white card, with the playlist
// item's stored key applied (same rendering as the standalone song page)
function DeckSlide({ item }: { item: PlaylistItemDto }) {
	const sheet = useMemo(() => {
		const s = new Sheet(item.pack.sheetData)
		if (item.toneKey) s.setKey(item.toneKey)
		return s
	}, [item.pack.sheetData, item.toneKey])
	return (
		<Box sx={CARD}>
			<SheetDisplay
				sheet={sheet}
				title={item.pack.title}
				hideChords={false}
				variant="default"
				editMode={false}
			/>
		</Box>
	)
}

/**
 * Detail-mode content: the whole song (shared SheetDisplay on a white card) with
 * horizontal swipe between the playlist's songs. Fills its parent; the page owns
 * the header + switcher around it. Only the current ±1 slides mount their sheet.
 * A nav row (‹ dots ›) sits above the floating switcher — `bottomInset` reserves
 * the space the switcher occupies so it never hides the dots.
 */
export default function PlaylistSwipeDeck({
	items,
	startIndex = 0,
	bottomInset = 0,
}: {
	items: PlaylistItemDto[]
	startIndex?: number
	/** px the parent's floating switcher occupies; the nav row clears it. */
	bottomInset?: number
}) {
	const t = useTranslations('playlist')
	const scrollerRef = useRef<HTMLDivElement>(null)
	const [current, setCurrent] = useState(startIndex)
	const rafRef = useRef(0)

	// open at the requested song (no smooth jump) once the scroller has a width
	useEffect(() => {
		const el = scrollerRef.current
		if (el) el.scrollLeft = startIndex * el.clientWidth
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	const onScroll = () => {
		if (rafRef.current) return
		rafRef.current = requestAnimationFrame(() => {
			rafRef.current = 0
			const el = scrollerRef.current
			if (!el || el.clientWidth === 0) return
			const i = Math.round(el.scrollLeft / el.clientWidth)
			setCurrent((c) => (c === i ? c : i))
		})
	}

	const goTo = (i: number) => {
		const el = scrollerRef.current
		const clamped = Math.max(0, Math.min(items.length - 1, i))
		if (el) el.scrollTo({ left: clamped * el.clientWidth, behavior: 'smooth' })
	}

	return (
		<Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
			<Box
				ref={scrollerRef}
				onScroll={onScroll}
				sx={{
					flex: 1,
					minHeight: 0,
					display: 'flex',
					overflowX: 'auto',
					overflowY: 'hidden',
					scrollSnapType: 'x mandatory',
					'&::-webkit-scrollbar': { display: 'none' },
				}}
			>
				{items.map((item, i) => (
					<Box
						key={item.guid}
						sx={{
							flex: '0 0 100%',
							width: '100%',
							height: '100%',
							overflowY: 'auto',
							scrollSnapAlign: 'center',
							paddingX: 2,
							paddingTop: 1,
							paddingBottom: 2,
						}}
					>
						{Math.abs(i - current) <= 1 ? <DeckSlide item={item} /> : null}
					</Box>
				))}
			</Box>
			{/* nav row: arrows + dots, held above the floating mode switcher */}
			<Box
				sx={{
					flexShrink: 0,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					gap: 1,
					paddingTop: 0.5,
				}}
				style={{ paddingBottom: bottomInset }}
			>
				<IconButton
					size="small"
					color="grey.700"
					alt={t('prevSong')}
					disabled={current === 0}
					onClick={() => goTo(current - 1)}
				>
					<ChevronLeftRounded />
				</IconButton>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
					{items.map((item, i) => (
						<Box
							key={item.guid}
							onClick={() => goTo(i)}
							sx={{
								width: i === current ? 22 : 7,
								height: 7,
								borderRadius: 999,
								cursor: 'pointer',
								bgcolor: i === current ? 'primary.main' : 'grey.300',
								transition: 'width 0.2s',
							}}
						/>
					))}
				</Box>
				<IconButton
					size="small"
					color="grey.700"
					alt={t('nextSong')}
					disabled={current === items.length - 1}
					onClick={() => goTo(current + 1)}
				>
					<ChevronRightRounded />
				</IconButton>
			</Box>
		</Box>
	)
}
