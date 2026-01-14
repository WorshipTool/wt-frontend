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
							: 'echo "Building project..." && npm run build && npm run start',
					port: 5500,
					reuseExistingServer: true,
					timeout: 120 * 1000, // 2 minutes
					// "stdout": "ignore",
					stderr: 'ignore',
				},
		  }),
	use: {
		baseURL: process.env.NEXT_PUBLIC_FRONTEND_URL,
		headless: true,
		// Increased timeouts for more reliable tests
		actionTimeout: 30 * 1000, // 30 seconds
		navigationTimeout: 30 * 1000, // 30 seconds

		// Better debugging in CI
		screenshot: isCI ? 'on' : 'only-on-failure',
		video: isCI ? 'on' : 'retain-on-failure',
		trace: isCI ? 'on-first-retry' : 'retain-on-failure',

		// Ignore HTTPS errors in test environments
		ignoreHTTPSErrors: true,
	},
	// Better reporters for CI and local development
	reporter: [
		['html', { open: 'never' }],
		['github'],
		['list'],
		// Add junit reporter for CI integration
		...(isCI
			? [['junit', { outputFile: 'temp/tests/junit-results.xml' }] as const]
			: []),
	],
	// More retries in CI to handle transient failures
	retries: isCI ? 2 : 1,
	// Reduced workers for more stable parallel execution
	workers: isCI ? '50%' : '75%',
	// Longer timeout for complex test scenarios
	timeout: 120 * 1000, // 2 minutes
	outputDir: 'temp/tests/results/',
	// Fail fast in CI to save resources
	maxFailures: isCI ? 10 : undefined,
})
