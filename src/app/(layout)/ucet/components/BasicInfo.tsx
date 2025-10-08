import { useApi } from '@/api/tech-and-hooks/useApi'
import { Box, Button, Gap, Typography } from '@/common/ui'
import { Card } from '@/common/ui/Card'
import { TextField } from '@/common/ui/mui'
import useAuth from '@/hooks/auth/useAuth'
import { ROLES } from '@/interfaces/user'
import { useApiState } from '@/tech/ApiState'
import { Edit, Save } from '@mui/icons-material'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

export default function BasicInfo() {
	const [editMode, setEditMode] = useState(false)
	const { info, reloadInfo } = useAuth()

	const [editedName, setEditedName] = useState<string | null>(null)
	const [editedSurname, setEditedSurname] = useState<string | null>(null)

	const { authApi } = useApi()

	const { fetchApiState, apiState } = useApiState<boolean>()

	const t = useTranslations('account.basicInfo')
	const tCommon = useTranslations('common')

	const onSaveClick = () => {
		const data = {
			firstName: editedName || info.firstName,
			lastName: editedSurname || info.lastName,
		}
		fetchApiState(async () => authApi.changeUserName(data)).finally(() => {
			setEditMode(false)
			reloadInfo(data)
		})
	}
	const onCancelClick = () => {
		setEditMode(false)
		setEditedName(null)
		setEditedSurname(null)
	}

	return (
		<>
			<Card>
				<Box display={'flex'} flexDirection={'row'}>
					<Image
						src={info.pictureUrl || '/assets/account.webp'}
						alt="account"
						width={70}
						height={70}
						style={{ opacity: info.pictureUrl ? 1 : 0.3 }}
					/>
					<Box
						marginLeft={3}
						display={'flex'}
						flexDirection={'column'}
						justifyContent={'center'}
					>
						<Typography variant="h6">
							{info.firstName} {info.lastName}
						</Typography>
						<Typography>
							{info.role === ROLES.Admin
								? 'Admin'
								: info.role === ROLES.Trustee
								? 'Trustee'
								: info.role === ROLES.User
								? 'Uživatel'
								: ROLES[info.role]}
						</Typography>
					</Box>
					<Box flex={1} />
					{!editMode ? (
						<Box>
							<Button
								outlined
								startIcon={<Edit />}
								small
								onClick={() => setEditMode(true)}
							>
								{tCommon('edit')}
							</Button>
						</Box>
					) : (
						<Box
							flexDirection={'row'}
							display={'flex'}
							gap={1}
							alignItems={'start'}
						>
							<Button
								small
								onClick={onSaveClick}
								startIcon={<Save />}
								loading={apiState.loading}
							>
								{tCommon('save')}
							</Button>
							<Button
								small
								outlined
								onClick={onCancelClick}
								disabled={apiState.loading}
							>
								{tCommon('cancel')}
							</Button>
						</Box>
					)}
				</Box>

				<Gap value={3} />

				<Box
					display={'flex'}
					flexDirection={'row'}
					gap={3}
					alignItems={'center'}
				>
					<Box>
						<Typography>{t('firstName')}</Typography>
						<TextField
							size="small"
							fullWidth
							value={editedName === null ? info.firstName : editedName}
							onChange={(e) => setEditedName(e.target.value)}
							disabled={!editMode}
						/>
					</Box>
					<Box>
						<Typography>{t('lastName')}</Typography>
						<TextField
							size="small"
							fullWidth
							value={editedSurname === null ? info.lastName : editedSurname}
							disabled={!editMode}
							onChange={(e) => setEditedSurname(e.target.value)}
						/>
					</Box>
				</Box>

				<Gap />

				<Typography>{t('email')}</Typography>
				<TextField size="small" fullWidth value={info.email} disabled />
			</Card>
		</>
	)
}
