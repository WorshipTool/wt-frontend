import { SURFACE_CARD_SX } from '@/common/constants/surfaces'
import { Box } from '@/common/ui'
import { SxProps } from '@/common/ui/mui'
import { Typography } from '@/common/ui/Typography'
import React from 'react'

type TeamCardProps = {
	title?: string
	children?: React.ReactNode
	sx?: SxProps
}

export default function TeamCard(props: TeamCardProps) {
	return (
		<Box
			sx={{
				...SURFACE_CARD_SX,
				padding: 3,
				...props.sx,
			}}
		>
			{props.title && (
				<Typography variant="h6" strong>
					{props.title}
				</Typography>
			)}
			{props.children}
		</Box>
	)
}
