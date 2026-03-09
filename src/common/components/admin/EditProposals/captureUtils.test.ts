import '@testing-library/jest-dom'
import {
	buildCssSelector,
	buildElementPath,
	captureElement,
	captureTextSelection,
	isEditableTarget,
} from './captureUtils'

describe('isEditableTarget', () => {
	it('returns true for INPUT elements', () => {
		const el = document.createElement('input')
		expect(isEditableTarget(el)).toBe(true)
	})

	it('returns true for TEXTAREA elements', () => {
		const el = document.createElement('textarea')
		expect(isEditableTarget(el)).toBe(true)
	})

	it('returns true for SELECT elements', () => {
		const el = document.createElement('select')
		expect(isEditableTarget(el)).toBe(true)
	})

	it('returns true for elements with contenteditable attribute', () => {
		const el = document.createElement('div')
		el.setAttribute('contenteditable', 'true')
		expect(isEditableTarget(el)).toBe(true)
	})

	it('returns true for children inside a contenteditable ancestor', () => {
		const parent = document.createElement('div')
		parent.setAttribute('contenteditable', 'true')
		document.body.appendChild(parent)
		const child = document.createElement('span')
		parent.appendChild(child)

		expect(isEditableTarget(child)).toBe(true)

		parent.remove()
	})

	it('returns false for regular div elements', () => {
		const el = document.createElement('div')
		expect(isEditableTarget(el)).toBe(false)
	})

	it('returns false for paragraph elements', () => {
		const el = document.createElement('p')
		expect(isEditableTarget(el)).toBe(false)
	})

	it('returns false for button elements', () => {
		const el = document.createElement('button')
		expect(isEditableTarget(el)).toBe(false)
	})
})

describe('buildElementPath', () => {
	it('returns tag name for a direct body child', () => {
		const el = document.createElement('h1')
		document.body.appendChild(el)
		const path = buildElementPath(el)
		expect(path).toBe('h1')
		el.remove()
	})

	it('builds a slash-separated path for nested elements', () => {
		const main = document.createElement('main')
		const section = document.createElement('section')
		const h2 = document.createElement('h2')
		main.appendChild(section)
		section.appendChild(h2)
		document.body.appendChild(main)

		const path = buildElementPath(h2)
		expect(path).toContain('h2')
		expect(path).toContain('section')

		main.remove()
	})

	it('limits depth to 4 segments', () => {
		// Build deeply nested structure: body > div1 > div2 > div3 > div4 > span
		const divs = Array.from({ length: 5 }, () => document.createElement('div'))
		const span = document.createElement('span')
		divs.reduce((parent, child) => {
			parent.appendChild(child)
			return child
		})
		divs[divs.length - 1].appendChild(span)
		document.body.appendChild(divs[0])

		const path = buildElementPath(span)
		const segments = path.split(' / ')
		expect(segments.length).toBeLessThanOrEqual(4)

		divs[0].remove()
	})
})

describe('buildCssSelector', () => {
	it('includes the element tag in the selector', () => {
		const el = document.createElement('button')
		document.body.appendChild(el)
		const selector = buildCssSelector(el)
		expect(selector).toContain('button')
		el.remove()
	})

	it('stops at an element with an id', () => {
		const parent = document.createElement('div')
		parent.id = 'my-container'
		const child = document.createElement('span')
		parent.appendChild(child)
		document.body.appendChild(parent)

		const selector = buildCssSelector(child)
		expect(selector).toContain('#my-container')

		parent.remove()
	})

	it('includes class names when present', () => {
		const el = document.createElement('div')
		el.className = 'foo bar'
		document.body.appendChild(el)

		const selector = buildCssSelector(el)
		expect(selector).toContain('foo')

		el.remove()
	})

	it('filters out generated class names starting with css-', () => {
		const el = document.createElement('div')
		el.className = 'css-abc123 my-class'
		document.body.appendChild(el)

		const selector = buildCssSelector(el)
		expect(selector).not.toContain('css-abc123')
		expect(selector).toContain('my-class')

		el.remove()
	})
})

describe('captureElement', () => {
	it('returns a capture with type "element"', () => {
		const el = document.createElement('p')
		el.textContent = 'Hello world'
		document.body.appendChild(el)

		const capture = captureElement(el)
		expect(capture.type).toBe('element')

		el.remove()
	})

	it('captures the element tag name', () => {
		const el = document.createElement('h2')
		document.body.appendChild(el)

		const capture = captureElement(el)
		expect(capture.elementTag).toBe('h2')

		el.remove()
	})

	it('truncates long element text to 120 characters', () => {
		const el = document.createElement('p')
		el.textContent = 'a'.repeat(200)
		document.body.appendChild(el)

		const capture = captureElement(el)
		expect(capture.elementText?.length).toBeLessThanOrEqual(124) // 120 + '…' length

		el.remove()
	})

	it('sets elementText to undefined for empty elements', () => {
		const el = document.createElement('div')
		document.body.appendChild(el)

		const capture = captureElement(el)
		expect(capture.elementText).toBeUndefined()

		el.remove()
	})

	it('includes the current page URL', () => {
		const el = document.createElement('span')
		document.body.appendChild(el)

		const capture = captureElement(el)
		expect(capture.pageUrl).toBe(window.location.href)

		el.remove()
	})

	it('includes anchorRect from getBoundingClientRect', () => {
		const el = document.createElement('p')
		document.body.appendChild(el)
		const mockRect = { top: 10, left: 20, right: 120, bottom: 40, width: 100, height: 30 }
		jest.spyOn(el, 'getBoundingClientRect').mockReturnValue(mockRect as DOMRect)

		const capture = captureElement(el)
		expect(capture.anchorRect).toEqual(mockRect)

		el.remove()
	})
})

describe('captureTextSelection', () => {
	it('returns a capture with type "text-selection"', () => {
		const el = document.createElement('p')
		document.body.appendChild(el)

		const capture = captureTextSelection('selected text', el)
		expect(capture.type).toBe('text-selection')

		el.remove()
	})

	it('stores the selected text', () => {
		const el = document.createElement('p')
		document.body.appendChild(el)

		const capture = captureTextSelection('my selection', el)
		expect(capture.selectedText).toBe('my selection')

		el.remove()
	})

	it('captures the anchor element tag', () => {
		const el = document.createElement('span')
		document.body.appendChild(el)

		const capture = captureTextSelection('text', el)
		expect(capture.elementTag).toBe('span')

		el.remove()
	})

	it('falls back to element bounding rect when no selection range is available', () => {
		const el = document.createElement('p')
		document.body.appendChild(el)
		const mockRect = { top: 5, left: 15, right: 115, bottom: 35, width: 100, height: 30 }
		jest.spyOn(el, 'getBoundingClientRect').mockReturnValue(mockRect as DOMRect)

		// Ensure getSelection returns null so we use the fallback
		jest.spyOn(window, 'getSelection').mockReturnValue(null)

		const capture = captureTextSelection('text', el)
		expect(capture.anchorRect).toEqual(mockRect)

		el.remove()
		jest.restoreAllMocks()
	})
})
