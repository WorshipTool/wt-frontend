'use client'
import ParseAdminOption from '@/app/(layout)/vytvorit/components/ParseAdminOption'
import { SmartPage } from '@/common/components/app/SmartPage/SmartPage'
import FlagProtected from '@/common/providers/FeatureFlags/FlagProtected'
import { Box } from '@/common/ui'
import { Edit, UploadFile } from '@mui/icons-material'
import { useTranslations } from 'next-intl'
import AddMenuItem from './components/AddMenuItem'

export default SmartPage(AddMenu)

function AddMenu() {
	const t = useTranslations('upload')

	return (
		<>
			<Box
				sx={{
					width: '100%',
					height: 500,
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
				}}
			>
				<Box
					sx={{
						display: 'flex',
						flexDirection: 'row',
						justifyContent: 'center',
						flexWrap: 'wrap',
						gap: {
							xs: 2,
							sm: 5,
						},
					}}
				>
					<FlagProtected flag={'enable_file_parser'}>
						<AddMenuItem
							title={t('uploadFile')}
							subtitle={t('uploadFileSubtitle')}
							icon={<UploadFile fontSize="inherit" />}
							to="upload"
						/>
					</FlagProtected>
					<AddMenuItem
						title={t('writeManually')}
						// subtitle='Použijte editor pro psaní textu písně'
						icon={<Edit fontSize="inherit" />}
						iconSize={40}
						to="writeSong"
					/>
				</Box>
			</Box>

			<ParseAdminOption />
		</>
	)
}
