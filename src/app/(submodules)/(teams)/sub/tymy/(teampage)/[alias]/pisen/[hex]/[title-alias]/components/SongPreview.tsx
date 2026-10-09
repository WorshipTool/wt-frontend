'use client'
import { CreatedType } from '@/api/dtos'
import { EditVariantOutDto } from '@/api/generated'
import { useApi } from '@/api/tech-and-hooks/useApi'
import AddToPlaylistButton from '@/app/(layout)/pisen/[hex]/[alias]/components/components/AddToPlaylistButton/AddToPlaylistButton'
import PrintVariantButton from '@/app/(layout)/pisen/[hex]/[alias]/components/components/PrintButton'
import TransposePanel from '@/app/(layout)/pisen/[hex]/[alias]/components/TransposePanel'
import UserNotePanel from '@/app/(layout)/pisen/[hex]/[alias]/components/UserNotePanel'
import EditButtonsPanel from '@/app/(submodules)/(teams)/sub/tymy/(teampage)/[alias]/pisen/[hex]/[title-alias]/components/EditButtonsPanel'
import MoreTeamSongButton from '@/app/(submodules)/(teams)/sub/tymy/(teampage)/[alias]/pisen/[hex]/[title-alias]/components/MoreTeamSongButton'
import TeamNotePanel from '@/app/(submodules)/(teams)/sub/tymy/(teampage)/[alias]/pisen/[hex]/[title-alias]/components/TeamNotePanel'
import useInnerTeam from '@/app/(submodules)/(teams)/sub/tymy/(teampage)/hooks/useInnerTeam'
import { TeamPermissions } from '@/app/(submodules)/(teams)/sub/tymy/tech'
import SheetDisplay from '@/common/components/SheetDisplay/SheetDisplay'
import SmartPortalMenuItem from '@/common/components/SmartPortalMenuItem/SmartPortalMenuItem'
import { SURFACE_CARD_SX } from '@/common/constants/surfaces'
import { useDownSize } from '@/common/hooks/useDownSize'
import { Box } from '@/common/ui'
import { Button } from '@/common/ui/Button'
import HeartLikeButton from '@/common/ui/SongCard/components/HeartLikeButton'
import useAuth from '@/hooks/auth/useAuth'
import { usePermission } from '@/hooks/permissions/usePermission'
import { useSmartUrlState } from '@/hooks/urlstate/useUrlState'
import { useSmartNavigate } from '@/routes/useSmartNavigate'
import { useSmartParams } from '@/routes/useSmartParams'
import { useApiState } from '@/tech/ApiState'
import { ExtendedVariantPack } from '@/types/song'
import { Sheet } from '@pepavlin/sheet-api'
import { useCallback, useRef, useState } from 'react'

type SongPreviewProps = {
	variant: ExtendedVariantPack
}

export default function SongPreview({ variant }: SongPreviewProps) {
	const { guid: teamGuid, alias: teamAlias } = useInnerTeam()

	const { 'title-alias': titleAlias, hex } = useSmartParams('teamSong')
	const [inEditMode, setInEditMode] = useSmartUrlState('teamSong', 'edit', {
		parse: (v) => v === 'true',
		stringify: (v) => (v ? 'true' : 'false'),
	})

	const hasPermissionToEdit = usePermission<TeamPermissions>(
		'team.edit_songs',
		{
			teamGuid,
		}
	)

	const navigate = useSmartNavigate()

	const { user } = useAuth()

	const [hideChords, setHideChords] = useState(false)

	const [sheet, setSheet] = useState<Sheet>(new Sheet(variant.sheetData))

	const [justNumber, setJustNumber] = useState(0)
	const rerender = useCallback(() => {
		setJustNumber(justNumber + 1)
	}, [justNumber])

	const editedSheetData = useRef<string | null>(null)
	const editedTitle = useRef<string | null>(null)
	const onSheetChange = useCallback((sheetData: string, title: string) => {
		editedSheetData.current = sheetData
		editedTitle.current = title
	}, [])

	const {
		fetchApiState,
		apiState: { loading: saving },
	} = useApiState<EditVariantOutDto>()
	const { songEditingApi } = useApi()

	const onSave = useCallback(() => {
		if (editedSheetData.current) {
			const sheet = new Sheet(editedSheetData.current)
			setSheet(sheet)
		}

		const newData = {
			title:
				editedTitle.current !== variant.title ? editedTitle.current : undefined,
			sheetData:
				editedSheetData.current !== variant.sheetData
					? editedSheetData.current
					: undefined,
		}

		// Save data
		fetchApiState(
			async () => {
				return songEditingApi.editVariant({
					variantAlias: variant.packAlias,
					createdType: CreatedType.Manual,
					title: newData.title || undefined,
					sheetData: newData.sheetData || undefined,
				})
			},
			() => {
				if (newData.title) {
					navigate(
						'teamSong',
						{
							alias: teamAlias,
							hex,
							'title-alias': titleAlias,
							edit: false,
						},
						{
							replace: true,
						}
					)
				}
			}
		)
	}, [editedSheetData, editedTitle, variant])

	const onCancel = useCallback(() => {
		editedSheetData.current = null
		editedTitle.current = null
	}, [])

	const isSmall = useDownSize('md')
	const isLarger = useDownSize('lg')

	return (
		<Box
			sx={{
				...SURFACE_CARD_SX,
				padding: 4,
				borderRadius: 2,
				position: 'relative',
				display: 'flex',
				flexDirection: 'row',
				gap: 2,
				flexWrap: 'wrap-reverse',
				alignItems: 'start',
			}}
		>
			<Box display={'flex'} flexDirection={'column'} flex={1} gap={2}>
				{!inEditMode ? (
					<Box
						display={'flex'}
						gap={1}
						justifyContent={'space-between'}
						flexWrap={'wrap-reverse'}
					>
						{sheet.getKeyChord() ? (
							<Box display={'flex'} gap={1}>
								<TransposePanel
									disabled={hideChords}
									transpose={function (i: number): void {
										sheet.transpose(i)
										rerender()
									}}
								/>
								{!isLarger ? (
									hideChords ? (
										<Button
											onClick={() => setHideChords(false)}
											variant="text"
											size="small"
										>
											Zobrazit akordy
										</Button>
									) : (
										<Button
											onClick={() => setHideChords(true)}
											variant="text"
											color="grey.600"
											size="small"
										>
											Skrýt akordy
										</Button>
									)
								) : hideChords ? (
									<SmartPortalMenuItem
										title={'Zobrazit akordy'}
										onClick={() => setHideChords(false)}
									/>
								) : (
									<SmartPortalMenuItem
										title={'Skrýt akordy'}
										onClick={() => setHideChords(true)}
									/>
								)}
							</Box>
						) : (
							<Box />
						)}
						<Box
							display={'flex'}
							maxHeight={'2rem'}
							alignItems={'stretch'}
							gap={1}
						>
							{user && (
								<>
									<Box display={'flex'} gap={1}>
										<HeartLikeButton
											packGuid={variant.packGuid}
											interactable
											small
										/>
										{!isSmall ? (
											<></>
										) : (
											<>
												<PrintVariantButton
													params={{
														hex,
														alias: titleAlias,
														hideChords: hideChords,
														key: sheet.getKeyNote() || undefined,
													}}
													size="small"
												/>
											</>
										)}
										<MoreTeamSongButton />
									</Box>
									<AddToPlaylistButton variant={variant} />
								</>
							)}
							{!inEditMode && !isSmall && (
								<>
									<PrintVariantButton
										params={{
											hex,
											alias: titleAlias,
											hideChords: hideChords,
											key: sheet.getKeyNote() || undefined,
										}}
										size="small"
									/>
								</>
							)}

							{hasPermissionToEdit && (
								<EditButtonsPanel
									inEditMode={Boolean(inEditMode)}
									setInEditMode={setInEditMode}
									variant={variant}
									onSave={onSave}
									onCancel={onCancel}
									saving={saving}
								/>
							)}
						</Box>
					</Box>
				) : (
					<Box>
						{hasPermissionToEdit && (
							<EditButtonsPanel
								inEditMode={inEditMode}
								setInEditMode={setInEditMode}
								variant={variant}
								onSave={onSave}
								onCancel={onCancel}
								saving={saving}
							/>
						)}
					</Box>
				)}
				<Box
					display={'flex'}
					justifyContent={'space-between'}
					flexWrap={'wrap'}
					gap={2}
				>
					<Box
						sx={{
							flex: inEditMode ? 1 : undefined,
						}}
					>
						<SheetDisplay
							sheet={sheet}
							hideChords={hideChords}
							editMode={Boolean(inEditMode)}
							title={inEditMode ? variant.title : undefined}
							onChange={onSheetChange}
						/>
					</Box>
					{user && !inEditMode && (
						<Box
							sx={{
								position: 'sticky',
								top: 16,
								alignSelf: 'flex-start',
								display: 'flex',
								flexDirection: 'column',
								gap: 2,
								flexBasis: 300,
							}}
						>
							<TeamNotePanel />
							<UserNotePanel />
						</Box>
					)}
				</Box>
			</Box>
		</Box>
	)
}
