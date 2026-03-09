import { alpha } from '@/common/ui/mui'
import { keyframes } from '@emotion/react'

export const BLUE = '#0085FF'
export const BLUE_DARK = '#0060cc'
export const PURPLE = '#9c27b0'
export const PURPLE_DARK = '#7b1fa2'

export type TaskStatus =
	| 'queued'
	| 'starting'
	| 'running'
	| 'retrying'
	| 'completed'
	| 'failed'
	| 'interrupted'

export type PullRequest = {
	repo: string
	url: string
	state?: string
	lastCheckedAt?: string
}

export const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
	queued:      { bg: alpha('#888888', 0.1), color: '#666'    },
	starting:    { bg: alpha(BLUE, 0.12),     color: BLUE      },
	running:     { bg: alpha(BLUE, 0.12),     color: BLUE      },
	retrying:    { bg: '#fff3e0',             color: '#e65100' },
	completed:   { bg: '#e8f5e9',             color: '#2e7d32' },
	failed:      { bg: '#ffebee',             color: '#c62828' },
	interrupted: { bg: alpha('#888888', 0.1), color: '#666'    },
}

const DEFAULT_STATUS_STYLE: { bg: string; color: string } = {
	bg: alpha('#888888', 0.1),
	color: '#666',
}

/** Returns the style for a given status, falling back to a default for unknown statuses. */
export function getStatusStyle(status: string): { bg: string; color: string } {
	return STATUS_STYLE[status] ?? DEFAULT_STATUS_STYLE
}

export function extractPrNumber(prUrl: string): string | null {
	const match = prUrl.match(/\/pull\/(\d+)$/)
	return match ? match[1] : null
}

export const bgMove = keyframes`
  0%   { transform: translate3d(-120px, -80px, 0) scale(1)    rotate(-3deg); }
  50%  { transform: translate3d(120px,   80px, 0) scale(1.12) rotate(4deg);  }
  100% { transform: translate3d(-120px, -80px, 0) scale(1)    rotate(-3deg); }
`
