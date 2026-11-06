import {
	AnalyticsEventNameType,
	AnalyticsTrackDataType,
} from '@/app/components/components/analytics/analytics.types'

const track = <T extends AnalyticsEventNameType>(
	eventName: T,
	data: AnalyticsTrackDataType<T>
) => {
	// Mixpanel is intentionally disabled when no token is configured
	if (!process.env.NEXT_PUBLIC_MIXPANEL_TOKEN) return

	import('mixpanel-browser').then((mod) => {
		const mixpanel = mod.default
		if (!(mixpanel as any).__loaded) {
			console.error(
				'MixPanelAnalytics not initialized. Cannot track event',
				eventName
			)
			return
		} else {
			mixpanel.track(eventName, data)
		}
	})
}

export const Analytics = {
	track,
}
