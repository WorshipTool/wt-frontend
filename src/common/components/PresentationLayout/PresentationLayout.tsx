'use client'
import GoBackButton from '@/common/components/PresentationLayout/components/GoBackButton'
import SlideCard from '@/common/components/PresentationLayout/components/SlideCard'
import { Box, IconButton } from '@/common/ui'
import { BasicVariantPack } from '@/types/song'
import {
	ChevronLeft,
	ChevronRight,
	Fullscreen,
	FullscreenExit,
} from '@mui/icons-material'
import { useEffect, useState } from 'react'
import { SwipeEventListener } from 'swipe-event-listener'

export type PresentationLayoutProps = {
	items: BasicVariantPack[]
	onBackClick?: () => void
}

export default function PresentationLayout({
	items,
	...props
}: PresentationLayoutProps) {
	const [currentIndex, setCurrentIndex] = useState(0)

	const [fullscreen, setFullscreen] = useState(false)

	const COLOR = 'white'

	const right = () => {
		moveCurrent(-1)
	}
	const left = () => {
		moveCurrent(1)
	}
	const up = () => {
		turnOnFullscreen()
	}
	const down = () => {
		turnOffFullscreen()
	}

	useEffect(() => {
		if (items.length === 0) return

		const swipeArea = document.querySelector('body') as HTMLElement

		// swipe-event-listener attaches its own raw touch/mouse listeners to
		// swipeArea and exposes no way to tear them down. Since swipeArea is
		// <body>, which Next.js keeps mounted across client-side navigation,
		// those listeners would otherwise leak onto every other page for the
		// rest of the session. Intercept addEventListener while the library
		// wires itself up so every listener it (and we) register here can be
		// removed again on cleanup.
		const registered: {
			type: string
			listener: EventListenerOrEventListenerObject
		}[] = []
		const originalAddEventListener = swipeArea.addEventListener.bind(swipeArea)
		swipeArea.addEventListener = ((
			type: string,
			listener: EventListenerOrEventListenerObject,
			options?: boolean | AddEventListenerOptions,
		) => {
			registered.push({ type, listener })
			originalAddEventListener(type, listener, options)
		}) as typeof swipeArea.addEventListener

		SwipeEventListener({ swipeArea })

		swipeArea.addEventListener('swipeRight', right)
		swipeArea.addEventListener('swipeLeft', left)
		swipeArea.addEventListener('swipeUp', up)
		swipeArea.addEventListener('swipeDown', down)

		swipeArea.addEventListener = originalAddEventListener

		return () => {
			registered.forEach(({ type, listener }) =>
				swipeArea.removeEventListener(type, listener),
			)
		}
	}, [items])

	const moveCurrent = (offset: number) => {
		setCurrentIndex((v) => {
			const target = v + offset
			if (target < 0) return 0
			if (target >= items.length) return items.length - 1
			return target
		})
	}

	const onKeyDown = (e: any) => {
		e.preventDefault()

		console.log(e.code)

		if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
			right()
		} else if (
			e.code === 'ArrowRight' ||
			e.code === 'Space' ||
			e.code === 'KeyD'
		) {
			left()
		} else if (e.code === 'ArrowUp') {
			up()
		} else if (e.code === 'ArrowDown') {
			down()
		}
	}

	const turnOnFullscreen = () => {
		if (!document.body.requestFullscreen || document.fullscreenElement) {
			return
		}
		document.body.requestFullscreen().catch(() => {
			// Fullscreen can be rejected by the browser (unsupported, no user
			// activation, permissions policy, ...) - ignore, state stays in sync
			// via the fullscreenchange listener below.
		})
	}

	const turnOffFullscreen = () => {
		if (!document.exitFullscreen || !document.fullscreenElement) {
			return
		}
		document.exitFullscreen().catch(() => {
			// See turnOnFullscreen - ignore rejections, fullscreenchange syncs state.
		})
	}

	useEffect(() => {
		document.addEventListener('keydown', onKeyDown)
		return () => {
			document.removeEventListener('keydown', onKeyDown)
		}
	}, [items])

	useEffect(() => {
		const onFullscreenChange = () => {
			setFullscreen(!!document.fullscreenElement)
		}
		document.addEventListener('fullscreenchange', onFullscreenChange)
		return () => {
			document.removeEventListener('fullscreenchange', onFullscreenChange)
		}
	}, [])

	return (
		<Box overflow={'hidden'}>
			<SlideCard item={items[currentIndex]} order={currentIndex} />
			<Box
				position={'absolute'}
				right={0}
				top={0}
				display={'flex'}
				gap={1.5}
				alignItems={'end'}
			>
				{/* {playlist?.teamAlias && (
					<PeoplePanel onCardChange={onCardChange} cardIndex={currentIndex} />
				)} */}
				<Box bgcolor={'grey'} display={'flex'}>
					<IconButton
						color="inherit"
						sx={{ color: COLOR }}
						onClick={() => moveCurrent(-1)}
						disabled={currentIndex == 0}
					>
						<ChevronLeft />
					</IconButton>
					<IconButton
						color="inherit"
						sx={{ color: COLOR }}
						onClick={() => moveCurrent(1)}
						disabled={currentIndex == items.length - 1}
					>
						<ChevronRight />
					</IconButton>
					{!fullscreen ? (
						<IconButton
							onClick={() => {
								turnOnFullscreen()
							}}
						>
							<Fullscreen color="inherit" sx={{ color: COLOR }} />
						</IconButton>
					) : (
						<IconButton
							onClick={() => {
								turnOffFullscreen()
							}}
						>
							<FullscreenExit color="inherit" sx={{ color: COLOR }} />
						</IconButton>
					)}
				</Box>
			</Box>
			<Box
				sx={{
					position: 'absolute',
					top: 0,
					left: 0,
				}}
			>
				<GoBackButton onClick={props.onBackClick} />
			</Box>
		</Box>
	)
}
