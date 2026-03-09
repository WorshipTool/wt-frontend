/**
 * Builds a human-readable description of a DOM element.
 * Includes tag name and key attributes (id, role, aria-label, data-testid, first class).
 */
export function describeElement(el: Element): string {
	const tag = el.tagName.toLowerCase()
	const parts: string[] = [tag]

	const id = el.getAttribute('id')
	if (id) parts.push(`#${id}`)

	const role = el.getAttribute('role')
	if (role) parts.push(`[role="${role}"]`)

	const ariaLabel = el.getAttribute('aria-label')
	if (ariaLabel) parts.push(`[aria-label="${ariaLabel.slice(0, 30)}"]`)

	const classes = el.className
	if (typeof classes === 'string' && classes.trim()) {
		const firstClass = classes.trim().split(/\s+/)[0]
		if (firstClass && !firstClass.includes('Mui') && !firstClass.startsWith('css-')) {
			parts.push(`.${firstClass}`)
		}
	}

	const dataTestId = el.getAttribute('data-testid')
	if (dataTestId) parts.push(`[data-testid="${dataTestId}"]`)

	return `<${parts.join('')}>`
}

/**
 * Gets a short text preview from an element.
 * Prefers text content over inner HTML, truncates to 80 chars.
 */
export function getElementTextPreview(el: Element): string {
	const text = (el.textContent ?? '').trim().replace(/\s+/g, ' ')
	if (!text) return ''
	return text.length > 80 ? text.slice(0, 80) + '…' : text
}

/**
 * Finds the most meaningful ancestor element to describe.
 * Walks up the DOM to find a more semantic element if the target is very generic.
 */
export function findMeaningfulElement(el: Element): Element {
	const genericTags = new Set(['span', 'div', 'li', 'ul', 'ol'])
	let current: Element | null = el

	// If the element has an id or meaningful role, use it directly
	if (
		el.getAttribute('id') ||
		el.getAttribute('role') ||
		el.getAttribute('aria-label') ||
		!genericTags.has(el.tagName.toLowerCase())
	) {
		return el
	}

	// Walk up to find a more meaningful parent (max 3 levels)
	for (let i = 0; i < 3; i++) {
		const parent: Element | null = current?.parentElement ?? null
		if (!parent || parent.tagName.toLowerCase() === 'body') break
		if (
			parent.getAttribute('id') ||
			parent.getAttribute('role') ||
			parent.getAttribute('aria-label') ||
			!genericTags.has(parent.tagName.toLowerCase())
		) {
			return parent
		}
		current = parent
	}

	return el
}
