import { addSeenStep, buildStepList } from './steps'

const show = (list: ReturnType<typeof buildStepList>) =>
	list.map((s) => `${s.step}:${s.state}`)

describe('buildStepList', () => {
	it('starts with the first expected step active', () => {
		expect(show(buildStepList([], 'link'))).toEqual([
			'detect:active',
			'fetch:pending',
			'extract:pending',
			'score:pending',
		])
	})

	it('marks reported steps done and the last one active', () => {
		expect(show(buildStepList(['detect', 'fetch'], 'link'))).toEqual([
			'detect:done',
			'fetch:active',
			'extract:pending',
			'score:pending',
		])
	})

	it('slots an unexpected OCR step in before scoring', () => {
		expect(show(buildStepList(['detect', 'extract', 'ocr'], 'file'))).toEqual([
			'detect:done',
			'extract:done',
			'ocr:active',
			'score:pending',
		])
	})

	it('drops expected steps the parser skipped', () => {
		expect(show(buildStepList(['detect', 'extract'], 'link'))).toEqual([
			'detect:done',
			'extract:active',
			'score:pending',
		])
	})
})

describe('buildStepList with a failure', () => {
	it('fails the step where it stopped and promises nothing after it', () => {
		expect(show(buildStepList(['detect', 'fetch'], 'link', true))).toEqual([
			'detect:done',
			'fetch:failed',
		])
	})

	it('fails the first step when nothing was reported', () => {
		expect(show(buildStepList([], 'file', true))).toEqual(['detect:failed'])
	})
})

describe('addSeenStep', () => {
	it('ignores a repeated step', () => {
		expect(addSeenStep(['detect', 'fetch'], 'fetch')).toEqual([
			'detect',
			'fetch',
		])
		expect(addSeenStep(['detect'], 'fetch')).toEqual(['detect', 'fetch'])
	})
})
