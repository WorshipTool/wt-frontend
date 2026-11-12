import { checkFlag } from '@/common/providers/FeatureFlags/flags.tech'
import { LayoutProps } from '@/common/types'
import { routesPaths } from '@/routes/routes'
import { smartRedirect } from '@/routes/routes.tech.server'
import { getServerUser } from '@/tech/auth/getServerUser'
import { generateSmartMetadata } from '@/tech/metadata/metadata'
import { getTranslations } from 'next-intl/server'

export const generateMetadata = generateSmartMetadata(
	'importSong',
	async () => {
		const t = await getTranslations('upload')
		return {
			title: t('import.title'),
		}
	},
)

/**
 * The import screen's gate, the one place it is decided who gets in: the
 * parser endpoint is for signed-in users with `enable_general_parser`. Signed
 * out → the login page, which comes back here; flag off → the create menu,
 * which then offers the options this user has. Nobody reaches the form only to
 * be refused after submitting.
 */
export default async function ImportSongLayout({ children }: LayoutProps) {
	const user = getServerUser()
	if (!user) {
		const t = await getTranslations('upload')
		smartRedirect('login', {
			previousPage: routesPaths.importSong,
			message: t('import.problem.login.text'),
		})
	}
	if (!(await checkFlag('enable_general_parser', user)))
		smartRedirect('addMenu', {})
	return children
}
