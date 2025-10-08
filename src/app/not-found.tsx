import { Link } from '@/common/ui/Link/Link'
import { useTranslations } from 'next-intl'

export default function ErrorPage() {
	const t = useTranslations('errors')
	return (
		<div
			style={{
				height: '100vh',
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'center',
			}}
		>
			<div
				style={{
					display: 'flex',
					flexDirection: 'column',
					justifyContent: 'end',
					alignItems: 'center',
					// gap: '1rem',
				}}
			>
				<h1>
					<strong>{t('notFound')}</strong>
				</h1>
				<p style={{ textAlign: 'center' }}>
					{t('notFoundDescription')}
				</p>

				<Link
					to="home"
					params={{
						hledat: '',
					}}
				>
					{t('goHome')}
				</Link>
			</div>
		</div>
	)
}
