'use client'

import SvgIcon from '@/assets/icon.svg'
import { Box, Typography } from '@/common/ui'
// import { AnimatePresence } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { Gap } from '../../../ui/Gap/Gap'
import { Background } from '../Background'
import './LoadingScreen.styles.css'

const size = 56

type LoadingScreenProps = {
	isVisible?: boolean
}

export default function LoadingScreen({
	isVisible = true,
}: LoadingScreenProps) {
	const t = useTranslations('loadingScreen')
	return (
		<>
			{/* <AnimatePresence> */}
			{
				<div
					style={{
						position: 'fixed',
						zIndex: 10000,
						top: 0,
						left: 0,
						right: 0,
						bottom: 0,
						opacity: isVisible ? 1 : 0,
						pointerEvents: isVisible ? 'all' : 'none',
						transition: 'opacity 0.2s',
					}}
				>
					<Background />
					<Box
						sx={{
							display: 'flex',
							justifyContent: 'center',
							alignItems: 'center',
							height: '100vh',
							width: '100vw',
							color: 'black',
							// background: theme.palette.primary.main,
							flexDirection: 'column',
						}}
					>
						{/* Loading */}
						<SvgIcon fill="white" height={size} className="rotate" />
						{/* <CircularProgress
                    color="inherit"
                    size={size * 1.3}
                    thickness={2}
                    variant="indeterminate"
                    sx={{
                        position: "absolute",
                        zIndex: 1,
                        opacity: 0.2
                    }}
                /> */}
						<Gap value={2} />
						<Typography className="loadingText">
							{t('message')}
						</Typography>
					</Box>
				</div>
			}
			{/* </AnimatePresence> */}
		</>
	)
}
