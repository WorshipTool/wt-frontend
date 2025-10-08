import { useApi } from '@/api/tech-and-hooks/useApi'
import useInnerTeam from '@/app/(submodules)/(teams)/sub/tymy/(teampage)/hooks/useInnerTeam'
import AdminOption from '@/common/components/admin/AdminOption'
import Popup from '@/common/components/Popup/Popup'
import { Button, TextInput, Typography } from '@/common/ui'
import { useApiState } from '@/tech/ApiState'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

export default function TeamPeopleAdminOption() {
	const t = useTranslations('teams.people')
	const tCommon = useTranslations('common')
	const [popupOpen, setPopupOpen] = useState(false)

	const [email, setEmail] = useState('')
	const { guid } = useInnerTeam()

	const { teamJoiningApi } = useApi()
	const { fetchApiState, apiState } = useApiState()
	const onClick = () => {
		if (!email) return
		fetchApiState(
			async () => {
				return teamJoiningApi.addByEmail({
					email,
					teamGuid: guid,
				})
			},
			() => {
				window.location.reload()
			}
		)
	}

	return (
		<>
			<AdminOption
				label={t('addNewMember')}
				onClick={() => setPopupOpen(true)}
			/>

			<Popup
				open={popupOpen}
				onClose={() => setPopupOpen(false)}
				onSubmit={onClick}
				title={t('addUser')}
				subtitle={t('addUserSubtitle')}
				actions={[
					<Button
						key={'cancel'}
						type="reset"
						variant="text"
						color="grey.900"
						size="small"
						disabled={apiState.loading}
					>
						{tCommon('cancel')}
					</Button>,
					<Button
						key={'cancel'}
						type="submit"
						variant="contained"
						color="primary"
						size="small"
						loading={apiState.loading}
					>
						{tCommon('add')}
					</Button>,
				]}
			>
				{apiState.error && (
					<Typography color="error">
						{t('addUserError')}
					</Typography>
				)}
				<TextInput
					value={email}
					onChange={setEmail}
					placeholder="Email"
					autoFocus
					type="email"
				/>
			</Popup>
		</>
	)
}
