'use client'

/**
 * Broadcast Popup Component
 *
 * A styled popup (analogous to NewsPopup) that displays operational broadcast
 * messages — outages, maintenance windows, important notices — to all logged-in
 * users.
 *
 * Visual differences from the banner:
 * - Full modal with animated gradient background blobs (severity-themed)
 * - Larger, more prominent presentation with severity badge
 * - Supports multi-message pagination inside the popup
 * - "Dismiss All" shortcut when there are multiple messages
 */

import Popup from '@/common/components/Popup/Popup'
import { Box, Button, IconButton } from '@/common/ui'
import { Gap } from '@/common/ui/Gap'
import { Typography } from '@/common/ui/Typography'
import { alpha } from '@/common/ui/mui'
import { keyframes } from '@emotion/react'
import {
  ArrowBackIos,
  ArrowForwardIos,
  Close,
  ErrorOutline,
  InfoOutlined,
  WarningAmber,
} from '@mui/icons-material'
import { useTranslations } from 'next-intl'
import { useBroadcast } from './BroadcastContext'
import { BroadcastSeverity } from './broadcast.types'

// ─── Background animation (same rhythm as NewsPopup) ─────────────────────────

const bgMove = keyframes`
0% {
  transform: translate3d(-120px, -80px, 0) scale(1) rotate(-3deg);
}
50% {
  transform: translate3d(120px, 80px, 0) scale(1.12) rotate(4deg);
}
100% {
  transform: translate3d(-120px, -80px, 0) scale(1) rotate(-3deg);
}
`

// ─── Severity theme map ───────────────────────────────────────────────────────

type SeverityTheme = {
  /** Blob colours for the animated background */
  blobA: string
  blobB: string
  blobC: string
  /** Badge/icon accent colour */
  accent: string
  /** MUI icon component */
  Icon: React.ElementType
  /** Text colour for badge */
  badgeText: string
}

const SEVERITY_THEMES: Record<BroadcastSeverity, SeverityTheme> = {
  info: {
    blobA: '#3B82F644',
    blobB: '#3B82F633',
    blobC: '#1D4ED822',
    accent: '#3B82F6',
    Icon: InfoOutlined,
    badgeText: '#ffffff',
  },
  warning: {
    blobA: '#F59E0B44',
    blobB: '#F59E0B33',
    blobC: '#B4530022',
    accent: '#F59E0B',
    Icon: WarningAmber,
    badgeText: '#ffffff',
  },
  critical: {
    blobA: '#EF444444',
    blobB: '#EF444433',
    blobC: '#99181822',
    accent: '#EF4444',
    Icon: ErrorOutline,
    badgeText: '#ffffff',
  },
}

// ─── Component ────────────────────────────────────────────────────────────────

export function BroadcastPopup() {
  const {
    isPopupOpen,
    closePopup,
    currentBroadcast,
    currentIndex,
    totalCount,
    dismiss,
    dismissAll,
    navigatePrev,
    navigateNext,
  } = useBroadcast()

  const t = useTranslations('broadcast')

  if (!currentBroadcast) return null

  const theme = SEVERITY_THEMES[currentBroadcast.severity]
  const { Icon } = theme
  const hasPagination = totalCount > 1

  const handleDismissCurrent = () => {
    dismiss(currentBroadcast.id)
    // Popup auto-closes when activeBroadcasts reaches 0 (handled in context)
  }

  const handleDismissAll = () => {
    dismissAll()
    // Popup auto-closes via context effect
  }

  return (
    <Popup
      open={isPopupOpen}
      onClose={closePopup}
      sx={{
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: -140,
          background: `
            radial-gradient(420px 320px at 50% 50%, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0.65) 35%, transparent 70%),
            radial-gradient(520px 420px at 15% 25%, ${theme.blobA} 0%, transparent 65%),
            radial-gradient(480px 380px at 85% 20%, ${theme.blobB} 0%, transparent 65%),
            radial-gradient(520px 420px at 60% 85%, ${theme.blobC} 0%, transparent 70%)
          `,
          zIndex: 0,
          filter: 'blur(22px)',
          opacity: 1,
          pointerEvents: 'none',
          willChange: 'transform',
          transform: 'translate3d(0,0,0)',
          animation: `${bgMove} 8s ease-in-out infinite`,
        },
      }}
      width={480}
    >
      <Box sx={{ zIndex: 1 }}>
        {/* ── Header row: badge + close ── */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.75,
              bgcolor: alpha(theme.accent, 0.7),
              color: theme.badgeText,
              width: 'fit-content',
              padding: '2px 12px 2px 8px',
              borderRadius: 2,
            }}
          >
            <Icon sx={{ fontSize: 16 }} />
            <Typography variant="subtitle1" strong={500}>
              {t('popupLabel')}
            </Typography>
          </Box>

          <IconButton small onClick={closePopup}>
            <Close fontSize="inherit" />
          </IconButton>
        </Box>

        <Gap value={2} />

        {/* ── Title + message ── */}
        <Box
          display="flex"
          flexDirection="column"
          gap={1.5}
          maxHeight="55vh"
          sx={{ overflowY: 'auto' }}
        >
          <Typography
            variant="h4"
            strong
            sx={{ letterSpacing: '0.02em' }}
          >
            {currentBroadcast.title}
          </Typography>
          <Typography variant="subtitle1" strong={300} sx={{ whiteSpace: 'pre-line' }}>
            {currentBroadcast.message}
          </Typography>
        </Box>

        <Gap value={2} />

        {/* ── Pagination (only when multiple messages) ── */}
        {hasPagination && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 0.5,
              mb: 1.5,
            }}
          >
            <IconButton
              small
              onClick={navigatePrev}
              alt={t('previous')}
            >
              <ArrowBackIos sx={{ fontSize: 12 }} />
            </IconButton>

            <Typography
              variant="normal"
              small
              strong
              sx={{ minWidth: 40, textAlign: 'center', color: 'text.secondary' }}
            >
              {t('pageIndicator', {
                current: String(currentIndex + 1),
                total: String(totalCount),
              })}
            </Typography>

            <IconButton
              small
              onClick={navigateNext}
              alt={t('next')}
            >
              <ArrowForwardIos sx={{ fontSize: 12 }} />
            </IconButton>
          </Box>
        )}

        {/* ── Action buttons ── */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            gap: 1.5,
            flexDirection: 'row',
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          {hasPagination && (
            <Button
              outlined
              small
              onClick={handleDismissAll}
              sx={{
                borderRadius: 3,
              }}
            >
              {t('dismissAll')}
            </Button>
          )}

          <Button
            color="primarygradient"
            onClick={handleDismissCurrent}
            sx={{
              opacity: 0.9,
              borderRadius: 3,
              paddingX: 5,
            }}
          >
            {t('dismiss')}
          </Button>
        </Box>

        <Gap value={1} />
      </Box>
    </Popup>
  )
}
