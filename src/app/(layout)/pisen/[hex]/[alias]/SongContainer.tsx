'use client'
// 'use server'
import { useIsPhone } from '@/common/hooks/useIsPhone'
import AdditionalSongInfoPanel from '@/app/(layout)/pisen/[hex]/[alias]/components/AdditionalSongInfoPanel'
import DeletedInfoPanel from '@/app/(layout)/pisen/[hex]/[alias]/components/components/DeletedInfoPanel'
import { SONG_OPTIONS_BUTTON_ID } from '@/app/(layout)/pisen/[hex]/[alias]/components/components/SongsOptionsButton'
import AllSongAdminOptions from '@/app/(layout)/pisen/[hex]/[alias]/components/admin/AllSongAdminOptions'
import HideChordsButton from '@/app/(layout)/pisen/[hex]/[alias]/components/HideChordsButton'
import MobileSongDock from '@/app/(layout)/pisen/[hex]/[alias]/components/MobileSongDock'
import TopPanel from '@/app/(layout)/pisen/[hex]/[alias]/components/TopPanel'
import UserNotePanel from '@/app/(layout)/pisen/[hex]/[alias]/components/UserNotePanel'
import { InnerPackProvider } from '@/app/(layout)/pisen/[hex]/[alias]/hooks/useInnerPack'
import { useSongEditing } from '@/app/(layout)/pisen/[hex]/[alias]/hooks/useSongEditing'
import { useBlockAppReload } from '@/app/components/appReloadGuard'
import { MobileAppHeader } from '@/common/components/MobileAppHeader'
import SheetDisplay from '@/common/components/SheetDisplay/SheetDisplay'
import { SmartPortalMenuProvider } from '@/common/components/SmartPortalMenuItem/SmartPortalMenuProvider'
import { Box, Gap, Typography } from '@/common/ui'
import { CONTENT_CARD_SX } from '@/common/ui/GroupList'
import useAuth from '@/hooks/auth/useAuth'
import { useRerender } from '@/hooks/useRerender'
import { ExtendedVariantPack } from '@/types/song'
import { Sheet } from '@pepavlin/sheet-api'
import { useEffect, useMemo, useState } from 'react'
import { SongDto } from '../../../../../api/dtos'

export type SongPageProps = {
	variant: ExtendedVariantPack
	song: SongDto
	flags: {
		showMedia: boolean
	}
}

export default function SongContainer({
	variant,
	song,
	...props
}: SongPageProps) {
	const sheet = useMemo(() => {
		return new Sheet(variant.sheetData)
	}, [variant.sheetData])

	const title = useMemo(() => {
		return variant.title
	}, [variant.title])

	const [showChords, setShowChords] = useState(true)

	const { user } = useAuth()

	// phone: the classic TopPanel is replaced by the floating bottom dock
	// (except in edit mode, which keeps the TopPanel's save/cancel UI)
	const phoneVersion = useIsPhone()

	const isOwner = useMemo(() => {
		if (!user) return false
		return variant.createdByGuid === user.guid
	}, [user, variant])

	const rerender = useRerender()

	// Current sheet
	const [currentSheet, setCurrentSheet] = useState<Sheet>(sheet)
	useEffect(() => {
		if (sheet) setCurrentSheet(sheet)
	}, [sheet])

	// Current title
	const [editedTitle, setEditedTitle] = useState(title)
	useEffect(() => {
		if (title) setEditedTitle(title)
	}, [title])

	const transpose = (value: number) => {
		if (currentSheet) {
			currentSheet.transpose(value)
			rerender()
		}
	}

	const reload = () => {
		window?.location.reload()
	}

	const [inEditMode, setInEditMode] = useState(false)

	// an auto-update reload while editing would discard the unsaved sheet
	useBlockAppReload(inEditMode, 'editing a song')

	// One source of truth for edit/save, shared by the desktop TopPanel and the
	// phone dock — including the "can't edit a published song" guard.
	const editing = useSongEditing({
		variant,
		sheet: currentSheet,
		editedTitle,
		setEditMode: setInEditMode,
	})

	const cancelEditing = () => {
		setInEditMode(false)
		setCurrentSheet(sheet)
		if (title) setEditedTitle(title)
	}

	// phone (non-edit, non-deleted): the sheet lives inside the shared
	// collapsing MobileAppHeader (back arrow + song title → slim bar on scroll),
	// matching the rest of the app. The floating dock stays pinned above the tab
	// bar. Desktop / edit / deleted keep the classic layout below.
	const usePhoneShell =
		phoneVersion && !inEditMode && !variant.deleted && Boolean(currentSheet)

	if (usePhoneShell) {
		return (
			<InnerPackProvider
				variantAlias={variant.packAlias}
				startData={{ variant, song }}
			>
				<SmartPortalMenuProvider id={SONG_OPTIONS_BUTTON_ID}>
					<MobileSongDock
						variant={variant}
						sheet={currentSheet}
						song={song as SongDto}
						showChords={showChords}
						onToggleChords={setShowChords}
						transpose={transpose}
						reloadSong={reload}
						onEditClick={editing.onEditClick}
						saving={editing.saving}
						editedTitle={editedTitle}
						isOwner={isOwner}
						anyChange={editing.anyChange}
					/>
					<AllSongAdminOptions />
					<MobileAppHeader
						title={editedTitle}
						backTo="songsList"
						surface="grey.50"
					>
						{/* the song sheet lives in a white card floating on the grey app
						    canvas (matching the rest of the app) — so short songs read as
						    an intentional card, not a big empty white void */}
						<Box
							sx={CONTENT_CARD_SX}
						>
							<SheetDisplay
								sheet={currentSheet}
								title={''}
								hideChords={!showChords}
								variant={'default'}
								editMode={false}
								onChange={(sheet, title) => {
									setCurrentSheet(new Sheet(sheet))
									setEditedTitle(title)
								}}
							/>
							<Gap value={2} />
							<AdditionalSongInfoPanel
								song={song as SongDto}
								variant={variant}
								showMedia={props.flags.showMedia}
							/>
						</Box>
						{/* clearance so a long song's end scrolls clear of the floating
						    dock (which hovers ~70px above the tab bar) */}
						<Box sx={{ height: 76 }} />
					</MobileAppHeader>
				</SmartPortalMenuProvider>
			</InnerPackProvider>
		)
	}

	return (
		<InnerPackProvider
			variantAlias={variant.packAlias}
			startData={{
				variant,
				song,
			}}
		>
			<SmartPortalMenuProvider id={SONG_OPTIONS_BUTTON_ID}>
				<Box
					display={'flex'}
					flexDirection={'column'}
					sx={
						phoneVersion
							? {
									// phone edit / deleted keep the classic layout, but the
									// page wrapper is now neutral — so restore the full-bleed
									// white reading surface + bottom clearance here
									width: '100vw',
									marginLeft: 'calc(50% - 50vw)',
									minHeight: 'calc(100dvh - env(safe-area-inset-top))',
									bgcolor: 'background.paper',
									paddingX: 2.5,
									paddingTop: 1,
									paddingBottom: 'calc(env(safe-area-inset-bottom) + 170px)',
							  }
							: undefined
					}
				>
					{(!phoneVersion || inEditMode) && (
						<TopPanel
							transpose={transpose}
							variant={variant}
							reloadSong={reload}
							editedTitle={editedTitle}
							sheet={currentSheet as Sheet}
							song={song as SongDto}
							editing={editing}
							isInEditMode={inEditMode}
							cancelEditing={cancelEditing}
							hideChords={!showChords}
						/>
					)}

					{/* admin panels normally rendered by TopPanel (hidden on phones) */}
					{phoneVersion && !inEditMode && <AllSongAdminOptions />}

					<>
						{variant && variant.deleted ? (
							<>
								<Gap value={2} />
								<DeletedInfoPanel variant={variant} reloadSong={reload} />
							</>
						) : (
							currentSheet && (
								<Box
									display={'flex'}
									flexDirection={'row'}
									flexWrap={'wrap'}
									justifyContent={'space-between'}
								>
									<Box flex={1}>
										<Gap value={0.5} />
										{!phoneVersion && currentSheet.getKeyChord() && (
											<HideChordsButton
												hiddenValue={!showChords}
												onChange={(value) => setShowChords(!value)}
											/>
										)}
										<Gap value={0.5} />
										{/* phone: a proper page header instead of the sheet's
										    small inline title (suppressed below) */}
										{phoneVersion && !inEditMode && (
											<Box sx={{ paddingTop: 1, paddingBottom: 2.5 }}>
												<Typography variant="h4" strong={800}>
													{editedTitle}
												</Typography>
											</Box>
										)}
										<SheetDisplay
											sheet={currentSheet}
											title={phoneVersion && !inEditMode ? '' : editedTitle}
											hideChords={!showChords}
											variant={'default'}
											editMode={inEditMode}
											onChange={(sheet, title) => {
												setCurrentSheet(new Sheet(sheet))
												setEditedTitle(title)
											}}
										/>
									</Box>
									{/* phone: the note lives in the dock's popup instead */}
									{!inEditMode && !phoneVersion && (
										<Box>
											{user && (
												<>
													<Gap />
													<Box
														sx={{
															position: 'sticky',
															top: 80,
															// bottom: 160,
															display: 'flex',
															flexDirection: 'column',
															alignItems: 'flex-end',
														}}
													>
														<UserNotePanel />
													</Box>
												</>
											)}
										</Box>
									)}
								</Box>
							)
						)}
					</>

					{!inEditMode && variant && !variant.deleted && (
						<>
							<Gap value={2} />
							<AdditionalSongInfoPanel
								song={song as SongDto}
								variant={variant}
								showMedia={props.flags.showMedia}
							/>
						</>
					)}
				</Box>
			</SmartPortalMenuProvider>
		</InnerPackProvider>
	)
}
