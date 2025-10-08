'use client'
import NextPlannedPlaylistPanel from '@/app/(submodules)/(teams)/sub/tymy/(teampage)/[alias]/components/NextPlannedPlaylistPanel/NextPlannedPlaylistPanel'
import TeamQuickActions from '@/app/(submodules)/(teams)/sub/tymy/(teampage)/[alias]/components/QuickActions/TeamQuickActions'
import { SmartTeamPage } from '@/app/(submodules)/(teams)/sub/tymy/(teampage)/[alias]/components/SmartTeamPage/SmartTeamPage'
import TeamCard from '@/app/(submodules)/(teams)/sub/tymy/(teampage)/[alias]/components/TeamCard/TeamCard'
import { TeamPageTitle } from '@/app/(submodules)/(teams)/sub/tymy/(teampage)/[alias]/components/TopPanel/components/TeamPageTitle'
import useInnerTeam from '@/app/(submodules)/(teams)/sub/tymy/(teampage)/hooks/useInnerTeam'
import { PageProps } from '@/common/types'
import { Box } from '@/common/ui'
import { Gap } from '@/common/ui/Gap'
import { Grid } from '@/common/ui/mui/Grid'
import { Typography } from '@/common/ui/Typography'
import { WavingHand } from '@mui/icons-material'
import { useTranslations } from 'next-intl'

export default SmartTeamPage(TeamPage, {
	collapseSideBar: false,
})

function TeamPage(props: PageProps<'team'>) {
	const { name } = useInnerTeam()
	const tTeam = useTranslations('teamPage')
	return (
		<>
			<TeamPageTitle>{tTeam('overviewTitle')}</TeamPageTitle>
			<Grid container spacing={2}>
				<Grid item xs={12} display={'flex'}>
					<TeamCard>
						<Box
							display={'flex'}
							flexDirection={'row'}
							alignItems={'center'}
							gap={2}
						>
							<WavingHand />
							<Box>
							<Typography variant="h6" strong>
								{tTeam('welcomeTitle')}{' '}
								<i>{name}</i>
							</Typography>
							<Typography>{tTeam('welcomeNote')}</Typography>
							</Box>
						</Box>
					</TeamCard>
				</Grid>
				<Grid item xs={12}>
				<Typography strong>{tTeam('quickActions')}</Typography>
					<Gap />
					<TeamQuickActions />
				</Grid>
				<Grid item>
					<Gap />
					<NextPlannedPlaylistPanel />
				</Grid>
			</Grid>
		</>
	)
}
