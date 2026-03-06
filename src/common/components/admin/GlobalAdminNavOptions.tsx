'use client'
import AdminOption from '@/common/components/admin/AdminOption'
import LoginAsTestUser from '@/common/components/admin/LoginAsTestUser'
import { useFlag } from '@/common/providers/FeatureFlags/useFlag'
import { useSmartNavigate } from '@/routes/useSmartNavigate'
import { AdminPanelSettings, Psychology } from '@mui/icons-material'

/**
 * Provides permanent admin navigation items in the global admin menu (bottom-right corner).
 * Rendered in the root layout so these items appear on all pages.
 *
 * Items shown when `show_admin_page` feature flag is enabled:
 * - Admin: navigates to the admin dashboard
 * - ML Trénink: navigates to the ML training page
 *
 * Always shown to admins:
 * - Přihlásit si jako test: creates a new random test account and logs in as it
 */
export default function GlobalAdminNavOptions() {
	const showAdminPage = useFlag('show_admin_page')
	const navigate = useSmartNavigate()

	return (
		<>
			{showAdminPage && (
				<>
					<AdminOption
						label="Admin"
						icon={<AdminPanelSettings />}
						onClick={() => navigate('admin', {})}
					/>
					<AdminOption
						label="ML Trénink"
						icon={<Psychology />}
						onClick={() => navigate('adminMlTraining', {})}
					/>
				</>
			)}
			<LoginAsTestUser />
		</>
	)
}
