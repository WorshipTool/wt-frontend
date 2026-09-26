'use client'
import { useIsPhone } from '@/common/hooks/useIsPhone'
import { MobileAppHeader } from '@/common/components/MobileAppHeader'
import { SmartPage } from '@/common/components/app/SmartPage/SmartPage'
import { Box, Typography } from '@/common/ui'
import { routesPaths } from '@/routes'
import { useTranslations } from 'next-intl'
import { useEffect } from 'react'
import useAuth from '../../../hooks/auth/useAuth'
import { useSmartNavigate } from '../../../routes/useSmartNavigate'
import AdminPanel from '@/app/(layout)/ucet/components/AdminPanel/AdminPanel'
import BasicInfo from './components/BasicInfo'
import ChangePassword from './components/ChangePassword'
import TabsPanel from './components/TabsPanel'

export default SmartPage(Account)
function Account() {
	const { isLoggedIn, isAdmin } = useAuth()

	const navigate = useSmartNavigate()

	const t = useTranslations('auth.login')
	const tNav = useTranslations('navigation')
	const tAccount = useTranslations('account')

	const phoneVersion = useIsPhone()

	useEffect(() => {
		if (!isLoggedIn()) {
			navigate('login', {
				previousPage: routesPaths.account,
				message: 'Pro zobrazeni účtu se musíte přihlásit.',
			})
		}
	}, [isLoggedIn()])

	// Phones get the native app shell (Účet is a tab-root, so no back arrow).
	// The shell has no tabs, so the desktop TabsPanel's sections are stacked —
	// otherwise changing your password would be unreachable on a phone.
	if (phoneVersion) {
		return (
			<MobileAppHeader title={tNav('account')}>
				<Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
					<BasicInfo />

					<Box>
						<Typography strong sx={{ paddingBottom: 1 }}>
							{tAccount('tabs.changePassword')}
						</Typography>
						<ChangePassword />
					</Box>

					{isAdmin() && <AdminPanel />}
				</Box>
			</MobileAppHeader>
		)
	}

	return (
		<Box sx={{ padding: 8 }}>
			<TabsPanel />
		</Box>
	)
}
