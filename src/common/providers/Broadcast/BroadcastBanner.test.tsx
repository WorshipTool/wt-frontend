/**
 * BroadcastBanner tests
 *
 * Covers rendering, severity styling, pagination, dismiss, and animation wrapper.
 */

import '@testing-library/jest-dom'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import { BroadcastBanner } from './BroadcastBanner'
import { BroadcastMessage } from './broadcast.types'

// ─── Mocks ────────────────────────────────────────────────────────────────────

jest.mock('next-intl', () => ({
  useTranslations: () => {
    const t = (key: string, params?: Record<string, string>) => {
      if (params) {
        return Object.entries(params).reduce(
          (acc, [k, v]) => acc.replace(`{${k}}`, v),
          key,
        )
      }
      return key
    }
    return t
  },
}))

// Mock framer-motion to render children directly (no animation in tests)
jest.mock('framer-motion', () => ({
  AnimatePresence: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  motion: {
    div: React.forwardRef(
      (
        {
          children,
          initial,
          animate,
          exit,
          transition,
          style,
          ...rest
        }: any,
        ref: any,
      ) => (
        <div ref={ref} data-testid="motion-div" style={style} {...rest}>
          {children}
        </div>
      ),
    ),
  },
}))

const mockDismiss = jest.fn()
const mockDismissAll = jest.fn()
const mockClosePopup = jest.fn()
const mockNavigatePrev = jest.fn()
const mockNavigateNext = jest.fn()

const defaultContext = {
  isPopupOpen: false,
  closePopup: mockClosePopup,
  currentBroadcast: null as BroadcastMessage | null,
  currentIndex: 0,
  totalCount: 0,
  activeBroadcasts: [] as BroadcastMessage[],
  dismiss: mockDismiss,
  dismissAll: mockDismissAll,
  navigatePrev: mockNavigatePrev,
  navigateNext: mockNavigateNext,
}

const mockUseBroadcast = jest.fn(() => defaultContext)

jest.mock('./BroadcastContext', () => ({
  useBroadcast: () => mockUseBroadcast(),
}))

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

const renderBanner = (overrides: Partial<typeof defaultContext> = {}) => {
  mockUseBroadcast.mockReturnValue({ ...defaultContext, ...overrides })
  return render(<BroadcastBanner />)
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('BroadcastBanner', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('when there is no current broadcast', () => {
    it('renders nothing', () => {
      const { container } = renderBanner({ currentBroadcast: null })
      expect(container.innerHTML).toBe('')
    })
  })

  describe('with a single info message', () => {
    beforeEach(() => {
      renderBanner({
        currentBroadcast: makeMessage('msg-1', 'info'),
        totalCount: 1,
        activeBroadcasts: [makeMessage('msg-1', 'info')],
      })
    })

    it('renders the banner', () => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })

    it('shows the title', () => {
      expect(screen.getByText('Title msg-1')).toBeInTheDocument()
    })

    it('shows the message body', () => {
      expect(screen.getByText('Message body for msg-1')).toBeInTheDocument()
    })

    it('does NOT show pagination controls', () => {
      expect(screen.queryByLabelText('previous')).toBeNull()
      expect(screen.queryByLabelText('next')).toBeNull()
    })

    it('shows the dismiss button', () => {
      expect(screen.getByLabelText('dismiss')).toBeInTheDocument()
    })

    it('calls dismiss with the current message id when dismiss is clicked', () => {
      fireEvent.click(screen.getByLabelText('dismiss'))
      expect(mockDismiss).toHaveBeenCalledWith('msg-1')
    })
  })

  describe('with a warning message', () => {
    it('renders correctly', () => {
      renderBanner({
        currentBroadcast: makeMessage('warn-1', 'warning'),
        totalCount: 1,
        activeBroadcasts: [makeMessage('warn-1', 'warning')],
      })
      expect(screen.getByText('Title warn-1')).toBeInTheDocument()
    })
  })

  describe('with a critical message', () => {
    it('renders correctly', () => {
      renderBanner({
        currentBroadcast: makeMessage('crit-1', 'critical'),
        totalCount: 1,
        activeBroadcasts: [makeMessage('crit-1', 'critical')],
      })
      expect(screen.getByText('Title crit-1')).toBeInTheDocument()
    })
  })

  describe('with multiple messages', () => {
    const messages = [
      makeMessage('msg-1', 'info'),
      makeMessage('msg-2', 'warning'),
      makeMessage('msg-3', 'critical'),
    ]

    beforeEach(() => {
      renderBanner({
        currentBroadcast: messages[0],
        currentIndex: 0,
        totalCount: 3,
        activeBroadcasts: messages,
      })
    })

    it('shows pagination controls', () => {
      expect(screen.getByLabelText('previous')).toBeInTheDocument()
      expect(screen.getByLabelText('next')).toBeInTheDocument()
    })

    it('shows the page indicator', () => {
      expect(screen.getByText('pageIndicator')).toBeInTheDocument()
    })

    it('calls navigateNext when next arrow is clicked', () => {
      fireEvent.click(screen.getByLabelText('next'))
      expect(mockNavigateNext).toHaveBeenCalled()
    })

    it('calls navigatePrev when prev arrow is clicked', () => {
      fireEvent.click(screen.getByLabelText('previous'))
      expect(mockNavigatePrev).toHaveBeenCalled()
    })
  })

  describe('message without title', () => {
    it('renders only the message body', () => {
      const noTitleMsg: BroadcastMessage = {
        id: 'no-title',
        title: '',
        message: 'Body only message',
        severity: 'info',
        createdAt: '2026-03-01T00:00:00Z',
        active: true,
      }
      renderBanner({
        currentBroadcast: noTitleMsg,
        totalCount: 1,
        activeBroadcasts: [noTitleMsg],
      })
      expect(screen.getByText('Body only message')).toBeInTheDocument()
    })
  })

  describe('animation wrapper', () => {
    it('renders the motion wrapper with the message key', () => {
      renderBanner({
        currentBroadcast: makeMessage('anim-1'),
        totalCount: 1,
        activeBroadcasts: [makeMessage('anim-1')],
      })
      expect(screen.getByTestId('motion-div')).toBeInTheDocument()
    })
  })
})
