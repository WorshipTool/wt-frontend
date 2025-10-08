import { TeamMemberDto } from '@/api/generated'
import ActionsPartPeople from '@/app/(submodules)/(teams)/sub/tymy/(teampage)/[alias]/lide/components/ActionsPartPeople'
import RolePart from '@/app/(submodules)/(teams)/sub/tymy/(teampage)/[alias]/lide/components/RolePart'
import useInnerTeam from '@/app/(submodules)/(teams)/sub/tymy/(teampage)/hooks/useInnerTeam'
import { TeamMemberRole } from '@/app/(submodules)/(teams)/sub/tymy/tech'
import Popup from '@/common/components/Popup/Popup'
import { Box } from '@/common/ui'
import { Button } from '@/common/ui/Button'
import { Tooltip } from '@/common/ui/CustomTooltip/Tooltip'
import { Avatar, Checkbox } from '@/common/ui/mui'
import { Typography } from '@/common/ui/Typography'
import { UserGuid } from '@/interfaces/user'
import { useSmartNavigate } from '@/routes/useSmartNavigate'
import { ExitToApp } from '@mui/icons-material'
import { useSnackbar } from 'notistack'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'

type PeopleListItemProps = {
	data: TeamMemberDto
	selectable?: boolean
	me?: boolean
	selected: boolean
	onSelectChange: (selected: boolean) => void
	onMemberRemove: (guid: UserGuid) => void
	onChangeRole: (guid: UserGuid, role: TeamMemberRole) => void
	hideActions?: boolean
	hideEmail?: boolean
}

export default function PeopleListItem(props: PeopleListItemProps) {
	const t = useTranslations('teams.people')
	const fullName = `${props.data.firstName} ${props.data.lastName}`
	const [_editable, setEditable] = useState(false)

	const [popupOpen, setPopupOpen] = useState(false)

	const [role, setRole] = useState<TeamMemberRole>(props.data.role)
	const navigate = useSmartNavigate()
	const { enqueueSnackbar } = useSnackbar()
	useEffect(() => {
		if (props.selectable) {
			setEditable(false)
		}
	}, [props.selectable])

	const editable = useMemo(() => {
		return _editable && !props.me && !props.selectable
	}, [_editable, props.me, props.selectable])

	const onRemove = useCallback(() => {
		props.onMemberRemove(props.data.userGuid as UserGuid)
		setPopupOpen(false)
		if (props.me) {
			navigate('teams', {})
			enqueueSnackbar(t('leftTeam'))
		}
	}, [])

	const onEditableChange = useCallback(
		(editable: boolean) => {
			setEditable(editable)
			if (!editable) {
				props.onChangeRole(props.data.userGuid as UserGuid, role)
			}
		},
		[role, props.data]
	)

	const { createdByGuid } = useInnerTeam()
	const isCreator = useMemo(() => {
		if (!createdByGuid) return false
		return createdByGuid === props.data.userGuid
	}, [createdByGuid])

	const hideActions = props.hideActions

	return (
		<>
			{props.selectable && (
				<Box display={'flex'} justifyContent={'center'} alignItems={'center'}>
					<Checkbox
						size="small"
						checked={props.selected}
						onChange={(e) => {
							props.onSelectChange(e.target.checked)
						}}
					/>
				</Box>
			)}
			<Box>
				<Avatar />
			</Box>
			<Box>
				<Typography>{fullName}</Typography>
			</Box>
			{!props.hideEmail && (
				<Box>
					<Typography>{props.data.email}</Typography>
				</Box>
			)}
			<RolePart
				editable={editable}
				role={role}
				onRoleChange={setRole}
				isOwner={isCreator}
			/>
			{!hideActions && <Box></Box>}
			{!hideActions &&
				(!props.me ? (
					<ActionsPartPeople
						data={props.data}
						editable={editable}
						onEditableChange={onEditableChange}
						selectable={Boolean(props.selectable)}
						onRemove={() => setPopupOpen(true)}
						isCreator={isCreator}
					/>
				) : (
					<Box display={'flex'} flexDirection={'row'} justifyContent={'end'}>
						<Tooltip
							label={
								isCreator ? t('cannotLeaveOwnedTeam') : ''
							}
						>
							<Button
								tooltip={t('leaveTeam')}
								color="error"
								size="small"
								variant="outlined"
								endIcon={<ExitToApp />}
								disabled={props.selectable || isCreator}
								onClick={() => setPopupOpen(true)}
							>
								{t('leave')}
							</Button>
						</Tooltip>
					</Box>
				))}
			<Popup
				open={popupOpen}
				onClose={() => setPopupOpen(false)}
				title={props.me ? t('leaveTeamConfirm') : t('removeFromTeamConfirm')}
				subtitle={
					props.me
						? t('leaveTeamDescription')
						: t('removeFromTeamDescription')
				}
				actions={
					<>
						<Box flex={1} />

						<Button
							variant="text"
							color="error"
							size="small"
							onClick={onRemove}
						>
							{props.me ? t('leave') : t('remove')}
						</Button>
						<Button size="small" type="reset">
							{t('cancel')}
						</Button>
					</>
				}
			></Popup>
		</>
	)
}
