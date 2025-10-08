import useInnerPlaylist from '@/app/(layout)/playlist/[guid]/hooks/useInnerPlaylist'
import SmartPortalMenuItem from '@/common/components/SmartPortalMenuItem/SmartPortalMenuItem'
import { useTheme } from '@/common/ui'
import { Button } from '@/common/ui/Button'
import { useMediaQuery } from '@/common/ui/mui'
import { RoutesKeys, SmartAllParams } from '@/routes'
import { ViewCarousel } from '@mui/icons-material'
import { useTranslations } from 'next-intl'

type PresentationButtonProps<T extends RoutesKeys> = {
	to: T
	toParams: SmartAllParams<T>
}

export default function PresentationButton<T extends RoutesKeys>(
	props: PresentationButtonProps<T>
) {
	const { guid, save, items } = useInnerPlaylist()
	const t = useTranslations('playlist')

	const theme = useTheme()
	const isSmall = useMediaQuery(theme.breakpoints.down('lg'))

	const disabled = items.length === 0

	return isSmall ? (
		<>
			<SmartPortalMenuItem
				title={t('presentation')}
				onClick={save}
				disabled={disabled}
				to={props.to}
				toParams={props.toParams}
				icon={<ViewCarousel />}
			/>
		</>
	) : (
		<>
			<Button
				size="small"
				variant="outlined"
				to={props.to}
				toParams={props.toParams}
				onClick={save}
				disabled={disabled}
			>
				{t('presentation')}
			</Button>
		</>
	)
}
