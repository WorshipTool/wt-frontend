/**
 * Utility functions for capturing DOM element information
 * when the admin right-clicks or selects text.
 */

import { ElementCapture } from './types'

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
		pageUrl: window.location.href,
	}
}

/**
 * Capture an ElementCapture snapshot for a text selection.
 * `anchorEl` is the element where the selection starts.
 */
export function captureTextSelection(
	selectedText: string,
	anchorEl: Element
): ElementCapture {
	return {
		type: 'text-selection',
		selectedText,
		elementTag: anchorEl.tagName.toLowerCase(),
		elementPath: buildElementPath(anchorEl),
		cssSelector: buildCssSelector(anchorEl),
		pageUrl: window.location.href,
	}
}
