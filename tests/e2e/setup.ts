import type { Page, TestInfo } from '@playwright/test'
import { test as base } from '@playwright/test'
import { config } from 'dotenv'

config()

type TestType = 'smoke' | 'critical' | 'full'

type SmartTest = (
	name: string,
	testType: TestType,
	fn: (args: { page: Page }, testInfo: TestInfo) => Promise<void> | void
) => ReturnType<typeof base>

const emoji: Record<TestType, string> = {
	smoke: '🚀',
	critical: '❗️',
	full: '🔦',
}
const BLOCK = [
	/google-analytics\.com/,
	/googletagmanager\.com/,
	/doubleclick\.net/,
	/hotjar\.com/,
	/mixpanel\.com/,
	/segment\.com/,
	/sentry\.io/,
	/prodregistryv2\.org/,
]
const getSmartTestName = (name: string, testType: TestType) =>
	`${emoji[testType]}@${testType} ${name}`

export const smartTest: SmartTest = (name, testType, use) =>
	base(getSmartTestName(name, testType), async ({ page }, testInfo) => {
		await page.route('**/*', async (route) => {
			const url = route.request().url()
			if (BLOCK.some((re) => re.test(url))) return route.abort()

			const slowdown =
				process.env.TEST_WITH_SLOWDOWN?.toLocaleLowerCase() === 'true'
			if (slowdown) await new Promise((r) => setTimeout(r, 1000))
			await route.continue()
		})
		await use({ page }, testInfo)
	})

export const test = base.extend({
	context: async ({ context }, use) => {
		await context.route('**/*', (route) => {
			const url = route.request().url()
			if (BLOCK.some((re) => re.test(url))) return route.abort()
			route.continue()
		})
		await use(context)
	},
})
