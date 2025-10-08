'use client'
import { TeamEventData } from '@/api/generated'
import TeamEventPopup from '@/app/(submodules)/(teams)/sub/tymy/(teampage)/[alias]/components/EventPopup/TeamEventPopup'
import useInnerTeam from '@/app/(submodules)/(teams)/sub/tymy/(teampage)/hooks/useInnerTeam'
import { Box, Chip, useTheme } from '@/common/ui'
import { Clickable } from '@/common/ui/Clickable'
import { IconButton } from '@/common/ui/IconButton'
import { Typography } from '@/common/ui/Typography'
import { useSmartUrlState } from '@/hooks/urlstate/useUrlState'
import { useSmartNavigate } from '@/routes/useSmartNavigate'
import { Event, KeyboardArrowRight } from '@mui/icons-material'
import { useTranslations } from 'next-intl'
import { useMemo } from 'react'

type PreviousItemProps = {
	data: TeamEventData
}

export default function PreviousItem(props: PreviousItemProps) {
	const t = useTranslations('teams.playlists.events')
	
	const [openedEventGuid, setOpenedEventGuid] = useSmartUrlState(
		'teamPlaylists',
		'openedEvent',
		{
			parse: (v) => v,
			stringify: (v) => v as string,
		}
	)
	const open = useMemo(
		() => openedEventGuid === props.data.guid,
		[openedEventGuid, props.data.guid]
	)

	const setOpen = (open: boolean) => {
		setOpenedEventGuid(open ? props.data.guid : null)
	}

	const date = new Date(props.data.date)
	const dateString = date.toLocaleDateString('cs-CZ', {
		day: 'numeric',
		month: 'long',
	})

	const diffTitle: boolean = props.data.title !== props.data.playlist.title

	const theme = useTheme()
	const navigate = useSmartNavigate()
	const { alias: teamAlias } = useInnerTeam()

	return (
		// <Clickable>
		<Clickable>
			<Box
				sx={{
					// bgcolor: 'grey.300',
					paddingY: 1,
					paddingX: 1,
					borderRadius: 3,
					cursor: 'pointer',

					transition: 'all 0.3s ease',

					'&:hover': {
						bgcolor: 'grey.300',
						// paddingLeft: 1,
					},
				}}
				display={'flex'}
				flexDirection={'row'}
				gap={1}
				alignItems={'center'}
				onClick={() =>
					navigate('teamPlaylist', {
						alias: teamAlias,
						guid: props.data.playlist.guid,
					})
				}
				height={theme.spacing(5)}
			>
				<Box width={90}>
					<Chip label={dateString} size="small" icon={<Event />} />
				</Box>
				{/* <Typography color="grey.700">{date.toLocaleDateString()}</Typography> */}

				<Box
					display={'flex'}
					flexDirection={'row'}
					gap={2}
					alignItems={'center'}
				>
					{/* <Avatar /> */}
					{/* <Event /> */}
					<Box display={'flex'} flexDirection={'column'}>
						<Typography strong>{props.data.title}</Typography>

						{/* <Typography color="grey.700">
							Vedoucí:{' '}
							{props.data.leader.firstName + ' ' + props.data.leader.lastName}
						</Typography> */}

						{diffTitle && (
							<Typography color="grey.700">
								{props.data.playlist.title}
							</Typography>
						)}
					</Box>
				</Box>
				<Box flex={1} />
				<IconButton
					tooltip={t('openDetail')}
					onClick={(e) => {
						e.stopPropagation()
						setOpen(true)
					}}
				>
					<KeyboardArrowRight />
				</IconButton>
			</Box>
			<TeamEventPopup
				open={open}
				onClose={() => setOpen(false)}
				data={
					{
						...props.data,
						date: date,
					} as any
				}
			/>
		</Clickable>
		// </Clickable>
	)
}
