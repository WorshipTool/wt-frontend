import AdminBreadItem from '@/app/(layout)/sub/admin/components/AdminBreadItem'
import { LayoutProps } from '@/common/types'
import { getTranslations } from 'next-intl/server'

export default async function layout(props: LayoutProps) {
	const t = await getTranslations('admin.layout')
	
	return (
		<>
			<AdminBreadItem label={t('create')} to="adminCreateSong" toParams={{}} />
			{props.children}
		</>
	)
}
