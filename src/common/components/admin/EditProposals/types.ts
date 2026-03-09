/**
 * Types for the Admin Edit Proposals feature.
 *
 * Admins can right-click on any element or select text to propose an edit.
 * Proposals accumulate and are submitted all at once as a single task.
 */

export type CaptureType = 'element' | 'text-selection'

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
