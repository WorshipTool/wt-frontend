'use client'
import { TeamEventData } from '@/api/generated'
import TeamEventPopup from '@/app/(submodules)/(teams)/sub/tymy/(teampage)/[alias]/components/EventPopup/TeamEventPopup'
import NextMonthItem from '@/app/(submodules)/(teams)/sub/tymy/(teampage)/[alias]/playlisty/components/NextMonthItem'
import useInnerTeam from '@/app/(submodules)/(teams)/sub/tymy/(teampage)/hooks/useInnerTeam'
import { TeamPermissions } from '@/app/(submodules)/(teams)/sub/tymy/tech'
import { Box, useTheme } from '@/common/ui'
import { Clickable } from '@/common/ui/Clickable'
import { Tooltip } from '@/common/ui/CustomTooltip/Tooltip'
import { Gap } from '@/common/ui/Gap'
import { Typography } from '@/common/ui/Typography'
import { usePermission } from '@/hooks/permissions/usePermission'
import { Add } from '@mui/icons-material'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

type NextMonthPanelProps = {
	events: TeamEventData[]
	loading: boolean
	allEventsCount: number
}

export default function NextMonthPanel(props: NextMonthPanelProps) {
	const t = useTranslations('teams.playlists')
	const [open, setOpen] = useState(false)

	const theme = useTheme()

	const { guid: teamGuid } = useInnerTeam()

	const hasPermissionToAdd = usePermission<TeamPermissions>('team.add_event', {
		teamGuid,
	})

	return !hasPermissionToAdd && props.events.length === 0 ? null : (
		<Box>
			<Typography variant="h6">{t('upcoming')}</Typography>
			<Gap />
			<Box display={'flex'} flexDirection={'row'} gap={1} flexWrap={'wrap'}>
				{props.events.map((item, index) => (
					<NextMonthItem key={item.guid} data={item} />
				))}

				{hasPermissionToAdd && (
					<Clickable onClick={() => setOpen(true)}>
						<Tooltip label={t('schedulePlaylist')}>
							<Box
								sx={{
									width: theme.spacing(22),
									aspectRatio: '3/2',
									bgcolor: 'grey.300',
									borderRadius: 3,
									display: 'flex',
									flexDirection: 'row',
									gap: 1,
									justifyContent: 'center',
									alignItems: 'center',
									color: 'grey.700',
								}}
							>
								<Add />
								<Typography>{t('schedule')}</Typography>
							</Box>
						</Tooltip>
					</Clickable>
				)}
			</Box>

			<TeamEventPopup
				open={open}
				onClose={() => setOpen(false)}
				editable
				createMode
				// editable={false}
			/>
		</Box>
	)
}
