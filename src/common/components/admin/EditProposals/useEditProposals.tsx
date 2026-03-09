'use client'
import { useApi } from '@/api/tech-and-hooks/useApi'
import useAuth from '@/hooks/auth/useAuth'
import { useSnackbar } from 'notistack'
import {
	createContext,
	useCallback,
	useContext,
	useMemo,
	useRef,
	useState,
} from 'react'
import { EditProposal, ElementCapture } from './types'

const IMPLEMENT_IDEA_URL = process.env.NEXT_PUBLIC_IMPLEMENT_IDEA_URL

// ─── Context value shape ─────────────────────────────────────────────────────

export type EditProposalsContextValue = {
	/** Accumulated proposals not yet submitted */
	proposals: EditProposal[]
	/** True once the first proposal has been added (collection mode is active) */
	isCollecting: boolean
	/** A capture awaiting the admin's proposal text in the dialog */
	pendingCapture: ElementCapture | null
	/** Open the proposal dialog for a captured element / text selection */
	openProposalFor: (capture: ElementCapture) => void
	/** Confirm the dialog — appends a new proposal to the list */
	confirmProposal: (proposalText: string) => void
	/** Cancel the currently open proposal dialog without adding anything */
	cancelPendingProposal: () => void
	/** Remove a single proposal by id */
	removeProposal: (id: string) => void
	/** Discard all proposals and leave collection mode */
	clearProposals: () => void
	/**
	 * Send all accumulated proposals as a single implementation task.
	 * Uses NEXT_PUBLIC_IMPLEMENT_IDEA_URL when available, falls back to mail API.
	 */
	submitAll: () => Promise<void>
	isSubmitting: boolean
}

// ─── Context ─────────────────────────────────────────────────────────────────

const EditProposalsContext = createContext<EditProposalsContextValue>({
	proposals: [],
	isCollecting: false,
	pendingCapture: null,
	openProposalFor: () => {},
	confirmProposal: () => {},
	cancelPendingProposal: () => {},
	removeProposal: () => {},
	clearProposals: () => {},
	submitAll: async () => {},
	isSubmitting: false,
})

// ─── Provider ────────────────────────────────────────────────────────────────

export function EditProposalsProvider({
	children,
}: {
	children: React.ReactNode
}) {
	const [proposals, setProposals] = useState<EditProposal[]>([])
	const [pendingCapture, setPendingCapture] = useState<ElementCapture | null>(
		null
	)
	const [isSubmitting, setIsSubmitting] = useState(false)
	const { enqueueSnackbar } = useSnackbar()
	const { info } = useAuth()
	const { mailApi } = useApi()
	const idCounter = useRef(0)

	const openProposalFor = useCallback((capture: ElementCapture) => {
		setPendingCapture(capture)
	}, [])

	const confirmProposal = useCallback(
		(proposalText: string) => {
			if (!pendingCapture) return
			const newProposal: EditProposal = {
				id: `proposal-${Date.now()}-${++idCounter.current}`,
				capture: pendingCapture,
				proposalText,
				timestamp: Date.now(),
			}
			setProposals((prev) => [...prev, newProposal])
			setPendingCapture(null)
		},
		[pendingCapture]
	)

	const cancelPendingProposal = useCallback(() => {
		setPendingCapture(null)
	}, [])

	const removeProposal = useCallback((id: string) => {
		setProposals((prev) => prev.filter((p) => p.id !== id))
	}, [])

	const clearProposals = useCallback(() => {
		setProposals([])
	}, [])

	const submitAll = useCallback(async () => {
		if (proposals.length === 0) return
		setIsSubmitting(true)
		try {
			const formattedMessage = formatProposalsAsMessage(proposals)

			if (IMPLEMENT_IDEA_URL) {
				// Primary: send as an implementation task (same endpoint as ImplementIdeaDialog)
				const res = await fetch(IMPLEMENT_IDEA_URL, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ message: formattedMessage }),
				})
				if (!res.ok) throw new Error(`HTTP ${res.status}`)
			} else {
				// Fallback: send as a feedback email
				const adminName = info
					? `${info.firstName} ${info.lastName}`.trim()
					: 'Admin'
				const adminEmail = info?.email ?? 'admin@unknown'
				await mailApi.sendFeedbackMail({
					name: adminName,
					email: adminEmail,
					message: formattedMessage,
				})
			}

			enqueueSnackbar('Návrhy úprav byly odeslány k implementaci', {
				variant: 'success',
			})
			setProposals([])
		} catch {
			enqueueSnackbar('Nepodařilo se odeslat návrhy', { variant: 'error' })
		} finally {
			setIsSubmitting(false)
		}
	}, [proposals, info, mailApi, enqueueSnackbar])

	const value = useMemo<EditProposalsContextValue>(
		() => ({
			proposals,
			isCollecting: proposals.length > 0 || pendingCapture !== null,
			pendingCapture,
			openProposalFor,
			confirmProposal,
			cancelPendingProposal,
			removeProposal,
			clearProposals,
			submitAll,
			isSubmitting,
		}),
		[
			proposals,
			pendingCapture,
			openProposalFor,
			confirmProposal,
			cancelPendingProposal,
			removeProposal,
			clearProposals,
			submitAll,
			isSubmitting,
		]
	)

	return (
		<EditProposalsContext.Provider value={value}>
			{children}
		</EditProposalsContext.Provider>
	)
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useEditProposals() {
	return useContext(EditProposalsContext)
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function formatProposalsAsMessage(proposals: EditProposal[]): string {
	const lines: string[] = [
		'=== ADMIN NÁVRHY ÚPRAV ===',
		`Celkem návrhů: ${proposals.length}`,
		'',
	]

	proposals.forEach((p, index) => {
		const date = new Date(p.timestamp).toLocaleString('cs-CZ')
		lines.push(`--- Návrh ${index + 1} ---`)
		lines.push(`Datum: ${date}`)
		lines.push(`Stránka: ${p.capture.pageUrl}`)
		lines.push(
			`Element: <${p.capture.elementTag}> (${p.capture.elementPath})`
		)
		if (p.capture.type === 'text-selection' && p.capture.selectedText) {
			lines.push(`Označený text: "${p.capture.selectedText}"`)
		} else if (p.capture.elementText) {
			lines.push(`Text elementu: "${p.capture.elementText}"`)
		}
		if (p.capture.cssSelector) {
			lines.push(`CSS selektor: ${p.capture.cssSelector}`)
		}
		lines.push('')
		lines.push(`NÁVRH ZMĚNY:`)
		lines.push(p.proposalText)
		lines.push('')
	})

	return lines.join('\n')
}
