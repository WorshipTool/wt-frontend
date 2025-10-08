'use client'

import SmartPortalMenuItem from '@/common/components/SmartPortalMenuItem/SmartPortalMenuItem'
import { useDownSize } from '@/common/hooks/useDownSize'
import { Button } from '@/common/ui'
import { ListItemIcon, ListItemText, MenuItem } from '@/common/ui/mui'
import { Edit, Save } from '@mui/icons-material'
import { useTranslations } from 'next-intl'
import { useSnackbar } from 'notistack'
import { isSheetDataValid } from '../../../../../../../tech/sheet.tech'

interface EditButtonProps {
	onClick?: (editable: boolean) => void
	inEditMode?: boolean
	loading?: boolean
	sheetData: string
	title: string
	asMenuItem?: boolean
	anyChange: boolean
}

export default function EditButton(props: EditButtonProps) {
	const { enqueueSnackbar } = useSnackbar()
	const tEdit = useTranslations('songPage.editButton')

	const onClick = async () => {
		if (props.inEditMode) {
			if (props.sheetData === '' || props.title === '') {
				enqueueSnackbar(tEdit('errorEmpty'))
				return
			}
		}
		props.onClick?.(!props.inEditMode)
	}

	const isSmall = useDownSize('md')

	return props.asMenuItem ? (
		<>
			{!props.inEditMode && (
				<MenuItem onClick={onClick}>
					<ListItemIcon>
						<Edit />
					</ListItemIcon>
					<ListItemText primary={tEdit('edit')} />
				</MenuItem>
			)}
		</>
	) : !isSmall || props.inEditMode ? (
		<Button
			variant="contained"
			color={props.inEditMode ? 'info' : 'secondary'}
			startIcon={props.inEditMode ? <Save /> : <Edit />}
			loading={props.loading}
			// loadingIndicator="Saving..."
			disabled={
				(props.inEditMode && !props.anyChange) ||
				(props.inEditMode && !isSheetDataValid(props.sheetData))
			}
			onClick={onClick}
		>
			{props.inEditMode ? tEdit('save') : tEdit('edit')}
		</Button>
	) : (
		<SmartPortalMenuItem title={tEdit('edit')} onClick={onClick} icon={<Edit />} />
	)
}
