import { CornerStack } from '@/common/components/CornerStack'
import { Box, Tooltip } from '@/common/ui'
import { Fab } from '@/common/ui/mui'
import { Add } from '@mui/icons-material'
import { AnimatePresence, motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { Link } from '../../../common/ui/Link/Link'
import useAuth from '../../../hooks/auth/useAuth'

interface FloatingAddButtonProps {
	extended?: boolean
}

export default function FloatingAddButton({
	extended,
}: FloatingAddButtonProps) {
	const { isLoggedIn } = useAuth()
	const tNavigation = useTranslations('navigation')
	const tHome = useTranslations('home')

	const transition = 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
	const titleWidth = '90px'
	return (
		<CornerStack corner="bottom-right" order={0}>
			<Link to="addMenu" params={{}}>
				<AnimatePresence>
					{isLoggedIn() && (
						<motion.div
							initial={{ opacity: 0, scale: 0.8 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 0.8 }}
							transition={{
								duration: 0.3,
								ease: [0.25, 0.46, 0.45, 0.94],
							}}
						>
							<Tooltip
								title={tNavigation('tooltips.addSong')}
								placement="left"
							>
								<Fab
									sx={{
										transition,
										background: 'linear-gradient(135deg, #00e5ff 0%, #7b2fff 50%, #ff00e5 100%)',
										color: '#0a0a0f',
										fontFamily: 'var(--font-orbitron)',
										fontWeight: 700,
										letterSpacing: '0.08em',
										boxShadow: '0 0 20px rgba(0, 229, 255, 0.3), 0 0 40px rgba(123, 47, 255, 0.15)',
										border: '1px solid rgba(0, 229, 255, 0.3)',
										'&:hover': {
											background: 'linear-gradient(135deg, #00e5ff 0%, #ff00e5 50%, #7b2fff 100%)',
											boxShadow: '0 0 30px rgba(0, 229, 255, 0.5), 0 0 60px rgba(255, 0, 229, 0.2)',
											transform: 'translateY(-3px) scale(1.05)',
										},
										...(extended
											? { width: `calc( ${titleWidth} + 56px)` }
											: { width: 56 }),
									}}
									color="primary"
									variant={extended ? 'extended' : 'circular'}
								>
									<Add
										sx={{
											position: 'absolute',
											transition,
											filter: 'drop-shadow(0 0 4px rgba(0, 229, 255, 0.5))',
											...(extended ? { mr: titleWidth } : { mr: 0 }),
										}}
									/>
									<Add sx={{ opacity: 0 }} />
									<Box
										sx={{
											transition,
											overflowWrap: 'none',
											overflow: 'hidden',
											...(extended
												? { width: titleWidth }
												: { width: 0, opacity: 0 }),
										}}
									>
										{tHome('floatingAdd.label')}
									</Box>
								</Fab>
							</Tooltip>
						</motion.div>
					)}
				</AnimatePresence>
			</Link>
		</CornerStack>
	)
}
