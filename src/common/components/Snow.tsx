'use client'
import { Box } from '@/common/ui'
import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import Snowfall from 'react-snowfall'
import { useSmartMatch } from '../../routes/useSmartMatch'
import OnScrollComponent from '../providers/OnScrollComponent/OnScrollComponent'

export default function Snow() {
	const sizeCoef = 0.4
	const isHome = useSmartMatch('home')

	const [blur, setBlur] = useState(0)

	return (
		<Box displayPrint={'none'}>
			<OnScrollComponent
				onChange={(_, y) => {
					const level = Math.min(1, Math.pow(y / 100, 3))
					setBlur(level * 10)
				}}
			/>
			<AnimatePresence>
				<motion.div
					initial={{
						opacity: 0,
					}}
					animate={{
						opacity: 1,
					}}
					exit={{
						opacity: 0,
					}}
				>
					{isHome && (
						<Snowfall
							snowflakeCount={30}
							speed={[0.2, 1]}
							color="#4faaff44"
							radius={[5 * sizeCoef, 15 * sizeCoef]}
							style={{
								zIndex: -100,
								opacity: 0.8,
								filter: `blur(${blur}px)`,

								transition: 'all 0.1s ',
								position: 'fixed',
								top: 0,
							}}
						/>
					)}
				</motion.div>
			</AnimatePresence>
		</Box>
	)
}
