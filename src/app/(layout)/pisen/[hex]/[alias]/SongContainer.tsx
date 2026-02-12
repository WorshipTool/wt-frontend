'use client'
// 'use server'
import AdditionalSongInfoPanel from '@/app/(layout)/pisen/[hex]/[alias]/components/AdditionalSongInfoPanel'
import DeletedInfoPanel from '@/app/(layout)/pisen/[hex]/[alias]/components/components/DeletedInfoPanel'
import { SONG_OPTIONS_BUTTON_ID } from '@/app/(layout)/pisen/[hex]/[alias]/components/components/SongsOptionsButton'
import HideChordsButton from '@/app/(layout)/pisen/[hex]/[alias]/components/HideChordsButton'
import TopPanel from '@/app/(layout)/pisen/[hex]/[alias]/components/TopPanel'
import UserNotePanel from '@/app/(layout)/pisen/[hex]/[alias]/components/UserNotePanel'
import MobileTransposeControls from '@/app/(layout)/pisen/[hex]/[alias]/components/MobileTransposeControls'
import { InnerPackProvider } from '@/app/(layout)/pisen/[hex]/[alias]/hooks/useInnerPack'
import SheetDisplay from '@/common/components/SheetDisplay/SheetDisplay'
import { SmartPortalMenuProvider } from '@/common/components/SmartPortalMenuItem/SmartPortalMenuProvider'
import { Box, Gap } from '@/common/ui'
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

	// Track original key for reset functionality
	const originalKey = useMemo(() => {
		if (!sheet) return undefined
		const keyChord = sheet.getKeyChord()
		if (!keyChord) return undefined

		const root = keyChord.data.rootNote.toString('sharp')
		const quality = keyChord.data.quality

		let signature: 'sharp' | 'flat' = 'sharp'
		if (root === 'A#') signature = 'flat'
		if (root === 'C' && quality === 'm') signature = 'flat'
		if (root === 'D' && quality === 'm') signature = 'flat'
		if (root === 'F') signature = 'flat'

		const noteString = keyChord.data.rootNote.toString(signature)
		const qualityString = quality === 'm' ? ' mol' : ' dur'

		return noteString + qualityString
	}, [sheet])

	const transpose = (value: number) => {
		if (currentSheet) {
			currentSheet.transpose(value)
			rerender()
		}
	}

	const resetTranspose = () => {
		// Reset to original sheet to restore original key
		if (sheet) {
			setCurrentSheet(new Sheet(sheet.getOriginalSheetData()))
			rerender()
		}
	}

	const reload = () => {
		window?.location.reload()
	}

	const [inEditMode, setInEditMode] = useState(false)

	const onEditClick = async (editable: boolean) => {
		setInEditMode(editable)
	}

	const cancelEditing = () => {
		setInEditMode(false)
		setCurrentSheet(sheet)
		if (title) setEditedTitle(title)
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
				<Box display={'flex'} flexDirection={'column'}>
					<TopPanel
						transpose={transpose}
						variant={variant}
						reloadSong={reload}
						title={editedTitle}
						editedTitle={editedTitle}
						sheet={currentSheet as Sheet}
						song={song as SongDto}
						onEditClick={onEditClick}
						isInEditMode={inEditMode}
						cancelEditing={cancelEditing}
						hideChords={!showChords}
					/>

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
										{currentSheet.getKeyChord() && (
											<HideChordsButton
												hiddenValue={!showChords}
												onChange={(value) => setShowChords(!value)}
											/>
										)}
										<Gap value={0.5} />
										<SheetDisplay
											sheet={currentSheet}
											title={editedTitle}
											hideChords={!showChords}
											variant={'default'}
											editMode={inEditMode}
											onChange={(sheet, title) => {
												setCurrentSheet(new Sheet(sheet))
												setEditedTitle(title)
											}}
										/>
									</Box>
									{!inEditMode && (
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

					{/* Mobile transpose controls - fixed at bottom */}
					{!inEditMode && currentSheet && currentSheet.getKeyChord() && (
						<MobileTransposeControls
							transpose={transpose}
							reset={resetTranspose}
							disabled={!Boolean(currentSheet.getKeyChord())}
							sheet={currentSheet}
							originalKey={originalKey}
						/>
					)}
				</Box>
			</SmartPortalMenuProvider>
		</InnerPackProvider>
	)
}
