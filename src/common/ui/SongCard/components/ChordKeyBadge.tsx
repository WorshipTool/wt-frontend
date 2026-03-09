import { Box } from '@/common/ui/Box'
import { Tooltip } from '@/common/ui/CustomTooltip/Tooltip'
import { SxProps } from '@/common/ui/mui'

type ChordKeyBadgeProps = {
	chordKey: string
	sx?: SxProps
	tooltip?: string
}

/**
 * Displays the song's key chord as a letter inside a subtle light circle.
 * Used to indicate that a song variant contains chord notation.
 */
export default function ChordKeyBadge({ chordKey, sx, tooltip }: ChordKeyBadgeProps) {
	const badge = (
		<Box
			component="span"
			aria-label={`chord key ${chordKey}`}
			sx={{
				display: 'inline-flex',
				alignItems: 'center',
				justifyContent: 'center',
				width: 18,
				height: 18,
				borderRadius: '50%',
				backgroundColor: 'grey.300',
				flexShrink: 0,
				...sx,
			}}
		>
			<Box
				component="span"
				sx={{
					fontSize: '0.55rem',
					fontWeight: 600,
					color: 'grey.600',
					lineHeight: 1,
					letterSpacing: 0,
					userSelect: 'none',
				}}
			>
				{chordKey}
			</Box>
		</Box>
	)

	if (tooltip) {
		return <Tooltip title={tooltip}>{badge}</Tooltip>
	}

	return badge
}
