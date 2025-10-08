'use client'
import { useTeamSideBar } from '@/app/(submodules)/(teams)/sub/tymy/(teampage)/[alias]/components/SmartTeamPage/hooks/useTeamSideBar'
import { useTeamLogo } from '@/app/(submodules)/(teams)/sub/tymy/(teampage)/[alias]/hooks/useTeamLogo'
import useInnerTeam from '@/app/(submodules)/(teams)/sub/tymy/(teampage)/hooks/useInnerTeam'
import { Box } from '@/common/ui'
import { Clickable } from '@/common/ui/Clickable'
import { Image } from '@/common/ui/Image'
import { Link } from '@/common/ui/Link/Link'
import { Typography } from '@/common/ui/Typography'
import { useTranslations } from 'next-intl'

type TeamPanelTitleProps = {
	collapsed: boolean
}

export default function TeamPanelTitle(props: TeamPanelTitleProps) {
	const { name, alias } = useInnerTeam()
	const { hasLogo, logoUrl } = useTeamLogo()
	const { darkMode } = useTeamSideBar()
 	const tLeftPanel = useTranslations('teamPage.leftPanel')
	return (
		<Box>
			<Box
				display={'flex'}
				flexDirection={'column'}
				justifyContent={'center'}
				alignItems={'center'}
				padding={3}
				gap={1}
				sx={{
					opacity: props.collapsed ? 0 : 1,
					transition: 'all 0.1s',
				}}
			>
				{hasLogo && (
					<Link
						to="team"
						params={{
							alias,
						}}
					>
						<Clickable>
							<Image src={logoUrl} alt={'Logo týmu'} width={64} height={64} />
						</Clickable>
					</Link>
				)}
				<Typography color={darkMode ? 'grey.300' : 'grey.800'} noWrap>
					{tLeftPanel('title')}
				</Typography>
				<Link
					to="team"
					params={{
						alias,
					}}
				>
					<Clickable>
						<Box
							display={'flex'}
							flexDirection={'row'}
							justifyContent={'center'}
							alignItems={'center'}
							gap={1}
							minWidth={'13rem'}
						>
							<Typography variant="h4">{name}</Typography>
						</Box>
					</Clickable>
				</Link>
			</Box>
			{hasLogo && (
				<Box
					sx={{
						position: 'absolute',
						top: 32,
						left: '50%',
						transform: `translateX(-50%)`,
						opacity: props.collapsed ? 1 : 0,
						transition: 'all 0.1s',
						pointerEvents: props.collapsed ? 'auto' : 'none',
					}}
				>
					<Link
						to="team"
						params={{
							alias,
						}}
					>
						<Clickable disabled={!props.collapsed}>
							<Image src={logoUrl} alt={'Logo týmu'} width={32} height={32} />
						</Clickable>
					</Link>
				</Box>
			)}
		</Box>
	)
}
