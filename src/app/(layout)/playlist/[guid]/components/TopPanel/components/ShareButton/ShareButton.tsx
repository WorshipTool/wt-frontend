import useInnerPlaylist from '@/app/(layout)/playlist/[guid]/hooks/useInnerPlaylist'
import SmartPortalMenuItem from '@/common/components/SmartPortalMenuItem/SmartPortalMenuItem'
import { useDownSize } from '@/common/hooks/useDownSize'
import { Button } from '@/common/ui/Button'

import { getRouteUrlWithParams } from '@/routes/tech/transformer.tech'
import { Share } from '@mui/icons-material'
import { useSnackbar } from 'notistack'
import { useMemo } from 'react'
import { useTranslations } from 'next-intl'

export default function ShareButton() {
	const { guid, title, save } = useInnerPlaylist()
	const url = useMemo(() => getRouteUrlWithParams('playlist', { guid }), [guid])
	const t = useTranslations('playlist')

	const { enqueueSnackbar } = useSnackbar()

	const isSmall = useDownSize('md')

	const onShare = async () => {
		await save()
		if (navigator.share) {
			navigator
				.share({
					title: title + ' - Playlist',
					url: url,
				})
				.then(() => {})
				.catch(console.error)
		}
		navigator.clipboard.writeText(url)

		enqueueSnackbar(t('linkCopiedToClipboard'), {})
	}

	return isSmall ? (
		<>
			<SmartPortalMenuItem
				title={t('share')}
				icon={<Share />}
				onClick={onShare}
			/>
		</>
	) : (
		<Button
			endIcon={<Share />}
			color="secondary"
			size={'small'}
			onClick={onShare}
		>
			{t('share')}
		</Button>
	)
}