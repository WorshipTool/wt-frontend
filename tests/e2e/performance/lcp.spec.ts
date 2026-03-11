/**
 * LCP (Largest Contentful Paint) Performance Tests
 *
 * These E2E tests measure LCP on key pages and verify that:
 * - LCP stays within acceptable thresholds (< 2.5s = "good" per Web Vitals)
 * - LCP images are not oversized (checking natural vs displayed dimensions)
 * - Images loaded above the fold have proper optimization attributes
 */
import { expect } from '@playwright/test'

import { smartTest } from '../setup'

/** LCP threshold in milliseconds - "good" rating per Web Vitals */
const LCP_GOOD_THRESHOLD = 2500

/** Maximum ratio of natural image size to displayed size */
const MAX_IMAGE_OVERSIZE_RATIO = 2.5

/** Maximum allowed image transfer size in bytes for LCP element */
const MAX_LCP_IMAGE_TRANSFER_SIZE = 300 * 1024 // 300 KB

/**
 * Measures LCP on a given page using PerformanceObserver API.
 * Returns the LCP entry with timing and element info.
 */
async function measureLCP(
	page: import('@playwright/test').Page,
	url: string
): Promise<{
	value: number
	element: {
		tagName: string
		src: string | null
		naturalWidth: number
		naturalHeight: number
		displayWidth: number
		displayHeight: number
	} | null
}> {
	// Navigate and wait for the page to be fully loaded
	await page.goto(url, { waitUntil: 'load' })

	// Wait a bit for LCP to settle
	await page.waitForTimeout(1000)

	const lcpData = await page.evaluate(() => {
		return new Promise<{
			value: number
			element: {
				tagName: string
				src: string | null
				naturalWidth: number
				naturalHeight: number
				displayWidth: number
				displayHeight: number
			} | null
		}>((resolve) => {
			let lastEntry: PerformanceEntry | null = null

			const observer = new PerformanceObserver((list) => {
				const entries = list.getEntries()
				if (entries.length > 0) {
					lastEntry = entries[entries.length - 1]
				}
			})

			observer.observe({ type: 'largest-contentful-paint', buffered: true })

			// Give the observer time to collect entries, then resolve
			setTimeout(() => {
				observer.disconnect()

				if (!lastEntry) {
					resolve({ value: 0, element: null })
					return
				}

				const lcpEntry = lastEntry as PerformanceEntry & {
					startTime: number
					element?: Element
				}
				const lcpElement = lcpEntry.element

				let elementInfo = null
				if (lcpElement) {
					const tagName = lcpElement.tagName.toLowerCase()
					const isImage = tagName === 'img'
					const imgElement = isImage
						? (lcpElement as HTMLImageElement)
						: null
					const rect = lcpElement.getBoundingClientRect()

					elementInfo = {
						tagName,
						src: imgElement?.currentSrc || imgElement?.src || null,
						naturalWidth: imgElement?.naturalWidth || 0,
						naturalHeight: imgElement?.naturalHeight || 0,
						displayWidth: Math.round(rect.width),
						displayHeight: Math.round(rect.height),
					}
				}

				resolve({
					value: lcpEntry.startTime,
					element: elementInfo,
				})
			}, 500)
		})
	})

	return lcpData
}

smartTest(
	'Homepage LCP should be within acceptable threshold',
	'full',
	async ({ page }) => {
		const lcp = await measureLCP(page, '/')

		console.log(`\n📊 Homepage LCP: ${lcp.value.toFixed(0)}ms`)
		if (lcp.element) {
			console.log(`   LCP Element: <${lcp.element.tagName}>`)
			if (lcp.element.src) {
				console.log(`   Image src: ${lcp.element.src}`)
				console.log(
					`   Natural size: ${lcp.element.naturalWidth}x${lcp.element.naturalHeight}`
				)
				console.log(
					`   Display size: ${lcp.element.displayWidth}x${lcp.element.displayHeight}`
				)
			}
		}

		expect(
			lcp.value,
			`LCP (${lcp.value.toFixed(0)}ms) exceeds "good" threshold (${LCP_GOOD_THRESHOLD}ms). ` +
				`Optimize the largest visible element on the page.`
		).toBeLessThan(LCP_GOOD_THRESHOLD)
	}
)

smartTest(
	'Homepage LCP image should not be oversized',
	'full',
	async ({ page }) => {
		const lcp = await measureLCP(page, '/')

		// Skip if LCP element is not an image
		if (!lcp.element || lcp.element.tagName !== 'img') {
			console.log(
				`LCP element is <${lcp.element?.tagName || 'unknown'}>, not an image - skipping oversize check`
			)
			return
		}

		const { naturalWidth, naturalHeight, displayWidth, displayHeight } =
			lcp.element

		// Only check if we have valid dimensions
		if (naturalWidth === 0 || displayWidth === 0) return

		const widthRatio = naturalWidth / displayWidth
		const heightRatio = naturalHeight / displayHeight
		const maxRatio = Math.max(widthRatio, heightRatio)

		console.log(
			`\n📊 LCP Image oversize ratio: ${maxRatio.toFixed(2)}x (limit: ${MAX_IMAGE_OVERSIZE_RATIO}x)`
		)

		expect(
			maxRatio,
			`LCP image is ${maxRatio.toFixed(1)}x larger than displayed size ` +
				`(natural: ${naturalWidth}x${naturalHeight}, displayed: ${displayWidth}x${displayHeight}). ` +
				`Resize or use responsive images with srcset.`
		).toBeLessThan(MAX_IMAGE_OVERSIZE_RATIO)
	}
)

smartTest(
	'Above-the-fold images should not be excessively large',
	'full',
	async ({ page }) => {
		await page.goto('/', { waitUntil: 'load' })
		await page.waitForTimeout(500)

		// Find all images visible in the viewport
		const aboveFoldImages = await page.evaluate(() => {
			const images = Array.from(document.querySelectorAll('img'))
			const viewportHeight = window.innerHeight

			return images
				.filter((img) => {
					const rect = img.getBoundingClientRect()
					// Image is at least partially above the fold
					return rect.top < viewportHeight && rect.bottom > 0
				})
				.map((img) => ({
					src: img.currentSrc || img.src,
					naturalWidth: img.naturalWidth,
					naturalHeight: img.naturalHeight,
					displayWidth: Math.round(img.getBoundingClientRect().width),
					displayHeight: Math.round(
						img.getBoundingClientRect().height
					),
					loading: img.loading,
					fetchPriority:
						img.getAttribute('fetchpriority') || 'auto',
				}))
		})

		console.log(
			`\n📊 Found ${aboveFoldImages.length} above-the-fold images`
		)

		for (const img of aboveFoldImages) {
			if (img.naturalWidth === 0 || img.displayWidth === 0) continue

			const oversizeRatio = Math.max(
				img.naturalWidth / img.displayWidth,
				img.naturalHeight / img.displayHeight
			)

			console.log(
				`   ${img.src.substring(img.src.lastIndexOf('/') + 1)}: ` +
					`${img.naturalWidth}x${img.naturalHeight} -> ${img.displayWidth}x${img.displayHeight} ` +
					`(${oversizeRatio.toFixed(1)}x) loading=${img.loading} priority=${img.fetchPriority}`
			)

			expect(
				oversizeRatio,
				`Image ${img.src} is ${oversizeRatio.toFixed(1)}x larger than displayed size. ` +
					`This wastes bandwidth and slows LCP. ` +
					`Natural: ${img.naturalWidth}x${img.naturalHeight}, ` +
					`Displayed: ${img.displayWidth}x${img.displayHeight}`
			).toBeLessThan(MAX_IMAGE_OVERSIZE_RATIO)
		}
	}
)

smartTest(
	'Above-the-fold images should not use lazy loading',
	'full',
	async ({ page }) => {
		await page.goto('/', { waitUntil: 'load' })
		await page.waitForTimeout(500)

		const lazyAboveFold = await page.evaluate(() => {
			const images = Array.from(document.querySelectorAll('img'))
			const viewportHeight = window.innerHeight

			return images
				.filter((img) => {
					const rect = img.getBoundingClientRect()
					return (
						rect.top < viewportHeight &&
						rect.bottom > 0 &&
						img.loading === 'lazy'
					)
				})
				.map((img) => ({
					src: img.currentSrc || img.src,
					top: Math.round(img.getBoundingClientRect().top),
				}))
		})

		expect(
			lazyAboveFold,
			`${lazyAboveFold.length} above-the-fold image(s) use loading="lazy":\n` +
				lazyAboveFold
					.map((img) => `  - ${img.src} (top: ${img.top}px)`)
					.join('\n') +
				`\nImages visible in the initial viewport should NOT be lazy-loaded. ` +
				`Lazy loading delays LCP. Use loading="eager" or remove the loading attribute.`
		).toHaveLength(0)
	}
)

smartTest(
	'Page should not load excessively large image resources',
	'full',
	async ({ page }) => {
		const largeImages: { url: string; size: number }[] = []

		// Intercept image responses and track their sizes
		page.on('response', async (response) => {
			const contentType = response.headers()['content-type'] || ''
			if (!contentType.startsWith('image/')) return

			const contentLength = response.headers()['content-length']
			if (!contentLength) return

			const size = parseInt(contentLength, 10)
			if (size > MAX_LCP_IMAGE_TRANSFER_SIZE) {
				largeImages.push({
					url: response.url(),
					size,
				})
			}
		})

		await page.goto('/', { waitUntil: 'load' })
		await page.waitForTimeout(1000)

		const formatSize = (bytes: number) =>
			bytes < 1024 * 1024
				? `${(bytes / 1024).toFixed(1)} KB`
				: `${(bytes / (1024 * 1024)).toFixed(2)} MB`

		const details = largeImages
			.map(
				(img) =>
					`  - ${img.url.substring(img.url.lastIndexOf('/') + 1)}: ${formatSize(img.size)} (limit: ${formatSize(MAX_LCP_IMAGE_TRANSFER_SIZE)})`
			)
			.join('\n')

		expect(
			largeImages,
			`${largeImages.length} image(s) transferred exceed size limit:\n${details}\n` +
				`Large image transfers directly impact LCP. ` +
				`Use Next.js Image component, serve WebP/AVIF, resize to display dimensions.`
		).toHaveLength(0)
	}
)
