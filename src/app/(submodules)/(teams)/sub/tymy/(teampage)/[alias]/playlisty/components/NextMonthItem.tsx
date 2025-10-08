'use client'
import { TeamEventData } from '@/api/generated'
import TeamEventPopup from '@/app/(submodules)/(teams)/sub/tymy/(teampage)/[alias]/components/EventPopup/TeamEventPopup'
import useInnerTeam from '@/app/(submodules)/(teams)/sub/tymy/(teampage)/hooks/useInnerTeam'
import { Box, useTheme } from '@/common/ui'
import { Clickable } from '@/common/ui/Clickable'
import { IconButton } from '@/common/ui/IconButton'
import { Chip } from '@/common/ui/mui'
import { Typography } from '@/common/ui/Typography'
import { useSmartUrlState } from '@/hooks/urlstate/useUrlState'
import { useSmartNavigate } from '@/routes/useSmartNavigate'
import { KeyboardArrowRight } from '@mui/icons-material'
import { useTranslations } from 'next-intl'
import { useMemo } from 'react'

type NextMonthItemProps = {
	data: TeamEventData
}

export default function NextMonthItem(props: NextMonthItemProps) {
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
	const theme = useTheme()

	const setOpen = (open: boolean) => {
		setOpenedEventGuid(open ? props.data.guid : null)
	}

	const navigate = useSmartNavigate()

	const { alias: teamAlias } = useInnerTeam()

	const diffTitle: boolean = props.data.title !== props.data.playlist.title

	const date = new Date(props.data.date)

	const dateString = useMemo(() => {
		const long = date.toLocaleDateString('cs-CZ', {
			day: 'numeric',
			month: 'long',
		})
		if (long.length <= 11) return long
		return date.toLocaleDateString('cs-CZ', {
			day: 'numeric',
			month: 'short',
		})
	}, [date])

	return (
		<>
			<Clickable
				onClick={() =>
					navigate('teamPlaylist', {
						alias: teamAlias,
						guid: props.data.playlist.guid,
					})
				}
			>
				<Box
					sx={{
						width: theme.spacing(22),
						aspectRatio: '3/2',
						bgcolor: 'grey.100',
						borderRadius: 3,
						position: 'relative',
						overflow: 'hidden',
						border: '1px solid',
						borderColor: 'grey.400',
					}}
				>
					<Box
						sx={{
							position: 'absolute',
							left: theme.spacing(3),
							top: theme.spacing(3),
							right: theme.spacing(3),
							bottom: theme.spacing(3),
							gap: 0,
							display: 'flex',
							flexDirection: 'column',
							justifyContent: 'space-between',
						}}
					>
						<Box
							display={'flex'}
							flexWrap={'wrap-reverse'}
							gap={1}
							{...(!diffTitle
								? {
										flexDirection: 'column-reverse',
										// alignItems: 'center',
								  }
								: {})}
						>
							<Typography strong>{props.data.title}</Typography>
							<Box display={'flex'}>
								<Chip label={dateString} size="small" />
							</Box>
						</Box>
						{/* <CalendarMonth
								color="inherit"
								sx={{
									color: 'grey.700',
								}}
							/> */}
						{diffTitle && (
							<Typography
								color="grey.700"
								sx={{
									marginBottom: theme.spacing(1.5),
								}}
							>
								{props.data.playlist.title}
							</Typography>
						)}
					</Box>

					<Box
						sx={{
							height: 30,
							bgcolor: 'secondary.main',
							position: 'absolute',
							bottom: 0,
							right: 0,
							left: 0,
							transform: 'translateY(0%) translateX(50%) rotate(-45deg)',
						}}
					></Box>

					<Box
						sx={{
							position: 'absolute',
							right: 0,
							bottom: 0,
							padding: 1,
						}}
					>
						<IconButton
							tooltip={t('openDetail')}
							onClick={(e) => {
								e.stopPropagation()
								setOpen(true)
							}}
							sx={
								{
									// bgcolor: 'grey.100',
									// borderRadius: '50%',
								}
							}
						>
							<KeyboardArrowRight />
						</IconButton>
					</Box>
				</Box>
			</Clickable>
			<TeamEventPopup
				open={open}
				onClose={() => setOpen(false)}
				data={{
					...(props.data as any),
					date: new Date(props.data.date),
				}}
			/>
		</>
	)
}
