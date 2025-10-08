import { useApi } from '@/api/tech-and-hooks/useApi'
import NoteContent from '@/app/(layout)/pisen/[hex]/[alias]/components/NoteContent'
import { useInnerPack } from '@/app/(layout)/pisen/[hex]/[alias]/hooks/useInnerPack'
import { Box } from '@/common/ui'
import { Button } from '@/common/ui/Button'
import { Gap } from '@/common/ui/Gap'
import { IconButton } from '@/common/ui/IconButton'
import { TextField } from '@/common/ui/TextField/TextField'
import { Typography } from '@/common/ui/Typography'
import { useApiState, useApiStateEffect } from '@/tech/ApiState'
import { AddComment, Edit } from '@mui/icons-material'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'

export default function UserNotePanel() {
	const { songNotesApi } = useApi()
	const { packGuid } = useInnerPack()
	const t = useTranslations('song.userNote')

	const [{ data, loading: getLoading }, reload] =
		useApiStateEffect(async () => {
			return songNotesApi.getNotesOfVariantAndUser(packGuid)
		}, [songNotesApi, packGuid])

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
						return songNotesApi.deleteNote({
							noteGuid: notes[0].guid,
						})
					} else {
						return
					}
				}

				if (notes.length > 0) {
					return songNotesApi.editNote({
						content: cnt,
						noteGuid: notes[0].guid,
					})
				}

				return songNotesApi.addNoteToVariant({
					content: cnt,
					packGuid,
				})
			},
			() => {
				reload()
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

	return (
		<Box display={'flex'} flexDirection={'column'}>
			<Box display={'flex'} justifyContent={'end'}>
				{!hasNote && !adding && !loading && (
					<IconButton
						onClick={() => {
							setAdding(true)
						}}
						tooltip={t('add')}
					>
						<AddComment />
					</IconButton>
				)}
			</Box>

			{(hasNote || adding) && (
				<Box
					display={'flex'}
					sx={{
						bgcolor: 'grey.300',
						borderRadius: 3,
						padding: 2,
					}}
					flexDirection={'column'}
					maxWidth={300}
				>
					<Box
						display={'flex'}
						flexDirection={'row'}
						justifyContent={'space-between'}
						gap={1}
						alignItems={'center'}
					>
						<Typography>{t('title')}</Typography>
						{
							<IconButton
								onClick={() => setAdding(true)}
								size="small"
								tooltip={t('edit')}
								disabled={adding || loading}
								sx={{
									opacity: adding ? 0 : 1,
								}}
							>
								<Edit
									fontSize="inherit"
									sx={{
										fontSize: '1.2rem',
									}}
								/>
							</IconButton>
						}
					</Box>
					<Box display={'flex'} flexDirection={'column'}>
						{adding ? (
							<Box display={'flex'} flexDirection={'column'}>
								<TextField
									value={content}
									onChange={(e) => setContent(e)}
									sx={{
										bgcolor: 'grey.200',
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
								<Box display={'flex'} justifyContent={'space-between'} gap={1}>
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
										disabled={(isContentEmpty && !isButtonDeleting) || loading}
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
			)}
		</Box>
	)
}
