import { Box, Typography } from '@/common/ui'
import { signature } from '@pepavlin/sheet-api/lib/models/note'
import { Section } from '@pepavlin/sheet-api/lib/models/song/section'
import { Segment } from '@pepavlin/sheet-api/lib/models/song/segment'
import { useTranslations } from 'next-intl'
import { useMemo } from 'react'
import { sectionNameToText } from '../../../../tech/sectionNameToText'
import { SheetStyleComponentType } from './config'

const chordHeight = '1.5em'
const sectionsGap = '2em'

const SegmentElement = ({
	segment,
	signature,
	showChords,
}: {
	segment: Segment
	signature?: signature
	showChords: boolean
}) => {
	const words = useMemo(() => {
		return segment.text?.split(/(\s+)/) || []
	}, [segment])

	return (
		<>
			{words.map((word, index) => {
				return (
					<Box key={word}>
						{showChords &&
							(index == 0 ? (
								<>
									<Typography sx={{ height: chordHeight }} strong={900}>
										{segment.chord?.toString(signature)}
									</Typography>
								</>
							) : (
								<>
									<Box sx={{ height: chordHeight }} />
								</>
							))}

						<Typography>{word}</Typography>
					</Box>
				)
			})}
		</>
	)
}

const SectionComponent = ({
	section,
	signature,
}: {
	section: Section
	signature?: signature
}) => {
	const t = useTranslations('common.sections')
	
	const sectionName = useMemo(() => {
		if (!section.name) return undefined
		return sectionNameToText(section.name, t)
	}, [section, t])

	const hasChords = useMemo(() => {
		return true
		return section.lines?.some((line) =>
			line.segments.some((segment) => segment.chord)
		)
	}, [section])
	return (
		<>
			<Box
				sx={{
					paddingTop: hasChords ? chordHeight : 0,
				}}
			>
				{sectionName && (
					<Typography
						italic
						noWrap
						strong={500}
						sx={{
							paddingRight: '2em',
						}}
					>
						{sectionName}
					</Typography>
				)}
			</Box>
			<Box
				sx={{
					breakInside: 'avoid',
				}}
			>
				{section.lines ? (
					<>
						{section.lines.map((line, index) => {
							return (
								<Box
									key={index}
									sx={{
										display: 'flex',
										flexDirection: 'row',
										flexWrap: 'wrap',
									}}
								>
									{line.segments.map((segment, index) => {
										return (
											<SegmentElement
												key={index}
												segment={segment}
												signature={signature}
												showChords={hasChords}
											/>
										)
									})}
								</Box>
							)
						})}
					</>
				) : (
					<></>
				)}
				{!hasChords && (
					<>
						<Box sx={{ height: sectionsGap }} />
					</>
				)}
			</Box>
		</>
	)
}

const ModernStyle: SheetStyleComponentType = ({ sheet, title, signature }) => {
	const sections = useMemo(() => {
		if (sheet === undefined) return []
		return sheet.getSections()
	}, [sheet])

	return (
		<Box sx={{}}>
			<Box
				sx={{
					display: 'flex',
					flexDirection: 'column',
					// alignItems: 'center',
					// justifyContent: 'center',
				}}
			>
				{title && (
					<Box
						sx={{
							marginBottom: 2,
							// display: 'flex',
							// justifyContent: 'center',
						}}
					>
						<Typography variant="h4">
							<b>{title}</b>
						</Typography>
					</Box>
				)}

				<div
					style={{
						display: 'grid',
						gridTemplateColumns: 'min-content 1fr',
						width: 'fit-content',
					}}
				>
					{sections.map((section, index) => {
						return (
							<SectionComponent
								key={index}
								section={section}
								signature={signature}
							/>
						)
					})}
				</div>
			</Box>
		</Box>
	)
}
export default ModernStyle
