import { getPopupPosition, MAX_WIDTH, OFFSET } from './popupPosition'

const PHONE = { width: 390, height: 664 }
const DESKTOP = { width: 1280, height: 900 }

const rect = (left: number, right: number, top = 100, bottom = 140) => ({
	left,
	right,
	top,
	bottom,
})

describe('getPopupPosition', () => {
	describe('on a phone', () => {
		// The playlist's add-song anchor is a zero-width marker at left: 50%, so it
		// counted as "right half" and pinned the popup's right edge to the middle of
		// the screen — leaving 187px of a 374px popup past the left edge.
		it('centres the popup instead of pinning an edge to the anchor', () => {
			const p = getPopupPosition(rect(195, 195), PHONE, true)

			expect(p.left).toBe(OFFSET)
			expect(p.right).toBeUndefined()
		})

		it('centres it wherever the anchor happens to be', () => {
			for (const anchor of [rect(0, 0), rect(12, 60), rect(380, 390)]) {
				expect(getPopupPosition(anchor, PHONE).left).toBe(OFFSET)
			}
		})

		it('leaves the popup fully on screen', () => {
			const p = getPopupPosition(rect(195, 195), PHONE, true)
			// the popup's width is clamped to the screen less both gutters
			const width = Math.min(MAX_WIDTH, PHONE.width - OFFSET * 2)

			expect(p.left).toBeGreaterThanOrEqual(0)
			expect(p.left! + width).toBeLessThanOrEqual(PHONE.width)
			// and the gutters match, i.e. it really is centred
			expect(PHONE.width - (p.left! + width)).toBe(p.left)
		})
	})

	describe('on a desktop', () => {
		it('pins its left edge to an anchor in the left half', () => {
			const p = getPopupPosition(rect(200, 260), DESKTOP)

			expect(p.left).toBe(208)
			expect(p.right).toBeUndefined()
		})

		it('pins its right edge to an anchor in the right half', () => {
			const p = getPopupPosition(rect(1000, 1060), DESKTOP)

			expect(p.right).toBe(228)
			expect(p.left).toBeUndefined()
		})

		it('never lets a left-pinned popup run off the right edge', () => {
			// just inside the left half, but far enough right that following the
			// anchor would hang the popup's other end off the screen
			const p = getPopupPosition(rect(450, 490), { width: 1000, height: 900 })

			expect(p.left).toBe(1000 - MAX_WIDTH - OFFSET)
		})
	})

	describe('with a point anchor', () => {
		// The narrow playlist layout anchors the picker to a zero-width marker at
		// left: 50%. Read as an edge it counted as "right half", which pinned the
		// popup's right edge to the middle of the screen and hung the rest off it —
		// on any screen wide enough to skip the centring rule above.
		const TABLET = { width: 800, height: 700 }

		it('centres on the point rather than taking a side', () => {
			const p = getPopupPosition(rect(400, 400), TABLET)

			expect(p.left).toBe((800 - MAX_WIDTH) / 2)
			expect(p.right).toBeUndefined()
		})

		it('stays on screen when the point is near an edge', () => {
			expect(getPopupPosition(rect(20, 20), TABLET).left).toBe(OFFSET)
			expect(getPopupPosition(rect(780, 780), TABLET).left).toBe(
				800 - MAX_WIDTH - OFFSET
			)
		})

		it('still takes a side when the anchor has real width', () => {
			expect(getPopupPosition(rect(600, 700), TABLET).right).toBe(108)
		})
	})

	describe('above the bottom dock', () => {
		// 71px tab bar + 8px safe-area inset, as the phone shell measures it
		const DOCKED = { ...PHONE, bottomInset: 79 }

		it('rises from the dock, not from the bottom of the screen', () => {
			const p = getPopupPosition(rect(195, 195, 664, 664), DOCKED, true)

			// the anchor sits at the very bottom, under the bar; the popup does not
			expect(p.bottom).toBe(79 + OFFSET)
		})

		it('keeps an anchored popup where it is when it already clears the dock', () => {
			const p = getPopupPosition(rect(195, 195, 300, 300), DOCKED, true)

			expect(p.bottom).toBe(DOCKED.height - 300 + OFFSET)
		})

		it('caps a downward popup at the dock', () => {
			const p = getPopupPosition(rect(195, 195, 120, 160), DOCKED)

			expect(p.top).toBe(128)
			expect(p.top! + p.maxHeight).toBe(DOCKED.height - 79 - OFFSET)
		})

		it('reserves nothing where there is no dock', () => {
			const p = getPopupPosition(rect(195, 195, 664, 664), PHONE, true)

			expect(p.bottom).toBe(OFFSET)
		})
	})

	describe('vertically', () => {
		it('hangs below the anchor top by default', () => {
			const p = getPopupPosition(rect(200, 260, 300, 340), DESKTOP)

			expect(p.top).toBe(308)
			expect(p.bottom).toBeUndefined()
		})

		it('rises from the anchor bottom with upDirection', () => {
			const p = getPopupPosition(rect(200, 260, 300, 340), DESKTOP, true)

			expect(p.bottom).toBe(900 - 340 + OFFSET)
			expect(p.top).toBeUndefined()
		})
	})
})
