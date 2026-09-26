'use client'

import { BasicVariantPack } from '@/api/dtos'
import { Box } from '@/common/ui/Box'
import { SxProps } from '@/common/ui/mui'
import { Skeleton } from '@/common/ui/mui/Skeleton'
import { SongVariantCard } from '@/common/ui/SongCard'
import { Typography } from '@/common/ui/Typography'
import { ChevronRightRounded, MusicNoteRounded } from '@mui/icons-material'
import { Fragment, ReactNode } from 'react'

/**
 * The iOS-style grouped list: rows sit on one white surface floating on the grey
 * app canvas, separated by inset hairlines.
 *
 * This shape is the mobile app's list language — songs, playlists, recently
 * added, search results. It used to be copy-pasted per screen (seven copies of
 * the surface, three of the flat-row override, three of the divider inset), so
 * the insets had already drifted apart. Everything lives here now.
 */

/** The raised white surface every mobile card sits on. */
const CARD_SURFACE = {
	bgcolor: 'background.paper',
	borderRadius: 3,
	boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
} as const

/**
 * A list group: rows are flush to the edges and clip to the radius, so the
 * surface provides no padding of its own. Spread it when you need the raw sx.
 */
export const GROUP_CARD_SX = {
	...CARD_SURFACE,
	overflow: 'hidden',
} as const

/**
 * The same surface holding one block of content (a song sheet, a deck slide)
 * rather than rows — so it pads itself instead of clipping.
 */
export const CONTENT_CARD_SX = {
	...CARD_SURFACE,
	padding: 2.5,
} as const

/**
 * Strips SongVariantCard's own card chrome so it reads as a row *inside* a
 * group rather than a card on top of one.
 */
export const FLAT_ROW_SX = {
	bgcolor: 'transparent',
	borderRadius: 0,
	outlineColor: 'transparent',
	'&:hover': { bgcolor: 'grey.50', boxShadow: 'none' },
	'&:active': { bgcolor: 'grey.100' },
} as const

/** How far a hairline starts from the left edge, by what the row leads with. */
const DIVIDER_INSETS = {
	/** past a 40px leading icon: row padding (2u) + icon (5u) + gap (1.5u) */
	icon: 8.5,
	/** text-only rows: just past the row's own padding */
	text: 1.75,
	/** full-bleed */
	none: 0,
} as const

export type GroupDividerInset = keyof typeof DIVIDER_INSETS

export function GroupCard({
	children,
	sx,
}: {
	children?: ReactNode
	sx?: SxProps
}) {
	return <Box sx={{ ...GROUP_CARD_SX, ...sx }}>{children}</Box>
}

export function GroupDivider({ inset = 'icon' }: { inset?: GroupDividerInset }) {
	return (
		<Box
			sx={{ height: '1px', bgcolor: 'grey.200', marginLeft: DIVIDER_INSETS[inset] }}
		/>
	)
}

/** The muted note tile song rows lead with. */
export function SongLeadingIcon() {
	return (
		<Box
			sx={{
				width: 40,
				height: 40,
				borderRadius: 2,
				bgcolor: 'grey.100',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				flexShrink: 0,
			}}
		>
			<MusicNoteRounded sx={{ fontSize: 20, color: 'grey.600' }} />
		</Box>
	)
}

/**
 * One song as a row of a group — the list's smallest unit, and the shape
 * everything else here is built from.
 *
 * `trailing` replaces the disclosure chevron for a row that has something else
 * to offer at its end.
 */
export function SongRow({
	song,
	previewLines = 1,
	withIcon = true,
	highlight,
	trailing,
}: {
	song: BasicVariantPack
	previewLines?: number
	withIcon?: boolean
	highlight?: string
	trailing?: ReactNode
}) {
	return (
		<SongVariantCard
			data={song}
			dense
			previewLines={previewLines}
			highlight={highlight}
			leadingIcon={withIcon ? <SongLeadingIcon /> : undefined}
			trailingIcon={trailing ?? <ChevronRightRounded sx={{ color: 'grey.400' }} />}
			sx={FLAT_ROW_SX}
		/>
	)
}

/**
 * A whole group of song rows — the shape the songs list, home and the account
 * lists all render. Pass `previewLines` to trade lyric preview for density.
 */
export function SongGroup({
	songs,
	previewLines = 1,
	withIcon = true,
	highlight,
	sx,
}: {
	songs: BasicVariantPack[]
	previewLines?: number
	/** The leading music icon. Off on a desktop, where rows are wider and the
	 * icon is a column of decoration down the page. */
	withIcon?: boolean
	/** Marks this text in each title — what a search matched. */
	highlight?: string
	sx?: SxProps
}) {
	return (
		<GroupCard sx={sx}>
			{songs.map((song, i) => (
				<Fragment key={`${String(song.packGuid)}-${i}`}>
					<SongRow
						song={song}
						previewLines={previewLines}
						withIcon={withIcon}
						highlight={highlight}
					/>
					{i < songs.length - 1 && (
						<GroupDivider inset={withIcon ? 'icon' : 'text'} />
					)}
				</Fragment>
			))}
		</GroupCard>
	)
}

/** Placeholder rows shown while a group's data loads. */
export function GroupRowsSkeleton({
	rows = 6,
	withIcon = false,
	inset,
}: {
	rows?: number
	/** Match rows that lead with a `SongLeadingIcon` (also picks the inset). */
	withIcon?: boolean
	inset?: GroupDividerInset
}) {
	const dividerInset = inset ?? (withIcon ? 'icon' : 'text')
	return (
		<GroupCard>
			{Array.from({ length: rows }).map((_, i) => (
				<Fragment key={i}>
					<Box
						sx={{
							display: 'flex',
							alignItems: 'center',
							gap: 1.5,
							paddingX: 1.75,
							paddingY: 1.25,
						}}
					>
						{withIcon && (
							<Skeleton
								variant="rounded"
								sx={{
									width: 40,
									height: 40,
									borderRadius: 2,
									bgcolor: 'grey.100',
									flexShrink: 0,
								}}
							/>
						)}
						<Box sx={{ flex: 1 }}>
							<Skeleton variant="text" sx={{ width: '55%', bgcolor: 'grey.100' }} />
							<Skeleton variant="text" sx={{ width: '80%', bgcolor: 'grey.100' }} />
						</Box>
					</Box>
					{i < rows - 1 && <GroupDivider inset={dividerInset} />}
				</Fragment>
			))}
		</GroupCard>
	)
}

/**
 * The empty / error state a data-backed mobile screen shows instead of its
 * group (MOBILE.md rule 7: never a blank screen). Pass `action` for a retry.
 */
export function ListStateView({
	icon,
	message,
	action,
}: {
	icon: ReactNode
	message: string
	action?: ReactNode
}) {
	return (
		<Box
			sx={{
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				textAlign: 'center',
				gap: action ? 2 : 1,
				paddingTop: 8,
				paddingX: 3,
			}}
		>
			<Box sx={{ fontSize: 48, color: 'grey.400', display: 'flex' }}>{icon}</Box>
			<Typography color="grey.600">{message}</Typography>
			{action}
		</Box>
	)
}
