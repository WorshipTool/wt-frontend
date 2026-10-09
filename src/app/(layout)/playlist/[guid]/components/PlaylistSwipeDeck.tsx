'use client'

import SheetDisplay from '@/common/components/SheetDisplay/SheetDisplay'
import { Box, IconButton, Typography } from '@/common/ui'
import { PlaylistItemDto } from '@/interfaces/playlist/playlist.types'
import { Sheet } from '@pepavlin/sheet-api'
import {
	AddRounded,
	ChevronLeftRounded,
	ChevronRightRounded,
	RemoveRounded,
} from '@mui/icons-material'
import { CONTENT_CARD_SX as CARD } from '@/common/ui/GroupList'
import { useTranslations } from 'next-intl'
import { useEffect, useMemo, useRef, useState } from 'react'

/**
 * The smallest a control may be under a thumb. The arrows here are the most
 * pressed thing on the screen and used to be the smallest: `size="small"`
 * draws a 34px button. The dots keep their 7px look and take the same height
 * — what you aim at is not what you see.
 */
const TOUCH = 44
const TOUCH_SX = {
	'& .MuiIconButton-root': { width: TOUCH, height: TOUCH },
} as const

// one song slide: the shared SheetDisplay on a white card, with the playlist
// item's stored key applied (same rendering as the standalone song page), and
// — for whoever may edit the playlist — the `−`/`+` that change that key,
// inside the card above the song, where the desktop keeps them.
function DeckSlide({
	item,
	onTranspose,
}: {
	item: PlaylistItemDto
	onTranspose?: (semitones: number) => void
}) {
	const t = useTranslations('songPage.transpose')
	const sheet = useMemo(() => {
		const s = new Sheet(item.pack.sheetData)
		if (item.toneKey) s.setKey(item.toneKey)
		return s
	}, [item.pack.sheetData, item.toneKey])
	return (
		<Box sx={CARD}>
			{onTranspose && (
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
					<IconButton
						color="grey.700"
						tooltip={t('decrease')}
						onClick={() => onTranspose(-1)}
					>
						<RemoveRounded />
					</IconButton>
					<IconButton
						color="grey.700"
						tooltip={t('increase')}
						onClick={() => onTranspose(1)}
					>
						<AddRounded />
					</IconButton>
				</Box>
			)}
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
	onTranspose,
}: {
	items: PlaylistItemDto[]
	startIndex?: number
	/** px the parent's floating switcher occupies; the nav row clears it. */
	bottomInset?: number
	/** Given, each song can be transposed — the same `+`/`−` a desktop puts at
	 * the top of the same card. Left out for a playlist the visitor cannot
	 * edit, which is what a desktop does with them too. */
	onTranspose?: (item: PlaylistItemDto, semitones: number) => void
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
						{Math.abs(i - current) <= 1 ? (
							<DeckSlide
								item={item}
								onTranspose={
									onTranspose ? (by) => onTranspose(item, by) : undefined
								}
							/>
						) : null}
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
					sx={TOUCH_SX}
					color="grey.700"
					alt={t('prevSong')}
					disabled={current === 0}
					onClick={() => goTo(current - 1)}
				>
					<ChevronLeftRounded />
				</IconButton>
				<Box sx={{ display: 'flex', alignItems: 'center' }}>
					{items.map((item, i) => (
						// the dot is 7px of paint; the button around it is a thumb tall,
						// and takes the row's gap with it so nothing between two dots is
						// dead
						<Box
							key={item.guid}
							component="button"
							type="button"
							aria-label={item.pack.title}
							aria-current={i === current}
							onClick={() => goTo(i)}
							sx={{
								border: 0,
								background: 'none',
								padding: 0,
								paddingX: 0.375,
								height: TOUCH,
								display: 'flex',
								alignItems: 'center',
								cursor: 'pointer',
							}}
						>
							<Box
								sx={{
									width: i === current ? 22 : 7,
									height: 7,
									borderRadius: 999,
									bgcolor: i === current ? 'primary.main' : 'grey.300',
									transition: 'width 0.2s',
								}}
							/>
						</Box>
					))}
				</Box>
				<IconButton
					sx={TOUCH_SX}
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
