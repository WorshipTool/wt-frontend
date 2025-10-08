'use client'
import { JoinTeamOutDto } from '@/api/generated'
import { useApi } from '@/api/tech-and-hooks/useApi'
import {
	NEW_TEAM_MEMBER_MESSAGE_GROUP,
	NEW_TEAM_MEMBER_MESSAGE_NAME,
} from '@/app/(submodules)/(teams)/sub/tymy/(teampage)/hooks/useTeamMembers'
import Popup from '@/common/components/Popup/Popup'
import { Button, TextInput, Typography } from '@/common/ui'
import { useLiveMessage } from '@/hooks/sockets/useLiveMessage'
import { useSmartNavigate } from '@/routes/useSmartNavigate'
import { useApiState } from '@/tech/ApiState'
import { useTranslations } from 'next-intl'
import { useSnackbar } from 'notistack'
import { useState } from 'react'

type Props = {
	open: boolean
	onClose: () => void
}

export default function JoinTeamPopup(props: Props) {
	const { teamJoiningApi } = useApi()

	const [joinCode, setJoinCode] = useState('')
	const { enqueueSnackbar } = useSnackbar()
	const tTeams = useTranslations('teams')

	const { fetchApiState, apiState } = useApiState<JoinTeamOutDto>()

	const navigate = useSmartNavigate()
	const { send } = useLiveMessage(NEW_TEAM_MEMBER_MESSAGE_GROUP)

	const onJoinClick = () => {
		fetchApiState(
			async () => {
				return teamJoiningApi.joinTeam({
					joinCode,
				})
			},
			(data) => {
				navigate('team', {
					alias: data.teamAlias,
				})

				if (data.newMember) {
					enqueueSnackbar(tTeams('joinPopup.success'))
					send(NEW_TEAM_MEMBER_MESSAGE_NAME, {})
				}
			}
		)
	}
	return (
		<Popup
			open={props.open}
			onClose={props.onClose}
			onSubmit={onJoinClick}
			title={tTeams('joinPopup.title')}
			subtitle={tTeams('joinPopup.subtitle')}
			actions={
				<>
					<Button sx={{}} type="submit" loading={apiState.loading}>
						{tTeams('joinPopup.joinButton')}
					</Button>
				</>
			}
		>
			{apiState.error && (
				<Typography color="red">
					{apiState.error.status === 404
						? tTeams('joinPopup.errors.notFound')
						: tTeams('joinPopup.errors.unknown')}
				</Typography>
			)}
			<TextInput
				placeholder={tTeams('joinPopup.placeholder')}
				value={joinCode}
				onChange={setJoinCode}
				autoFocus
			/>
		</Popup>
	)
}
