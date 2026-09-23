'use client'

import BrandSheepIcon from '@/assets/icon.svg'
import { createStory } from '@/app/(layout)/storybook/createStory'
import {
	TAB_ICON_SIZE,
	TabItem,
} from '@/common/components/MobileAppTabBar/TabItem'
import { Box, Typography } from '@/common/ui'
import {
	AppsOutlined,
	HomeOutlined,
	HomeRounded,
	LibraryMusicOutlined,
	LoginRounded,
	SearchOutlined,
} from '@mui/icons-material'
import { useTranslations } from 'next-intl'
import { ReactNode } from 'react'

const FRAME_WIDTH = 390

/**
 * Playground for the bottom tab bar's icons, so alternatives can be compared
 * without editing the live bar. The rows use the real `TabItem`, so what you see
 * here is what the bar renders.
 *
 * The brand mark is `@/assets/icon.svg`, which paints with `fill="currentColor"`
 * — so unlike a flat image it tints for the active/inactive states exactly like
 * the Material icons beside it.
 */
const MobileAppTabBarStory = () => {
	const tNav = useTranslations('navigation')

	const row = (homeIcon: ReactNode, homeActiveIcon: ReactNode, label: string) => (
		<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
			<Typography small strong uppercase color="grey.700">
				{label}
			</Typography>
			{/* both states side by side: the home tab active, then at rest */}
			{[true, false].map((homeActive) => (
				<Box
					key={String(homeActive)}
					sx={{
						width: FRAME_WIDTH,
						maxWidth: '100%',
						bgcolor: 'background.paper',
						border: '1px solid',
						borderColor: 'grey.200',
						borderRadius: 2,
						display: 'flex',
						alignItems: 'flex-start',
						paddingTop: 1.5,
						paddingBottom: 1.5,
					}}
				>
					<Box sx={{ flex: 1, minWidth: 0 }}>
						<TabItem
							icon={homeIcon as JSX.Element}
							activeIcon={homeActiveIcon as JSX.Element}
							label={tNav('home')}
							active={homeActive}
						/>
					</Box>
					<Box sx={{ flex: 1, minWidth: 0 }}>
						<TabItem
							icon={<LibraryMusicOutlined />}
							label={tNav('songs')}
							active={false}
						/>
					</Box>
					<Box sx={{ flex: 1, minWidth: 0 }}>
						<TabItem icon={<SearchOutlined />} label={tNav('search')} />
					</Box>
					<Box sx={{ flex: 1, minWidth: 0 }}>
						<TabItem icon={<AppsOutlined />} label={tNav('tools')} />
					</Box>
					<Box sx={{ flex: 1, minWidth: 0 }}>
						<TabItem icon={<LoginRounded />} label={tNav('login')} />
					</Box>
				</Box>
			))}
		</Box>
	)

	return (
		<Box
			data-testid="tabbar-icon-concept"
			sx={{ display: 'flex', flexDirection: 'column', gap: 3, padding: 2 }}
		>
			{row(<HomeOutlined />, <HomeRounded />, 'Dnes — domeček')}
			{row(
				<BrandSheepIcon width={TAB_ICON_SIZE} height={TAB_ICON_SIZE} />,
				<BrandSheepIcon width={TAB_ICON_SIZE} height={TAB_ICON_SIZE} />,
				'Návrh — ovečka z loga'
			)}
		</Box>
	)
}

createStory(MobileAppTabBarStory, MobileAppTabBarStory)
