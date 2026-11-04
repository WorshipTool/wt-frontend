'use client'

import { SURFACE_CARD_SX } from '@/common/constants/surfaces'
import { Box, Button, TextField, Typography } from '@/common/ui'
import { alpha } from '@/common/ui/mui'
import { FileUploadRounded } from '@mui/icons-material'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { isImportableFile } from './useFilePicker'

type ImportSourceFormProps = {
	url: string
	onUrlChange: (url: string) => void
	onSubmitUrl: () => void
	/** Opens the system file picker (must run inside the click). */
	onPickFile: () => void
	onDropFile: (file: File) => void
	urlInputRef?: React.Ref<HTMLInputElement>
}

/**
 * Where a song comes from: a card with the link field, and under it a compact
 * drop tile for a PDF or a photo. The same form whichever way the user arrived;
 * only what has the focus differs, and that is the page's business.
 */
export default function ImportSourceForm(props: ImportSourceFormProps) {
	const t = useTranslations('upload.import.form')
	const [dragging, setDragging] = useState(false)

	const onDrop = (e: React.DragEvent) => {
		e.preventDefault()
		setDragging(false)
		const file = Array.from(e.dataTransfer.files).find(isImportableFile)
		if (file) props.onDropFile(file)
	}

	return (
		<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
			<Box
				component="form"
				onSubmit={(e: React.FormEvent) => {
					e.preventDefault()
					props.onSubmitUrl()
				}}
				sx={{
					...SURFACE_CARD_SX,
					padding: 2,
					display: 'flex',
					flexDirection: 'column',
					gap: 1,
				}}
			>
				<Box sx={{ display: 'flex', gap: 1, alignItems: 'stretch' }}>
					<TextField
						value={props.url}
						onChange={props.onUrlChange}
						placeholder={t('urlPlaceholder')}
						aria-label={t('urlLabel')}
						inputRef={props.urlInputRef}
						sx={{
							flex: 1,
							minWidth: 0,
							bgcolor: 'surface.sunken',
							borderRadius: 2,
							paddingX: 1.5,
							minHeight: 44,
							'&.Mui-focused': {
								outline: '2px solid',
								outlineColor: 'primary.main',
							},
						}}
					/>
					<Button type="submit" disabled={!props.url.trim()}>
						{t('load')}
					</Button>
				</Box>
				<Typography small color="grey.600">
					{t('urlHint')}
				</Typography>
			</Box>

			<Box
				onDragOver={(e) => {
					e.preventDefault()
					setDragging(true)
				}}
				onDragLeave={() => setDragging(false)}
				onDrop={onDrop}
				sx={(theme) => ({
					display: 'flex',
					alignItems: 'center',
					flexWrap: 'wrap',
					gap: 2,
					padding: 2,
					borderRadius: 3,
					border: '1px dashed',
					borderColor: dragging ? 'primary.main' : 'grey.400',
					bgcolor: dragging
						? alpha(theme.palette.primary.main, 0.06)
						: 'surface.card',
					transition: 'border-color 0.15s, background-color 0.15s',
				})}
			>
				<FileUploadRounded
					sx={{
						fontSize: 32,
						color: dragging ? 'primary.main' : 'grey.500',
						flexShrink: 0,
					}}
				/>
				<Typography strong={500} sx={{ flex: 1, minWidth: 0 }}>
					{dragging ? t('dropActive') : t('dropTitle')}
				</Typography>
				<Button variant="outlined" onClick={props.onPickFile}>
					{t('chooseFile')}
				</Button>
			</Box>
		</Box>
	)
}
