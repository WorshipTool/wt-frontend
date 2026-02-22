/**
 * Broadcast Message Configuration
 *
 * This file contains all broadcast messages that will be shown to users.
 * To send a new message to all users:
 *   1. Add a new object to the getBroadcastMessages() array below.
 *   2. Give it a unique `id` (e.g. 'outage-2026-03').
 *   3. Set `active: true`.
 *   4. Deploy – the popup will appear automatically for every user who has not yet dismissed it.
 *
 * IMPORTANT:
 *   - The `id` must be unique and must not change after deployment (used for localStorage tracking).
 *   - Set `active: false` (or remove the entry) when the message is no longer relevant.
 *   - The message with the most recent `createdAt` date is shown first.
 */

import { BroadcastMessage } from './broadcast-message.types'

export function getBroadcastMessages(): BroadcastMessage[] {
	return [
		// Example – uncomment and edit to show a message to all users:
		// {
		//   id: 'outage-2026-03',
		//   title: 'Omlouváme se za výpadek',
		//   description:
		//     'Omlouváme se za komplikace způsobené nedávným výpadkem. Na opravě jsme usilovně pracovali.',
		//   createdAt: '2026-03-01T00:00:00Z',
		//   active: true,
		// },
	]
}

export function getActiveBroadcastMessages(): BroadcastMessage[] {
	return getBroadcastMessages()
		.filter((msg) => msg.active !== false)
		.sort(
			(a, b) =>
				new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
		)
}
