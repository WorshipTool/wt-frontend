'use client'
import { CreateTeamOutDto } from '@/api/generated'
import { useApi } from '@/api/tech-and-hooks/useApi'
import Popup from '@/common/components/Popup/Popup'
import { Box } from '@/common/ui'
import { Button } from '@/common/ui/Button'
import { TextField } from '@/common/ui/TextField/TextField'
import { Typography } from '@/common/ui/Typography'
import { useSmartNavigate } from '@/routes/useSmartNavigate'
import { useApiState } from '@/tech/ApiState'
import { grey } from '@mui/material/colors'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

export default function CreateTeamButton() {
	// Popup
	const [popupOpen, setPopupOpen] = useState(false)

	// Apis
	const { teamAddingApi } = useApi()
	const { apiState, fetchApiState } = useApiState<CreateTeamOutDto>()

	// Input states
	const [teamName, setTeamName] = useState('')

	const navigate = useSmartNavigate()

	const t = useTranslations('teams')
	const tCommon = useTranslations('common')

	const onClick = () => {
		setPopupOpen(true)
	}

	const onCancel = () => {
		setPopupOpen(false)
		setTeamName('')
	}

	const onCreateClick = () => {
		fetchApiState(
			() =>
				teamAddingApi.createNewTeam({
					teamName,
				}),
			(data) => {
				navigate('team', {
					alias: data.alias,
				})
			}
		)
	}

	return (
		<>
			<Popup
				open={popupOpen}
				onSubmit={onCreateClick}
				onClose={() => setPopupOpen(false)}
				onReset={onCancel}
				width={300}
				title={t('createTeam')}
				subtitle={t('createPrivateTeam')}
				actions={
					<>
						<Button
							title={tCommon('cancel')}
							color="grey.700"
							// size="small"
							variant="text"
							type="reset"
						/>
						<Button
							title={t('createTeam')}
							color="primary"
							// size="small"
							loading={apiState.loading}
							type="submit"
						/>
					</>
				}
			>
				<Box display={'flex'} flexDirection={'column'} gap={1}>
					<TextField
						placeholder={t('enterTeamName')}
						value={teamName}
						onChange={setTeamName}
						autoFocus
						sx={{
							bgcolor: 'grey.100',
							padding: 1,
							borderRadius: 1,
							border: `1px solid ${grey[300]}`,
						}}
					/>
					{apiState.error && (
						<>
							<Typography color="error">
								{t('errorMessage')}
							</Typography>
						</>
					)}
				</Box>
			</Popup>
			<Button
				title={t('tryOut')}
				subtitle={t('createTeam')}
				color="secondary"
				sx={{
					width: 150,
				}}
				onClick={onClick}
			/>
		</>
	)
}
