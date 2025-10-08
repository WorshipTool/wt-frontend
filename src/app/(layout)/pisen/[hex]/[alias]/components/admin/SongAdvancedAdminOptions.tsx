import GGFilterAdminButton from '@/app/(layout)/sub/admin/pisen/[hex]/[alias]/components/GGFilterAdminButton'
import SetTranslationTypeAdminButton from '@/app/(layout)/sub/admin/pisen/[hex]/[alias]/components/SetTranslationTypeAdminButton'
import VerifyButton from '@/app/(layout)/sub/admin/pisen/[hex]/[alias]/components/VerifyButton'
import AdminOption from '@/common/components/admin/AdminOption'
import CustomMenuItem from '@/common/components/Menu/MenuItem'
import Popup from '@/common/components/Popup/Popup'
import { Button, Divider, Typography } from '@/common/ui'
import { Menu } from '@/common/ui/mui'
import { copyToClipboard } from '@/tech/string/copy.tech'
import { ExtendedVariantPack } from '@/types/song'
import { CopyAll, NewReleases, Verified } from '@mui/icons-material'
import { Sheet } from '@pepavlin/sheet-api'
import { useTranslations } from 'next-intl'
import { useSnackbar } from 'notistack'
import React, { useCallback, useMemo, useState } from 'react'
import { SongDto } from '../../../../../../../api/dtos'
import useAuth from '../../../../../../../hooks/auth/useAuth'
import DeleteButton from '../components/DeleteButton'
import EditButton from '../components/EditButton'
import PublishButton from '../components/PublishButton'

interface AddToPlaylistButtonProps {
	sheet: Sheet
	song: SongDto
	reload: () => void
	variant: ExtendedVariantPack
	onEditClick: (editable: boolean) => void
	isInEditMode?: boolean
	editLoading: boolean
	editedTitle: string
	anyChange: boolean
}

export default function SongAdvancedAdminOptions({
	sheet,
	song,
	reload,
	variant,
	onEditClick,
	isInEditMode,
	editLoading,
	editedTitle,
	anyChange,
}: AddToPlaylistButtonProps) {
	const t = useTranslations('song.admin')
	const { isAdmin, user, apiConfiguration } = useAuth()

	const [open, setOpen] = React.useState(false)

	const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)

	const handleClick = useCallback((event: React.MouseEvent<HTMLElement>) => {
		setOpen(true)
		setAnchorEl(event.currentTarget)
	}, [])

	const handleClose = () => {
		setOpen(false)
		setAnchorEl(null)
	}

	const { enqueueSnackbar } = useSnackbar()

	const [addTagOpen, setAddTagOpen] = useState(false)
	const [addCreatorOpen, setAddCreatorOpen] = useState(false)

	const onCopyClick = () => {
		const data = sheet.getOriginalSheetData()

		copyToClipboard(data)

		enqueueSnackbar(t('dataCopied'))
	}

	const addCreator = () => {
		setAddCreatorOpen(true)
		handleClose()
	}

	const addTag = () => {
		setAddTagOpen(true)
		handleClose()
	}

	const Option = useMemo(
		() => (
			<AdminOption
				title={t('advancedOptions')}
				subtitle={t('songOptions')}
				onClick={handleClick}
				stayOpenedOnClick
			/>
		),
		[]
	)

	const [verifyPopupOpen, setVerifyPopupOpen] = useState(false)
	return (
		<>
			{Option}

			<Menu
				id="basic-menu"
				anchorEl={anchorEl}
				anchorOrigin={{
					vertical: 'bottom',
					horizontal: 'left',
				}}
				transformOrigin={{
					vertical: 'bottom',
					horizontal: 'right',
				}}
				open={open}
				onClose={handleClose}
			>
				<PublishButton variant={variant} />
				{variant.public && (
					<CustomMenuItem
						title={t('manageManualVerification')}
						icon={variant.verified ? <Verified /> : <NewReleases />}
						onClick={() => setVerifyPopupOpen(true)}
					/>
				)}
				<Divider />
				<SetTranslationTypeAdminButton />
				<GGFilterAdminButton />
				<Divider />

				{isAdmin() &&
					variant.createdByLoader && [
						<EditButton
							key={'edit-button'}
							asMenuItem
							onClick={onEditClick}
							inEditMode={isInEditMode}
							loading={editLoading}
							sheetData={sheet?.getOriginalSheetData() || ''}
							title={editedTitle}
							anyChange={anyChange}
						/>,
						<DeleteButton
							reloadSong={reload}
							variant={variant}
							asMenuItem
							key={'delete-button'}
						/>,

						<Divider key={'divider'} />,
					]}

				<CustomMenuItem
					title={t('copy')}
					onClick={onCopyClick}
					icon={<CopyAll fontSize="small" />}
				/>
			</Menu>

			<Popup
				open={verifyPopupOpen}
				onClose={() => setVerifyPopupOpen(false)}
				title={t('manualVerification')}
				subtitle={variant.title}
				actions={[
					<Button key={'cancel'} type="reset" size="small" variant="text">
{t('cancel')}
					</Button>,
					<VerifyButton variant={variant} key={'action'} />,
				]}
				width={300}
			>
				{variant.verified !== null ? (
					<>
						{variant.verified ? (
							<Typography>Píseň je manualně ověřena.</Typography>
						) : (
							<Typography>Píseň je manualně zamítnuta.</Typography>
						)}
					</>
				) : (
					<>
						<Typography>Píseň není manualně ověřena</Typography>
					</>
				)}
			</Popup>
		</>
	)
}
