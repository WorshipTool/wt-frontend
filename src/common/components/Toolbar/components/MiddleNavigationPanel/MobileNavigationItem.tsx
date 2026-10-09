import { Box } from '@/common/ui'
import { Button } from '@/common/ui/Button'
import { RoutesKeys, SmartAllParams } from '@/routes'
import { useSmartMatch } from '@/routes/useSmartMatch'
import { useMemo } from 'react'

type MobileNavigationItemProps<T extends RoutesKeys> = {
	title: string
	enabled?: boolean
	onClick?: () => void
	to?: T
	toParams?: SmartAllParams<T>
}

export default function MobileNavigationItem<T extends RoutesKeys>(
	props: MobileNavigationItemProps<T>
) {
	const match = useSmartMatch(props.to || 'home')

	const enabled = useMemo(
		() => props.enabled ?? (props.to ? match : false),
		[props.enabled, match, props.to]
	)

	return (
		<Box
			sx={{
				pointerEvents: 'auto',
				bgcolor: enabled ? 'surface.sunken' : 'transparent',
				// bgcolor: 'grey.300',
				transition: 'background-color 0.2s',
				minWidth: 130,
			}}
			flex={1}
			padding={1}
		>
			<Button
				variant="text"
				color="inherit"
				size="small"
				to={props.to}
				toParams={props.toParams}
				onClick={props.onClick}
				sx={{
					borderRadius: 2,
				}}
			>
				{props.title}
			</Button>
		</Box>
	)
}
