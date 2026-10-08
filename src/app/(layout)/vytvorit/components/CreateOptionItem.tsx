'use client'

import { CreateOption } from '@/app/(layout)/vytvorit/components/createOptions'
import { MOBILE_NAV_BREAKPOINT } from '@/common/components/MobileAppTabBar/nav.constants'
import { Box, Typography } from '@/common/ui'
import { Link } from '@/common/ui/Link/Link'
import { alpha } from '@/common/ui/mui'
import { RoutesKeys } from '@/routes'
import { ChevronRightRounded } from '@mui/icons-material'
import { useTranslations } from 'next-intl'

/**
 * One "add a song" option. Mobile-first: a tappable row with a soft-tinted icon
 * tile, title + description and a trailing chevron. Above the phone breakpoint
 * the same element tree becomes the desktop's 200×200 card — a column with a
 * large plain icon and centred text, chevron hidden.
 *
 * One component rather than a phone/desktop pair: the content, the route and
 * the strings are identical, only the arrangement differs, so a breakpoint is
 * enough. Doing it in CSS also avoids the first-render desktop flash a JS
 * media query would cause.
 */
export default function CreateOptionItem({ option }: { option: CreateOption }) {
	const t = useTranslations('upload')
	const Icon = option.icon

	return (
		<Link to={option.to as RoutesKeys} params={{}}>
			<Box
				sx={(theme) => ({
					display: 'flex',
					alignItems: 'center',
					gap: 2,
					padding: 2,
					bgcolor: 'background.paper',
					border: '1px solid',
					borderColor: 'grey.200',
					borderRadius: 3,
					transition: 'background-color 0.15s, transform 0.2s ease-in-out',
					'&:active': { bgcolor: 'grey.100' },
					[theme.breakpoints.up(MOBILE_NAV_BREAKPOINT)]: {
						width: 200,
						height: 200,
						flexDirection: 'column',
						justifyContent: 'center',
						textAlign: 'center',
						gap: 1,
						'&:hover': { transform: 'scale(1.02)' },
					},
				})}
			>
				<Box
					sx={(theme) => ({
						width: 52,
						height: 52,
						flexShrink: 0,
						borderRadius: 2.5,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						fontSize: 26,
						color: 'primary.main',
						bgcolor: alpha(theme.palette.primary.main, 0.1),
						[theme.breakpoints.up(MOBILE_NAV_BREAKPOINT)]: {
							width: 'auto',
							height: 60,
							borderRadius: 0,
							fontSize: 48,
							bgcolor: 'transparent',
						},
					})}
				>
					<Icon fontSize="inherit" />
				</Box>

				<Box sx={{ flex: 1, minWidth: 0 }}>
					<Typography strong={600}>{t(option.titleKey)}</Typography>
					<Typography small color="grey.600">
						{t(option.subtitleKey)}
					</Typography>
				</Box>

				<ChevronRightRounded
					sx={(theme) => ({
						color: 'grey.400',
						flexShrink: 0,
						[theme.breakpoints.up(MOBILE_NAV_BREAKPOINT)]: { display: 'none' },
					})}
				/>
			</Box>
		</Link>
	)
}
