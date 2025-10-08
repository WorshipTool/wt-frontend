import { Box, Button, Typography } from '@/common/ui'
import { Paper } from '@/common/ui/mui'
import { CloudUpload } from '@mui/icons-material'
import { useTranslations } from 'next-intl'
import React, { useRef } from 'react'
import { Gap } from '../../../../../common/ui/Gap'
import UploadFileInput from '../UploadFileInput'
import DragAndDrop from './components/DragAndDrop'

interface UploadPanelProps {
	onUpload?: (files: File[]) => void
}

export default function UploadPanel(props: UploadPanelProps) {
	const inputRef = useRef(null)

	const [draggingOver, setDraggingOver] = React.useState(false)

	const t = useTranslations('upload')

	const uploadFiles = (files: File[]) => {
		if (props.onUpload) props.onUpload(files)
	}

	const openFilePicker = () => {
		//@ts-ignore
		inputRef.current.click()
	}

	return (
		<DragAndDrop
			onDragOver={() => {
				setDraggingOver(true)
			}}
			onDragLeave={() => {
				setDraggingOver(false)
			}}
			onDrop={(files) => {
				setDraggingOver(false)
				uploadFiles(files)
			}}
		>
			<Paper
				sx={{
					width: 360,
					height: 330,
					borderRadius: 5,
					display: 'flex',
					flexDirection: 'column',
					justifyContent: 'center',
					alignItems: 'center',
					userSelect: 'none',
					bgcolor: draggingOver ? 'grey.500' : 'grey.100',
					border: draggingOver ? '0px solid' : '2px dashed',
				}}
			>
				<Box
					sx={{
						display: 'flex',
						flexDirection: 'column',
						justifyContent: 'center',
						alignItems: 'center',
					}}
				>
					<Gap value={3} />
					{!draggingOver ? (
						<Box
							sx={{
								fontSize: 60,
								display: 'flex',
								flexDirection: 'column',
								justifyContent: 'center',
								alignItems: 'center',
								color: 'grey.500',
							}}
						>
							<CloudUpload fontSize={'inherit'} />
							<Box
								sx={{
									display: 'flex',
									flexDirection: 'column',
									justifyContent: 'center',
									alignItems: 'center',
								}}
							>
								<Typography>{t('dragAndDrop')}</Typography>
							</Box>
						</Box>
					) : (
						<Box
							sx={{
								fontSize: 60,
								display: 'flex',
								flexDirection: 'column',
								justifyContent: 'center',
								alignItems: 'center',
								color: 'white',
							}}
						>
							<CloudUpload fontSize={'inherit'} />
							<Box
								sx={{
									display: 'flex',
									flexDirection: 'column',
									justifyContent: 'center',
									alignItems: 'center',
								}}
							>
								<Typography>Pusťte soubory zde</Typography>
							</Box>
						</Box>
					)}

					<Gap value={4} />
					<Button
						variant="contained"
						onClick={openFilePicker}
						sx={{
							display: draggingOver ? 'none' : 'block',
						}}
					>
						{t('selectFiles')}
					</Button>
				</Box>

				<Box
					sx={{
						bgcolor: 'grey.200',
						padding: 1,
						borderRadius: 1,
						display: draggingOver ? 'none' : 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						marginTop: 3,
					}}
					width={200}
				>
					<Typography color={'grey'}>{t('supportedFormats')}: png, jpg, jpeg, pdf</Typography>
				</Box>
			</Paper>
			<UploadFileInput
				inputRef={inputRef}
				onUpload={(files) => uploadFiles(files)}
			/>
		</DragAndDrop>
	)
}
