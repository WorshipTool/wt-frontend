import { GeneralParserStep } from '@/api/general-parser/generalParser'
import { ImportSourceKind } from './importStorage'

export type StepState = 'done' | 'active' | 'pending'
export type StepView = { step: GeneralParserStep; state: StepState }

/**
 * The steps a source usually goes through, used to show what is still to come.
 * OCR is left out: only some files need it, so it appears when the parser says
 * it has started it rather than being promised up front.
 */
const EXPECTED: Record<ImportSourceKind, GeneralParserStep[]> = {
	link: ['detect', 'fetch', 'extract', 'score'],
	file: ['detect', 'extract', 'score'],
}

/**
 * The step list shown while parsing: every step the parser has reported, in
 * the order it reported them (the last one active, the rest done), followed by
 * the expected steps it has not reached yet. Before the first event the first
 * expected step is the active one, so the list never starts empty.
 */
export function buildStepList(
	seen: GeneralParserStep[],
	kind: ImportSourceKind
): StepView[] {
	const expected = EXPECTED[kind]
	if (seen.length === 0) {
		return expected.map((step, i) => ({
			step,
			state: i === 0 ? 'active' : 'pending',
		}))
	}

	const current = seen[seen.length - 1]
	const reached = seen.map<StepView>((step) => ({
		step,
		state: step === current ? 'active' : 'done',
	}))
	const currentAt = expected.indexOf(current)
	// an unexpected step (ocr) sits between extract and score
	const after =
		currentAt >= 0
			? expected.slice(currentAt + 1)
			: expected.filter((s) => s === 'score')
	const pending = after
		.filter((s) => !seen.includes(s))
		.map<StepView>((step) => ({ step, state: 'pending' }))

	return [...reached, ...pending]
}

/** Adds a reported step, ignoring repeats (a step can report more than once). */
export function addSeenStep(
	seen: GeneralParserStep[],
	step: GeneralParserStep
): GeneralParserStep[] {
	return seen.includes(step) ? seen : [...seen, step]
}
