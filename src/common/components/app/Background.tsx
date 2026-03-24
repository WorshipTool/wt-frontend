'use client'
import { Box } from '@/common/ui'
import { styled } from '@/common/ui/mui'

const Bg = styled(Box)(() => ({
	position: 'fixed',
	width: '100%',
	top: 0,
	bottom: 0,
	zIndex: -100,
	background: 'linear-gradient(180deg, #0a0a0f 0%, #0d0d1a 40%, #0a0a14 100%)',
	overflow: 'hidden',
}))

const GridLayer = styled('div')(() => ({
	position: 'absolute',
	inset: 0,
	backgroundImage: `
		linear-gradient(rgba(0, 229, 255, 0.05) 1px, transparent 1px),
		linear-gradient(90deg, rgba(0, 229, 255, 0.05) 1px, transparent 1px)
	`,
	backgroundSize: '60px 60px',
	maskImage: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.6) 30%, rgba(0,0,0,0.3) 70%, transparent 100%)',
	WebkitMaskImage: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.6) 30%, rgba(0,0,0,0.3) 70%, transparent 100%)',
}))

const PerspectiveGrid = styled('div')(() => ({
	position: 'absolute',
	left: '-50%',
	right: '-50%',
	bottom: '-20%',
	height: '60%',
	backgroundImage: `
		linear-gradient(rgba(0, 229, 255, 0.08) 1px, transparent 1px),
		linear-gradient(90deg, rgba(123, 47, 255, 0.06) 1px, transparent 1px)
	`,
	backgroundSize: '80px 80px',
	transform: 'perspective(500px) rotateX(60deg)',
	animation: 'grid-flow 4s linear infinite',
	opacity: 0.6,
}))

const ScanlineOverlay = styled('div')(() => ({
	position: 'absolute',
	inset: 0,
	background: `repeating-linear-gradient(
		0deg,
		transparent,
		transparent 2px,
		rgba(0, 229, 255, 0.015) 2px,
		rgba(0, 229, 255, 0.015) 4px
	)`,
	pointerEvents: 'none',
}))

const VignetteOverlay = styled('div')(() => ({
	position: 'absolute',
	inset: 0,
	background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0, 0, 0, 0.5) 100%)',
	pointerEvents: 'none',
}))

export const Background = () => {
	return (
		<Bg>
			<GridLayer />
			<PerspectiveGrid />
			<ScanlineOverlay />
			<VignetteOverlay />
		</Bg>
	)
}
