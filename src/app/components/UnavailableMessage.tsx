'use client'
import { useCloudConfig } from '@/common/providers/FeatureFlags/cloud-config/useCloudConfig'
import { Box } from '@/common/ui'
import { Card } from '@/common/ui/Card/Card'
import { Typography } from '@/common/ui/Typography'
import { BugReport, Build, PrecisionManufacturing } from '@mui/icons-material'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
import { Gap } from '../../common/ui/Gap/Gap'

export default function UnavailableMessage() {
	const [isUnavailable, setIsUnvailable] = useState(false)
	const t = useTranslations('maintenance')

	const flagEnabled = useCloudConfig(
		'basic',
		'APP_TEMPORARILY_UNAVAILABLE',
		false
	)
	useEffect(() => {
		if (flagEnabled) setIsUnvailable(flagEnabled)
	}, [flagEnabled])

	// if user write on keyboard "please", then set isUnvailable to false
	useEffect(() => {
		const keysDown: string[] = []
		const mustContain = ['p', 'l', 'e', 'a', 's', 'e']
		const onKeyDown = (e: KeyboardEvent) => {
			keysDown.push(e.key)

			if (mustContain.every((key) => keysDown.includes(key))) {
				setIsUnvailable(false)
			}
		}
		const onKeyUp = (e: KeyboardEvent) => {
			keysDown.splice(keysDown.indexOf(e.key), 1)
		}
		window.addEventListener('keydown', onKeyDown)
		window.addEventListener('keyup', onKeyUp)
		return () => {
			window.removeEventListener('keydown', onKeyDown)
			window.removeEventListener('keyup', onKeyUp)
		}
	}, [])

	const padding = '0rem'
	return (
		<>
			{isUnavailable && (
				<Card
					style={{
						position: 'fixed',
						bottom: padding,
						left: padding,
						right: padding,
						top: padding,
						color: 'white',
						padding: '1rem',
						textAlign: 'center',
						zIndex: 9999,
						backgroundColor: 'rgba(0, 0, 0, 0.5)',
						backdropFilter: 'blur(20px)',
						display: 'flex',
						flexDirection: 'column',
						justifyContent: 'center',
					}}
				>
					<Box
						display={'flex'}
						flexDirection={'row'}
						gap={1}
						justifyContent={'center'}
						alignItems={'center'}
					>
						<Build
							fontSize="inherit"
							sx={{
								fontSize: '4rem',
							}}
						/>
						<BugReport
							fontSize="inherit"
							sx={{
								fontSize: '5rem',
							}}
						/>
						<PrecisionManufacturing
							fontSize="inherit"
							sx={{
								fontSize: '5rem',
							}}
						/>
					</Box>
					<Gap value={2} />
					<Typography variant="h4" strong>
						{t('workInProgress')}
					</Typography>
					<Gap />
					<Typography variant="h5" strong={100}>
						{t('temporarilyUnavailable')} <br />
						{t('tryAgainLater')}
					</Typography>
				</Card>
			)}
		</>
	)
}
