import '@testing-library/jest-dom'
import {
	buildCssSelector,
	buildElementPath,
	buildOpeningTag,
	captureElement,
	captureTextSelection,
	extractIdentifiers,
	findNearestIdentifiableAncestor,
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

	it('includes identifiers in the capture', () => {
		const el = document.createElement('p')
		el.id = 'my-para'
		document.body.appendChild(el)

		jest.spyOn(window, 'getSelection').mockReturnValue(null)

		const capture = captureTextSelection('text', el)
		expect(capture.identifiers).toBeDefined()
		expect(capture.identifiers?.id).toBe('my-para')

		el.remove()
		jest.restoreAllMocks()
	})
})

// ─── buildOpeningTag ──────────────────────────────────────────────────────────

describe('buildOpeningTag', () => {
	it('builds a tag with no attributes', () => {
		const el = document.createElement('div')
		expect(buildOpeningTag(el)).toBe('<div>')
	})

	it('includes id and class attributes', () => {
		const el = document.createElement('h2')
		el.id = 'title'
		el.className = 'section-title'
		const tag = buildOpeningTag(el)
		expect(tag).toContain('id="title"')
		expect(tag).toContain('class="section-title"')
		expect(tag).toMatch(/^<h2 /)
		expect(tag).toMatch(/>$/)
	})

	it('includes data attributes', () => {
		const el = document.createElement('button')
		el.setAttribute('data-testid', 'submit-btn')
		const tag = buildOpeningTag(el)
		expect(tag).toContain('data-testid="submit-btn"')
	})

	it('truncates very long attribute values', () => {
		const el = document.createElement('div')
		el.setAttribute('style', 'a'.repeat(200))
		const tag = buildOpeningTag(el)
		// The value should be truncated with …
		expect(tag).toContain('…')
		expect(tag.length).toBeLessThan(600)
	})
})

// ─── findNearestIdentifiableAncestor ────────────────────────────────────────

describe('findNearestIdentifiableAncestor', () => {
	it('returns undefined when no ancestor has id or data-testid', () => {
		const el = document.createElement('span')
		document.body.appendChild(el)
		expect(findNearestIdentifiableAncestor(el)).toBeUndefined()
		el.remove()
	})

	it('finds a parent with an id', () => {
		const parent = document.createElement('section')
		parent.id = 'pricing'
		const child = document.createElement('p')
		parent.appendChild(child)
		document.body.appendChild(parent)

		expect(findNearestIdentifiableAncestor(child)).toBe('#pricing')
		parent.remove()
	})

	it('finds a parent with data-testid', () => {
		const parent = document.createElement('div')
		parent.setAttribute('data-testid', 'hero-section')
		const child = document.createElement('h1')
		parent.appendChild(child)
		document.body.appendChild(parent)

		expect(findNearestIdentifiableAncestor(child)).toBe('[data-testid="hero-section"]')
		parent.remove()
	})

	it('prefers id over data-testid when both exist on same parent', () => {
		const parent = document.createElement('div')
		parent.id = 'my-section'
		parent.setAttribute('data-testid', 'my-test')
		const child = document.createElement('span')
		parent.appendChild(child)
		document.body.appendChild(parent)

		expect(findNearestIdentifiableAncestor(child)).toBe('#my-section')
		parent.remove()
	})
})

// ─── extractIdentifiers ─────────────────────────────────────────────────────

describe('extractIdentifiers', () => {
	it('extracts id when present', () => {
		const el = document.createElement('div')
		el.id = 'test-id'
		const ids = extractIdentifiers(el)
		expect(ids.id).toBe('test-id')
	})

	it('extracts data-testid', () => {
		const el = document.createElement('button')
		el.setAttribute('data-testid', 'submit')
		const ids = extractIdentifiers(el)
		expect(ids.testId).toBe('submit')
	})

	it('extracts meaningful class names and filters generated ones', () => {
		const el = document.createElement('div')
		el.className = 'css-abc123 my-class another-class MuiButton-root'
		const ids = extractIdentifiers(el)
		expect(ids.classNames).toContain('my-class')
		expect(ids.classNames).toContain('another-class')
		expect(ids.classNames).not.toContain('css-abc123')
		expect(ids.classNames).not.toContain('MuiButton-root')
	})

	it('extracts aria-label and role', () => {
		const el = document.createElement('button')
		el.setAttribute('aria-label', 'Close dialog')
		el.setAttribute('role', 'button')
		const ids = extractIdentifiers(el)
		expect(ids.ariaLabel).toBe('Close dialog')
		expect(ids.role).toBe('button')
	})

	it('extracts href for links', () => {
		const el = document.createElement('a')
		el.setAttribute('href', '/pricing')
		const ids = extractIdentifiers(el)
		expect(ids.href).toBe('/pricing')
	})

	it('extracts src and alt for images', () => {
		const el = document.createElement('img')
		el.setAttribute('src', '/logo.png')
		el.setAttribute('alt', 'Company logo')
		const ids = extractIdentifiers(el)
		expect(ids.src).toBe('/logo.png')
		expect(ids.alt).toBe('Company logo')
	})

	it('extracts name and placeholder for inputs', () => {
		const el = document.createElement('input')
		el.setAttribute('name', 'email')
		el.setAttribute('placeholder', 'Enter email')
		const ids = extractIdentifiers(el)
		expect(ids.name).toBe('email')
		expect(ids.placeholder).toBe('Enter email')
	})

	it('extracts other data-* attributes (excluding data-testid and data-edit-proposals-ui)', () => {
		const el = document.createElement('div')
		el.setAttribute('data-section', 'hero')
		el.setAttribute('data-index', '3')
		el.setAttribute('data-testid', 'skip-me')
		el.setAttribute('data-edit-proposals-ui', '')
		const ids = extractIdentifiers(el)
		expect(ids.dataAttributes).toEqual({
			'data-section': 'hero',
			'data-index': '3',
		})
	})

	it('always includes an opening tag', () => {
		const el = document.createElement('span')
		const ids = extractIdentifiers(el)
		expect(ids.openingTag).toBe('<span>')
	})

	it('finds nearest identifiable ancestor when element has no id or testId', () => {
		const parent = document.createElement('section')
		parent.id = 'features'
		const child = document.createElement('p')
		parent.appendChild(child)
		document.body.appendChild(parent)

		const ids = extractIdentifiers(child)
		expect(ids.nearestIdentifiableAncestor).toBe('#features')

		parent.remove()
	})

	it('does not look for ancestor when element has an id', () => {
		const parent = document.createElement('section')
		parent.id = 'features'
		const child = document.createElement('p')
		child.id = 'my-paragraph'
		parent.appendChild(child)
		document.body.appendChild(parent)

		const ids = extractIdentifiers(child)
		expect(ids.nearestIdentifiableAncestor).toBeUndefined()

		parent.remove()
	})
})

// ─── captureElement includes identifiers ────────────────────────────────────

describe('captureElement - identifiers', () => {
	it('includes identifiers in the capture result', () => {
		const el = document.createElement('a')
		el.setAttribute('href', '/about')
		el.id = 'about-link'
		el.textContent = 'About us'
		document.body.appendChild(el)

		const capture = captureElement(el)
		expect(capture.identifiers).toBeDefined()
		expect(capture.identifiers?.id).toBe('about-link')
		expect(capture.identifiers?.href).toBe('/about')
		expect(capture.identifiers?.openingTag).toContain('href')

		el.remove()
	})
})
