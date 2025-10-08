'use client'

import useUsersTeamPlaylists from '@/app/(submodules)/(teams)/sub/tymy/(teampage)/[alias]/hooks/useUsersTeamPlaylists'
import UsersTeamPlaylistsAddButton from '@/app/(submodules)/(teams)/sub/tymy/(teampage)/[alias]/playlisty/components/UsersTeamPlaylistsAddButton'
import useInnerTeam from '@/app/(submodules)/(teams)/sub/tymy/(teampage)/hooks/useInnerTeam'
import { Box, useTheme } from '@/common/ui'
import { Clickable } from '@/common/ui/Clickable'
import { Tooltip } from '@/common/ui/CustomTooltip/Tooltip'
import { Gap } from '@/common/ui/Gap'
import { InfoButton } from '@/common/ui/InfoButton'
import { Typography } from '@/common/ui/Typography'
import { useSmartNavigate } from '@/routes/useSmartNavigate'
import { getSmartDateAgoString } from '@/tech/date/date.tech'
import { Schedule } from '@mui/icons-material'
import { useTranslations } from 'next-intl'

export default function UsersTeamPlaylistsPanel() {
	const t = useTranslations('teams.playlists')
	const { playlists: usersPlaylists } = useUsersTeamPlaylists()
	const { alias: teamAlias } = useInnerTeam()

	const navigate = useSmartNavigate()

	const theme = useTheme()

	const playlists = usersPlaylists.sort((a, b) => {
		return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
	})

	const getRecentString = (date: Date) =>
		getSmartDateAgoString(date, t('lastUpdated'), 20)

	return (
		<Box display={'flex'} flexDirection={'column'}>
			<Box display={'flex'} gap={1} alignItems={'center'}>
				<Schedule />
				<Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
					{t('yourRecent')}{' '}
					<InfoButton expandedWidth={300} lineCount={2}>
						{t('yourRecentDescription')}
					</InfoButton>
				</Typography>
			</Box>
			<Gap />
			<Box display={'flex'} gap={1} flexWrap={'wrap'} alignItems={'center'}>
				{playlists.slice(0, 5).map((playlist) => (
					<Tooltip key={playlist.guid} label={t('openPlaylist')}>
						<Clickable
							key={playlist.guid}
							onClick={() =>
								navigate('teamPlaylist', {
									alias: teamAlias,
									guid: playlist.guid,
								})
							}
						>
							<Box
								key={playlist.guid}
								sx={{
									// padding: 2,
									borderRadius: 3,
									bgcolor: 'grey.100',
									border: '1px solid',
									borderColor: 'grey.400',
									width: theme.spacing(22),
									height: theme.spacing(10),
									display: 'flex',
								}}
							>
								<Box
									margin={2}
									display={'flex'}
									flexDirection={'column'}
									justifyContent={'space-between'}
								>
									<Typography strong>{playlist.title}</Typography>
									<Typography
										color="grey.500"
										size={'small'}
										strong
										sx={{
											lineHeight: 1,
										}}
									>
										{getRecentString(new Date(playlist.updatedAt))}
									</Typography>
								</Box>
							</Box>
						</Clickable>
					</Tooltip>
				))}
				<UsersTeamPlaylistsAddButton />
			</Box>
		</Box>
	)
}
