import AdminBreadcrumbs from '@/app/(layout)/sub/admin/components/AdminBreadcrumbs'
import AdminBreadItem from '@/app/(layout)/sub/admin/components/AdminBreadItem'
import AdminMenu from '@/app/(layout)/sub/admin/components/AdminMenu'
import { checkFlag } from '@/common/providers/FeatureFlags/flags.tech'
import { LayoutProps } from '@/common/types'
import { Box } from '@/common/ui'
import { getServerUser } from '@/tech/auth/getServerUser'
import { forbidden } from '@/tech/error/error.tech'

export default async function Layout(props: LayoutProps<'admin'>) {
	const user = getServerUser()
	const show = await checkFlag('show_admin_page', user)
	if (!show) forbidden()
	// throw forbidden exception with status code 403

	return (
		<>
			<Box
				sx={{
					bgcolor: 'grey.300',
					position: 'fixed',
					top: 0,
					left: 0,
					right: 0,
					bottom: 0,
					zIndex: -1,
				}}
			/>
			<Box
				sx={{
					display: 'flex',
					flexDirection: 'row',
					width: '100%',
				}}
			>
				<Box
					sx={{
						height: 'calc(100vh - 56px)',
						width: 250,
						bgcolor: 'grey.800',
						position: 'sticky',
						top: 56,
					}}
				>
					<Box
						sx={{
							margin: 2,
						}}
					>
						<AdminMenu />
					</Box>
				</Box>
				<Box
					sx={{
						padding: 3,
						flex: 1,
						display: 'flex',
						flexDirection: 'column',
						gap: 2,
					}}
				>
					<AdminBreadcrumbs />
					<AdminBreadItem label="Dashboard" to="admin" toParams={{}} base />
					{props.children}
				</Box>
			</Box>
		</>
	)
}
