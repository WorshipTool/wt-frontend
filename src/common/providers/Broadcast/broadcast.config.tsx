/**
 * Broadcast Message Configuration
 *
 * This file is the single place operators edit to manage broadcast messages.
 * Messages are shown to ALL logged-in users until dismissed.
 *
 * HOW TO ADD A MESSAGE
 * --------------------
 * 1. Add an entry to the array inside getBroadcastMessages()
 * 2. Set `active: true` and fill in `id`, `title`, `message`, `severity`, `createdAt`
 * 3. Optionally set `expiresAt` for messages with a known end time
 * 4. Deploy — the message will immediately appear to all logged-in users
 *
 * HOW TO REMOVE A MESSAGE
 * -----------------------
 * Set `active: false` or delete the entry entirely, then deploy.
 *
 * SEVERITY GUIDE
 * --------------
 * 'info'     — informational, no user action needed
 * 'warning'  — caution: upcoming maintenance, temporary degradation
 * 'critical' — active outage or data-integrity issue requiring attention
 *
 * ID CONVENTION
 * -------------
 * Format: {type}-{YYYY-MM}[-{sequence}]
 * Example: 'outage-2026-03', 'maintenance-2026-04-01', 'apology-2026-03-02'
 * IDs must be unique and STABLE — they are stored in localStorage as dismiss keys.
 */

import { BroadcastMessage } from './broadcast.types'

export function getBroadcastMessages(): BroadcastMessage[] {
  return [
    // ─── Add operational messages here ─────────────────────────────────────
    {
      id: 'info-2026-03-01',
      title: 'Vítejte v nové verzi',
      message:
        'Spustili jsme aktualizovanou verzi aplikace s vylepšeným výkonem a novými funkcemi. Děkujeme za vaši trpělivost.',
      severity: 'info',
      createdAt: '2026-03-06T08:00:00Z',
      active: true,
    },
    {
      id: 'maintenance-2026-03-01',
      title: 'Plánovaná údržba',
      message:
        'Tuto neděli 8. března od 02:00 do 04:00 SEČ proběhne plánovaná údržba. Během této doby může být aplikace nedostupná.',
      severity: 'warning',
      createdAt: '2026-03-06T08:00:00Z',
      expiresAt: '2026-03-08T04:00:00Z',
      active: true,
    },
    // ───────────────────────────────────────────────────────────────────────
  ]
}

/**
 * Returns only the messages that should currently be displayed:
 * - `active` is not explicitly false
 * - `expiresAt` (if set) is in the future
 * - sorted oldest-first so the most pressing historical notice appears first
 */
export function getActiveBroadcasts(): BroadcastMessage[] {
  const now = new Date().toISOString()

  return getBroadcastMessages()
    .filter((msg) => {
      if (msg.active === false) return false
      if (msg.expiresAt && msg.expiresAt <= now) return false
      return true
    })
    .sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    )
}
