'use client'

/**
 * News Popup Component
 *
 * Popup window displaying new features and news.
 * Shows automatically when there are unseen news items.
 */

import Popup from '@/common/components/Popup/Popup'
import { Z_INDEX } from '@/common/constants/zIndex'
import { theme } from '@/common/constants/theme'
import { Box, Button, IconButton } from '@/common/ui'
import { Gap } from '@/common/ui/Gap'
import { Typography } from '@/common/ui/Typography'
import { alpha } from '@/common/ui/mui'
import { useNews } from './NewsContext'

import { keyframes } from '@emotion/react'
import { Close } from '@mui/icons-material'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'

const bgMove = keyframes`
0% {
  transform: translate3d(-120px, -80px, 0) scale(1) rotate(-3deg);
}
50% {
  transform: translate3d(120px, 80px, 0) scale(1.12) rotate(4deg);
}
100% {
  transform: translate3d(-120px, -80px, 0) scale(1) rotate(-3deg);
}
`
/**
 * Main popup component for news
 */
export function NewsPopup() {
	const {
		isPopupOpen,
		closePopup,
		enableSpotlight,
		markAsSeen,
		markAsTried,
		newsToShow,
	} = useNews()
	const router = useRouter()
	const t = useTranslations('news')

	const handleClose = () => {
		// Mark all news as seen on close
		markAsSeen()
		closePopup()
	}

	// Function to scroll to element
	const scrollToElement = (elementId: string) => {
		const element =
			document.querySelector(`[data-news-target="${elementId}"]`) ||
			document.getElementById(elementId)

		if (element) {
			element.scrollIntoView({
				behavior: 'smooth',
				block: 'center',
			})
		}
	}

	// Handler for "Try" button - navigates and scrolls to component
	const handleTryFeature = () => {
		enableSpotlight() // Enable spotlight effect (dark background)
		closePopup()

		if (activeNew.tutorial?.steps && activeNew.tutorial?.steps.length > 0) {
			markAsSeen()
		} else {
			markAsTried()
		}

		const elementId = activeNew.tutorial?.targetComponent
		const navigateTo = activeNew.tutorial?.navigateTo

		// If navigation path is specified
		if (navigateTo) {
			// Navigate to page
			router.push(navigateTo as '/')

			// After navigation scroll to element (with longer delay for page load)
			if (elementId) {
				setTimeout(() => {
					scrollToElement(elementId)
				}, 500)
			}
		} else if (elementId) {
			// If no navigation, just scroll to element on current page
			setTimeout(() => {
				scrollToElement(elementId)
			}, 300)
		}
	}

	// Don't render if there are no unseen news
	if (!newsToShow) {
		return null
	}

	const activeNew = newsToShow

	return (
		<Popup
			open={isPopupOpen}
			onClose={handleClose}
			// title="Co je nového"
			// icon={
			// 	<Celebration
			// 		sx={{
			// 			color: 'primary.main',
			// 			fontSize: 28,
			// 		}}
			// 	/>
			// }
			sx={{
				position: 'relative',
				overflow: 'hidden',
				'&::before': {
					content: '""',
					position: 'absolute',
					inset: -140,
					background: `
                    /* bílý střed */
                    radial-gradient(420px 320px at 50% 50%, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.6) 35%, transparent 70%),

                    /* barevné bloby */
                    radial-gradient(520px 420px at 15% 25%, ${theme.palette.primary.main}44 0%, transparent 65%),
                    radial-gradient(480px 380px at 85% 20%, ${theme.palette.primary.main}33 0%, transparent 65%),
                    radial-gradient(520px 420px at 60% 85%, ${theme.palette.primary.dark}22 0%, transparent 70%)
          `,
					zIndex: Z_INDEX.BASE,
					filter: 'blur(22px)',
					opacity: 1,
					pointerEvents: 'none',
					willChange: 'transform',
					transform: 'translate3d(0,0,0)',
					animation: `${bgMove} 8s ease-in-out infinite`, // schválně rychlé, ať je to vidět
				},
			}}
			width={480}
		>
			<Box
				sx={{
					zIndex: Z_INDEX.RAISED,
				}}
			>
				<Box
					sx={{
						display: 'flex',
						justifyContent: 'space-between',
						alignItems: 'center',
					}}
				>
					<Box
						sx={{
							bgcolor: (theme) => alpha(theme.palette.primary.main, 0.6),
							color: 'white',
							width: 'fit-content',
							padding: '2px 12px',
							borderRadius: 2,
						}}
					>
						<Typography variant="subtitle1" strong={500}>
							{t('popupLabel')}
						</Typography>
					</Box>

					<IconButton small onClick={handleClose}>
						<Close fontSize="inherit" />
					</IconButton>
				</Box>
				<Gap value={2} />
				<Box
					display="flex"
					flexDirection="column"
					gap={2}
					maxHeight="60vh"
					sx={{ overflowY: 'auto' }}
				>
					<Typography
						variant="h4"
						strong
						sx={{
							letterSpacing: '0.02em',
						}}
					>
						{activeNew.title}
					</Typography>
					<Typography variant="subtitle1" strong={300}>
						{activeNew.description}
					</Typography>
				</Box>
				<Gap value={2} />
				<Box
					sx={{
						display: 'flex',
						justifyContent: 'center',
					}}
				>
					<Button
						sx={{
							opacity: 0.9,
							borderRadius: 3,
							paddingX: 5,
						}}
						color="primarygradient"
						onClick={handleTryFeature}
					>
						{t('popupTryIt')}
					</Button>
				</Box>
				<Gap value={1} />
			</Box>
		</Popup>
	)
}
