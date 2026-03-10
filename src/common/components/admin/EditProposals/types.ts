/**
 * Types for the Admin Edit Proposals feature.
 *
 * Admins can right-click on any element or select text to propose an edit.
 * Proposals accumulate and are submitted all at once as a single task.
 */

export type CaptureType = 'element' | 'text-selection'

/**
 * A plain-object snapshot of a DOMRect, captured at interaction time.
 * Used to position the floating proposal panel next to the target element.
 */
export type AnchorRect = {
	top: number
	left: number
	right: number
	bottom: number
	width: number
	height: number
}

/**
 * Rich identifiers extracted from the DOM element to help AI find the
 * corresponding element in source code. Compiled DOM paths may differ
 * from JSX source, so we capture as many semantic identifiers as possible.
 */
export type ElementIdentifiers = {
	/** Element's id attribute */
	id?: string
	/** Meaningful (non-generated) CSS class names on the element */
	classNames?: string[]
	/** data-testid attribute value */
	testId?: string
	/** All data-* attributes (key-value pairs, excluding data-testid) */
	dataAttributes?: Record<string, string>
	/** aria-label attribute value */
	ariaLabel?: string
	/** role attribute value */
	role?: string
	/** href for links */
	href?: string
	/** src for images / media */
	src?: string
	/** alt text for images */
	alt?: string
	/** name attribute (for forms) */
	name?: string
	/** placeholder attribute (for inputs) */
	placeholder?: string
	/** The element's opening HTML tag with all attributes (no children) */
	openingTag: string
	/** id or data-testid of the nearest identifiable ancestor (if the element itself lacks both) */
	nearestIdentifiableAncestor?: string
}

/**
 * Snapshot of the captured DOM element or text selection that the admin
 * wants to propose a change for.
 */
export type ElementCapture = {
	type: CaptureType
	/** For text-selection captures: the highlighted text */
	selectedText?: string
	/** Truncated text content of the target element (for context) */
	elementText?: string
	/** HTML tag name of the target element, e.g. 'h1', 'p', 'button' */
	elementTag: string
	/** Human-readable path describing where in the page the element sits */
	elementPath: string
	/** Current page URL at the time of capture */
	pageUrl: string
	/** CSS selector built from the element hierarchy */
	cssSelector?: string
	/** Rich identifiers for AI to locate the element in source code */
	identifiers?: ElementIdentifiers
	/**
	 * Viewport-relative bounding rect of the element or text selection,
	 * captured at the moment of the right-click / selection.
	 * Used to position the floating proposal panel next to the target.
	 */
	anchorRect?: AnchorRect
}

/**
 * A single edit proposal created by the admin.
 */
export type EditProposal = {
	id: string
	capture: ElementCapture
	/** Admin's free-text description of the desired change */
	proposalText: string
	timestamp: number
}
