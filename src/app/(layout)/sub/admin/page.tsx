'use client'
import AdminPageCard from '@/app/(layout)/sub/admin/components/AdminCard'
import { SmartPage } from '@/common/components/app/SmartPage/SmartPage'
import { Box, Typography } from '@/common/ui'
import { useSmartNavigate } from '@/routes/useSmartNavigate'
import { Add, Search } from '@mui/icons-material'
import { useTranslations } from 'next-intl'

export default SmartPage(Page, [
	'fullWidth',
	'hideFooter',
	'hideMiddleNavigation',
	'darkToolbar',
])

function Page() {
	const navigate = useSmartNavigate()

	const t = useTranslations('buttons')
	const tSearch = useTranslations('search')

	return (
		<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
			<Box maxWidth={200}>
				<AdminPageCard
					color="primary.light"
					onClick={() => navigate('adminCreateSong', {})}
				>
					<Box display={'flex'} alignItems="center" gap={1}>
						<Add />
						<Typography>{t('addNewSong')}</Typography>
					</Box>
				</AdminPageCard>
			</Box>
			<Box maxWidth={200}>
				<AdminPageCard
					color="grey.800"
					onClick={() => navigate('adminSongs', {})}
				>
					<Box display={'flex'} alignItems="center" gap={1}>
						<Search />
						<Typography>{tSearch('searchSongs')}</Typography>
					</Box>
				</AdminPageCard>
			</Box>
		</Box>
	)
}
