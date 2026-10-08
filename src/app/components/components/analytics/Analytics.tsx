import { GoogleAnalytics } from '@/app/components/components/analytics/GoogleAnalytics'
import HotjarAnalytics from '@/app/components/components/analytics/HotjarAnalytics'
import MixPanelAnalytics from '@/app/components/components/analytics/mixpanel/MixPanelAnalytics'

/**
 * The three analytics scripts, rendered like anything else.
 *
 * Do not load this with `next/dynamic` and `ssr: false`. That is how it used to
 * be pulled into the root layout, and `ssr: false` means the server renders
 * nothing where it stands: React then reported the Suspense boundary around it
 * as one the server never finished and re-rendered on the client — error #419,
 * on every page of the app, because the root layout is on every page. Six
 * walkthroughs in a row reported it from the console; nothing looked broken, so
 * it had gone unnoticed.
 *
 * Nothing here needs keeping off the server anyway: Hotjar and MixPanel render
 * `null` and do their work in effects, and `@next/third-parties` is built to be
 * rendered normally.
 */
export default function Analytics() {
	return (
		<>
			<GoogleAnalytics />
			<HotjarAnalytics />
			<MixPanelAnalytics />
		</>
	)
}
