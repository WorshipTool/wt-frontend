import { MAIN_SEARCH_EVENT_NAME } from '@/app/components/components/MainSearchInput'
import MobileNavigationItem from '@/common/components/Toolbar/components/MiddleNavigationPanel/MobileNavigationItem'
import NavigationItem, {
	NavigationItemProps,
} from '@/common/components/Toolbar/components/MiddleNavigationPanel/NavigationItem'
import { MOBILE_NAVIGATION_PANEL_ID } from '@/common/components/Toolbar/components/MiddleNavigationPanel/NavigationMobilePanel'
import { useToolbar } from '@/common/components/Toolbar/hooks/useToolbar'
import { Box, Divider } from '@/common/ui'
import { Button } from '@/common/ui/Button'
import { IconButton } from '@/common/ui/IconButton'
import { useSmartMatch } from '@/routes/useSmartMatch'
import { useSmartParams } from '@/routes/useSmartParams'
import { ArrowDropUp, Menu } from '@mui/icons-material'
import { useTranslations } from 'next-intl'
import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'

type NavigationItems = [
	NavigationItemProps<'home'>,
	NavigationItemProps<'about'>,
	NavigationItemProps<'teams'>,
	NavigationItemProps<'contact'>
]

export default function MiddleNavigationPanel() {
	const { hledat: searchString } = useSmartParams('home')
	const isHome = useSmartMatch('home')
	const tNavigation = useTranslations('navigation')

	const navigationItems: NavigationItems = useMemo(
		() => [
			{
				title: tNavigation('search'),
				to: 'home',
				toParams: { hledat: isHome ? searchString || '' : '' },
				enabled: false,
				onClick: () => {
					window.dispatchEvent(new Event(MAIN_SEARCH_EVENT_NAME))
				},
			},
			{ title: tNavigation('aboutUs'), to: 'about' },
			{ title: tNavigation('worshipTeams'), to: 'teams' },
			{ title: tNavigation('contact'), to: 'contact' },
		],
		[isHome, searchString, tNavigation]
	)

	const { hideMiddleNavigation, _setTempSolid, transparent } = useToolbar()

	useEffect(() => {
		if (hideMiddleNavigation) {
			setShowMobileMenu(false)
		}
	}, [hideMiddleNavigation])

	const [showMobileMenu, setShowMobileMenu] = useState(false)

	useEffect(() => {
		if (showMobileMenu) {
			_setTempSolid(true)
		} else {
			_setTempSolid(false)
		}
	}, [showMobileMenu])

	return (
		<Box
			sx={{
				opacity: hideMiddleNavigation ? 0 : 1,
				transition: 'all 0.3s ease',
				display: 'flex',
				alignItems: 'center',
			}}
			position={'relative'}
		>
			<Box
				display={{
					xs: 'none',
					sm: 'none',
					md: 'flex',
				}}
				flexDirection={'row'}
				gap={4}
			>
				{navigationItems.map((item) => (
					<NavigationItem {...item} key={item.title} />
				))}
			</Box>

			<Box
				display={{
					sm: 'flex',
					md: 'none',
				}}
				flexDirection={'row'}
				alignItems={'center'}
				flexWrap={'nowrap'}
				gap={0.5}
				sx={{
					width: hideMiddleNavigation ? 0 : '2.5rem',
					transition: 'all 0.3s ease',
				}}
			>
				<IconButton
					color="inherit"
					onClick={() => {
						setShowMobileMenu(!showMobileMenu)
					}}
					size="small"
				>
					<Menu />
				</IconButton>
			</Box>

			{showMobileMenu &&
				createPortal(
					<Box
						display={{
							sm: 'flex',
							md: 'none',
						}}
						flexDirection={'column'}
						justifyContent={'space-around'}
						flexWrap={'wrap'}
						position={'fixed'}
						top={56}
						left={0}
						right={0}
						zIndex={2}
						boxShadow={2}
						bgcolor={'grey.200'}
						sx={{
							opacity: hideMiddleNavigation ? 0 : 1,
							transition: 'all 0.3s ease',
						}}
					>
						{navigationItems.map((item) => (
							<MobileNavigationItem
								title={item.title}
								to={item.to}
								toParams={item.toParams}
								key={item.title}
								onClick={() => {
									setShowMobileMenu(false)
									item.onClick?.()
								}}
							/>
						))}
						<Divider />
						<Box
							display={'flex'}
							flexDirection={'row'}
							justifyContent={'center'}
							paddingY={1}
						>
							<Button
								size="small"
								variant="text"
								endIcon={<ArrowDropUp />}
								color="inherit"
								onClick={() => {
									setShowMobileMenu(false)
								}}
							>
								{tNavigation('closeMenu')}
							</Button>
						</Box>
					</Box>,
					document.querySelector(`#${MOBILE_NAVIGATION_PANEL_ID}`)!
				)}
		</Box>
	)
}
