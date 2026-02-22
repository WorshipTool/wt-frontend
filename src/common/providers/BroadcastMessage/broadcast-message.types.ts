/**
 * Broadcast Message System Types
 *
 * System for displaying admin-configured broadcast messages to users.
 * Messages are displayed to logged-in users in a popup window.
 * Seen state is tracked via localStorage (no backend required).
 */

import { ReactNode } from 'react'

/**
 * Unique identifier for a broadcast message.
 * Used for tracking which messages the user has already seen.
 */
export type BroadcastMessageId = string

/**
 * Definition of a single broadcast message.
 */
export type BroadcastMessage = {
	/** Unique message ID – must not change after deployment */
	id: BroadcastMessageId
	/** Message title */
	title: ReactNode
	/** Message body */
	description: ReactNode
	/** ISO date string – newer messages (higher date) take priority */
	createdAt: string
	/** Whether the message is currently active (inactive messages are not displayed) */
	active?: boolean
}
