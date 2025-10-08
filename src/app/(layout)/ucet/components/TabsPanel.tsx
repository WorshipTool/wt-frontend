import AdminPanel from '@/app/(layout)/ucet/components/AdminPanel/AdminPanel'
import { Box, Typography } from '@/common/ui'
import { Tab, Tabs } from '@/common/ui/mui'
import { useTranslations } from 'next-intl'
import React, { useState } from 'react'
import useAuth from '../../../../hooks/auth/useAuth'
import BasicInfo from './BasicInfo'
import ChangePassword from './ChangePassword'
import TabPanel from './TabPanel'

export default function TabsPanel() {
	const { isLoggedIn, user, isTrustee, isAdmin } = useAuth()

	const [tabValue, setTabValue] = useState(1)

	const t = useTranslations('account')

	const onTabChange = (event: React.SyntheticEvent, newValue: number) => {
		setTabValue(newValue)
	}

	return (
		<Box
			sx={{
				flexGrow: 1,
				display: 'flex',
				gap: 2,
				position: 'relative',
				// flexDirection: 'row',
				// flex,
			}}
		>
			<Tabs
				orientation="vertical"
				value={tabValue}
				onChange={onTabChange}
				sx={{ borderRight: 1, borderColor: 'divider' }}
			>
				<Typography variant="h6" sx={{ marginBottom: 3 }}>
					{t('title')}
				</Typography>

				<Tab label={t('tabs.info')} />
				<Tab label={t('tabs.changePassword')} />
				{isAdmin() && <Tab label="ejdmin" />}
			</Tabs>
			<div
				style={{
					flex: 1,
				}}
			>
				<TabPanel value={tabValue} index={1}>
					<BasicInfo />
				</TabPanel>
				<TabPanel value={tabValue} index={2}>
					<ChangePassword />
				</TabPanel>

				<TabPanel value={tabValue} index={3}>
					<AdminPanel />
				</TabPanel>
			</div>
		</Box>
	)
}
