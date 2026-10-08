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
	describe('as a sheet', () => {
		// What the narrow layouts ask for: the same size and the same place
		// whatever the anchor is doing, because at this width the popup is the
		// screen rather than a menu belonging to a button.
		const DOCKED_PHONE = { ...PHONE, bottomInset: 79 }

		it('sits at the bottom, above the dock, whatever the anchor says', () => {
			const high = getPopupPosition(rect(16, 374, 300, 344), DOCKED_PHONE, {
				upDirection: true,
				asSheet: true,
			})
			const low = getPopupPosition(rect(16, 374, 600, 644), DOCKED_PHONE, {
				upDirection: true,
				asSheet: true,
			})

			expect(high.bottom).toBe(79 + OFFSET)
			expect(low).toEqual(high)
		})

		it('is centred at every width', () => {
			for (const width of [390, 610, 760, 899]) {
				const p = getPopupPosition(rect(16, 374), { width, height: 700 }, { asSheet: true })
				const popup = Math.min(MAX_WIDTH, width - OFFSET * 2)
				const rightGutter = width - (p.left! + popup)

				// an odd width cannot split evenly, so the two gutters may differ by
				// the one pixel that is left over
				expect(Math.abs(rightGutter - p.left!)).toBeLessThanOrEqual(1)
				expect(p.left).toBeGreaterThanOrEqual(OFFSET)
			}
		})

		it('takes the whole height it is given, minus the gutters', () => {
			const p = getPopupPosition(rect(16, 374), DOCKED_PHONE, { asSheet: true })

			expect(p.maxHeight).toBe(PHONE.height - 79 - OFFSET * 2)
		})
	})

	describe('on a phone', () => {
		// Anchored mode on a narrow screen — what the other callers still get.
		it('centres the popup instead of pinning an edge to the anchor', () => {
			const p = getPopupPosition(rect(195, 195), PHONE, { upDirection: true })

			expect(p.left).toBe(OFFSET)
			expect(p.right).toBeUndefined()
		})

		it('centres it wherever the anchor happens to be', () => {
			for (const anchor of [rect(0, 0), rect(12, 60), rect(380, 390)]) {
				expect(getPopupPosition(anchor, PHONE).left).toBe(OFFSET)
			}
		})

		it('leaves the popup fully on screen', () => {
			const p = getPopupPosition(rect(195, 195), PHONE, { upDirection: true })
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

	describe('above the bottom dock', () => {
		// 71px tab bar + 8px safe-area inset, as the phone shell measures it
		const DOCKED = { ...PHONE, bottomInset: 79 }

		it('rises from the dock, not from the bottom of the screen', () => {
			const p = getPopupPosition(rect(195, 195, 664, 664), DOCKED, {
				upDirection: true,
			})

			// the anchor sits at the very bottom, under the bar; the popup does not
			expect(p.bottom).toBe(79 + OFFSET)
		})

		it('keeps an anchored popup where it is when it already clears the dock', () => {
			const p = getPopupPosition(rect(195, 195, 300, 300), DOCKED, {
				upDirection: true,
			})

			expect(p.bottom).toBe(DOCKED.height - 300 + OFFSET)
		})

		it('caps a downward popup at the dock', () => {
			const p = getPopupPosition(rect(195, 195, 120, 160), DOCKED)

			expect(p.top).toBe(128)
			expect(p.top! + p.maxHeight).toBe(DOCKED.height - 79 - OFFSET)
		})

		it('reserves nothing where there is no dock', () => {
			const p = getPopupPosition(rect(195, 195, 664, 664), PHONE, { upDirection: true })

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
			const p = getPopupPosition(rect(200, 260, 300, 340), DESKTOP, { upDirection: true })

			expect(p.bottom).toBe(900 - 340 + OFFSET)
			expect(p.top).toBeUndefined()
		})
	})
})
