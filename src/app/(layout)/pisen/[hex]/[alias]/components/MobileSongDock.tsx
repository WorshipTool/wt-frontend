'use client'

import { PlaylistData } from '@/api/generated'
import AddToPlaylistMenuItem from '@/app/(layout)/pisen/[hex]/[alias]/components/components/AddToPlaylistButton/AddToPlaylistMenuItem'
import CreateCopyButton from '@/app/(layout)/pisen/[hex]/[alias]/components/components/CreateCopyButton'
import EditButton from '@/app/(layout)/pisen/[hex]/[alias]/components/components/EditButton'
import SongsOptionsButton from '@/app/(layout)/pisen/[hex]/[alias]/components/components/SongsOptionsButton'
import UserNotePanel from '@/app/(layout)/pisen/[hex]/[alias]/components/UserNotePanel'
import SelectPlaylistMenu from '@/common/components/Menu/SelectPlaylistMenu/SelectPlaylistMenu'
import Popup from '@/common/components/Popup/Popup'
import { ABOVE_TABBAR_SLOT_ID } from '@/common/components/MobileAppTabBar/nav.constants'
import SmartPortalMenuItem from '@/common/components/SmartPortalMenuItem/SmartPortalMenuItem'
import { Box, IconButton, Typography } from '@/common/ui'
import { PlaylistGuid } from '@/interfaces/playlist/playlist.types'
import HeartLikeButton from '@/common/ui/SongCard/components/HeartLikeButton'
import useAuth from '@/hooks/auth/useAuth'
import { getReplacedUrlWithParams } from '@/routes/tech/transformer.tech'
import { printDocumentByUrl } from '@/tech/print.tech'
import { parseVariantAlias } from '@/tech/song/variant/variant.utils'
import { ExtendedVariantPack } from '@/types/song'
import {
	AddComment,
	AddRounded,
	FeaturedPlayList,
	MusicNoteRounded,
	MusicOffRounded,
	PlaylistAddRounded,
	Print,
	RemoveRounded,
} from '@mui/icons-material'
import { Sheet } from '@pepavlin/sheet-api'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { SongDto } from '../../../../../../api/dtos'
import { routesPaths } from '../../../../../../routes'

/**
 * A ruler, not a key: the widest letter and the widest accidental a note can be
 * printed with, so no real key's label is ever wider than the space kept for it.
 * Measured in the dock's own type — `Tónina H` is a pixel past `Tónina C`, and
 * `#` a pixel past `b`.
 */
const WIDEST_NOTE = 'H#'

type MobileSongDockProps = {
	variant: ExtendedVariantPack
	sheet: Sheet
	song: SongDto
	showChords: boolean
	onToggleChords: (show: boolean) => void
	transpose: (i: number) => void
	reloadSong: () => void
	onEditClick: (editable: boolean) => Promise<void>
	saving: boolean
	editedTitle: string
	isOwner: boolean
	anyChange: boolean
}

/**
 * Phone-only floating control dock for the song page (the V12 layout): a
 * detached white bar above the tab bar — [print, like] | [− key +] | [options
 * menu]. Everything that doesn't fit the dock (the chords toggle, presentation,
 * edit, create copy…) lives in the options menu, keeping behavior parity with
 * the desktop TopPanel. Portalled into the tab bar's slot so it stacks above
 * the bar via layout. Desktop keeps the classic TopPanel; this renders instead
 * of it on phones (outside edit mode, which brings the TopPanel back for its
 * save/cancel UI).
 */
export default function MobileSongDock(props: MobileSongDockProps) {
	const { user, isLoggedIn } = useAuth()
	const tTranspose = useTranslations('songPage.transpose')
	const tHide = useTranslations('songPage.hideChords')
	const tTopPanel = useTranslations('songPage.topPanel')
	const tPrint = useTranslations('songPage.print')
	const tNote = useTranslations('userNote')

	const [noteOpen, setNoteOpen] = useState(false)
	const [playlistAnchor, setPlaylistAnchor] = useState<null | HTMLElement>(null)

	const [tabBarSlot, setTabBarSlot] = useState<HTMLElement | null>(null)
	useEffect(() => {
		setTabBarSlot(document.getElementById(ABOVE_TABBAR_SLOT_ID))
	}, [])

	const hasChords = Boolean(props.sheet?.getKeyChord())
	const keyNote = props.sheet?.getKeyNote() || null

	const isOwner = props.isOwner

	const onPrintClick = () => {
		const url = getReplacedUrlWithParams(
			routesPaths['variantPdf'],
			{
				...parseVariantAlias(props.variant.packAlias),
				hideChords: !props.showChords,
				key: props.sheet?.getKeyNote() || undefined,
			},
			{ returnFormat: 'absolute' }
		)
		printDocumentByUrl(url)
	}

	if (!tabBarSlot) return null

	return createPortal(
		<>
			{/* the options menu carries everything that doesn't fit the dock —
			    mirrors the desktop TopPanel's extra actions */}
			{/* Chords are a setting, not an action: you turn them on for the song you
			    are about to play and then leave them alone, so the dock's one open
			    slot goes to printing instead — the thing you reach for while holding
			    the phone. The item still shows which way it is set. */}
			{hasChords && (
				<SmartPortalMenuItem
					title={props.showChords ? tHide('hide') : tHide('show')}
					icon={props.showChords ? <MusicNoteRounded /> : <MusicOffRounded />}
					onClick={() => props.onToggleChords(!props.showChords)}
				/>
			)}
			<SmartPortalMenuItem
				title={tTopPanel('presentationItem.title')}
				subtitle={tTopPanel('presentationItem.subtitle')}
				to="variantCards"
				toParams={{
					...parseVariantAlias(props.variant.packAlias),
					key: props.sheet.getKeyNote() ?? undefined,
				}}
				icon={<FeaturedPlayList />}
			/>
			{/* on phones EditButton renders as an options-menu item */}
			{isOwner && !props.variant.public && (
				<EditButton
					onClick={props.onEditClick}
					inEditMode={false}
					sheetData={props.sheet?.getOriginalSheetData() || ''}
					title={props.editedTitle}
					anyChange={props.anyChange}
				/>
			)}
			{/* on phones this renders as an options-menu item too */}
			{isLoggedIn() && <CreateCopyButton packGuid={props.variant.packGuid} />}
			{/* the private note opens from the menu (its popup is rendered below) */}
			{user && (
				<SmartPortalMenuItem
					title={tNote('title')}
					icon={<AddComment />}
					onClick={() => setNoteOpen(true)}
				/>
			)}

			<Box
				sx={{
					marginX: 2,
					marginBottom: 1.5,
					bgcolor: 'background.paper',
					borderRadius: 3,
					boxShadow: '0 6px 24px rgba(0,0,0,0.16)',
					display: 'flex',
					alignItems: 'center',
					// every control is a direct child, so the gaps between all of
					// them (including around the transpose pill) stay equal on any
					// device width
					justifyContent: 'space-between',
					paddingX: 1.5,
					height: 58,
				}}
			>
				<IconButton tooltip={tPrint('tooltip')} onClick={onPrintClick}>
					<Print fontSize="small" sx={{ color: 'grey.700' }} />
				</IconButton>
				{user && (
					<HeartLikeButton packGuid={props.variant.packGuid} interactable />
				)}

				{hasChords && (
					<Box
						sx={{
							display: 'flex',
							alignItems: 'center',
							gap: 0.25,
							bgcolor: 'grey.100',
							borderRadius: 5,
							paddingX: 0.5,
							height: 42,
						}}
					>
						<IconButton
							tooltip={tTranspose('decrease')}
							onClick={() => props.transpose(-1)}
						>
							<RemoveRounded />
						</IconButton>
						{/* The label is what used to make the pill breathe: an accidental
						    is nine pixels of type, so the pill — and every control it
						    pushes along the dock — shifted a little each time you
						    transposed, under the thumb doing the transposing. The cell
						    keeps the width of the widest label this language can print
						    and the real one is centred in it, so nothing moves. A width
						    in pixels would not do: the word is `Tónina` here, `Tonacja`
						    and `Key` in the other two catalogs. */}
						<Box
							sx={{
								display: 'grid',
								justifyItems: 'center',
								alignItems: 'center',
								minWidth: 54,
							}}
						>
							<Typography
								strong
								noWrap
								sx={{ gridArea: '1 / 1', visibility: 'hidden' }}
							>
								{tTranspose('keyWithNote', { note: WIDEST_NOTE })}
							</Typography>
							<Typography strong noWrap sx={{ gridArea: '1 / 1' }}>
								{keyNote
									? tTranspose('keyWithNote', { note: keyNote })
									: tTranspose('title')}
							</Typography>
						</Box>
						<IconButton
							tooltip={tTranspose('increase')}
							onClick={() => props.transpose(1)}
						>
							<AddRounded />
						</IconButton>
					</Box>
				)}

				{isLoggedIn() && (
					<IconButton
						tooltip={tTopPanel('addToPlaylist')}
						onClick={(e) => setPlaylistAnchor(e.currentTarget)}
					>
						<PlaylistAddRounded fontSize="small" sx={{ color: 'grey.700' }} />
					</IconButton>
				)}
				{/* the dock is at the bottom of the screen, so its menus open upward
				    onto their button rather than being slid away from it */}
				<SongsOptionsButton
					openAbove
					reloadSong={props.reloadSong}
					variant={props.variant}
					sheet={props.sheet}
					song={props.song}
					onEditClick={props.onEditClick}
					isInEditMode={false}
					saving={props.saving}
					editedTitle={props.editedTitle}
					isOwner={props.isOwner}
					anyChange={props.anyChange}
				/>
			</Box>

			{/* private note popup (desktop shows it as a sticky side panel) */}
			{noteOpen && (
				<Popup open onClose={() => setNoteOpen(false)} width={360}>
					<UserNotePanel forceOpen />
				</Popup>
			)}

			{/* playlist picker anchored to the dock's playlist button */}
			<SelectPlaylistMenu
				openAbove
				open={Boolean(playlistAnchor)}
				onClose={() => setPlaylistAnchor(null)}
				anchor={playlistAnchor}
				itemComponent={(playlist: PlaylistData) => (
					<AddToPlaylistMenuItem
						key={playlist.guid}
						variant={props.variant}
						guid={playlist.guid as PlaylistGuid}
						title={playlist.title}
					/>
				)}
			/>
		</>,
		tabBarSlot
	)
}
