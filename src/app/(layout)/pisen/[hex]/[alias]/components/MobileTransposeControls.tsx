'use client'

import { Box, Typography } from '@/common/ui'
import { alpha, styled, useTheme } from '@/common/ui/mui'
import { Add, Remove, RestartAlt } from '@mui/icons-material'
import { IconButton } from '@/common/ui/IconButton'
import { useTranslations } from 'next-intl'
import { Sheet } from '@pepavlin/sheet-api'
import { useDownSize } from '@/common/hooks/useDownSize'

const MobileControlsContainer = styled(Box)(({ theme }) => ({
	position: 'fixed',
	bottom: 0,
	left: 0,
	right: 0,
	backgroundColor: alpha(theme.palette.background.paper, 0.95),
	backdropFilter: 'blur(10px)',
	boxShadow: `0px -4px 12px ${alpha(theme.palette.grey[500], 0.3)}`,
	padding: '12px 16px',
	display: 'flex',
	flexDirection: 'row',
	justifyContent: 'space-around',
	alignItems: 'center',
	gap: 12,
	zIndex: 1000,
	// Only show on mobile/tablet
	[theme.breakpoints.up('md')]: {
		display: 'none',
	},
}))

const TransposeButton = styled(IconButton)(({ theme }) => ({
	color: 'white',
	backgroundColor: theme.palette.primary.main,
	minWidth: '56px',
	minHeight: '56px',
	borderRadius: '50%',
	boxShadow: `0px 4px 8px ${alpha(theme.palette.primary.main, 0.4)}`,
	'&:hover': {
		backgroundColor: theme.palette.primary.dark,
		boxShadow: `0px 6px 12px ${alpha(theme.palette.primary.main, 0.6)}`,
	},
	'&:active': {
		transform: 'scale(0.95)',
	},
	'&.Mui-disabled': {
		backgroundColor: alpha(theme.palette.grey[400], 0.5),
		color: alpha(theme.palette.common.white, 0.5),
	},
	transition: 'all 0.2s',
}))

const ResetButton = styled(IconButton)(({ theme }) => ({
	color: theme.palette.text.secondary,
	backgroundColor: alpha(theme.palette.grey[300], 0.5),
	minWidth: '48px',
	minHeight: '48px',
	borderRadius: '50%',
	'&:hover': {
		backgroundColor: alpha(theme.palette.grey[400], 0.7),
	},
	'&:active': {
		transform: 'scale(0.95)',
	},
	'&.Mui-disabled': {
		backgroundColor: alpha(theme.palette.grey[200], 0.3),
		color: alpha(theme.palette.text.secondary, 0.3),
	},
	transition: 'all 0.2s',
}))

const KeyDisplayBox = styled(Box)(({ theme }) => ({
	display: 'flex',
	flexDirection: 'column',
	alignItems: 'center',
	justifyContent: 'center',
	padding: '8px 16px',
	borderRadius: 8,
	backgroundColor: alpha(theme.palette.primary.main, 0.1),
	border: `2px solid ${alpha(theme.palette.primary.main, 0.3)}`,
	minWidth: '80px',
}))

interface MobileTransposeControlsProps {
	transpose: (i: number) => void
	reset?: () => void
	disabled?: boolean
	sheet?: Sheet
	originalKey?: string
}

export default function MobileTransposeControls({
	transpose,
	reset,
	disabled = true,
	sheet,
	originalKey,
}: MobileTransposeControlsProps) {
	const tTranspose = useTranslations('songPage.transpose')
	const theme = useTheme()
	const isMobile = useDownSize('md')

	// Only render on mobile/tablet
	if (!isMobile) {
		return null
	}

	// Get current key from sheet
	const getCurrentKey = () => {
		if (!sheet) return null
		const keyChord = sheet.getKeyChord()
		if (!keyChord) return null

		// Determine signature (sharp vs flat)
		const root = keyChord.data.rootNote.toString('sharp')
		const quality = keyChord.data.quality

		let signature: 'sharp' | 'flat' = 'sharp'
		if (root === 'A#') signature = 'flat'
		if (root === 'C' && quality === 'm') signature = 'flat'
		if (root === 'D' && quality === 'm') signature = 'flat'
		if (root === 'F') signature = 'flat'

		const noteString = keyChord.data.rootNote.toString(signature)
		const qualityString = quality === 'm' ? ' mol' : ' dur'

		return noteString + qualityString
	}

	const currentKey = getCurrentKey()
	const isTransposed = originalKey && currentKey && originalKey !== currentKey

	if (disabled) {
		return null
	}

	return (
		<MobileControlsContainer>
			<TransposeButton
				disabled={disabled}
				onClick={() => transpose(-1)}
				tooltip={tTranspose('decrease')}
				sx={{
					fontSize: '2rem',
				}}
			>
				<Remove fontSize="inherit" />
			</TransposeButton>

			{currentKey && (
				<KeyDisplayBox>
					<Typography
						strong={600}
						sx={{
							color: 'primary.main',
							lineHeight: 1,
							fontSize: '0.7rem',
							textTransform: 'uppercase',
						}}
						size={'small'}
					>
						Tónina
					</Typography>
					<Typography
						strong={700}
						sx={{
							color: 'primary.main',
							lineHeight: 1.3,
							fontSize: '1.3rem',
						}}
					>
						{currentKey}
					</Typography>
					{isTransposed && originalKey && (
						<Typography
							strong={400}
							sx={{
								color: 'text.secondary',
								lineHeight: 1,
								fontSize: '0.65rem',
								textDecoration: 'line-through',
							}}
							size={'small'}
						>
							{originalKey}
						</Typography>
					)}
				</KeyDisplayBox>
			)}

			{reset && (
				<ResetButton
					disabled={disabled || !isTransposed}
					onClick={reset}
					tooltip="Původní tónina"
					sx={{
						fontSize: '1.5rem',
					}}
				>
					<RestartAlt fontSize="inherit" />
				</ResetButton>
			)}

			<TransposeButton
				disabled={disabled}
				onClick={() => transpose(1)}
				tooltip={tTranspose('increase')}
				sx={{
					fontSize: '2rem',
				}}
			>
				<Add fontSize="inherit" />
			</TransposeButton>
		</MobileControlsContainer>
	)
}
