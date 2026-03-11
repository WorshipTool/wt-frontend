/**
 * Image Size Tests for LCP Performance
 *
 * These tests validate that image assets don't exceed size thresholds
 * that would negatively impact Largest Contentful Paint (LCP) metrics.
 *
 * Thresholds are based on Web Vitals best practices:
 * - Large images are one of the primary causes of slow LCP
 * - Images should be compressed and use modern formats (WebP/AVIF)
 * - Icons should be especially small as they're often loaded eagerly
 *
 * Known violations are tracked in KNOWN_OVERSIZED_FILES. When these images
 * are optimized, remove them from the list. New oversized images will fail.
 */
import fs from 'fs'
import path from 'path'

const PUBLIC_ASSETS_DIR = path.resolve(__dirname, '../../../public/assets')

// --- Thresholds (in bytes) ---
const THRESHOLDS = {
	/** Max size for a single raster image (PNG/JPG/GIF) */
	RASTER_IMAGE_MAX: 300 * 1024, // 300 KB
	/** Max size for a single icon image */
	ICON_MAX: 100 * 1024, // 100 KB
	/** Max size for a single WebP image */
	WEBP_MAX: 100 * 1024, // 100 KB
	/** Max size for a single SVG file */
	SVG_MAX: 100 * 1024, // 100 KB
	/** Max total size for all images (excluding videos) */
	TOTAL_BUDGET: 10 * 1024 * 1024, // 10 MB
	/** Minimum file size to require a WebP alternative */
	WEBP_ALTERNATIVE_MIN: 50 * 1024, // 50 KB
} as const

/**
 * Known oversized images that existed before these tests were introduced.
 * Remove entries as images are optimized - the test will then enforce the limit.
 * DO NOT add new entries here - optimize new images instead.
 */
const KNOWN_OVERSIZED_FILES = new Set<string>([
	'team-preview.png',
	'team-preview2.png',
])

/**
 * Known images missing WebP alternatives.
 * Remove entries as WebP versions are created.
 */
const KNOWN_MISSING_WEBP = new Set<string>([])

const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg']
const RASTER_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif']
const ICON_DIRECTORIES = ['icons']

/** Recursively find all files matching given extensions */
function findImageFiles(dir: string): string[] {
	if (!fs.existsSync(dir)) return []

	const files: string[] = []
	const entries = fs.readdirSync(dir, { withFileTypes: true })
	for (const entry of entries) {
		const fullPath = path.join(dir, entry.name)
		if (entry.isDirectory()) {
			files.push(...findImageFiles(fullPath))
		} else if (
			IMAGE_EXTENSIONS.includes(path.extname(entry.name).toLowerCase())
		) {
			files.push(fullPath)
		}
	}
	return files
}

function getFileSize(filePath: string): number {
	return fs.statSync(filePath).size
}

function formatSize(bytes: number): string {
	if (bytes < 1024) return `${bytes} B`
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
	return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

function isIconFile(filePath: string): boolean {
	const relativePath = path.relative(PUBLIC_ASSETS_DIR, filePath)
	return ICON_DIRECTORIES.some((dir) => relativePath.startsWith(dir))
}

function getDisplayPath(filePath: string): string {
	return path.relative(PUBLIC_ASSETS_DIR, filePath)
}

// --- Pre-compute image data ---
const allImages = findImageFiles(PUBLIC_ASSETS_DIR)

describe('Image Size - LCP Performance', () => {
	it('should find image files in public/assets', () => {
		expect(allImages.length).toBeGreaterThan(0)
	})

	describe('Raster image size limits (PNG/JPG/GIF)', () => {
		const rasterImages = allImages.filter((f) =>
			RASTER_EXTENSIONS.includes(path.extname(f).toLowerCase())
		)

		it.each(
			rasterImages.map((f) => {
				const displayPath = getDisplayPath(f)
				const size = getFileSize(f)
				const isIcon = isIconFile(f)
				const limit = isIcon
					? THRESHOLDS.ICON_MAX
					: THRESHOLDS.RASTER_IMAGE_MAX
				const isKnown = KNOWN_OVERSIZED_FILES.has(displayPath)
				return { displayPath, size, limit, isKnown }
			})
		)(
			'$displayPath should be under size limit',
			({ displayPath, size, limit, isKnown }) => {
				if (isKnown) {
					// Known violation - warn but don't fail
					if (size > limit) {
						console.warn(
							`[KNOWN] ${displayPath}: ${formatSize(size)} exceeds ${formatSize(limit)} - needs optimization`
						)
					} else {
						// Image was optimized - remove from KNOWN_OVERSIZED_FILES!
						console.log(
							`${displayPath} is now within limits - remove from KNOWN_OVERSIZED_FILES`
						)
					}
					return
				}
				expect(size).toBeLessThanOrEqual(limit)
			}
		)
	})

	describe('WebP image size limits', () => {
		const webpImages = allImages.filter(
			(f) => path.extname(f).toLowerCase() === '.webp'
		)

		it.each(
			webpImages.map((f) => ({
				displayPath: getDisplayPath(f),
				size: getFileSize(f),
			}))
		)('$displayPath should be under size limit', ({ size }) => {
			expect(size).toBeLessThanOrEqual(THRESHOLDS.WEBP_MAX)
		})
	})

	describe('SVG file size limits', () => {
		const svgImages = allImages.filter(
			(f) => path.extname(f).toLowerCase() === '.svg'
		)

		it.each(
			svgImages.map((f) => {
				const displayPath = getDisplayPath(f)
				return {
					displayPath,
					size: getFileSize(f),
					isKnown: KNOWN_OVERSIZED_FILES.has(displayPath),
				}
			})
		)(
			'$displayPath should be under size limit',
			({ displayPath, size, isKnown }) => {
				if (isKnown) {
					if (size > THRESHOLDS.SVG_MAX) {
						console.warn(
							`[KNOWN] ${displayPath}: ${formatSize(size)} exceeds ${formatSize(THRESHOLDS.SVG_MAX)} - needs optimization`
						)
					} else {
						console.log(
							`${displayPath} is now within limits - remove from KNOWN_OVERSIZED_FILES`
						)
					}
					return
				}
				expect(size).toBeLessThanOrEqual(THRESHOLDS.SVG_MAX)
			}
		)
	})

	describe('Total image budget', () => {
		it('total size of all images should be within budget', () => {
			const totalSize = allImages.reduce(
				(sum, f) => sum + getFileSize(f),
				0
			)
			expect(totalSize).toBeLessThan(THRESHOLDS.TOTAL_BUDGET)
		})
	})

	describe('Modern format adoption - WebP alternatives', () => {
		const largeRasters = allImages.filter((f) => {
			const ext = path.extname(f).toLowerCase()
			return (
				['.png', '.jpg', '.jpeg'].includes(ext) &&
				getFileSize(f) > THRESHOLDS.WEBP_ALTERNATIVE_MIN
			)
		})

		it.each(
			largeRasters.map((f) => {
				const displayPath = getDisplayPath(f)
				const webpPath = f.replace(/\.(png|jpe?g)$/i, '.webp')
				const hasWebP = fs.existsSync(webpPath)
				const isKnown = KNOWN_MISSING_WEBP.has(displayPath)
				return {
					displayPath,
					size: getFileSize(f),
					hasWebP,
					isKnown,
				}
			})
		)(
			'$displayPath should have a WebP alternative',
			({ displayPath, size, hasWebP, isKnown }) => {
				if (isKnown && !hasWebP) {
					console.warn(
						`[KNOWN] ${displayPath} (${formatSize(size)}) missing WebP alternative`
					)
					return
				}
				if (isKnown && hasWebP) {
					console.log(
						`${displayPath} now has WebP alternative - remove from KNOWN_MISSING_WEBP`
					)
				}
				expect(hasWebP).toBe(true)
			}
		)
	})

	describe('Known violations audit', () => {
		it('KNOWN_OVERSIZED_FILES entries should still exist', () => {
			const stale = Array.from(KNOWN_OVERSIZED_FILES).filter((f) => {
				const fullPath = path.join(PUBLIC_ASSETS_DIR, f)
				return !fs.existsSync(fullPath)
			})

			if (stale.length > 0) {
				throw new Error(
					`Stale entries in KNOWN_OVERSIZED_FILES (files no longer exist):\n` +
						stale.map((f) => `  - ${f}`).join('\n') +
						`\nRemove these entries from the allowlist.`
				)
			}
		})

		it('KNOWN_MISSING_WEBP entries should still exist', () => {
			const stale = Array.from(KNOWN_MISSING_WEBP).filter((f) => {
				const fullPath = path.join(PUBLIC_ASSETS_DIR, f)
				return !fs.existsSync(fullPath)
			})

			if (stale.length > 0) {
				throw new Error(
					`Stale entries in KNOWN_MISSING_WEBP (files no longer exist):\n` +
						stale.map((f) => `  - ${f}`).join('\n') +
						`\nRemove these entries from the allowlist.`
				)
			}
		})
	})

	describe('Image size report', () => {
		it('should generate a summary of all image assets', () => {
			const imagesByType = allImages.reduce(
				(acc, f) => {
					const ext = path.extname(f).toLowerCase()
					if (!acc[ext]) acc[ext] = { count: 0, totalSize: 0 }
					acc[ext].count++
					acc[ext].totalSize += getFileSize(f)
					return acc
				},
				{} as Record<string, { count: number; totalSize: number }>
			)

			const totalSize = allImages.reduce(
				(sum, f) => sum + getFileSize(f),
				0
			)

			const knownCount = KNOWN_OVERSIZED_FILES.size
			const knownMissingCount = KNOWN_MISSING_WEBP.size

			const report = Object.entries(imagesByType)
				.sort(([, a], [, b]) => b.totalSize - a.totalSize)
				.map(
					([ext, data]) =>
						`  ${ext}: ${data.count} files, ${formatSize(data.totalSize)}`
				)
				.join('\n')

			console.log(
				`\nImage Asset Summary:\n` +
					`${report}\n` +
					`  ----\n` +
					`  Total: ${allImages.length} files, ${formatSize(totalSize)}\n` +
					`  Budget: ${formatSize(THRESHOLDS.TOTAL_BUDGET)}\n` +
					`  Known oversized: ${knownCount} files\n` +
					`  Known missing WebP: ${knownMissingCount} files\n`
			)

			expect(totalSize).toBeGreaterThan(0)
		})
	})
})
