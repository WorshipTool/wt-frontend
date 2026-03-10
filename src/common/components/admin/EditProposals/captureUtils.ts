/**
 * Utility functions for capturing DOM element information
 * when the admin right-clicks or selects text.
 */

import { AnchorRect, ElementCapture, ElementIdentifiers } from './types'

/** Convert a DOMRect (or similar) to a plain AnchorRect object. */
function toAnchorRect(rect: DOMRect): AnchorRect {
	return {
		top: rect.top,
		left: rect.left,
		right: rect.right,
		bottom: rect.bottom,
		width: rect.width,
		height: rect.height,
	}
}

/** Tags we never want to capture directly (the overlay itself, etc.) */
const IGNORED_TAGS = new Set(['HTML', 'BODY', 'SCRIPT', 'STYLE', 'NOSCRIPT'])

/** Tags where we should not intercept context-menu / selection */
const INPUT_TAGS = new Set([
	'INPUT',
	'TEXTAREA',
	'SELECT',
	'OPTION',
	'[contenteditable]',
])

/**
 * Returns true if the element is an editable field where the browser's
 * default context-menu / text-selection should be preserved.
 */
export function isEditableTarget(el: Element): boolean {
	const tag = el.tagName.toUpperCase()
	if (INPUT_TAGS.has(tag)) return true
	if (el.getAttribute('contenteditable') !== null) return true
	// Walk up to detect contenteditable parents
	let parent = el.parentElement
	while (parent) {
		if (parent.getAttribute('contenteditable') !== null) return true
		parent = parent.parentElement
	}
	return false
}

/**
 * Build a short human-readable CSS selector for an element, e.g.
 * "main > section > h2.title"
 */
export function buildCssSelector(el: Element): string {
	const parts: string[] = []
	let current: Element | null = el

	while (current && current !== document.body) {
		let part = current.tagName.toLowerCase()
		if (current.id) {
			part += `#${current.id}`
			parts.unshift(part)
			break // id is unique enough
		}
		const classes = Array.from(current.classList)
			.filter((c) => !c.startsWith('css-') && c.length < 40) // skip generated classes
			.slice(0, 2)
		if (classes.length > 0) {
			part += `.${classes.join('.')}`
		}
		parts.unshift(part)
		// Limit depth
		if (parts.length >= 4) break
		current = current.parentElement
	}

	return parts.join(' > ')
}

/**
 * Build a short human-readable path for a breadcrumb-style description,
 * e.g. "header / nav / ul / li"
 */
export function buildElementPath(el: Element): string {
	const parts: string[] = []
	let current: Element | null = el

	while (current && current !== document.body && parts.length < 4) {
		if (!IGNORED_TAGS.has(current.tagName)) {
			parts.unshift(current.tagName.toLowerCase())
		}
		current = current.parentElement
	}

	return parts.join(' / ')
}

/** CSS class prefixes that are typically generated at build time */
const GENERATED_CLASS_PREFIXES = ['css-', 'sc-', 'jss', 'makeStyles-', 'Mui']

/** Returns true if a class name appears to be generated (not authored in source) */
function isGeneratedClassName(cls: string): boolean {
	return GENERATED_CLASS_PREFIXES.some((prefix) => cls.startsWith(prefix))
}

/**
 * Build the opening HTML tag string of an element (no children / closing tag).
 * E.g. `<h2 id="title" class="section-title" data-testid="heading">`
 * Truncated to a reasonable length for readability.
 */
export function buildOpeningTag(el: Element): string {
	const tag = el.tagName.toLowerCase()
	const attrs: string[] = []

	for (const attr of Array.from(el.attributes)) {
		let value = attr.value
		// Truncate very long attribute values (e.g. inline styles)
		if (value.length > 80) value = value.slice(0, 80) + '…'
		attrs.push(`${attr.name}="${value}"`)
	}

	const attrStr = attrs.length > 0 ? ' ' + attrs.join(' ') : ''
	const result = `<${tag}${attrStr}>`

	// Cap overall length
	return result.length > 500 ? result.slice(0, 500) + '…>' : result
}

/**
 * Walk up the DOM tree to find the nearest ancestor that has an id or
 * data-testid attribute. Returns a descriptive string like
 * `#pricing-section` or `[data-testid="hero"]`, or undefined if none found.
 */
export function findNearestIdentifiableAncestor(
	el: Element
): string | undefined {
	let current = el.parentElement
	let depth = 0
	while (current && current !== document.body && depth < 10) {
		if (current.id) return `#${current.id}`
		const testId = current.getAttribute('data-testid')
		if (testId) return `[data-testid="${testId}"]`
		current = current.parentElement
		depth++
	}
	return undefined
}

/**
 * Extract rich identifiers from a DOM element to help AI locate
 * the corresponding element in source code.
 */
export function extractIdentifiers(el: Element): ElementIdentifiers {
	const result: ElementIdentifiers = {
		openingTag: buildOpeningTag(el),
	}

	// id
	if (el.id) result.id = el.id

	// Meaningful class names
	const allClasses = Array.from(el.classList)
	const meaningful = allClasses.filter(
		(c) => !isGeneratedClassName(c) && c.length < 60
	)
	if (meaningful.length > 0) result.classNames = meaningful

	// data-testid
	const testId = el.getAttribute('data-testid')
	if (testId) result.testId = testId

	// Other data-* attributes
	const dataAttrs: Record<string, string> = {}
	for (const attr of Array.from(el.attributes)) {
		if (
			attr.name.startsWith('data-') &&
			attr.name !== 'data-testid' &&
			attr.name !== 'data-edit-proposals-ui'
		) {
			dataAttrs[attr.name] = attr.value
		}
	}
	if (Object.keys(dataAttrs).length > 0) result.dataAttributes = dataAttrs

	// ARIA
	const ariaLabel = el.getAttribute('aria-label')
	if (ariaLabel) result.ariaLabel = ariaLabel

	const role = el.getAttribute('role')
	if (role) result.role = role

	// Link/media attributes
	const href = el.getAttribute('href')
	if (href) result.href = href

	const src = el.getAttribute('src')
	if (src) result.src = src

	const alt = el.getAttribute('alt')
	if (alt) result.alt = alt

	// Form attributes
	const name = el.getAttribute('name')
	if (name) result.name = name

	const placeholder = el.getAttribute('placeholder')
	if (placeholder) result.placeholder = placeholder

	// Nearest identifiable ancestor (only if element itself lacks id + testId)
	if (!result.id && !result.testId) {
		result.nearestIdentifiableAncestor = findNearestIdentifiableAncestor(el)
	}

	return result
}

/**
 * Capture an ElementCapture snapshot for a right-clicked element.
 */
export function captureElement(el: Element): ElementCapture {
	const rawText = (el.textContent ?? '').replace(/\s+/g, ' ').trim()
	const elementText = rawText.length > 120 ? rawText.slice(0, 120) + '…' : rawText

	return {
		type: 'element',
		elementTag: el.tagName.toLowerCase(),
		elementText: elementText || undefined,
		elementPath: buildElementPath(el),
		cssSelector: buildCssSelector(el),
		identifiers: extractIdentifiers(el),
		pageUrl: window.location.href,
		anchorRect: toAnchorRect(el.getBoundingClientRect()),
	}
}

/**
 * Capture an ElementCapture snapshot for a text selection.
 * `anchorEl` is the element where the selection starts.
 * Reads the current window selection to obtain an accurate bounding rect
 * for the selected text range.
 */
export function captureTextSelection(
	selectedText: string,
	anchorEl: Element
): ElementCapture {
	// Prefer the selection range rect for accurate placement
	const selection = window.getSelection()
	const range =
		selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : null
	const rangeRect = range?.getBoundingClientRect()
	const anchorRect =
		rangeRect && rangeRect.width > 0
			? toAnchorRect(rangeRect)
			: toAnchorRect(anchorEl.getBoundingClientRect())

	return {
		type: 'text-selection',
		selectedText,
		elementTag: anchorEl.tagName.toLowerCase(),
		elementPath: buildElementPath(anchorEl),
		cssSelector: buildCssSelector(anchorEl),
		identifiers: extractIdentifiers(anchorEl),
		pageUrl: window.location.href,
		anchorRect,
	}
}
