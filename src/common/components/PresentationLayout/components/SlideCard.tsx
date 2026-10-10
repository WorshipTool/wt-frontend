'use client'
import { Box, CircularProgress, Gap, Typography } from '@/common/ui'
import { useChangeDelayer } from '@/hooks/changedelay/useChangeDelayer'
import { splitSection } from '@/common/components/PresentationLayout/sectionSplit'
import { sectionNameToText } from '@/tech/sectionNameToText'
import { BasicVariantPack } from '@/types/song'
import { Sheet } from '@pepavlin/sheet-api'
import { Section } from '@pepavlin/sheet-api/lib/models/song/section'
import { useTranslations } from 'next-intl'
import {
	useCallback,
	useEffect,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from 'react'

const sectionPart = (
	section: Section,
	fontSize: number,
	t: (key: string) => string
) => {
	const lines = section.lines

	return (
		<Box>
			{section.name && (
				<>
					<Typography
						strong
						size={fontSize + 2}
						color={'inherit'}
						sx={{
							color: 'red',
						}}
					>
						{sectionNameToText(section.name, t).toUpperCase()}
					</Typography>
				</>
			)}
			{lines &&
				lines.map((line, index) => {
					return (
						<Box display={'flex'} flexDirection={'row'} key={'bbox' + index}>
							{line.segments.map((segment, index) => {
								return (
									<Box
										display={'flex'}
										flexDirection={'column'}
										key={'cbox' + index}
									>
										<Box sx={{ flex: 1 }}>
											{segment.chord && (
												<Typography
													sx={{
														paddingRight: 1,
														fontSize: fontSize,
														color: '#FCF300',
													}}
													className="chord"
												>
													<b>{segment.chord.toString()}</b>
												</Typography>
											)}
										</Box>

										<Typography
											sx={{
												flex: 1,
												fontSize: fontSize,
											}}
										>
											{segment.text}
										</Typography>
									</Box>
								)
							})}
						</Box>
					)
				})}
		</Box>
	)
}

interface SlideCardProps {
	item: BasicVariantPack
	order?: number
}

const DEFAULT_FONT_SIZE = 20
export default function SlideCard({ item, order }: SlideCardProps) {
	const t = useTranslations('common')
	// Sheet
	const [sheet, setSheet] = useState<Sheet>()

	// Current font-size and padding
	const [size, setSize] = useState(DEFAULT_FONT_SIZE)
	const [padding, setPadding] = useState(20)

	// Is size stable? ...state
	const [isSizeSet, setIsSizeSet] = useState(false)

	// Managing changing songs
	const [showLoading, setShowLoading] = useState(true)
	useEffect(() => {
		setShowLoading(true)
	}, [item])

	const onItemChange = useCallback((item: BasicVariantPack) => {
		if (!item) return

		const newSheet = new Sheet(item.sheetData)

		setSheet(newSheet)

		setIsSizeSet(false)
		setSize(DEFAULT_FONT_SIZE)
		setLastWasOkey(true)

		setTimeout(() => {
			setShowLoading(false)
		}, 500)
	}, [])

	useChangeDelayer(item, onItemChange, [onItemChange], 1000)

	const displaySections = useMemo<Section[]>(() => {
		if (!sheet) return []
		return sheet.getSections().flatMap(splitSection)
	}, [sheet])

	// Managing window size
	const [windowWidth, setWindowWidth] = useState<number>(
		typeof window === 'undefined' ? 0 : window?.innerWidth
	)
	const [windowHeight, setWindowHeight] = useState<number>(
		typeof window === 'undefined' ? 0 : window?.innerHeight
	)
	useEffect(() => {
		setIsSizeSet(false)
	}, [windowWidth, windowHeight])

	useLayoutEffect(() => {
		function updateSize() {
			const w = window.innerWidth
			const h = window.innerHeight
			setWindowWidth(w)
			setWindowHeight(h)

			const calculatedPadding = Math.min(w, h) * 0.05
			setPadding(calculatedPadding)
		}
		window.addEventListener('resize', updateSize)
		updateSize()
		return () => window.removeEventListener('resize', updateSize)
	}, [])

	// The slide's text box. Fit is measured against it rather than against the
	// window: its height is 100dvh, and on iPad Safari 100vh (what both used to
	// be built from) is taller than the visible screen, so the last line of a
	// song sat under the bottom edge.
	const containerRef = useRef<HTMLDivElement>(null)

	// Make loop for changing size
	const [lastWasOkey, setLastWasOkey] = useState(true)
	const sizeIsOkey = useCallback((): boolean => {
		const container = containerRef.current
		if (!container || container.children.length === 0) return false
		const box = container.getBoundingClientRect()
		const minX = box.left + padding
		const maxX = box.right - padding
		const minY = box.top + padding
		const maxY = box.bottom - padding

		// Every block, not just the last section: with the sections wrapping
		// into columns, the last one can fit while a tall one before it runs
		// off the bottom.
		const TOLERANCE = 0.5
		return Array.from(container.children).every((child) => {
			const r = child.getBoundingClientRect()
			return (
				r.left >= minX - TOLERANCE &&
				r.right <= maxX + TOLERANCE &&
				r.top >= minY - TOLERANCE &&
				r.bottom <= maxY + TOLERANCE
			)
		})
	}, [padding])
	const step = useCallback(() => {
		if (isSizeSet) {
			if (!sizeIsOkey()) setSize((s) => s - 0.5)
			return
		}

		if (sizeIsOkey()) {
			setSize((s) => s + 0.5)

			if (!lastWasOkey) setIsSizeSet(true)

			setLastWasOkey(true)
		} else {
			setSize((s) => s - 0.5)
			setLastWasOkey(false)
		}
	}, [sizeIsOkey, lastWasOkey, isSizeSet])

	useEffect(() => {
		const interval = setInterval(step, 10)
		return () => clearInterval(interval)
	}, [step])

	return (
		<Box
			display={'flex'}
			flexDirection={'column'}
			flex={1}
			sx={{
				bgcolor: '#000',
				color: 'white',
				userSelect: 'none',
			}}
		>
			<Box
				display={'flex'}
				flexDirection={'column'}
				ref={containerRef}
				height={'100dvh'}
				width={'100%'}
				flexWrap={'wrap'}
				alignContent={'center'}
				alignItems={'stretch'}
				justifyContent={'center'}
				sx={{
					boxSizing: 'border-box',
					paddingTop: padding + 'px',
					paddingBottom: padding + 'px',
				}}
			>
				<Typography
					strong
					size={size + 5}
					sx={{
						marginRight: 2,
					}}
				>
					{order ? order + 1 + '. ' : ''}
					{item?.title.toUpperCase()}
				</Typography>
				{displaySections.map((section, index) => {
					return (
						<Box
							key={index}
							sx={{
								borderRadius: 2,
								paddingTop: 4,
								marginRight: 3,
							}}
						>
							{sectionPart(section, size, (key: string) =>
								t(`sections.${key}` as any)
							)}
						</Box>
					)
				})}
			</Box>
			<Box
				bgcolor={'black'}
				position={'absolute'}
				left={0}
				top={0}
				right={0}
				bottom={0}
				sx={{
					color: '#fff',
				}}
				display={showLoading ? 'flex' : 'none'}
				justifyContent={'center'}
				alignItems={'center'}
			>
				<CircularProgress color="inherit" />
				<Gap horizontal value={2} />
				<Typography variant="h6">{item?.title}</Typography>
			</Box>
		</Box>
	)
}
