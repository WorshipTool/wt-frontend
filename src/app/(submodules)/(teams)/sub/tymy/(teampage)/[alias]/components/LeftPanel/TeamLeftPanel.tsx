'use client'
import TeamLeftMenu from '@/app/(submodules)/(teams)/sub/tymy/(teampage)/[alias]/components/LeftPanel/components/TeamLeftMenu'
import TeamPanelTitle from '@/app/(submodules)/(teams)/sub/tymy/(teampage)/[alias]/components/LeftPanel/components/TeamPanelTitle'
import { useTeamSideBar } from '@/app/(submodules)/(teams)/sub/tymy/(teampage)/[alias]/components/SmartTeamPage/hooks/useTeamSideBar'
import { Box } from '@/common/ui'
import { Button } from '@/common/ui/Button'
import { IconButton } from '@/common/ui/IconButton'
import { ChevronLeft, ChevronRight } from '@mui/icons-material'
import { useTranslations } from 'next-intl'
import { useEffect, useMemo } from 'react'

type TeamLeftPanelProps = {}

const TRANSITION = 'all 0.2s'
export default function TeamLeftPanel(props: TeamLeftPanelProps) {
	const {
		collapsed,
		setCollapsedManually,
		darkMode,
		uncollapsable,
		setHidden,
	} = useTeamSideBar()
	const tLeftPanel = useTranslations('teamPage.leftPanel')

	useEffect(() => {
		setHidden(false)
	}, [])

	const WIDTH = useMemo(() => (collapsed ? 60 : 250), [collapsed])
	return (
		<>
			<Box
				sx={{
					minWidth: WIDTH,
					maxWidth: WIDTH,

					position: 'fixed',
					height: '100%',
					bgcolor: darkMode ? 'grey.900' : 'grey.100',
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					transition: TRANSITION,
					boxShadow: '0px 0px 4px 0px rgba(0,0,0,0.1)',
					zIndex: 2,
					color: darkMode ? 'grey.100' : 'grey.800',
					overflow: 'hidden',
				}}
			>
				<TeamPanelTitle collapsed={collapsed} />
				<TeamLeftMenu collapsed={collapsed} transition={TRANSITION} />
				<Box flex={1} />

				{!uncollapsable && (
					<Box paddingBottom={2}>
						{collapsed ? (
							<IconButton
								onClick={() => setCollapsedManually(!collapsed)}
								color="inherit"
								tooltip={tLeftPanel('expand')}
								tooltipPlacement="right"
							>
								{collapsed ? <ChevronRight /> : <ChevronLeft />}
							</IconButton>
						) : (
							<Button
								onClick={() => setCollapsedManually(!collapsed)}
								color="inherit"
								tooltip={tLeftPanel('collapse')}
								tooltipPlacement="right"
								startIcon={<ChevronLeft />}
								variant="text"
								sx={{
									minWidth: 150,
								}}
							>
								{tLeftPanel('collapse')}
							</Button>
						)}
					</Box>
				)}
			</Box>
			<Box
				sx={{
					minWidth: WIDTH,
					maxWidth: WIDTH,
					transition: TRANSITION,
				}}
			></Box>
		</>
	)
}
