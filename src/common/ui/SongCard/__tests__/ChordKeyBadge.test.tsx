import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import React from 'react'
import ChordKeyBadge from '../components/ChordKeyBadge'

/**
 * Tests for ChordKeyBadge component.
 * Verifies that the chord key letter is rendered inside a dark circle
 * with correct accessibility and tooltip behaviour.
 */
describe('ChordKeyBadge', () => {
	it('renders the chord key text', () => {
		render(<ChordKeyBadge chordKey="C" />)
		expect(screen.getByText('C')).toBeInTheDocument()
	})

	it('renders different chord key values correctly', () => {
		const { rerender } = render(<ChordKeyBadge chordKey="Am" />)
		expect(screen.getByText('Am')).toBeInTheDocument()

		rerender(<ChordKeyBadge chordKey="G#" />)
		expect(screen.getByText('G#')).toBeInTheDocument()
	})

	it('has an aria-label containing the chord key', () => {
		render(<ChordKeyBadge chordKey="D" />)
		expect(screen.getByLabelText('chord key D')).toBeInTheDocument()
	})

	it('renders without a Tooltip wrapper when no tooltip prop is given', () => {
		const { container } = render(<ChordKeyBadge chordKey="E" />)
		expect(container.querySelector('[role="tooltip"]')).not.toBeInTheDocument()
	})

	it('renders with a Tooltip when the tooltip prop is provided', () => {
		render(<ChordKeyBadge chordKey="F" tooltip="Has chords" />)
		expect(screen.getByText('F')).toBeInTheDocument()
	})

	it('renders as a span element for inline use', () => {
		render(<ChordKeyBadge chordKey="C" />)
		const badge = screen.getByLabelText('chord key C')
		expect(badge.tagName.toLowerCase()).toBe('span')
	})
})
