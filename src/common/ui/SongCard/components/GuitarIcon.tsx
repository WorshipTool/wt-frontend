import { Tooltip } from '@/common/ui/CustomTooltip/Tooltip'
import { SxProps } from '@/common/ui/mui'
import { Box } from '@mui/material'

type GuitarIconProps = {
	sx?: SxProps
	size?: number
	tooltip?: string
}

/**
 * Simple guitar silhouette SVG icon.
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
				<path d="M14.5 2.5c-.28 0-.5.22-.5.5s.22.5.5.5.5-.22.5-.5-.22-.5-.5-.5zm1.5 0c-.28 0-.5.22-.5.5s.22.5.5.5.5-.22.5-.5-.22-.5-.5-.5zm-2.12 1.38l-1.06 1.06.71.71.35-.35 6.36 6.36-.35.35.71.71 1.06-1.06-.71-.71-.35.35-6.36-6.36.35-.35-.71-.71zM9 8C6.24 8 4 10.24 4 13c0 1.3.5 2.48 1.32 3.35L3.5 18.17c-.78.78-.78 2.05 0 2.83.78.78 2.05.78 2.83 0l1.82-1.82C8.92 19.73 10.26 20 11.5 20c2.76 0 5-2.24 5-5 0-1.3-.5-2.48-1.32-3.35l.5-.5-1.41-1.41-.5.5C13.1 9.63 11.15 8 9 8zm0 2c1.31 0 2.5.56 3.35 1.46l.19.2.2.19C13.44 12.5 14 13.69 14 15c0 1.65-1.35 3-3 3-1.05 0-2.18-.43-3-.93l-.37-.25-1.97 1.97c-.2.2-.51.2-.71 0-.2-.2-.2-.51 0-.71l1.97-1.97-.25-.37C6.17 14.92 6 13.97 6 13c0-1.65 1.35-3 3-3zm0 1.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5z" />
			</svg>
		</Box>
	)

	if (tooltip) {
		return <Tooltip title={tooltip}>{icon}</Tooltip>
	}

	return icon
}
