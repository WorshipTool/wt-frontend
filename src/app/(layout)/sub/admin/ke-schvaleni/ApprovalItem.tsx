'use client'
import { useApi } from '@/api/tech-and-hooks/useApi'
import { Box, Button, Typography } from '@/common/ui'
import { Link } from '@/common/ui/Link/Link'
import { useApiState } from '@/tech/ApiState'
import { parseVariantAlias } from '@/tech/song/variant/variant.utils'
import { BasicVariantPack } from '@/types/song'
import { ChevronRight } from '@mui/icons-material'
import { useTranslations } from 'next-intl'

type Props = {
	pack: BasicVariantPack
}

export default function ApprovalItem({ pack }: Props) {
	const t = useTranslations('admin')
	const { songPublishingApi } = useApi()

	const { fetchApiState, apiState } = useApiState()
	const onRejectClick = async () => {
		await fetchApiState(async () =>
			songPublishingApi.rejectPublishApproval({
				packGuid: pack.packGuid,
			})
		)

		window.location.reload()
	}

	return (
		<Box
			sx={{
				bgcolor: 'grey.100',
				padding: 2,
				display: 'flex',
				flexDirection: 'row',
				justifyContent: 'space-between',
				alignItems: 'center',
			}}
		>
			<Link
				to="variant"
				params={{
					...parseVariantAlias(pack.packAlias),
				}}
				newTab
			>
				<Typography strong>{pack.title}</Typography>
			</Link>
			<Box display={'flex'} gap={1}>
				<Button small color="error" outlined onClick={onRejectClick}>
					{t('approval.reject')}
				</Button>
				<Button
					small
					endIcon={<ChevronRight />}
					to="variantPublish"
					toParams={{
						...parseVariantAlias(pack.packAlias),
					}}
				>
					{t('approval.continue')}
				</Button>
			</Box>
		</Box>
	)
}
