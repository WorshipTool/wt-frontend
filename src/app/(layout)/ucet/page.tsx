'use client'
import { SmartPage } from '@/common/components/app/SmartPage/SmartPage'
import { Box, useTheme } from '@/common/ui'
import { routesPaths } from '@/routes'
import { useTranslations } from 'next-intl'
import { useEffect } from 'react'
import useAuth from '../../../hooks/auth/useAuth'
import { useSmartNavigate } from '../../../routes/useSmartNavigate'
import BasicInfo from './components/BasicInfo'
import TabsPanel from './components/TabsPanel'

export default SmartPage(Account)
function Account() {
	const { isLoggedIn } = useAuth()

	const navigate = useSmartNavigate()

	const t = useTranslations('auth.login')

	useEffect(() => {
		if (!isLoggedIn()) {
			navigate('login', {
				previousPage: routesPaths.account,
				message: 'Pro zobrazeni účtu se musíte přihlásit.',
			})
		}
	}, [isLoggedIn()])

	const theme = useTheme()

	return (
		<>
			<Box
				sx={{
					[theme.breakpoints.down('md')]: {
						display: 'none',
					},
					padding: 8,
				}}
			>
				<TabsPanel />
			</Box>

			<Box
				sx={{
					[theme.breakpoints.up('md')]: {
						display: 'none',
					},
				}}
			>
				<BasicInfo />
			</Box>
		</>
	)
}
