'use client'

import { useApi } from '@/api/tech-and-hooks/useApi'
import AllSongAdminOptions from '@/app/(layout)/pisen/[hex]/[alias]/components/admin/AllSongAdminOptions'
import CreateCopyButton from '@/app/(layout)/pisen/[hex]/[alias]/components/components/CreateCopyButton'
import { useInnerPackSong } from '@/app/(layout)/pisen/[hex]/[alias]/hooks/useInnerPack'
import { useDownSize } from '@/common/hooks/useDownSize'
import { Box, useTheme } from '@/common/ui'
import { Button } from '@/common/ui/Button'
import HeartLikeButton from '@/common/ui/SongCard/components/HeartLikeButton'
import { parseVariantAlias } from '@/tech/song/variant/variant.utils'
import { ExtendedVariantPack } from '@/types/song'
import { Sheet } from '@pepavlin/sheet-api'
import { useSnackbar } from 'notistack'
import { useMemo } from 'react'
import {
	CreatedType,
	SongDto,
	VariantPackAlias,
} from '../../../../../../api/dtos'
import {
	EditVariantOutDto,
	PostEditVariantInDto,
} from '../../../../../../api/generated'
import useAuth from '../../../../../../hooks/auth/useAuth'
import { useSmartNavigate } from '../../../../../../routes/useSmartNavigate'
import { useApiState } from '../../../../../../tech/ApiState'
import { isSheetDataValid } from '../../../../../../tech/sheet.tech'
import NotValidWarning from '../../../../vytvorit/napsat/components/NotValidWarning'
import AddToPlaylistButton from './components/AddToPlaylistButton/AddToPlaylistButton'
import EditButton from './components/EditButton'
import PrintVariantButton from './components/PrintButton'
import SongsOptionsButton from './components/SongsOptionsButton'
import TransposePanel from './TransposePanel'
import { useTranslations } from 'next-intl'

interface TopPanelProps {
	transpose: (i: number) => void
	variant: ExtendedVariantPack
	reloadSong: () => void
	sheet: Sheet
	title: string
	editedTitle: string
	song: SongDto
	// variantIndex: number
	// onChangeVariant: (i:number)=>void,
	onEditClick?: (editable: boolean) => Promise<void>
	cancelEditing: () => void
	isInEditMode?: boolean
	hideChords: boolean
}

export default function TopPanel(props: TopPanelProps) {
	const { isAdmin, isTrustee, isLoggedIn, user, apiConfiguration } = useAuth()
	const tSongPage = useTranslations('songPage')
	const tCommon = useTranslations('common')
	const isOwner = useMemo(() => {
		if (!user) return false
		return props.variant.createdByGuid === user?.guid
	}, [user, props.variant])

	const { song } = useInnerPackSong()

	const { enqueueSnackbar } = useSnackbar()
	const navigate = useSmartNavigate()

	const { songEditingApi } = useApi()
	const {
		fetchApiState,
		apiState: { loading: saving },
	} = useApiState<EditVariantOutDto>()

	const anyChange = useMemo(() => {
		const t = props.variant.title !== props.editedTitle
		const s =
			new Sheet(props.variant?.sheetData).toString() !== props.sheet?.toString()
		return t || s
	}, [props.sheet, props.editedTitle, props.variant])

	const onEditClick = async (editable: boolean) => {
		if (editable) {
			if (props.variant.verified) {
				enqueueSnackbar(tSongPage('topPanel.cannotEditPublished'))
				return
			}
			await props.onEditClick?.(editable)
			return
		}

		const body: PostEditVariantInDto = {
			variantAlias: props.variant.packAlias,
			sheetData: props.sheet.getOriginalSheetData(),
			title: props.title,
			createdType: CreatedType.Manual,
		}
		fetchApiState(
			async () => {
				return await songEditingApi.editVariant(body)
			},
			async (result) => {
				await props.onEditClick?.(editable)
				const message = props.variant.title
					? tSongPage('topPanel.updateSuccess.withTitle', {
							title: props.variant.title,
					  })
					: tSongPage('topPanel.updateSuccess.withoutTitle')
				enqueueSnackbar(message)
				navigate('variant', {
					...parseVariantAlias(result.alias as VariantPackAlias),
				})
			}
		)
	}

	const theme = useTheme()

	const isValid = useMemo(() => {
		if (!props.sheet) return false
		const data = props.sheet?.toString()
		return isSheetDataValid(data)
	}, [props.sheet, props.sheet?.toString()])

	const isSmall = useDownSize('md')

	return (
		<>
			<Box
				sx={{
					display: 'flex',
					flexDirection: 'row',
					alignItems: 'center',
					gap: 1,
				}}
			>
				{props.isInEditMode ? (
					<>
						{isValid ? <Box flex={1} /> : <NotValidWarning />}

						<Button
							onClick={() => props.cancelEditing()}
							color="info"
							variant="outlined"
						>
							{tCommon('cancel')}
						</Button>

						<EditButton
							onClick={onEditClick}
							inEditMode={props.isInEditMode}
							loading={saving}
							sheetData={props.sheet?.getOriginalSheetData() || ''}
							title={props.editedTitle}
							anyChange={anyChange}
						/>
					</>
				) : props.variant.deleted ? (
					<></>
				) : (
					<>
						<TransposePanel
							transpose={props.transpose}
							disabled={!Boolean(props.sheet?.getKeyChord())}
						/>
						{/* {isOwner && <VisibilityLabel public={props.variant.public} />} */}
						<Box flex={1} />
						{/* {isOwner && <VisibilityLabel public={props.variant.public} right />} */}
						<Box display={'flex'} alignItems={'center'}>
							{user && (
								<HeartLikeButton
									packGuid={props.variant.packGuid}
									interactable
								/>
							)}

							{isSmall && (
								<PrintVariantButton
									params={{
										...parseVariantAlias(props.variant.packAlias),
										hideChords: props.hideChords,
										key: props.sheet?.getKeyNote() || undefined,
									}}
								/>
							)}

							<SongsOptionsButton
								reloadSong={props.reloadSong}
								variant={props.variant}
								sheet={props.sheet}
								song={props.song}
								onEditClick={onEditClick}
								isInEditMode={props.isInEditMode}
								saving={saving}
								editedTitle={props.editedTitle}
								isOwner={isOwner}
								anyChange={anyChange}
							/>
						</Box>
						{isLoggedIn() && (
							<CreateCopyButton packGuid={props.variant.packGuid} />
						)}
						{isOwner && !props.variant.public && (
							<EditButton
								onClick={onEditClick}
								inEditMode={props.isInEditMode}
								loading={saving}
								sheetData={props.sheet?.getOriginalSheetData() || ''}
								anyChange={anyChange}
								title={props.editedTitle}
							/>
						)}
						{isLoggedIn() && <AddToPlaylistButton variant={props.variant} />}
						{!isSmall && (
							<PrintVariantButton
								params={{
									...parseVariantAlias(props.variant.packAlias),
									hideChords: props.hideChords,
									key: props.sheet?.getKeyNote() || undefined,
								}}
							/>
						)}
					</>
				)}
			</Box>

			<AllSongAdminOptions />

			{/* {props.variant.public && (
				<>
					{!props.variant.language && (
						<>
							<AdminOption
								title={tSongPage('admin.generateLanguage')}
								subtitle={tSongPage('admin.generateLanguageSubtitle')}
								onClick={generateLanguage}
								loading={languageGenerating}
								icon={<Language />}
								notify
							/>
						</>
					)}
					{(!song.tags || song.tags.length === 0) && (
						<>
							<AdminOption
								title={tSongPage('admin.generateKeywords')}
								subtitle={tSongPage('admin.generateKeywordsSubtitle')}
								onClick={generateKeyword}
								loading={keywordsGenerating}
								icon={<Polyline />}
								notify
							/>
						</>
					)}
				</>
			)} */}
		</>
	)
}
