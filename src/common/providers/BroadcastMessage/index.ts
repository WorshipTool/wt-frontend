/**
 * Broadcast Message System
 *
 * System for displaying admin-configured broadcast messages to users.
 * Messages are configured in `broadcast-message.config.tsx` and shown to
 * logged-in users via a popup. Dismissed messages are tracked in localStorage.
 *
 * ## Usage:
 *
 * 1. `BroadcastMessageProvider` is already registered in `AppClientProviders`.
 *
 * 2. To send a new message to all users, add an entry to
 *    `broadcast-message.config.tsx` and set `active: true`.
 *
 * 3. The popup closes when the user clicks "OK" or the close button.
 *    The message ID is then stored in localStorage and will not appear again.
 */

// Config
export { getActiveBroadcastMessages } from './broadcast-message.config'

// Types
export type { BroadcastMessage, BroadcastMessageId } from './broadcast-message.types'

// Context & Hooks
export {
	BroadcastMessageProvider,
	useBroadcastMessage,
} from './BroadcastMessageContext'

// Components
export { BroadcastMessagePopup } from './BroadcastMessagePopup'
