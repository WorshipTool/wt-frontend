import { useApi } from '@/api/tech-and-hooks/useApi'
import NoteContent from '@/app/(layout)/pisen/[hex]/[alias]/components/NoteContent'
import { useInnerPack } from '@/app/(layout)/pisen/[hex]/[alias]/hooks/useInnerPack'
import { MoreTeamSongOption } from '@/app/(submodules)/(teams)/sub/tymy/(teampage)/[alias]/pisen/[hex]/[title-alias]/components/MoreTeamSongOption'
import useInnerTeam from '@/app/(submodules)/(teams)/sub/tymy/(teampage)/hooks/useInnerTeam'
import { TeamPermissions } from '@/app/(submodules)/(teams)/sub/tymy/tech'
import MenuItem from '@/common/components/Menu/MenuItem'
import { Box } from '@/common/ui'
import { Button } from '@/common/ui/Button'
import { Gap } from '@/common/ui/Gap'
import { TextField } from '@/common/ui/TextField/TextField'
import { Typography } from '@/common/ui/Typography'
import { usePermission } from '@/hooks/permissions/usePermission'
import { useApiState, useApiStateEffect } from '@/tech/ApiState'
import { StickyNote2 } from '@mui/icons-material'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'

export default function TeamNotePanel() {
	const { teamSongNotesApi } = useApi()
	const { packGuid } = useInnerPack()
	const { guid: teamGuid, notes: allTeamNotes } = useInnerTeam()
	const t = useTranslations('song.teamNote')

	const [{ data, loading: getLoading }, reload] =
		useApiStateEffect(async () => {
			return teamSongNotesApi.getNotesOfVariantAndTeam(packGuid, teamGuid)
		}, [teamSongNotesApi, packGuid])

	const { fetchApiState: fetchSave, apiState: saveApiState } = useApiState()

	const notes = data?.notes || []

	const [content, setContent] = useState('')

	useEffect(() => {
		if (notes.length > 0) {
			setContent(notes[0].content)
		}
	}, [notes])

	const onSave = () => {
		const cnt = content.trim()
		fetchSave(
			async () => {
				if (cnt.length === 0) {
					if (notes.length > 0) {
						return teamSongNotesApi.deleteNote({
							noteGuid: notes[0].guid,
						})
					} else {
						return
					}
				}

				if (notes.length > 0) {
					return teamSongNotesApi.editNote({
						content: cnt,
						noteGuid: notes[0].guid,
					})
				}

				return teamSongNotesApi.addNoteToVariant({
					content: cnt,
					packGuid: packGuid,
					teamGuid: teamGuid,
				})
			},
			() => {
				reload()
				allTeamNotes.reload()
				setAdding(false)
			}
		)
	}
	const [adding, setAdding] = useState(false)

	const hasNote = notes.length > 0

	const isButtonDeleting = hasNote && content.trim().length === 0
	const isButtonCanceling = !hasNote && content.trim().length === 0
	const isContentEmpty = content.trim().length === 0

	const loading = saveApiState.loading || getLoading
	useEffect(() => {
		// ctrl s save
		const handleSave = (e: KeyboardEvent) => {
			if (!adding || isButtonDeleting) return
			if ((e.ctrlKey || e.metaKey) && e.key === 's') {
				e.preventDefault()
				onSave()
			}
		}
		window.addEventListener('keydown', handleSave)
		return () => {
			window.removeEventListener('keydown', handleSave)
		}
	}, [adding, onSave, isButtonDeleting])

	const onReset = () => {
		setContent(notes.length > 0 ? notes[0].content : '')
		setAdding(false)
	}

	const hasPermissionToEdit = usePermission<TeamPermissions>(
		'team.edit_song_note',
		{
			teamGuid,
		}
	)

	return (
		<>
			{hasPermissionToEdit && !hasNote && !adding && !loading && (
				<MoreTeamSongOption>
					<MenuItem
						title={t('add')}
						icon={<StickyNote2 />}
						onClick={() => {
							setAdding(true)
						}}
					/>
				</MoreTeamSongOption>
			)}

			{hasPermissionToEdit && hasNote && !adding && !loading && (
				<MoreTeamSongOption>
					<MenuItem
						title={t('edit')}
						icon={<StickyNote2 />}
						onClick={() => setAdding(true)}
					/>
				</MoreTeamSongOption>
			)}
			{(hasNote || adding) && (
				<Box display={'flex'} flexDirection={'column'}>
					<Box
						display={'flex'}
						sx={{
							bgcolor: 'grey.200',
							borderRadius: 3,
							padding: 2,
							// border: '1px inset solid  rgba(0,0,0,1)',
							outline: '1px solid ',
							// borderColor: 'primary.main',
							// borderColor: 'grey.400',
							outlineColor: 'grey.400',
							overflow: 'hidden',
							position: 'relative',
							// boxShadow: '0 0 2px 0 rgba(0,0,0,0.5)',
						}}
						flexDirection={'column'}
						maxWidth={300}
					>
						{!adding && (
							<Box
								sx={{
									width: 50,
									aspectRatio: 1,
									bgcolor: 'primary.main',
									// gradient
									// background: `l
									position: 'absolute',
									right: 0,
									bottom: 0,
									transform: 'translateY(50%) translateX(50%)  rotate(45deg) ',
									boxShadow: '0 0 2px 0 rgba(0,0,0,0.3)',
								}}
							/>
						)}
						<Box
							display={'flex'}
							flexDirection={'row'}
							// justifyContent={'space-between'}
							gap={1}
							alignItems={'center'}
							// color={'primary.main'}
						>
							{/* <Public
                                color="inherit"
                                fontSize="inherit"
                                sx={{
                                    // color: 'grey.700',
                                    fontSize: '1.2rem',
                                }}
                            /> */}
							<Typography>{t('title')}</Typography>
						</Box>
						<Box display={'flex'} flexDirection={'column'}>
							{adding ? (
								<Box display={'flex'} flexDirection={'column'}>
									<TextField
										value={content}
										onChange={(e) => setContent(e)}
										sx={{
											bgcolor: 'grey.300',
											borderRadius: 1,
											paddingLeft: 1,
											width: '100%',
											minHeight: 64,
										}}
										placeholder={t('placeholder')}
										multiline
										disabled={loading}
									/>
									<Gap />
									<Box
										display={'flex'}
										justifyContent={'space-between'}
										gap={1}
									>
										<Button
											size="small"
											onClick={onReset}
											variant="text"
											color="grey.700"
											disabled={loading}
										>
											{t('cancel')}
										</Button>
										<Button
											onClick={onSave}
											size="small"
											tooltip={
												isButtonDeleting
													? t('deleteTooltip')
													: t('saveTooltip')
											}
											variant="contained"
											color={isButtonDeleting ? 'error' : 'primary'}
											disabled={
												(isContentEmpty && !isButtonDeleting) || loading
											}
										>
											{isButtonDeleting ? t('delete') : t('save')}
										</Button>
									</Box>
								</Box>
							) : (
								<Box>
									{/* <TextField
                                              value={content}
                                              // onChange={(e) => setContent(e)}
                                              disabled
                                              // sx={{
                                              // 	bgcolor: 'grey.200',
                                              // 	// borderRadius: 3,
                                              // 	paddingLeft: 1,
                                              // }}
                                              multiline
                                          /> */}
									<NoteContent>{content}</NoteContent>
								</Box>
							)}
						</Box>
					</Box>
				</Box>
			)}
		</>
	)
}
