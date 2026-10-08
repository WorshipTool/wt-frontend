'use client'

import AllSongAdminOptions from '@/app/(layout)/pisen/[hex]/[alias]/components/admin/AllSongAdminOptions'
import CreateCopyButton from '@/app/(layout)/pisen/[hex]/[alias]/components/components/CreateCopyButton'
import { SongEditing } from '@/app/(layout)/pisen/[hex]/[alias]/hooks/useSongEditing'
import SmartPortalMenuItem from '@/common/components/SmartPortalMenuItem/SmartPortalMenuItem'
import { useDownSize } from '@/common/hooks/useDownSize'
import { Box } from '@/common/ui'
import { Button } from '@/common/ui/Button'
import HeartLikeButton from '@/common/ui/SongCard/components/HeartLikeButton'
import { parseVariantAlias } from '@/tech/song/variant/variant.utils'
import { ExtendedVariantPack } from '@/types/song'
import { FeaturedPlayList } from '@mui/icons-material'
import { Sheet } from '@pepavlin/sheet-api'
import { useMemo } from 'react'
import { SongDto } from '../../../../../../api/dtos'
import useAuth from '../../../../../../hooks/auth/useAuth'
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
	editedTitle: string
	song: SongDto
	// variantIndex: number
	// onChangeVariant: (i:number)=>void,
	/** Edit/save behaviour, owned by the page so the phone dock shares it. */
	editing: SongEditing
	cancelEditing: () => void
	isInEditMode?: boolean
	hideChords: boolean
}

export default function TopPanel(props: TopPanelProps) {
	const { isLoggedIn, user } = useAuth()
	const tSongPage = useTranslations('songPage')
	const tCommon = useTranslations('common')
	const isOwner = useMemo(() => {
		if (!user) return false
		return props.variant.createdByGuid === user?.guid
	}, [user, props.variant])

	const { onEditClick, saving, anyChange, isValid } = props.editing

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
				<SmartPortalMenuItem
					title={tSongPage('topPanel.presentationItem.title')}
					subtitle={tSongPage('topPanel.presentationItem.subtitle')}
					to="variantCards"
					toParams={{
						...parseVariantAlias(props.variant.packAlias),
						key: props.sheet.getKeyNote() ?? undefined,
					}}
					icon={<FeaturedPlayList />}
				/>
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
