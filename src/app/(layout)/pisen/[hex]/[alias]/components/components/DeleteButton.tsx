'use client'

import { useApi } from '@/api/tech-and-hooks/useApi'
import Popup from '@/common/components/Popup/Popup'
import { Button, CircularProgress } from '@/common/ui'
import { ListItemIcon, ListItemText, MenuItem } from '@/common/ui/mui'
import { Typography } from '@/common/ui/Typography'
import { ExtendedVariantPack } from '@/types/song'
import { Delete } from '@mui/icons-material'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useSnackbar } from 'notistack'
import React from 'react'
import { useApiState } from '../../../../../../../tech/ApiState'

interface DeleteButtonProps {
	variant: ExtendedVariantPack
	reloadSong?: () => void
	asMenuItem?: boolean
}

export default function DeleteButton({
	variant,
	reloadSong,
	asMenuItem,
}: DeleteButtonProps) {
	const { enqueueSnackbar } = useSnackbar()
	const tDelete = useTranslations('songPage.delete')
	const tCommon = useTranslations('common')
	const [loading, setLoading] = React.useState(false)
	const navigate = useRouter()

	const { songDeletingApi } = useApi()

	const {
		fetchApiState,
		apiState: { loading: fetching },
	} = useApiState()

	const [dialogOpen, setDialogOpen] = React.useState(false)

	const onClick = async () => {
		if (variant.verified) {
			enqueueSnackbar(tDelete('cannotDeletePublished'))
			return
		}

		setDialogOpen(true)
		setLoading(true)
	}

	const indeedDelete = async () => {
		fetchApiState(
			async () => {
				return songDeletingApi._delete(variant.packGuid)
			},
			(result) => {
				const message = variant.title
					? tDelete('successWithTitle', { title: variant.title })
					: tDelete('success')
				enqueueSnackbar(message)
				reloadSong?.()

				// back in history
				navigate.back()
				setDialogOpen(false)
			}
		)
	}

	const yesClick = () => {
		indeedDelete()
	}

	const noClick = () => {
		if (fetching) return
		setLoading(false)
		setDialogOpen(false)
	}

	return (
		<>
			{asMenuItem ? (
				loading ? (
					<MenuItem disabled>
						<ListItemIcon>
							<CircularProgress size={`1rem`} color="inherit" />
						</ListItemIcon>
						<ListItemText
							primary={tDelete('menu.removing')}
							secondary={tDelete('menu.removeSong')}
						/>
					</MenuItem>
				) : variant.deleted ? (
					<MenuItem>
						<ListItemText>{tDelete('menu.deleted')}</ListItemText>
					</MenuItem>
				) : (
					<MenuItem
						onClick={onClick}
						sx={{
							color: 'error.main',
						}}
					>
						<ListItemIcon>
							<Delete color="error" />
						</ListItemIcon>
						<ListItemText
							primary={tDelete('menu.remove')}
							secondary={tDelete('menu.removeSubtitle')}
						/>
					</MenuItem>
				)
			) : (
				<Button
					variant="contained"
					color={'error'}
					// startIcon={<Remove/>}
					loading={loading}
					// loadingIndicator="Deleting..."
					onClick={async () => {
						onClick()
					}}
					disabled={variant.deleted}
				>
					{variant.deleted ? tDelete('button.deleted') : tDelete('button.delete')}
				</Button>
			)}

			<Popup
				open={dialogOpen}
				onClose={noClick}
				title={tDelete('dialog.title')}
				actions={
					<>
						<Button variant="outlined" onClick={noClick} disabled={fetching}>
							{tCommon('no')}
						</Button>
						<Button
							loading={fetching}
							variant="contained"
							color="error"
							onClick={yesClick}
						>
							{tCommon('yes')}
						</Button>
					</>
				}
			>
				<Typography>
					{fetching
						? tDelete('dialog.removing')
						: tDelete('dialog.confirmation')}
				</Typography>
			</Popup>
		</>
	)
}
