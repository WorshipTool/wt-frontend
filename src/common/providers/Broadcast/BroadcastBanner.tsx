'use client'

/**
 * Broadcast Banner Component
 *
 * A fixed-position dismissible banner shown at the top of the viewport
 * when there are active broadcast messages for the current user.
 *
 * Features:
 * - Severity-coded colours (info / warning / critical)
 * - Framer Motion slide-in animation
 * - Pagination controls when multiple messages are queued
 * - Single-click dismiss with localStorage persistence
 */

import { Box, IconButton, Typography } from '@/common/ui'
import { SxProps } from '@/common/ui/mui'
import {
  ArrowBackIos,
  ArrowForwardIos,
  Close,
  ErrorOutline,
  InfoOutlined,
  WarningAmber,
} from '@mui/icons-material'
import { AnimatePresence, motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { useBroadcast } from './BroadcastContext'
import { BroadcastSeverity } from './broadcast.types'

// ─── Severity styling map ─────────────────────────────────────────────────────

type SeverityStyle = {
  bgColor: string
  textColor: string
  borderColor: string
  Icon: React.ElementType
}

const SEVERITY_STYLES: Record<BroadcastSeverity, SeverityStyle> = {
  info: {
    bgColor: '#EFF6FF',
    textColor: '#1E40AF',
    borderColor: '#BFDBFE',
    Icon: InfoOutlined,
  },
  warning: {
    bgColor: '#FFFBEB',
    textColor: '#92400E',
    borderColor: '#FDE68A',
    Icon: WarningAmber,
  },
  critical: {
    bgColor: '#FEF2F2',
    textColor: '#991B1B',
    borderColor: '#FECACA',
    Icon: ErrorOutline,
  },
}

// ─── Component ────────────────────────────────────────────────────────────────

export function BroadcastBanner() {
  const {
    currentBroadcast,
    currentIndex,
    totalCount,
    dismiss,
    navigatePrev,
    navigateNext,
  } = useBroadcast()
  const t = useTranslations('broadcast')

  if (!currentBroadcast) return null

  const style = SEVERITY_STYLES[currentBroadcast.severity]
  const { Icon } = style
  const hasPagination = totalCount > 1

  const bannerSx: SxProps = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1400, // above MUI Drawer (1200), below Dialog (1300) — sits in "notification" tier
    backgroundColor: style.bgColor,
    borderBottom: `1px solid ${style.borderColor}`,
    color: style.textColor,
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    px: { xs: 1.5, sm: 2 },
    py: 0.75,
    minHeight: 44,
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentBroadcast.id}
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -60, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1400 }}
      >
        <Box sx={bannerSx} role="alert" aria-live="polite">
          {/* Severity icon */}
          <Icon
            aria-hidden="true"
            sx={{ fontSize: 18, flexShrink: 0, color: style.textColor }}
          />

          {/* Message content */}
          <Box sx={{ flex: 1, minWidth: 0, display: 'flex', gap: 0.75, flexWrap: 'wrap', alignItems: 'baseline' }}>
            {currentBroadcast.title && (
              <Typography
                variant="normal"
                strong
                sx={{ color: 'inherit', lineHeight: 1.4 }}
              >
                {currentBroadcast.title}
              </Typography>
            )}
            <Typography
              variant="normal"
              sx={{ color: 'inherit', lineHeight: 1.4 }}
            >
              {currentBroadcast.message}
            </Typography>
          </Box>

          {/* Pagination (only when multiple messages) */}
          {hasPagination && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                flexShrink: 0,
                ml: 1,
              }}
            >
              <IconButton
                small
                onClick={navigatePrev}
                alt={t('previous')}
                sx={{ color: style.textColor, p: 0.5 }}
              >
                <ArrowBackIos sx={{ fontSize: 12 }} />
              </IconButton>

              <Typography
                variant="normal"
                small
                strong
                sx={{ color: 'inherit', minWidth: 36, textAlign: 'center' }}
              >
                {t('pageIndicator', { current: String(currentIndex + 1), total: String(totalCount) })}
              </Typography>

              <IconButton
                small
                onClick={navigateNext}
                alt={t('next')}
                sx={{ color: style.textColor, p: 0.5 }}
              >
                <ArrowForwardIos sx={{ fontSize: 12 }} />
              </IconButton>
            </Box>
          )}

          {/* Dismiss button */}
          <IconButton
            small
            onClick={() => dismiss(currentBroadcast.id)}
            alt={t('dismiss')}
            sx={{ color: style.textColor, flexShrink: 0, ml: 0.5 }}
          >
            <Close fontSize="small" />
          </IconButton>
        </Box>
      </motion.div>
    </AnimatePresence>
  )
}
