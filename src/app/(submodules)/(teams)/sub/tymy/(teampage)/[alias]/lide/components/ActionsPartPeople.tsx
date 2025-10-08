import { TeamMemberDto } from '@/api/generated'
import useInnerTeam from '@/app/(submodules)/(teams)/sub/tymy/(teampage)/hooks/useInnerTeam'
import { TeamPermissions } from '@/app/(submodules)/(teams)/sub/tymy/tech'
import { Box } from '@/common/ui'
import { IconButton } from '@/common/ui/IconButton'
import { usePermission } from '@/hooks/permissions/usePermission'
import { Done, Edit, PersonRemove } from '@mui/icons-material'
import { useTranslations } from 'next-intl'

type RightSideItemProps = {
	data: TeamMemberDto
	editable: boolean
	onEditableChange: (editable: boolean) => void
	selectable: boolean
	onRemove: () => void
	isCreator: boolean
}

export default function ActionsPartPeople(props: RightSideItemProps) {
	const t = useTranslations('teams.people')
	const onEditClick = () => {
		props.onEditableChange(true)
	}

	const onDoneClick = () => {
		props.onEditableChange(false)
	}
	const { guid: teamGuid } = useInnerTeam()
	const kickPermission = usePermission<TeamPermissions>('team.kick_member', {
		teamGuid: teamGuid,
	})
	const setRolePermission = usePermission<TeamPermissions>(
		'team.set_member_role',
		{
			teamGuid: teamGuid,
		}
	)
	return props.isCreator ? (
		<Box />
	) : (
		<Box display={'flex'} flexDirection={'row'} alignItems={'center'} gap={2}>
			{!kickPermission ? null : props.editable ? (
				<>
					<IconButton
						onClick={onDoneClick}
						color="success"
						tooltip={t('saveRole')}
					>
						<Done />
					</IconButton>
				</>
			) : (
				<IconButton
					onClick={onEditClick}
					disabled={props.selectable || !setRolePermission}
					tooltip={t('changeRole')}
				>
					<Edit />
				</IconButton>
			)}
			{setRolePermission && (
				<IconButton
					disabled={props.selectable || !kickPermission}
					onClick={props.onRemove}
					tooltip={t('removeFromTeam')}
				>
					<PersonRemove />
				</IconButton>
			)}
		</Box>
	)
}
