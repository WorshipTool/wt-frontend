import useInnerPlaylist from '@/app/(layout)/playlist/[guid]/hooks/useInnerPlaylist'
import { openNewPrintWindow } from '@/app/(nolayout)/(print)/print.tech'
import { useDownSize } from '@/common/hooks/useDownSize'
import { IconButton } from '@/common/ui'
import { Button } from '@/common/ui/Button'
import { SmartAllParams, routesPaths } from '@/routes'
import { getReplacedUrlWithParams } from '@/routes/tech/transformer.tech'
import { Print } from '@mui/icons-material'
import { useTranslations } from 'next-intl'

export default function PrintButton() {
	const { guid, save, items } = useInnerPlaylist()
	const t = useTranslations('playlist')

	const onPrint = async () => {
		await save()

		const urlPattern = routesPaths.playlistPrint
		const printParams: SmartAllParams<'playlistPrint'> = {
			guid,
			landscapeMode: false,
		}
		const url = getReplacedUrlWithParams(urlPattern, printParams, {
			returnFormat: 'absolute',
		})

		openNewPrintWindow(url)
	}

	const isSmall = useDownSize('sm')
	const disabled = items.length === 0

	return isSmall ? (
		<IconButton
			onClick={onPrint}
			disabled={disabled}
			variant="contained"
			color="primary"
		>
			<Print />
		</IconButton>
	) : (
		<Button
			startIcon={<Print />}
			size="small"
			onClick={onPrint}
			disabled={disabled}
		>
			{t('print')}
		</Button>
	)
}
