import { teamMemberRoles } from '@/app/(submodules)/(teams)/sub/tymy/(teampage)/[alias]/lide/components/RolePart'
import useInnerTeam from '@/app/(submodules)/(teams)/sub/tymy/(teampage)/hooks/useInnerTeam'
import {
	TeamMemberRole,
	TeamPermissions,
} from '@/app/(submodules)/(teams)/sub/tymy/tech'
import Menu from '@/common/components/Menu/Menu'
import MenuItem, { MenuItemObjectType } from '@/common/components/Menu/MenuItem'
import Popup from '@/common/components/Popup/Popup'
import { Box } from '@/common/ui'
import { Button } from '@/common/ui/Button'
import { Tooltip } from '@/common/ui/CustomTooltip/Tooltip'
import useAuth from '@/hooks/auth/useAuth'
import { usePermission } from '@/hooks/permissions/usePermission'
import { UserGuid } from '@/interfaces/user'
import { ExpandMore } from '@mui/icons-material'
import { useCallback, useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'

type SelectedPeopleActionsProps = {
	selected: UserGuid[]
	onRemove: (guid: UserGuid) => void
	onRoleChange: (guid: UserGuid, role: TeamMemberRole) => void
}

export default function SelectedPeopleActions(
	props: SelectedPeopleActionsProps
) {
	const t = useTranslations('teams.people')
	const [open, setOpen] = useState(false)
	const [roleMenuOpen, setRoleMenuOpen] = useState(false)
	const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
	const [roleAnchorEl, setRoleAnchorEl] = useState<HTMLElement | null>(null)

	const { user } = useAuth()

	const { guid: teamGuid, createdByGuid } = useInnerTeam()

	const [popupOpen, setPopupOpen] = useState(false)

	const onClick = useCallback((e: React.MouseEvent<HTMLElement>) => {
		setAnchorEl(e.currentTarget)
		setOpen(true)
	}, [])

	const onChangeRoleClick = useCallback((e: React.MouseEvent<HTMLElement>) => {
		setRoleAnchorEl(e.currentTarget)
		setRoleMenuOpen(true)
	}, [])

	const onRemoveClick = useCallback(() => {
		props.selected.forEach((guid) => {
			props.onRemove(guid)
		})

		closeAll()
	}, [props.selected])

	const onRoleChange = useCallback(
		(role: TeamMemberRole) => {
			props.selected.forEach((guid) => {
				props.onRoleChange(guid, role)
			})
			closeAll()
		},
		[props.selected]
	)

	const closeAll = useCallback(() => {
		setOpen(false)
		setRoleMenuOpen(false)
		setPopupOpen(false)
	}, [])
	const kickPermission = usePermission<TeamPermissions>('team.kick_member', {
		teamGuid: teamGuid,
	})
	const setRolePermission = usePermission<TeamPermissions>(
		'team.set_member_role',
		{
			teamGuid: teamGuid,
		}
	)

	const moreIcon = useMemo(() => <ExpandMore />, [])

	const includesMe = useMemo(
		() => user && props.selected.includes(user.guid),
		[props.selected, user]
	)
	const includesCreator = useMemo(
		() => props.selected.includes(createdByGuid),
		[props.selected, teamGuid]
	)
	const disabledAction = useMemo(
		() => includesMe || includesCreator,
		[includesMe, includesCreator]
	)
	const menuItems: MenuItemObjectType[] = useMemo(
		() => [
			...(kickPermission
				? [
						{
							title: t('removeFromTeam'),
							onClick: () => setPopupOpen(true),
							disabled: !kickPermission || disabledAction,
						},
				  ]
				: []),
			...(setRolePermission
				? [
						{
							title: t('setRoleTo'),
							onClick: onChangeRoleClick,
							disabled: !setRolePermission || disabledAction,
						},
				  ]
				: []),
		],
		[
			onChangeRoleClick,
			setPopupOpen,
			kickPermission,
			setRolePermission,
			disabledAction,
		]
	)

	return (
		<Box>
			{menuItems.length > 0 && (
				<Button
					size="small"
					onClick={onClick}
					disabled={props.selected.length === 0}
					endIcon={moreIcon}
				>
					{t('actions')}
				</Button>
			)}

			<Menu open={open} anchor={anchorEl} onClose={() => setOpen(false)}>
				{menuItems.map((item, index) => (
					<Tooltip
						key={item.title + ''}
						label={disabledAction ? t('cannotEditSelfOrOwner') : ''}
						placement="left"
					>
						<MenuItem {...item} />
					</Tooltip>
				))}
			</Menu>

			<Menu
				open={roleMenuOpen}
				anchor={roleAnchorEl}
				anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
				transformOrigin={{ vertical: 'top', horizontal: 'right' }}
				onClose={() => setRoleMenuOpen(false)}
				items={Object.entries(teamMemberRoles).map(([key, value]) => ({
					title: value,
					onClick: () => onRoleChange(key as any as TeamMemberRole),
				}))}
			/>
			<Popup
				open={popupOpen}
				onClose={() => setPopupOpen(false)}
				title={t('confirmRemove')}
				subtitle={t('confirmRemoveSelectedPeople')}
				actions={[
					<>
						<Button
							size="small"
							color="black"
							variant="text"
							onClick={() => {
								setPopupOpen(false)
							}}
						>
							{t('cancel')}
						</Button>
						<Tooltip label={includesMe ? t('cannotRemoveSelf') : ''}>
							<Button
								size="small"
								color="error"
								onClick={() => {
									onRemoveClick()
								}}
								disabled={disabledAction}
							>
								{t('remove')}
							</Button>
						</Tooltip>
					</>,
				]}
			/>
		</Box>
	)
}
