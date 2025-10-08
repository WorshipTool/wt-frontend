import { useApi } from '@/api/tech-and-hooks/useApi'
import { Box, Button, Typography } from '@/common/ui'
import { BasicVariantPack } from '@/types/song'
import { Restore } from '@mui/icons-material'
import { useSnackbar } from 'notistack'
import { useTranslations } from 'next-intl'
import { Gap } from '../../../../../../../common/ui/Gap'
import useAuth from '../../../../../../../hooks/auth/useAuth'
import { useApiState } from '../../../../../../../tech/ApiState'

interface DeletedInfoPanelProps {
	variant: BasicVariantPack
	reloadSong: () => void
}

export default function DeletedInfoPanel({
	variant,
	reloadSong,
}: DeletedInfoPanelProps) {
	const { isAdmin, apiConfiguration } = useAuth()
	const { enqueueSnackbar } = useSnackbar()
	const t = useTranslations('song')

	const { songDeletingApi } = useApi()
	const {
		fetchApiState,
		apiState: { loading },
	} = useApiState()
	const restore = () => {
		fetchApiState(
			async () => {
				return songDeletingApi.restore(variant.packGuid)
			},
			() => {
				enqueueSnackbar(t('deleted.restored', { title: variant.title || '' }))
				reloadSong?.()
			}
		)
	}
	return (
		<Box
			sx={{
				display: 'flex',
				flexDirection: 'row',
				alignItems: 'center',
			}}
		>
			<Typography color="error">{t('deleted.message')}</Typography>
			<Gap value={2} horizontal />
			{isAdmin() && (
				<>
					<Button
						variant="contained"
						color="secondary"
						startIcon={<Restore />}
						loading={loading}
						onClick={restore}
					>
						{t('deleted.restore')}
					</Button>
				</>
			)}
		</Box>
	)
}
