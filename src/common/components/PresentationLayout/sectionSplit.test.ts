import { BasicVariantPack } from '@/types/song'
import { buildSlidePacks, computeChunkSizes, splitSection } from './sectionSplit'
import { Sheet } from '@pepavlin/sheet-api'
import { Section } from '@pepavlin/sheet-api/lib/models/song/section'

// ── helpers ──────────────────────────────────────────────────────────────────

function makeLines(count: number): string {
	return Array.from({ length: count }, (_, i) => `Line ${i + 1}`).join('\n')
}

function makeSheetData(sections: { name: string; lineCount: number }[]): string {
	return sections.map((s) => `{${s.name}}${makeLines(s.lineCount)}`).join('\n')
}

function makePack(sheetData: string): BasicVariantPack {
	return {
		packGuid: 'test-guid',
		packAlias: 'test-alias',
		title: 'Test Song',
		sheetData,
		songGuid: 'song-guid',
		verified: false,
	} as BasicVariantPack
}

function getSectionLineCounts(sheetData: string): number[] {
	return new Sheet(sheetData).getSections().map((s) => s.lines.length)
}

function getSectionNames(sheetData: string): string[] {
	return new Sheet(sheetData).getSections().map((s) => s.name)
}

// ── computeChunkSizes ─────────────────────────────────────────────────────────

describe('computeChunkSizes', () => {
	it('returns [n] when n cannot be expressed as 4a+3b (n=5)', () => {
		expect(computeChunkSizes(5)).toEqual([5])
	})

	it('returns single chunk for n=4', () => {
		expect(computeChunkSizes(4)).toEqual([4])
	})

	it('splits n=6 into two 3-line chunks', () => {
		expect(computeChunkSizes(6)).toEqual([3, 3])
	})

	it('splits n=7 into [4, 3] — prefers 4-line chunks', () => {
		expect(computeChunkSizes(7)).toEqual([4, 3])
	})

	it('splits n=8 into two 4-line chunks', () => {
		expect(computeChunkSizes(8)).toEqual([4, 4])
	})

	it('splits n=9 into three 3-line chunks', () => {
		expect(computeChunkSizes(9)).toEqual([3, 3, 3])
	})

	it('splits n=10 into [4, 3, 3] — one 4-line then 3-line', () => {
		expect(computeChunkSizes(10)).toEqual([4, 3, 3])
	})

	it('splits n=11 into [4, 4, 3]', () => {
		expect(computeChunkSizes(11)).toEqual([4, 4, 3])
	})

	it('splits n=12 into three 4-line chunks', () => {
		expect(computeChunkSizes(12)).toEqual([4, 4, 4])
	})

	it('never produces a 2-line chunk for n > 6 (the range splitSection uses)', () => {
		for (let n = 7; n <= 30; n++) {
			const sizes = computeChunkSizes(n)
			expect(sizes).not.toContain(2)
		}
	})

	it('chunk sizes always sum to n', () => {
		for (let n = 1; n <= 30; n++) {
			const sizes = computeChunkSizes(n)
			const sum = sizes.reduce((a, b) => a + b, 0)
			expect(sum).toBe(n)
		}
	})
})

// ── splitSection ──────────────────────────────────────────────────────────────

describe('splitSection', () => {
	function makeSection(name: string, lineCount: number): Section {
		return new Sheet(`{${name}}${makeLines(lineCount)}`).getSections()[0]
	}

	it('does not split a section with exactly 6 lines', () => {
		const section = makeSection('VERSE 1', 6)
		const result = splitSection(section)
		expect(result).toHaveLength(1)
		expect(result[0]).toBe(section)
	})

	it('does not split a section with fewer than 6 lines', () => {
		const section = makeSection('CHORUS', 4)
		const result = splitSection(section)
		expect(result).toHaveLength(1)
	})

	it('splits an 8-line section into two chunks of 4', () => {
		const section = makeSection('VERSE 1', 8)
		const result = splitSection(section)
		expect(result).toHaveLength(2)
		expect(result[0].lines).toHaveLength(4)
		expect(result[1].lines).toHaveLength(4)
	})

	it('splits a 7-line section into chunks of [4, 3]', () => {
		const section = makeSection('VERSE 1', 7)
		const result = splitSection(section)
		expect(result).toHaveLength(2)
		expect(result[0].lines).toHaveLength(4)
		expect(result[1].lines).toHaveLength(3)
	})

	it('keeps the section name on the first chunk only', () => {
		const section = makeSection('VERSE 1', 8)
		const result = splitSection(section)
		expect(result[0].name).toBe('VERSE 1')
		expect(result[1].name).toBe('')
	})

	it('preserves all lines — no lines lost or duplicated', () => {
		const section = makeSection('VERSE 1', 12)
		const result = splitSection(section)
		const totalLines = result.reduce((sum, s) => sum + s.lines.length, 0)
		expect(totalLines).toBe(12)
	})
})

// ── buildSlidePacks ───────────────────────────────────────────────────────────

describe('buildSlidePacks', () => {
	it('returns the original pack when no section exceeds 6 lines', () => {
		const pack = makePack(makeSheetData([{ name: 'VERSE 1', lineCount: 6 }]))
		const result = buildSlidePacks(pack)
		expect(result).toHaveLength(1)
		expect(result[0]).toBe(pack)
	})

	it('splits a pack with one 8-line section into 2 slides', () => {
		const pack = makePack(makeSheetData([{ name: 'VERSE 1', lineCount: 8 }]))
		const result = buildSlidePacks(pack)
		expect(result).toHaveLength(2)
		expect(getSectionLineCounts(result[0].sheetData)).toEqual([4])
		expect(getSectionLineCounts(result[1].sheetData)).toEqual([4])
	})

	it('splits a pack with one 12-line section into 3 slides of 4 lines each', () => {
		const pack = makePack(makeSheetData([{ name: 'VERSE 1', lineCount: 12 }]))
		const result = buildSlidePacks(pack)
		expect(result).toHaveLength(3)
		result.forEach((slide) => {
			expect(getSectionLineCounts(slide.sheetData)).toEqual([4])
		})
	})

	it('shows section name only on the first slide, empty on continuations', () => {
		const pack = makePack(makeSheetData([{ name: 'VERSE 1', lineCount: 8 }]))
		const result = buildSlidePacks(pack)
		expect(getSectionNames(result[0].sheetData)).toEqual(['VERSE 1'])
		expect(getSectionNames(result[1].sheetData)).toEqual([''])
	})

	it('short sections repeat on all slides when a longer section splits', () => {
		// Verse 1: 8 lines (splits into 2 slides), Chorus: 4 lines (repeats on all slides)
		const pack = makePack(
			makeSheetData([
				{ name: 'VERSE 1', lineCount: 8 },
				{ name: 'CHORUS', lineCount: 4 },
			]),
		)
		const result = buildSlidePacks(pack)
		expect(result).toHaveLength(2)
		// Slide 0: Verse chunk 0 (4 lines) + Chorus (4 lines)
		expect(getSectionLineCounts(result[0].sheetData)).toEqual([4, 4])
		// Slide 1: Verse chunk 1 (4 lines) + Chorus repeated (4 lines)
		expect(getSectionLineCounts(result[1].sheetData)).toEqual([4, 4])
	})

	it('preserves pack metadata (title, guid) on all slides', () => {
		const pack = makePack(makeSheetData([{ name: 'VERSE 1', lineCount: 8 }]))
		const result = buildSlidePacks(pack)
		result.forEach((slide) => {
			expect(slide.title).toBe(pack.title)
			expect(slide.packGuid).toBe(pack.packGuid)
			expect(slide.songGuid).toBe(pack.songGuid)
		})
	})
})
