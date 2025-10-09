import { defineConfig } from '@playwright/test'
import fs from 'fs'

import dotenv from 'dotenv'
dotenv.config()

const isCI = !!process.env.CI

const suite = process.env.E2E_SUITE ?? 'smoke' // smoke|critical|full

export default defineConfig({
	testDir: './tests/e2e',
	grep:
		suite === 'smoke'
			? /tests\/e2e\/smoke\/|@smoke/
			: suite === 'smoke-only'
			? /tests\/e2e\/smoke\/|@smoke/
			: suite === 'critical'
			? /tests\/e2e\/(smoke|critical)\/|@critical|@smoke/
			: suite === 'critical-only'
			? /tests\/e2e\/(critical)\/|@critical/
			: suite === 'full-only'
			? /tests\/e2e\/(full)\/|@full/
			: undefined,
	fullyParallel: true,
	...(isCI
		? {}
		: {
				webServer: {
					command:
						false && fs.existsSync('.next/routes-manifest.json') // just trying
							? 'npm run start'
							: 'echo "Building project..." &&npm run build && npm run start',
					port: 5500,
					reuseExistingServer: true,
					timeout: 120 * 1000, // 2 minutes
					// "stdout": "ignore",
					stderr: 'ignore',
				},
		  }),
	use: {
		baseURL: process.env.NEXT_PUBLIC_FRONTEND_URL,
		// baseURL: 'https://preview.chvalotce.cz',
		headless: true,
		actionTimeout: 30 * 1000, // 10 seconds
		navigationTimeout: 30 * 1000, // 10 seconds

		screenshot: 'only-on-failure',
		video: 'retain-on-failure',
		trace: 'retain-on-failure',
	},
	//TODO: add more browser testing on full mode
	reporter: [['html', { open: 'never' }], ['github'], ['list']],
	retries: 1,
	workers: '75%',
	timeout: 120 * 1000, // 60 seconds
	outputDir: 'temp/tests/results/',
})
