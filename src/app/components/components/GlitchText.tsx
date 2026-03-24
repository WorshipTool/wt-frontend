'use client'

import { Box } from '@/common/ui'
import { SxProps, Theme } from '@mui/system'

type GlitchTextProps = {
	children: React.ReactNode
	component?: React.ElementType
	sx?: SxProps<Theme>
	color?: string
	glitchColor1?: string
	glitchColor2?: string
	'data-testid'?: string
}

export default function GlitchText({
	children,
	component = 'span',
	sx,
	color = '#00e5ff',
	glitchColor1 = '#ff00e5',
	glitchColor2 = '#39ff14',
	...props
}: GlitchTextProps) {
	const baseSx: SxProps<Theme> = {
		position: 'relative',
		display: 'inline-block',
		color: color,
		...sx,
	}

	return (
		<Box component={component} sx={baseSx} data-testid={props['data-testid']}>
			{children}
			{/* Glitch layer 1 */}
			<Box
				component="span"
				aria-hidden="true"
				sx={{
					position: 'absolute',
					top: 0,
					left: 0,
					width: '100%',
					height: '100%',
					color: glitchColor1,
					animation: 'glitch-1 3s infinite linear alternate-reverse',
					zIndex: -1,
					...sx,
				}}
			>
				{children}
			</Box>
			{/* Glitch layer 2 */}
			<Box
				component="span"
				aria-hidden="true"
				sx={{
					position: 'absolute',
					top: 0,
					left: 0,
					width: '100%',
					height: '100%',
					color: glitchColor2,
					animation: 'glitch-2 2.5s infinite linear alternate-reverse',
					zIndex: -1,
					...sx,
				}}
			>
				{children}
			</Box>
		</Box>
	)
}
