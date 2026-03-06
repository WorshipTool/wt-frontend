import { act, renderHook } from '@testing-library/react'
import React from 'react'
import { BroadcastProvider, useBroadcast } from './BroadcastContext'
import type { BroadcastMessage } from './broadcast.types'

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockIsLoggedIn = jest.fn()
const mockUser = { guid: 'test-user-123' }

jest.mock('../../../hooks/auth/useAuth', () => ({
  __esModule: true,
  default: () => ({
    isLoggedIn: mockIsLoggedIn,
    user: mockUser,
  }),
}))

// Controllable list of broadcast messages for tests
let mockMessages: BroadcastMessage[] = []

jest.mock('./broadcast.config', () => ({
  getActiveBroadcasts: () => mockMessages,
}))

// ─── localStorage mock ────────────────────────────────────────────────────────

const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
  }
})()

Object.defineProperty(window, 'localStorage', { value: localStorageMock })

// ─── Test helpers ─────────────────────────────────────────────────────────────

const makeMessage = (
  id: string,
  severity: BroadcastMessage['severity'] = 'info',
): BroadcastMessage => ({
  id,
  title: `Title ${id}`,
  message: `Message body for ${id}`,
  severity,
  createdAt: '2026-03-01T00:00:00Z',
  active: true,
})

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <BroadcastProvider>{children}</BroadcastProvider>
)

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('BroadcastContext', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorageMock.clear()
    mockIsLoggedIn.mockReturnValue(true)
    mockMessages = []
  })

  describe('when user is not logged in', () => {
    it('returns no active broadcasts', async () => {
      mockIsLoggedIn.mockReturnValue(false)
      mockMessages = [makeMessage('msg-1')]

      const { result } = renderHook(() => useBroadcast(), { wrapper })

      await act(async () => {})

      expect(result.current.activeBroadcasts).toHaveLength(0)
      expect(result.current.currentBroadcast).toBeNull()
      expect(result.current.totalCount).toBe(0)
    })
  })

  describe('when user is logged in with no messages', () => {
    it('returns empty state', async () => {
      mockMessages = []
      const { result } = renderHook(() => useBroadcast(), { wrapper })

      await act(async () => {})

      expect(result.current.activeBroadcasts).toHaveLength(0)
      expect(result.current.currentBroadcast).toBeNull()
      expect(result.current.totalCount).toBe(0)
    })
  })

  describe('when there is one active message', () => {
    it('exposes the message as currentBroadcast', async () => {
      mockMessages = [makeMessage('outage-1', 'critical')]
      const { result } = renderHook(() => useBroadcast(), { wrapper })

      await act(async () => {})

      expect(result.current.currentBroadcast?.id).toBe('outage-1')
      expect(result.current.currentBroadcast?.severity).toBe('critical')
      expect(result.current.totalCount).toBe(1)
      expect(result.current.currentIndex).toBe(0)
    })

    it('removes the message from active list after dismiss', async () => {
      mockMessages = [makeMessage('outage-1')]
      const { result } = renderHook(() => useBroadcast(), { wrapper })

      await act(async () => {})

      act(() => {
        result.current.dismiss('outage-1')
      })

      expect(result.current.activeBroadcasts).toHaveLength(0)
      expect(result.current.currentBroadcast).toBeNull()
    })

    it('persists dismissed ID to localStorage', async () => {
      mockMessages = [makeMessage('outage-1')]
      const { result } = renderHook(() => useBroadcast(), { wrapper })

      await act(async () => {})

      act(() => {
        result.current.dismiss('outage-1')
      })

      const stored = JSON.parse(
        localStorageMock.getItem('broadcast-dismissed-test-user-123') ?? '[]',
      )
      expect(stored).toContain('outage-1')
    })
  })

  describe('when there are multiple active messages', () => {
    beforeEach(() => {
      mockMessages = [
        makeMessage('msg-1', 'info'),
        makeMessage('msg-2', 'warning'),
        makeMessage('msg-3', 'critical'),
      ]
    })

    it('starts at index 0', async () => {
      const { result } = renderHook(() => useBroadcast(), { wrapper })
      await act(async () => {})

      expect(result.current.currentIndex).toBe(0)
      expect(result.current.totalCount).toBe(3)
    })

    it('navigateNext advances to the next message', async () => {
      const { result } = renderHook(() => useBroadcast(), { wrapper })
      await act(async () => {})

      act(() => {
        result.current.navigateNext()
      })

      expect(result.current.currentIndex).toBe(1)
      expect(result.current.currentBroadcast?.id).toBe('msg-2')
    })

    it('navigatePrev wraps around from first to last', async () => {
      const { result } = renderHook(() => useBroadcast(), { wrapper })
      await act(async () => {})

      act(() => {
        result.current.navigatePrev()
      })

      expect(result.current.currentIndex).toBe(2)
      expect(result.current.currentBroadcast?.id).toBe('msg-3')
    })

    it('navigateNext wraps around from last to first', async () => {
      const { result } = renderHook(() => useBroadcast(), { wrapper })
      await act(async () => {})

      // advance to last
      act(() => {
        result.current.navigateNext()
        result.current.navigateNext()
      })
      expect(result.current.currentIndex).toBe(2)

      act(() => {
        result.current.navigateNext()
      })
      expect(result.current.currentIndex).toBe(0)
    })

    it('dismissAll removes all messages', async () => {
      const { result } = renderHook(() => useBroadcast(), { wrapper })
      await act(async () => {})

      act(() => {
        result.current.dismissAll()
      })

      expect(result.current.activeBroadcasts).toHaveLength(0)
      expect(result.current.currentBroadcast).toBeNull()
    })

    it('dismissing the current message shows the next undismissed one', async () => {
      const { result } = renderHook(() => useBroadcast(), { wrapper })
      await act(async () => {})

      act(() => {
        result.current.dismiss('msg-1')
      })

      // After dismissing msg-1, activeBroadcasts = [msg-2, msg-3]
      expect(result.current.activeBroadcasts.map((m) => m.id)).toEqual([
        'msg-2',
        'msg-3',
      ])
    })
  })

  describe('when dismissed messages are already in localStorage', () => {
    it('filters out previously dismissed messages on mount', async () => {
      localStorageMock.setItem(
        'broadcast-dismissed-test-user-123',
        JSON.stringify(['msg-1', 'msg-2']),
      )
      mockMessages = [
        makeMessage('msg-1'),
        makeMessage('msg-2'),
        makeMessage('msg-3'),
      ]

      const { result } = renderHook(() => useBroadcast(), { wrapper })
      await act(async () => {})

      expect(result.current.activeBroadcasts).toHaveLength(1)
      expect(result.current.activeBroadcasts[0].id).toBe('msg-3')
    })
  })

  describe('useBroadcast outside provider', () => {
    it('throws an error when used outside BroadcastProvider', () => {
      // Suppress console.error for this test
      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {})
      expect(() => renderHook(() => useBroadcast())).toThrow(
        'useBroadcast must be used inside a BroadcastProvider',
      )
      consoleSpy.mockRestore()
    })
  })
})
