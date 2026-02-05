'use client'

import { Box } from '@/common/ui/Box'
import { Tooltip } from '@/common/ui/CustomTooltip/Tooltip'
import { Typography } from '@/common/ui/Typography'
import { useSongFamilyInfo } from '@/hooks/song/useSongFamilyInfo'
import { SongGuid } from '@/types/song'
import { useState } from 'react'

type SongTitleWithTooltipProps = {
	title: string
	songGuid: SongGuid
	strong?: boolean
	sx?: any
	children?: React.ReactNode
}

export function SongTitleWithTooltip({
	title,
	songGuid,
	strong,
	sx,
	children,
}: SongTitleWithTooltipProps) {
	const [isHovered, setIsHovered] = useState(false)
	const { familyInfo } = useSongFamilyInfo(isHovered ? songGuid : null)

	const tooltipText = familyInfo
		? `Song Family: ${familyInfo.familyName}\nTranslations: ${familyInfo.translationCount}`
		: ''

	return (
		<Tooltip title={tooltipText} placement="top">
			<Box
				component="span"
				onMouseEnter={() => setIsHovered(true)}
				onMouseLeave={() => setIsHovered(false)}
			>
				<Typography strong={strong} sx={sx}>
					{children}
					{title}
				</Typography>
			</Box>
		</Tooltip>
	)
}
