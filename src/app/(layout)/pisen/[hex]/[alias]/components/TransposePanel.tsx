'use client'

import { Box, Typography } from '@/common/ui'
import { alpha, styled } from '@/common/ui/mui'
import { Add, Remove, RestartAlt } from '@mui/icons-material'
import { Gap } from '../../../../../../common/ui/Gap'
import { IconButton } from '../../../../../../common/ui/IconButton'
import { useTranslations } from 'next-intl'
import { Sheet } from '@pepavlin/sheet-api'
import { useMemo } from 'react'

const StyledButton = styled(IconButton)(({ theme }) => ({
	color: 'black',
	// Larger touch targets for mobile
	minWidth: 44,
	minHeight: 44,
	'@media (max-width: 600px)': {
		minWidth: 48,
		minHeight: 48,
	},
}))

const ResetButton = styled(IconButton)(({ theme }) => ({
	color: theme.palette.primary.main,
	minWidth: 44,
	minHeight: 44,
	'@media (max-width: 600px)': {
		minWidth: 48,
		minHeight: 48,
	},
}))

const Container = styled(Box)(({ theme }) => ({
	borderRadius: 8,
	padding: '8px 12px',
	boxShadow: `0px 0px 6px ${alpha(theme.palette.grey[400], 0.8)}`,
	display: 'flex',
	flexDirection: 'row',
	justifyContent: 'center',
	alignItems: 'center',
	gap: 8,
	flexWrap: 'wrap',
	'@media (max-width: 600px)': {
		padding: '12px 16px',
		gap: 12,
	},
}))

const CurrentKeyDisplay = styled(Box)(({ theme }) => ({
	display: 'flex',
	flexDirection: 'column',
	alignItems: 'center',
	justifyContent: 'center',
	minWidth: 60,
	'@media (max-width: 600px)': {
		minWidth: 80,
	},
}))

export default function TransposePanel({
	transpose,
	disabled = true,
	currentSheet,
	originalSheet,
	onReset,
}: {
	transpose: (i: number) => void
	disabled?: boolean
	currentSheet?: Sheet
	originalSheet?: Sheet
	onReset?: () => void
}) {
	const tTranspose = useTranslations('songPage.transpose')

	const currentKey = useMemo(() => {
		if (!currentSheet) return null
		return currentSheet.getKeyNote()
	}, [currentSheet])

	const originalKey = useMemo(() => {
		if (!originalSheet) return null
		return originalSheet.getKeyNote()
	}, [originalSheet])

	const isTransposed = useMemo(() => {
		if (!currentKey || !originalKey) return false
		return currentKey !== originalKey
	}, [currentKey, originalKey])

	return (
		<Container>
			{!disabled && currentKey && (
				<>
					<CurrentKeyDisplay>
						<Typography
							size={'xsmall'}
							sx={{
								color: 'grey',
								lineHeight: 1,
								marginBottom: '2px',
							}}
						>
							{tTranspose('currentKey')}
						</Typography>
						<Typography
							strong={600}
							sx={{
								color: 'black',
								fontSize: '1.5rem',
								lineHeight: 1,
							}}
						>
							{currentKey}
						</Typography>
					</CurrentKeyDisplay>
					<Box
						sx={{
							width: '1px',
							height: 40,
							backgroundColor: alpha('#000', 0.1),
						}}
					/>
				</>
			)}
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
			<StyledButton
				disabled={disabled}
				onClick={() => {
					transpose(-1)
				}}
				size="medium"
				tooltip={tTranspose('decrease')}
			>
				<Remove fontSize="large" />
			</StyledButton>
			<StyledButton
				disabled={disabled}
				onClick={() => {
					transpose(1)
				}}
				size="medium"
				tooltip={tTranspose('increase')}
			>
				<Add fontSize="large" />
			</StyledButton>
			{!disabled && isTransposed && onReset && (
				<>
					<Box
						sx={{
							width: '1px',
							height: 40,
							backgroundColor: alpha('#000', 0.1),
						}}
					/>
					<ResetButton
						onClick={onReset}
						size="medium"
						tooltip={tTranspose('reset')}
					>
						<RestartAlt fontSize="medium" />
					</ResetButton>
				</>
			)}
		</Container>
	)
}
