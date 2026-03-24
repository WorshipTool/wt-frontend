'use client'

import LeftWebTitle from '@/common/components/Toolbar/components/LeftWebTItle'
import MiddleNavigationPanel from '@/common/components/Toolbar/components/MiddleNavigationPanel/MiddleNavigationPanel'
import NavigationMobilePanel from '@/common/components/Toolbar/components/MiddleNavigationPanel/NavigationMobilePanel'
import RightAccountPanel from '@/common/components/Toolbar/components/RightAccountPanel/RightAccountPanel'
import { useToolbar } from '@/common/components/Toolbar/hooks/useToolbar'
import { Box, useTheme } from '@/common/ui'
import { styled, useMediaQuery } from '@mui/system'
import { motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'

const TopBar = styled(Box)(() => ({
	right: 0,
	left: 0,
	top: 0,
	height: 56,
	display: 'flex',
	flexDirection: 'column',
	displayPrint: 'none',
	zIndex: 10,
	pointerEvents: 'none',
	transition: 'all 0.3s ease',
}))

export function Toolbar() {
	const theme = useTheme()

	const { transparent, variant, whiteVersion, hidden } = useToolbar()

	const white = useMemo(() => {
		return whiteVersion || !transparent
	}, [whiteVersion, transparent])

	const [init, setInit] = useState(false)
	useEffect(() => {
		setInit(true)
	}, [])

	const navigationInMiddle = useMediaQuery(theme.breakpoints.up('md'))

	return (
		<>
			<TopBar
				displayPrint={'none'}
				position={'sticky'}
				zIndex={0}
				sx={{
					transform: hidden ? 'translateY(-100%)' : 'translateY(0)',
				}}
			></TopBar>
			<TopBar
				displayPrint={'none'}
				position={'fixed'}
				sx={{
					transform: hidden ? 'translateY(-100%)' : 'translateY(0)',
				}}
			>
				{/* Neon background layer */}
				<motion.div
					style={{
						background:
							variant === 'dark'
								? 'linear-gradient(90deg, #0a0a0f, #0e0e1a)'
								: 'linear-gradient(90deg, rgba(10, 10, 15, 0.95), rgba(14, 14, 26, 0.95))',
						backdropFilter: 'blur(20px)',
						position: 'absolute',
						left: 0,
						right: 0,
						top: 0,
						bottom: 0,
						borderBottom: variant === 'transparent' ? 'none' : '1px solid rgba(0, 229, 255, 0.15)',
						boxShadow: variant === 'transparent' ? 'none' : '0 2px 20px rgba(0, 229, 255, 0.08), 0 1px 0 rgba(123, 47, 255, 0.1)',
					}}
					initial={{ opacity: variant === 'transparent' ? 0 : 1 }}
					animate={{ opacity: variant === 'transparent' ? 0 : 1 }}
					transition={{ duration: 0.3 }}
				/>

				<Box
					zIndex={0}
					flexDirection={'row'}
					justifyContent={'space-between'}
					alignItems={'center'}
					display={'flex'}
					flex={1}
					height={'100%'}
					color={!white ? '#e8e8ff' : '#e8e8ff'}
				>
					<LeftWebTitle />
					{navigationInMiddle && <MiddleNavigationPanel />}

					<Box
						sx={{
							opacity: init ? 1 : 0,
							transition: 'opacity 0.3s',
							display: 'flex',
							flexDirection: 'row',
							paddingRight: 2,
						}}
					>
						<RightAccountPanel />
						{!navigationInMiddle && <MiddleNavigationPanel />}
					</Box>
				</Box>
			</TopBar>
			<NavigationMobilePanel />
		</>
	)
}
