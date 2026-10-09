import { getStatisticsColorFromString } from '@/app/(submodules)/(teams)/sub/tymy/(teampage)/[alias]/statistiky/tech/statistics.tech'
import { Box, Tooltip, Typography } from '@/common/ui'

type BarChartRowProps = {
	label: string
	value: number
	maxValue: number
	tooltip?: string
}

export default function BarChartRow(props: BarChartRowProps) {
	const labelsWidth = 100

	const color = getStatisticsColorFromString(props.label)

	return (
		<Tooltip label={props.tooltip} placement="right">
			<Box
				display={'flex'}
				gap={2}
				sx={{
					borderRadius: 1,
					'&: hover': {
						bgcolor: 'surface.sunken',
						paddingX: 0.5,
					},
					transition: '0.3s',
				}}
			>
				<Box
					sx={{
						width: labelsWidth,
						maxWidth: labelsWidth,
						display: 'flex',
						justifyContent: 'end',
					}}
				>
					<Typography small noWrap>
						{props.label}
					</Typography>
				</Box>

				<Box
					sx={{
						flex: 1,
						display: 'flex',
						gap: 1,
						alignItems: 'center',
					}}
				>
					{props.value > 0 && (
						<Box
							sx={{
								width: `${(props.value / props.maxValue) * 100}%`,
								// backgroundColor: 'primary.light',
								backgroundColor: color,
								borderRadius: 1,
								// marginY: 1,
								height: 10,
							}}
						/>
					)}
					<Typography small>{props.value}</Typography>
				</Box>
			</Box>
		</Tooltip>
	)
}
