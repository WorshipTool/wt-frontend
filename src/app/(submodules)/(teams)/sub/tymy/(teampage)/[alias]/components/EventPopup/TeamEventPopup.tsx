import {
	CreateTeamEventInDto,
	PlaylistData,
	TeamEventMemberData,
} from '@/api/generated'
import EventPopupGridRow from '@/app/(submodules)/(teams)/sub/tymy/(teampage)/[alias]/components/EventPopup/EventPopupGridRow'
import TeamEventMemberChip from '@/app/(submodules)/(teams)/sub/tymy/(teampage)/[alias]/components/EventPopup/TeamEventMemberChip'
import TeamEventPopupEditableInput from '@/app/(submodules)/(teams)/sub/tymy/(teampage)/[alias]/components/EventPopup/TeamEventPopupEditableInput'
import TeamMemberSelect from '@/app/(submodules)/(teams)/sub/tymy/(teampage)/[alias]/components/TeamMemberSelect/TeamMemberSelect'
import TeamPlaylistSelect from '@/app/(submodules)/(teams)/sub/tymy/(teampage)/[alias]/components/TeamPlaylistSelect/TeamPlaylistSelect'
import useInnerTeam from '@/app/(submodules)/(teams)/sub/tymy/(teampage)/hooks/useInnerTeam'
import { TeamPermissions } from '@/app/(submodules)/(teams)/sub/tymy/tech'
import Popup from '@/common/components/Popup/Popup'
import { Box, Divider, Tooltip, useTheme } from '@/common/ui'
import { Button } from '@/common/ui/Button'
import { Gap } from '@/common/ui/Gap'
import { IconButton } from '@/common/ui/IconButton'
import { Avatar, Chip } from '@/common/ui/mui'
import { Grid } from '@/common/ui/mui/Grid'
import { TextField } from '@/common/ui/TextField/TextField'
import { Typography } from '@/common/ui/Typography'
import { usePermission } from '@/hooks/permissions/usePermission'
import { usePermissions } from '@/hooks/permissions/usePermissions'
import { useSmartParams } from '@/routes/useSmartParams'
import {
	Add,
	ChangeCircle,
	Close,
	EditCalendar,
	EventNote,
	OpenInNew,
	QueueMusic,
	Warning,
} from '@mui/icons-material'
import { DatePicker } from '@mui/x-date-pickers'
import dayjs from 'dayjs'
import { useSnackbar } from 'notistack'
import { useEffect, useState } from 'react'
import { useUserProfileImage } from '../../../../../../../../../hooks/useUserProfileImage'
import { useTranslations } from 'next-intl'
type Member = TeamEventMemberData
export type TeamEventPopupData = {
	guid?: string
	title: string
	description: string
	date: Date
	leader: Member
	members: Member[]
	playlist: PlaylistData
}

type TeamEventPopupProps = {
	open: boolean
	onClose: () => void
	editable?: boolean
	data?: Partial<TeamEventPopupData>

	onSubmit?: () => any
	onDelete?: () => any

	createMode?: boolean
	submitting?: boolean

	lockPlaylist?: boolean
	hideOpenPlaylistButton?: boolean
}

export default function TeamEventPopup({
	data = {},
	editable: editableProp,
	...props
}: TeamEventPopupProps) {
	const theme = useTheme()
	const t = useTranslations('teams.events')

	const [editable, setEditable] = useState(editableProp)
	useEffect(() => {
		setEditable(editableProp)
	}, [editableProp])

	const {
		guid,
		events: { deleteEvent, editEvent, addEvent, events },
	} = useInnerTeam()

	const { alias } = useSmartParams('team')

	const [leaderSelectOpen, setLeaderSelectOpen] = useState(false)
	const [leaderSelectAnchor, setLeaderSelectAnchor] =
		useState<HTMLElement | null>(null)

	const [leader, setLeader] = useState<Member | null>(data.leader || null)

	const onLeaderSelect = (member: Member) => {
		setLeader(member)
		setLeaderSelectOpen(false)
	}
	const openLeaderSelect = (e: React.MouseEvent<HTMLElement>) => {
		setLeaderSelectOpen(true)
		setLeaderSelectAnchor(e.currentTarget)
	}

	const [memberSelectOpen, setMemberSelectOpen] = useState(false)
	const [memberSelectAnchor, setMemberSelectAnchor] =
		useState<HTMLElement | null>(null)

	const [members, setMembers] = useState<Member[]>(data.members || [])

	const onMemberRemove = (member: Member) => {
		setMembers(members.filter((m) => m.userGuid !== member.userGuid))
	}
	const onMemberAdd = (member: Member) => {
		setMembers([...members, member])
	}
	const openMemberSelect = (e: React.MouseEvent<HTMLElement>) => {
		setMemberSelectOpen(true)
		setMemberSelectAnchor(e.currentTarget)
	}

	const [title, setTitle] = useState(data.title)
	const [description, setDescription] = useState(data.description)

	const onTitleChange = (value: string) => {
		setTitle(value)
	}
	const onDescriptionChange = (value: string) => {
		setDescription(value)
	}

	const [playlistSelectOpen, setPlaylistSelectOpen] = useState(false)
	const [playlistSelectAnchor, setPlaylistSelectAnchor] =
		useState<HTMLElement | null>(null)

	const [playlist, setPlaylist] = useState<PlaylistData | null>(
		data.playlist || null
	)
	const onPlaylistSelect = (playlist: PlaylistData) => {
		setPlaylist(playlist)
		setPlaylistSelectOpen(false)

		if (!title || title === '') {
			setTitle(playlist.title)
		}
	}

	const openPlaylistSelect = (e: React.MouseEvent<HTMLElement>) => {
		setPlaylistSelectOpen(true)
		setPlaylistSelectAnchor(e.currentTarget)
	}

	// Filter function for the playlist select, filter out playlists that are already planned
	const playlistFilterFunc = (playlist: PlaylistData) => {
		if (!playlist) return false
		return !events?.some((event) => event.playlist?.guid === playlist.guid)
	}

	const [date, setDate] = useState<Date | null>(data.date || null)
	const onDateChange = (date: Date | null) => {
		setDate(date)
	}

	useEffect(() => {
		if (data.title && data.title !== title) setTitle(data.title)
		if (data.description && data.description !== description)
			setDescription(data.description)
		if (data.date && data.date !== date) setDate(data.date)
		if (data.leader && data.leader !== leader) setLeader(data.leader)
		if (data.members && data.members !== members) setMembers(data.members)
		if (data.playlist && data.playlist !== playlist) setPlaylist(data.playlist)
	}, [data])

	// Check if the date is in the past, today is ok
	const isPastDate = date ? dayjs(date).isBefore(dayjs(), 'day') : false

	const canSubmit = Boolean(title && date && leader && members && playlist)

	const allData: CreateTeamEventInDto = {
		teamGuid: guid,
		playlistGuid: playlist?.guid || '',
		memberUserGuids: members.map((m) => m.userGuid),
		leaderUserGuid: leader?.userGuid || '',
		eventDate: date?.toISOString() || '',
		eventTitle: title || '',
		eventDescription: description || '',
	}

	const { enqueueSnackbar } = useSnackbar()
	const { reload: reloadPermissions } = usePermissions()

	const onSubmit = async () => {
		if (!title || !date || !leader || !playlist) return
		if (props.createMode) {
			if (await addEvent(allData)) {
				onReset()
				props.onClose()
				enqueueSnackbar(t('eventCreated'))
				props.onSubmit?.()
				reloadPermissions()
			}
		} else {
			if (
				await editEvent({
					...allData,
					eventGuid: data.guid || '',
				})
			) {
				onReset()
				props.onClose()
				props.onSubmit?.()
			}
		}
	}

	const onReset = () => {
		if (props.createMode) {
			props.onClose()
		}
		setTitle(data.title)
		setDescription(data.description)
		setDate(data.date || null)
		setLeader(data.leader || null)
		setMembers(data.members || [])
		setPlaylist(data.playlist || null)
		setEditable(editableProp)
		setDeleteSecond(false)
	}

	const [deleteSecond, setDeleteSecond] = useState(false)

	const hasPermissionToEdit = usePermission<TeamPermissions>(
		'team.edit_event',
		{
			eventGuid: data.guid || '',
		}
	)
	const hasPermissionToDelete = usePermission<TeamPermissions>(
		'team.delete_event',
		{
			eventGuid: data.guid || '',
		}
	)

	const onClose = () => {
		if (!props.createMode) onReset()
		props.onClose()
	}

	const leaderImage = useUserProfileImage(leader?.userGuid)

	return (
		<>
			<Popup
				open={props.open}
				onClose={onClose}
				width={600}
				onSubmit={onSubmit}
				onReset={onReset}
				actions={[
					...(editable
						? [
								!props.createMode && hasPermissionToDelete && (
									<Button
										key={'deletebutton'}
										color="error"
										tooltip={t('deleteEventTooltip')}
										variant={deleteSecond ? 'contained' : 'text'}
										onClick={async () => {
											if (deleteSecond) {
												await deleteEvent(data.guid || '')
												props.onClose()
												props.onDelete?.()
												setDeleteSecond(false)
											} else {
												setDeleteSecond(true)
											}
										}}
									>
										{deleteSecond ? t('confirmDelete') : t('delete')}
									</Button>
								),
								<Box key={'gap1'} />,
								<Box
									display={'flex'}
									flexDirection={'row'}
									gap={1}
									key={'buttons1'}
								>
									<Button
										onClick={onReset}
										variant="text"
										color="grez.700"
										key={'cancel'}
										type="reset"
										loading={props.submitting}
									>
										{t('cancel')}
									</Button>

									<Button
										key={'asdfalsdfalk'}
										type="submit"
										disabled={!canSubmit}
										loading={props.submitting}
									>
										{props.createMode ? t('create') : t('save')}
									</Button>
								</Box>,
						  ]
						: playlist && !props.hideOpenPlaylistButton
						? [
								<Box key={'gap2'} />,
								<Button
									key={'playlist'}
									variant={editable ? 'outlined' : 'contained'}
									endIcon={<OpenInNew />}
									tooltip={t('openPlaylistTooltip')}
									color={editable ? undefined : 'primarygradient'}
									to="teamPlaylist"
									toParams={{ alias: alias, guid: playlist.guid }}
									target="_blank"
									disabled={props.submitting}
								>
									{t('openPlaylist')}
								</Button>,
								<Box key={'gap3'} />,
						  ]
						: []),
				]}
			>
				{/* Header */}
				<Box
					sx={{
						position: 'absolute',
						top: 0,
						left: 0,
						right: 0,
						height: theme.spacing(4),
						display: 'flex',
						flexDirection: 'column',
						justifyContent: 'space-between',
						bgcolor: 'grey.100',
						borderTopLeftRadius: theme.spacing(2),
						borderTopRightRadius: theme.spacing(2),
					}}
				>
					<Box
						display={'flex'}
						flexDirection={'row'}
						alignItems={'center'}
						justifyContent={'center'}
						flex={1}
						paddingX={4}
						color={'grey.700'}
						gap={1}
						sx={{
							userSelect: 'none',
						}}
						position={'relative'}
					>
						{editable ? (
							<EditCalendar
								fontSize="inherit"
								sx={{
									fontSize: '1rem',
								}}
							/>
						) : (
							<EventNote
								fontSize="inherit"
								sx={{
									fontSize: '1rem',
								}}
							/>
						)}
						<Typography size={'small'}>
							{props.createMode ? t('createEvent') : t('eventDetail')}
						</Typography>

						<Box
							sx={{
								position: 'absolute',
								right: 3,
								opacity: 0.7,
							}}
						>
							<IconButton size="small" onClick={props.onClose}>
								<Close
									fontSize="inherit"
									sx={{
										fontSize: '1rem',
									}}
								/>
							</IconButton>
						</Box>
					</Box>
					<Divider />
				</Box>

				{!editable && hasPermissionToEdit && (
					<Box
						sx={{
							position: 'absolute',
							right: theme.spacing(2),
							top: theme.spacing(6),
						}}
					>
						{data.guid && (
							<Button
								variant="outlined"
								startIcon={<EditCalendar />}
								onClick={() => {
									setEditable(true)
								}}
							>
								{t('edit')}
							</Button>
						)}
					</Box>
				)}

				{/* Content */}
				<Box display={'flex'} flexDirection={'row'} gap={3} marginTop={3}>
					<Box display={'flex'} flexDirection={'column'} gap={2}>
						{/* Title, Description */}
						<Box display={'flex'} flexDirection={'column'}>
							<>
								<TeamEventPopupEditableInput
									placeholder={t('eventNamePlaceholder')}
									tooltip={
										props.createMode
											? t('nameEventTooltip')
											: t('renameEventTooltip')
									}
									value={title}
									editable={editable}
									autoFocus
									onChange={onTitleChange}
								/>
							</>
							<Gap value={0.5} />
							<Tooltip label={t('changeDescriptionTooltip')} disabled={!editable}>
								{editable || (description && description?.length > 0) ? (
									<TextField
										placeholder={t('addDescriptionPlaceholder')}
										// tooltip="Change description"
										value={description}
										sx={{
											fontWeight: 400,
											fontSize: '1rem',
											color: 'grey.700',
											borderRadius: 1,
											'&:hover': editable
												? {
														bgcolor: 'grey.100',
												  }
												: {},
											'&:focus-within': editable ? { bgcolor: 'grey.100' } : {},
											paddingX: 1,
											paddingY: 0.5,
											userSelect: 'none',
										}}
										onChange={onDescriptionChange}
										disabled={!editable}
									/>
								) : (
									<></>
								)}
							</Tooltip>
							{/* <Gap />
							<Divider
								sx={{
									marginX: 1,
								}}
							/> */}
						</Box>

						{/* Details */}
						<Grid container spacing={3} padding={1}>
							<EventPopupGridRow label={t('date')}>
								{/* <Typography strong>25.7. 2024 9:00</Typography> */}
								<Box display={'flex'} flexDirection={'row'} gap={1}>
									<DatePicker
										label={t('eventDateLabel')}
										slotProps={{
											popper: {
												disablePortal: true,
											},
											textField: { size: 'small' },
										}}
										format="LL"
										disabled={!editable}
										value={date && dayjs(date)}
										onChange={(date) => onDateChange(date?.toDate() || null)}
										sx={{
											minWidth: 240,
										}}
									/>

									{isPastDate && editable ? (
										<Box
											display={'flex'}
											flexDirection={'row'}
											alignItems={'center'}
											gap={1}
										>
											<Warning color="warning" fontSize="small" />
											<Typography size={'small'}>
												{t('pastDateWarning')}
											</Typography>
										</Box>
									) : null}
								</Box>
							</EventPopupGridRow>

							{/* Leader*/}
							<EventPopupGridRow label={t('leader')}>
								<Box
									display={'flex'}
									flexDirection={'row'}
									alignItems={'center'}
									gap={0.5}
								>
									{leader && (
										<Chip
											avatar={<Avatar src={leaderImage} />}
											label={leader.firstName + ' ' + leader.lastName}
											// size="small"
											// color="primary"
											onClick={() => {}}
											deleteIcon={<ChangeCircle />}
											onDelete={editable ? openLeaderSelect : undefined}
										/>
									)}

									{editable && !leader && (
										<Tooltip label={t('chooseLeaderTooltip')}>
											<Chip
												label={t('choose')}
												variant="outlined"
												icon={<Add />}
												// size="small"
												onClick={openLeaderSelect}
											/>
										</Tooltip>
									)}
								</Box>

								<TeamMemberSelect
									open={leaderSelectOpen}
									onClose={() => setLeaderSelectOpen(false)}
									anchor={leaderSelectAnchor}
									onSelect={(member) => onLeaderSelect(member)}
								/>
							</EventPopupGridRow>

							{/* Members */}
							<EventPopupGridRow label={t('members')}>
								{members?.map((member, index) => (
									<TeamEventMemberChip
										key={member.userGuid}
										member={member}
										editable={editable}
										onMemberRemove={() => onMemberRemove(member)}
									/>
								))}
								{editable && (
									<Tooltip label={t('addMemberTooltip')}>
										<Chip
											label={t('add')}
											icon={<Add />}
											// size="small"
											onClick={openMemberSelect}
											variant="outlined"
										/>
									</Tooltip>
								)}

								<TeamMemberSelect
									open={memberSelectOpen}
									onClose={() => setMemberSelectOpen(false)}
									anchor={memberSelectAnchor}
									onSelect={onMemberAdd}
									filterFunc={(member) => {
										const alreadyAdded = members.find(
											(m) => m.userGuid === member.userGuid
										)
										const isLeader = leader?.userGuid === member.userGuid
										return !alreadyAdded && !isLeader
									}}
								/>
							</EventPopupGridRow>

							<EventPopupGridRow label="Playlist">
								{playlist && (
									<Chip
										label={playlist?.title}
										onClick={() => {}}
										icon={<QueueMusic />}
										// size="small"
										deleteIcon={<ChangeCircle />}
										onDelete={
											editable && !props.lockPlaylist
												? openPlaylistSelect
												: undefined
										}
									/>
								)}

								{editable && !playlist && (
									<Tooltip label={t('selectPlaylistTooltip')}>
										<Chip
											label={t('choose')}
											variant="outlined"
											icon={<Add />}
											// size="small"
											onClick={openPlaylistSelect}
										/>
									</Tooltip>
								)}

								<TeamPlaylistSelect
									open={playlistSelectOpen}
									onClose={() => setPlaylistSelectOpen(false)}
									anchor={playlistSelectAnchor}
									onSelect={onPlaylistSelect}
									filterFunc={playlistFilterFunc}
								/>
							</EventPopupGridRow>
						</Grid>
					</Box>
				</Box>
				{!props.hideOpenPlaylistButton && <Gap />}
			</Popup>
		</>
	)
}
