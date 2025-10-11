'use client'
import { Box } from '@/common/ui'
import { Button } from '@/common/ui/Button'
import { ArrowBack } from '@mui/icons-material'
import { useEffect, useState } from 'react'

const INTERVAL_DURATION = 5000

type GoBackButtonProps = {
	onClick?: () => void
}

export default function GoBackButton(props: GoBackButtonProps) {
	const [active, setActive] = useState(false)

	useEffect(() => {
		let interval: NodeJS.Timeout | null = null
		const makeActive = () => {
			// if active then reset interval
			setActive(true)

			if (interval) {
				clearInterval(interval)
			}
			interval = setInterval(makeDisactive, INTERVAL_DURATION)
		}

		const makeDisactive = () => {
			setActive(false)
		}

		// if click or mouse move then active
		document.addEventListener('click', makeActive)
		document.addEventListener('mousemove', makeActive)

		return () => {
			document.removeEventListener('click', makeActive)
			document.removeEventListener('mousemove', makeActive)
		}
	})

	return (
		<Box
			padding={1}
			sx={{
				opacity: active ? 1 : 0,
				transition: 'opacity 0.5s',
			}}
		>
			<Button
				variant="text"
				color="white"
				startIcon={<ArrowBack />}
				// disabled={!active}
				onClick={props.onClick}
			>
				Opustit prezentaci
			</Button>
		</Box>
	)
}
