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
										boxShadow: '0 4px 20px rgba(0, 133, 255, 0.3)',
										'&:hover': {
											boxShadow: '0 6px 28px rgba(0, 133, 255, 0.4)',
											transform: 'translateY(-2px)',
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
