import { BasicVariantPack } from '@/types/song'
import { Sheet } from '@pepavlin/sheet-api'
import { Section } from '@pepavlin/sheet-api/lib/models/song/section'

export function computeChunkSizes(n: number): number[] {
	for (let a = Math.floor(n / 4); a >= 0; a--) {
		const remainder = n - 4 * a
		if (remainder % 3 === 0) {
			return [...Array(a).fill(4), ...Array(remainder / 3).fill(3)]
		}
	}
	return [n]
}

export function splitSection(section: Section): Section[] {
	if (section.lines.length <= 6) return [section]
	const chunkSizes = computeChunkSizes(section.lines.length)
	if (chunkSizes.length === 1) return [section]
	const chunks: Section[] = []
	let lineIdx = 0
	for (let i = 0; i < chunkSizes.length; i++) {
		chunks.push(
			new Section(
				i === 0 ? section.name : '',
				section.lines.slice(lineIdx, lineIdx + chunkSizes[i]),
			),
		)
		lineIdx += chunkSizes[i]
	}
	return chunks
}

export function getSlideCount(pack: BasicVariantPack): number {
	const sheet = new Sheet(pack.sheetData)
	const chunks = sheet.getSections().map(splitSection)
	return Math.max(1, ...chunks.map((c) => c.length))
}

export function buildSlidePacks(pack: BasicVariantPack): BasicVariantPack[] {
	const sheet = new Sheet(pack.sheetData)
	const sectionChunks = sheet.getSections().map(splitSection)
	const slideCount = Math.max(1, ...sectionChunks.map((c) => c.length))
	if (slideCount === 1) return [pack]
	return Array.from({ length: slideCount }, (_, slideIdx) => {
		const slideSections = sectionChunks
			.map((chunks) => chunks[Math.min(slideIdx, chunks.length - 1)])
		return {
			...pack,
			sheetData: slideSections.map((s) => s.toString()).join('\n'),
		}
	})
}
