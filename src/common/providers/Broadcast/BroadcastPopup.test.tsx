/**
 * BroadcastPopup tests
 *
 * Covers rendering, pagination, dismiss, and dismissAll behaviours.
 */

import '@testing-library/jest-dom'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import { BroadcastPopup } from './BroadcastPopup'
import { BroadcastMessage } from './broadcast.types'

// ─── Mocks ────────────────────────────────────────────────────────────────────

// Minimal next-intl stub
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

// Popup renders children directly in tests (no portal)
jest.mock('../../components/Popup/Popup', () => ({
  __esModule: true,
  default: ({
    open,
    children,
    onClose,
  }: {
    open: boolean
    children: React.ReactNode
    onClose: () => void
  }) => {
    if (!open) return null
    return <div data-testid="popup">{children}</div>
  },
}))

const mockDismiss = jest.fn()
const mockDismissAll = jest.fn()
const mockClosePopup = jest.fn()
const mockNavigatePrev = jest.fn()
const mockNavigateNext = jest.fn()

const defaultContext = {
  isPopupOpen: true,
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

// We mock the whole BroadcastContext module to control useBroadcast
const mockUseBroadcast = jest.fn(() => defaultContext)

jest.mock('./BroadcastContext', () => ({
  useBroadcast: () => mockUseBroadcast(),
}))

// ─── Helpers ─────────────────────────────────────────────────────────────────

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

const renderPopup = (overrides: Partial<typeof defaultContext> = {}) => {
  mockUseBroadcast.mockReturnValue({ ...defaultContext, ...overrides })
  return render(<BroadcastPopup />)
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('BroadcastPopup', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('when there is no current broadcast', () => {
    it('renders nothing', () => {
      renderPopup({ currentBroadcast: null })
      expect(screen.queryByTestId('popup')).toBeNull()
    })
  })

  describe('when popup is closed', () => {
    it('renders nothing even if there is a message', () => {
      renderPopup({
        isPopupOpen: false,
        currentBroadcast: makeMessage('msg-1'),
        totalCount: 1,
        activeBroadcasts: [makeMessage('msg-1')],
      })
      expect(screen.queryByTestId('popup')).toBeNull()
    })
  })

  describe('with a single info message', () => {
    beforeEach(() => {
      renderPopup({
        currentBroadcast: makeMessage('msg-1', 'info'),
        totalCount: 1,
        activeBroadcasts: [makeMessage('msg-1', 'info')],
      })
    })

    it('renders the popup', () => {
      expect(screen.getByTestId('popup')).toBeInTheDocument()
    })

    it('shows the title', () => {
      expect(screen.getByText('Title msg-1')).toBeInTheDocument()
    })

    it('shows the message body', () => {
      expect(screen.getByText('Message body for msg-1')).toBeInTheDocument()
    })

    it('shows the severity badge label', () => {
      expect(screen.getByText('popupLabel')).toBeInTheDocument()
    })

    it('does NOT show pagination controls', () => {
      expect(screen.queryByText('previous')).toBeNull()
      expect(screen.queryByText('next')).toBeNull()
    })

    it('does NOT show "dismissAll" button', () => {
      expect(screen.queryByText('dismissAll')).toBeNull()
    })

    it('calls dismiss with the current message id when dismiss button is clicked', () => {
      fireEvent.click(screen.getByText('dismiss'))
      expect(mockDismiss).toHaveBeenCalledWith('msg-1')
    })
  })

  describe('close (X) button', () => {
    it('calls closePopup when X is clicked', () => {
      renderPopup({
        currentBroadcast: makeMessage('msg-1'),
        totalCount: 1,
        activeBroadcasts: [makeMessage('msg-1')],
      })
      // Close button has no text – find by aria pattern (it renders a Close icon inside an IconButton)
      // The IconButton wraps the icon so we look for the button with role="button" containing no text
      const buttons = screen.getAllByRole('button')
      // First button after the badge is the close (X) button
      const closeBtn = buttons[0]
      fireEvent.click(closeBtn)
      expect(mockClosePopup).toHaveBeenCalled()
    })
  })

  describe('with multiple messages', () => {
    const messages = [
      makeMessage('msg-1', 'info'),
      makeMessage('msg-2', 'warning'),
      makeMessage('msg-3', 'critical'),
    ]

    beforeEach(() => {
      renderPopup({
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
      // pageIndicator key with params current=1 total=3
      expect(screen.getByText('pageIndicator')).toBeInTheDocument()
    })

    it('shows the "dismissAll" button', () => {
      expect(screen.getByText('dismissAll')).toBeInTheDocument()
    })

    it('calls navigateNext when next arrow is clicked', () => {
      fireEvent.click(screen.getByLabelText('next'))
      expect(mockNavigateNext).toHaveBeenCalled()
    })

    it('calls navigatePrev when prev arrow is clicked', () => {
      fireEvent.click(screen.getByLabelText('previous'))
      expect(mockNavigatePrev).toHaveBeenCalled()
    })

    it('calls dismissAll when dismissAll button is clicked', () => {
      fireEvent.click(screen.getByText('dismissAll'))
      expect(mockDismissAll).toHaveBeenCalled()
    })

    it('calls dismiss with current message id when dismiss button is clicked', () => {
      fireEvent.click(screen.getByText('dismiss'))
      expect(mockDismiss).toHaveBeenCalledWith('msg-1')
    })
  })

  describe('severity-specific rendering', () => {
    it('renders warning severity message', () => {
      renderPopup({
        currentBroadcast: makeMessage('warn-1', 'warning'),
        totalCount: 1,
        activeBroadcasts: [makeMessage('warn-1', 'warning')],
      })
      expect(screen.getByText('Title warn-1')).toBeInTheDocument()
    })

    it('renders critical severity message', () => {
      renderPopup({
        currentBroadcast: makeMessage('crit-1', 'critical'),
        totalCount: 1,
        activeBroadcasts: [makeMessage('crit-1', 'critical')],
      })
      expect(screen.getByText('Title crit-1')).toBeInTheDocument()
    })
  })
})
