'use client'
import { SmartTeamPage } from '@/app/(submodules)/(teams)/sub/tymy/(teampage)/[alias]/components/SmartTeamPage/SmartTeamPage'
import { TeamPageTitle } from '@/app/(submodules)/(teams)/sub/tymy/(teampage)/[alias]/components/TopPanel/components/TeamPageTitle'
import TeamPlaylistContainer from '@/app/(submodules)/(teams)/sub/tymy/(teampage)/[alias]/playlist/[guid]/components/TeamPlaylistContainer'
import TeamPlaylistTopPanel from '@/app/(submodules)/(teams)/sub/tymy/(teampage)/[alias]/playlist/[guid]/components/TeamPlaylistTopPanel'

export default SmartTeamPage(TeamPlaylistPage, {
	hidePadding: true,
	collapseSideBar: true,
	fixedTopBar: true,
	topBarSx: {
		bgcolor: 'surface.card',
		borderBottom: '1px solid',
		borderColor: 'surface.border',
	},
})

function TeamPlaylistPage() {
	return (
		<>
			<TeamPageTitle>
				<TeamPlaylistTopPanel />
			</TeamPageTitle>
			{/* <Box bgcolor={'blue'}>ahoj</Box> */}
			<TeamPlaylistContainer />
		</>
	)
}
