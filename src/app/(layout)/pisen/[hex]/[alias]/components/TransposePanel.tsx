'use client'

import { Box, Typography } from '@/common/ui'
import { alpha, styled } from '@/common/ui/mui'
import { Add, Remove } from '@mui/icons-material'
import { Gap } from '@/common/ui/Gap'
import { IconButton } from '@/common/ui/IconButton'
import { useTranslations } from 'next-intl'
import { Sheet } from '@pepavlin/sheet-api'

const StyledButton = styled(IconButton)(({ theme }) => ({
	color: 'black',
	// Mobile-friendly minimum touch target size
	minWidth: '44px',
	minHeight: '44px',
	// Enhanced visual prominence
	backgroundColor: alpha(theme.palette.grey[200], 0.5),
	'&:hover': {
		backgroundColor: alpha(theme.palette.grey[300], 0.7),
	},
	'&:active': {
		backgroundColor: alpha(theme.palette.grey[400], 0.8),
	},
	'&.Mui-disabled': {
		backgroundColor: alpha(theme.palette.grey[100], 0.3),
	},
}))

const Container = styled(Box)(({ theme }) => ({
	borderRadius: 8,
	padding: 8,
	paddingLeft: 12,
	paddingRight: 12,
	boxShadow: `0px 0px 6px ${alpha(theme.palette.grey[400], 0.8)}`,
	display: 'flex',
	flexDirection: 'row',
	justifyContent: 'center',
	alignItems: 'center',
	gap: 8,
}))

const KeyDisplay = styled(Box)(({ theme }) => ({
	display: 'flex',
	flexDirection: 'column',
	alignItems: 'center',
	justifyContent: 'center',
	padding: '4px 12px',
	borderRadius: 6,
	backgroundColor: alpha(theme.palette.primary.main, 0.1),
	border: `2px solid ${alpha(theme.palette.primary.main, 0.3)}`,
	minWidth: '60px',
}))

export default function TransposePanel({
	transpose,
	disabled = true,
	sheet,
}: {
	transpose: (i: number) => void
	disabled?: boolean
	sheet?: Sheet
}) {
	const tTranspose = useTranslations('songPage.transpose')

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

	return (
		<Container>
			{/* {disabled ? (
                <>
                    <Button disabled>Píseň nemá akordy</Button>
                </>
            ) : ( */}
			<>
				<Typography
					strong={400}
					sx={{
						color: disabled ? 'lightgrey' : 'black',
					}}
					size={'small'}
					uppercase
				>
					{tTranspose('title')}
				</Typography>
				<Gap horizontal value={0.5} />
				<StyledButton
					disabled={disabled}
					onClick={() => {
						transpose(-1)
					}}
					size="medium"
					tooltip={tTranspose('decrease')}
					sx={{
						fontSize: '1.5rem',
					}}
				>
					<Remove fontSize="inherit" />
				</StyledButton>
				{currentKey && (
					<KeyDisplay>
						<Typography
							strong={600}
							sx={{
								color: 'primary.main',
								lineHeight: 1,
								fontSize: '0.75rem',
							}}
							size={'small'}
						>
							Tónina
						</Typography>
						<Typography
							strong={700}
							sx={{
								color: 'primary.main',
								lineHeight: 1.2,
								fontSize: '1.1rem',
							}}
						>
							{currentKey}
						</Typography>
					</KeyDisplay>
				)}
				<StyledButton
					disabled={disabled}
					onClick={() => {
						transpose(1)
					}}
					size="medium"
					tooltip={tTranspose('increase')}
					sx={{
						fontSize: '1.5rem',
					}}
				>
					<Add fontSize="inherit" />
				</StyledButton>
			</>
			{/* )} */}
		</Container>
	)
}
