'use client'
import { useTeamSideBar } from '@/app/(submodules)/(teams)/sub/tymy/(teampage)/[alias]/components/SmartTeamPage/hooks/useTeamSideBar'
import { useTeamTopBar } from '@/app/(submodules)/(teams)/sub/tymy/(teampage)/[alias]/components/SmartTeamPage/hooks/useTeamTopBar'
import TeamPageTitleContainer from '@/app/(submodules)/(teams)/sub/tymy/(teampage)/[alias]/components/TopPanel/components/TeamPageTitleContainer'
import RightAccountPanel from '@/common/components/Toolbar/components/RightAccountPanel/RightAccountPanel'
import { Box } from '@/common/ui'

export default function TeamTopPanel() {
	const { fixed, sx } = useTeamTopBar()
	const { collapsed, hidden } = useTeamSideBar()
	// const theme = useTheme()
	return (
		<>
			<Box
				sx={{
					// height: 60,
					// bgcolor: 'grey.400',
					paddingX: { xs: 3, sm: 3, md: 4 },
					paddingY: 3,
					position: fixed ? 'fixed' : undefined,
					top: 0,
					left: hidden ? 0 : collapsed ? 60 : 250,
					transition: 'all 0.2s',
					right: 0,
					zIndex: 1,
					// bgcolor: fixed ? 'grey.200' : undefined,
					// gradient, grey on top, transparent on bottom
					// background: `linear-gradient(180deg, ${alpha(
					// 	grey[200],
					// 	1
					// )} 70%, ${alpha(grey[200], 0)} 100%)`,
					...sx,
				}}
				display={'flex'}
				flexDirection={'row'}
				alignItems={'center'}
				gap={4}
			>
				<TeamPageTitleContainer />
				<RightAccountPanel />
			</Box>
			<Box minHeight={fixed ? 92 : 0}></Box>
		</>
	)
}
