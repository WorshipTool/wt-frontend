import TeamBottomMenu from '@/app/(submodules)/(teams)/sub/tymy/(teampage)/[alias]/components/LeftPanel/components/TeamBottomMenu'
import { useTeamSideBar } from '@/app/(submodules)/(teams)/sub/tymy/(teampage)/[alias]/components/SmartTeamPage/hooks/useTeamSideBar'
import useBottomPanel from '@/app/providers/BottomPanelProvider'
import { Box } from '@/common/ui'
import { Z_INDEX } from '@/common/constants/zIndex'
import { useEffect } from 'react'

const TRANSITION = 'all 0.2s'

export default function TeamBottomPanel() {
	const { darkMode, setHidden } = useTeamSideBar()

	const { setHeight } = useBottomPanel()

	const HEIGHT = 60

	useEffect(() => {
		setHidden(true)
		setHeight(60)

		return () => {
			setHeight(0)
		}
	}, [])

	return (
		<>
			<Box
				sx={{
					bgcolor: darkMode ? 'grey.900' : 'grey.100',
					minHeight: HEIGHT,
					maxHeight: HEIGHT,
					position: 'fixed',
					bottom: 0,
					left: 0,
					right: 0,
					boxShadow: '0px 0px 4px 0px rgba(0,0,0,0.1)',
					transition: TRANSITION,
					zIndex: Z_INDEX.ELEVATED,
					color: darkMode ? 'grey.100' : 'grey.800',
					display: 'flex',
					flexDirection: 'column',
					justifyContent: 'center',
				}}
			>
				<TeamBottomMenu />
			</Box>
			<Box sx={{ height: HEIGHT }} />
		</>
	)
}
