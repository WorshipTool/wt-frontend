import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import React from 'react'

/* eslint-disable react/display-name, @next/next/no-img-element */
jest.mock('framer-motion', () => ({
	motion: {
		div: ({
			children,
			animate,
			transition,
			...props
		}: {
			children?: React.ReactNode
			animate?: unknown
			transition?: unknown
			[key: string]: unknown
		}) => <div data-testid="animated-sheep" {...props}>{children}</div>,
	},
}))

jest.mock('../../../../../common/providers/FeatureFlags/useFlag', () => ({
	useFlag: () => false,
}))

jest.mock('../../../../../common/ui', () => ({
	Box: ({
		children,
		...props
	}: {
		children?: React.ReactNode
		[key: string]: unknown
	}) => <div {...props}>{children}</div>,
	Image: ({ alt, src, width, height }: { alt: string; src?: string; width?: number; height?: number }) => (
		<img alt={alt} src={src} width={width} height={height} />
	),
	Typography: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
}))

jest.mock('../../../../../tech/paths.tech', () => ({
	getAssetUrl: (name: string) => `/assets${name}`,
}))

jest.mock('next-intl', () => ({
	useTranslations: () => (key: string) => key,
}))

jest.mock('../../AllListPanel/AllListPanel', () => ({
	__esModule: true,
	default: () => <div data-testid="all-list-panel" />,
}))

jest.mock('../../LastAddedPanel/LastAddedPanel', () => ({
	__esModule: true,
	default: () => <div data-testid="last-added-panel" />,
}))
/* eslint-enable react/display-name, @next/next/no-img-element */

import RightSheepPanel from '../RightSheepPanel'

describe('RightSheepPanel', () => {
	it('renders without crashing', () => {
		render(<RightSheepPanel mobileVersion={false} />)
	})

	it('renders the sheep image with correct alt text', () => {
		render(<RightSheepPanel mobileVersion={false} />)
		const sheepImg = screen.getByAltText('sheep')
		expect(sheepImg).toBeInTheDocument()
	})

	it('renders the sheep image with correct src', () => {
		render(<RightSheepPanel mobileVersion={false} />)
		const sheepImg = screen.getByAltText('sheep')
		expect(sheepImg).toHaveAttribute('src', '/assets/sheeps/ovce3.svg')
	})

	it('wraps the sheep image in a Framer Motion animated div', () => {
		render(<RightSheepPanel mobileVersion={false} />)
		const animatedDiv = screen.getByTestId('animated-sheep')
		expect(animatedDiv).toBeInTheDocument()
	})

	it('renders the sheep image with 140px size', () => {
		render(<RightSheepPanel mobileVersion={false} />)
		const sheepImg = screen.getByAltText('sheep')
		expect(sheepImg).toHaveAttribute('width', '140')
		expect(sheepImg).toHaveAttribute('height', '140')
	})

	it('renders AllListPanel', () => {
		render(<RightSheepPanel mobileVersion={false} />)
		expect(screen.getByTestId('all-list-panel')).toBeInTheDocument()
	})

	it('renders fallback content when showLastAdded is false', () => {
		render(<RightSheepPanel mobileVersion={false} />)
		expect(screen.getByText('noIdea')).toBeInTheDocument()
		expect(screen.getByText('chooseSuggestion')).toBeInTheDocument()
	})

	it('renders correctly in mobile version', () => {
		render(<RightSheepPanel mobileVersion={true} />)
		const sheepImg = screen.getByAltText('sheep')
		expect(sheepImg).toBeInTheDocument()
	})
})
