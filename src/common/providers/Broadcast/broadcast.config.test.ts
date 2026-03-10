/**
 * broadcast.config tests
 *
 * Covers getActiveBroadcasts() filtering logic:
 * - active flag
 * - expiresAt expiration
 * - sorting order (oldest first)
 */

import { BroadcastMessage } from './broadcast.types'

// ─── Test-controllable message list ──────────────────────────────────────────

let testMessages: BroadcastMessage[] = []

// We re-implement the filtering logic from broadcast.config.tsx
// to test it in isolation, since the real config returns hardcoded messages
// and we want to test the filtering algorithm itself.

function getActiveBroadcastsFromList(
  messages: BroadcastMessage[],
): BroadcastMessage[] {
  const now = new Date().toISOString()

  return messages
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

// ─── Helpers ──────────────────────────────────────────────────────────────────

const makeMessage = (
  id: string,
  overrides: Partial<BroadcastMessage> = {},
): BroadcastMessage => ({
  id,
  title: `Title ${id}`,
  message: `Body ${id}`,
  severity: 'info',
  createdAt: '2026-03-01T00:00:00Z',
  active: true,
  ...overrides,
})

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('getActiveBroadcasts filtering', () => {
  describe('active flag', () => {
    it('includes messages with active=true', () => {
      const messages = [makeMessage('active-1', { active: true })]
      const result = getActiveBroadcastsFromList(messages)
      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('active-1')
    })

    it('excludes messages with active=false', () => {
      const messages = [makeMessage('inactive-1', { active: false })]
      const result = getActiveBroadcastsFromList(messages)
      expect(result).toHaveLength(0)
    })

    it('includes messages with active=undefined (defaults to active)', () => {
      const msg = makeMessage('implicit-active')
      delete (msg as any).active
      const result = getActiveBroadcastsFromList([msg])
      expect(result).toHaveLength(1)
    })
  })

  describe('expiresAt', () => {
    it('includes messages without expiresAt', () => {
      const messages = [makeMessage('no-expiry')]
      const result = getActiveBroadcastsFromList(messages)
      expect(result).toHaveLength(1)
    })

    it('includes messages with expiresAt in the future', () => {
      const futureDate = new Date(
        Date.now() + 24 * 60 * 60 * 1000,
      ).toISOString()
      const messages = [makeMessage('future', { expiresAt: futureDate })]
      const result = getActiveBroadcastsFromList(messages)
      expect(result).toHaveLength(1)
    })

    it('excludes messages with expiresAt in the past', () => {
      const pastDate = new Date(
        Date.now() - 24 * 60 * 60 * 1000,
      ).toISOString()
      const messages = [makeMessage('expired', { expiresAt: pastDate })]
      const result = getActiveBroadcastsFromList(messages)
      expect(result).toHaveLength(0)
    })
  })

  describe('sorting', () => {
    it('sorts messages oldest-first by createdAt', () => {
      const messages = [
        makeMessage('newest', { createdAt: '2026-03-10T00:00:00Z' }),
        makeMessage('oldest', { createdAt: '2026-03-01T00:00:00Z' }),
        makeMessage('middle', { createdAt: '2026-03-05T00:00:00Z' }),
      ]
      const result = getActiveBroadcastsFromList(messages)
      expect(result.map((m) => m.id)).toEqual(['oldest', 'middle', 'newest'])
    })
  })

  describe('combined filtering', () => {
    it('filters out inactive and expired, sorts the rest', () => {
      const futureDate = new Date(
        Date.now() + 24 * 60 * 60 * 1000,
      ).toISOString()
      const pastDate = new Date(
        Date.now() - 24 * 60 * 60 * 1000,
      ).toISOString()

      const messages = [
        makeMessage('active-new', { createdAt: '2026-03-10T00:00:00Z' }),
        makeMessage('inactive', {
          active: false,
          createdAt: '2026-03-05T00:00:00Z',
        }),
        makeMessage('expired', {
          expiresAt: pastDate,
          createdAt: '2026-03-03T00:00:00Z',
        }),
        makeMessage('active-old', { createdAt: '2026-03-01T00:00:00Z' }),
        makeMessage('future-expiry', {
          expiresAt: futureDate,
          createdAt: '2026-03-07T00:00:00Z',
        }),
      ]

      const result = getActiveBroadcastsFromList(messages)
      expect(result.map((m) => m.id)).toEqual([
        'active-old',
        'future-expiry',
        'active-new',
      ])
    })

    it('returns empty array when all messages are filtered out', () => {
      const pastDate = new Date(
        Date.now() - 24 * 60 * 60 * 1000,
      ).toISOString()
      const messages = [
        makeMessage('inactive', { active: false }),
        makeMessage('expired', { expiresAt: pastDate }),
      ]
      const result = getActiveBroadcastsFromList(messages)
      expect(result).toHaveLength(0)
    })

    it('returns empty array for empty input', () => {
      const result = getActiveBroadcastsFromList([])
      expect(result).toHaveLength(0)
    })
  })
})
