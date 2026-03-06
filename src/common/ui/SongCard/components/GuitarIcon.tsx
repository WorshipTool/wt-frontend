import { Tooltip } from '@/common/ui/CustomTooltip/Tooltip'
import { SxProps } from '@/common/ui/mui'
import { Box } from '@mui/material'

type GuitarIconProps = {
	sx?: SxProps
	size?: number
	tooltip?: string
}

/**
 * Guitar SVG icon (Material Design Icons style).
 * Used to indicate that a song variant contains chord notation.
 */
export default function GuitarIcon({ sx, size = 18, tooltip }: GuitarIconProps) {
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
				viewBox="0 0 24 24"
				fill="currentColor"
				xmlns="http://www.w3.org/2000/svg"
				aria-label="guitar"
			>
				<path d="M18.7,3.3L20,2L22,4L20.7,5.3L21.5,6.1L20.1,7.5L19.3,6.7L17.4,8.6L17.8,9.1C19.5,11.4 19.5,14.6 17.7,16.8C16.3,18.5 14.2,19.5 12,19.5C11.2,19.5 10.4,19.3 9.7,19.1L8,21.7C7.6,22.2 7,22.5 6.4,22.5C6,22.5 5.6,22.4 5.3,22.1L1.9,19.7C1.6,19.4 1.5,19.1 1.5,18.7C1.5,18.1 1.8,17.5 2.3,17.1L4.9,15.4C4.7,14.7 4.5,13.9 4.5,13.1C4.5,10.9 5.5,8.8 7.2,7.4C9.4,5.6 12.6,5.6 14.9,7.3L15.4,7.7L17.3,5.8L16.5,5L17.9,3.6L18.7,3.3M12,7.5C11.2,7.5 10.5,7.7 9.8,8.1L10.6,8.9L9.2,10.3L8.4,9.5C7.7,10.4 7.5,11.5 7.7,12.6L8.6,11.7L10,13.1L9.1,14C9.7,14.5 10.3,14.8 11,14.9L11,13.5L13,13.5L13,14.9C13.7,14.8 14.4,14.5 14.9,14L14,13.1L15.4,11.7L16.3,12.6C16.5,11.5 16.3,10.4 15.6,9.5L14.8,10.3L13.4,8.9L14.2,8.1C13.5,7.7 12.8,7.5 12,7.5Z" />
			</svg>
		</Box>
	)

	if (tooltip) {
		return <Tooltip title={tooltip}>{icon}</Tooltip>
	}

	return icon
}
