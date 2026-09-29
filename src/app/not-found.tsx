import MobileAppTabBar from '@/common/components/MobileAppTabBar/MobileAppTabBar'
import { MOBILE_NAV_CLEARANCE } from '@/common/components/MobileAppTabBar/nav.constants'
import { Button } from '@/common/ui'
import { useTranslations } from 'next-intl'

export default function ErrorPage() {
	const t = useTranslations('errors')
	return (
		<>
			<div
				style={{
					// the bar adds its own spacer below, so leave room for it rather
					// than claiming the whole viewport and scrolling by its height
					minHeight: `calc(100vh - ${MOBILE_NAV_CLEARANCE})`,
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
					<p style={{ textAlign: 'center' }}>{t('notFoundDescription')}</p>

					{/* the gap lives on the wrapper: Button hands its own `sx` to the
					    anchor, the box and the button alike, so a margin there lands
					    three times over */}
					<div style={{ marginTop: '0.5rem' }}>
						<Button
							to="home"
							toParams={{
								hledat: undefined,
							}}
						>
							{t('goHome')}
						</Button>
					</div>
				</div>
			</div>
			{/* no route key to classify, so the bar is asked for explicitly — a 404
			    is exactly where being stranded hurts most */}
			<MobileAppTabBar force />
		</>
	)
}
