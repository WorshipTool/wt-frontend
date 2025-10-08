import { Box, Button, Typography } from '@/common/ui'
import { InputBase, Paper, styled } from '@/common/ui/mui'
import { Sheet } from '@pepavlin/sheet-api'
import { useTranslations } from 'next-intl'
import React, { useMemo } from 'react'
import DefaultStyle from '../../../../common/components/SheetDisplay/styles/DefaultStyle'

interface UploadSheetEditableProps {
	title: string
	data: string
	originalFile: File
	onDelete?: () => void
	onChange?: (title: string, data: string) => void
}

const StyledInput = styled(InputBase)(({ theme }) => ({
	backgroundColor: theme.palette.grey[100],
}))

export default function UploadSheetEditable(props: UploadSheetEditableProps) {
	const t = useTranslations('upload.sheet')
	const tCommon = useTranslations('common')
	const [editable, setEditable] = React.useState(false)

	const [title, setTitle] = React.useState(props.title)
	const [sheetData, setSheetData] = React.useState(props.data)

	const sheet = useMemo(() => {
		props.onChange?.(title, sheetData)
		return new Sheet(sheetData)
	}, [sheetData, title, props])

	return (
		<Paper
			sx={{
				padding: 2,
				marginBottom: 2,
			}}
		>
			<Box sx={{}}>
				<Box
					sx={{
						display: 'flex',
						flexDirection: 'row',
						justifyContent: 'space-between',
						alignItems: 'center',
					}}
				>
					<Button
						color="error"
						onClick={() => {
							props.onDelete?.()
						}}
						size="small"
					>
						{tCommon('discard')}
					</Button>
					<Typography strong={200}>
						{t('foundIn', { fileName: props.originalFile.name })}
					</Typography>

					<Button
						variant="contained"
						size="small"
						onClick={() => {
							setEditable(!editable)
							if (editable) {
							}
						}}
					>
						{editable ? tCommon('save') : tCommon('edit')}
					</Button>
				</Box>
			</Box>
			<Box
				sx={{
					display: editable ? 'none' : 'block',
					padding: 2,
					paddingRight: 5,
				}}
			>
				<DefaultStyle
					sheet={sheet}
					title={title}
					columns={1}
					hideChords={false}
				></DefaultStyle>
			</Box>

			<Box
				sx={{
					display: editable ? 'flex' : 'none',
					padding: 2,
					flexDirection: 'column',
					gap: 2,
				}}
			>
				<StyledInput
					placeholder={t('titlePlaceholder')}
					value={title}
					onChange={(e) => {
						setTitle(e.target.value)
					}}
				/>
				<StyledInput
					placeholder={t('contentPlaceholder')}
					value={sheetData}
					multiline
					onChange={(e) => {
						setSheetData(e.target.value)
					}}
				/>
			</Box>
		</Paper>
	)
}
