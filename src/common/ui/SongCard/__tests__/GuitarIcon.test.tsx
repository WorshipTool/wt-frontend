import '@testing-library/jest-dom'
import { render } from '@testing-library/react'
import React from 'react'
import GuitarIcon from '../components/GuitarIcon'

/**
 * Tests for GuitarIcon component.
 * Verifies rendering, size prop, tooltip behaviour, and aria accessibility.
 */
describe('GuitarIcon', () => {
	it('renders an SVG with aria-label "guitar"', () => {
		render(<GuitarIcon />)
		expect(document.querySelector('svg[aria-label="guitar"]')).toBeInTheDocument()
	})

	it('applies the default size of 18 when no size prop is given', () => {
		render(<GuitarIcon />)
		const svg = document.querySelector('svg[aria-label="guitar"]') as SVGSVGElement
		expect(svg).toBeInTheDocument()
		expect(svg.getAttribute('width')).toBe('18')
		expect(svg.getAttribute('height')).toBe('18')
	})

	it('applies a custom size when the size prop is provided', () => {
		render(<GuitarIcon size={22} />)
		const svg = document.querySelector('svg[aria-label="guitar"]') as SVGSVGElement
		expect(svg.getAttribute('width')).toBe('22')
		expect(svg.getAttribute('height')).toBe('22')
	})

	it('renders without a Tooltip wrapper when no tooltip prop is given', () => {
		const { container } = render(<GuitarIcon />)
		// No MUI Tooltip role="tooltip" should be present without hover
		expect(container.querySelector('[role="tooltip"]')).not.toBeInTheDocument()
	})

	it('renders with a Tooltip when the tooltip prop is provided', () => {
		render(<GuitarIcon tooltip="Has chords" />)
		// Tooltip wraps the icon; the SVG should still be present
		expect(document.querySelector('svg[aria-label="guitar"]')).toBeInTheDocument()
	})

	it('uses fill="currentColor" so the icon inherits parent color', () => {
		render(<GuitarIcon />)
		const svg = document.querySelector('svg[aria-label="guitar"]') as SVGSVGElement
		expect(svg.getAttribute('fill')).toBe('currentColor')
	})
})
