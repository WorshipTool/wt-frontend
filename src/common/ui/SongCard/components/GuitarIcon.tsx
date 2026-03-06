import { Tooltip } from '@/common/ui/CustomTooltip/Tooltip'
import { SxProps } from '@/common/ui/mui'
import { Box } from '@mui/material'

type GuitarIconProps = {
	sx?: SxProps
	size?: number
	tooltip?: string
}

/**
 * Guitar SVG icon (seekicon guitar_1 style).
 * Used to indicate that a song variant contains chord notation.
 */
export default function GuitarIcon({ sx, size = 22, tooltip }: GuitarIconProps) {
	const icon = (
		<Box
			component="span"
			sx={{
				display: 'inline-flex',
				alignItems: 'center',
				justifyContent: 'center',
				color: 'inherit',
				...sx,
			}}
		>
			<svg
				width={size}
				height={size}
				viewBox="131 -131 512 512"
				fill="currentColor"
				xmlns="http://www.w3.org/2000/svg"
				aria-label="guitar"
			>
				<path d="M633.6-121.6l-34.1-9.4L538-69.5l5.1,13.7L395.4,80.7c-35.9-24.8-76-28.2-98.2-6
					c-28.2,28.2-24.8,52.1-37.6,64.9c-12.8,12.8-63.2-2.6-109.3,43.5c-34.1,34.1-22.2,102.4,27.3,151.1c49.5,49.5,117,61.5,151.1,27.3
					c46.1-46.1,31.6-96.5,43.5-109.3c12.8-12.8,35.9-8.5,64.9-37.6c22.2-22.2,18.8-63.2-6-98.2L567.9-32l13.7,5.1L643-88.3L633.6-121.6
					z M363.8,148.2c12.8,12.8,12.8,35,0,47.8c-12.8,12.8-35,12.8-47.8,0s-12.8-35,0-47.8C329.7,134.5,351,134.5,363.8,148.2z" />
			</svg>
		</Box>
	)

	if (tooltip) {
		return <Tooltip title={tooltip}>{icon}</Tooltip>
	}

	return icon
}
