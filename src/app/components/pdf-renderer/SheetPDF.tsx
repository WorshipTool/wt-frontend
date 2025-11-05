import { Sheet } from '@pepavlin/sheet-api'
import { signature } from '@pepavlin/sheet-api/lib/models/note'
import {
	Section,
	SectionType,
} from '@pepavlin/sheet-api/lib/models/song/section'
import { Segment } from '@pepavlin/sheet-api/lib/models/song/segment'
import {
	Document,
	Font,
	Image,
	Page,
	StyleSheet,
	Text,
	View,
} from '@react-pdf/renderer'

// Register Roboto font
Font.register({
	family: 'Roboto',
	fonts: [
		{
			src: 'https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Me5WZLCzYlKw.ttf',
			fontWeight: 400,
		},
		{
			src: 'https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmWUlvAx05IsDqlA.ttf',
			fontWeight: 700,
		},
	],
})

const options = {
	pagePadding: 40,
	watermarkSize: 32,
	chordHeight: 20,
}

const styles = StyleSheet.create({
	page: {
		padding: options.pagePadding,
		fontSize: 12,
		fontFamily: 'Roboto',
	},
	title: {
		fontSize: 18,
		fontWeight: 'bold',
		marginBottom: 8,
	},
	sectionContainer: {
		flexDirection: 'row',
		marginBottom: 24,
	},
	sectionLabel: {
		width: 24,
	},
	sectionLabelChorus: {
		fontWeight: 'bold',
	},
	sectionContent: {
		flex: 1,
	},
	line: {
		flexDirection: 'row',
		flexWrap: 'wrap',
	},
	segmentContainer: {},
	chord: {
		height: options.chordHeight,
		fontSize: 12,
		fontWeight: 'bold',
		paddingRight: 6,
		paddingTop: 4,
	},
	chordSpacer: {
		height: options.chordHeight,
	},
	text: {
		fontSize: 12,
	},
	watermark: {
		position: 'absolute',
		right: options.pagePadding,
		bottom: options.pagePadding,
		opacity: 0.1,
		width: options.watermarkSize,
		height: options.watermarkSize,
	},
})

type SegmentElementProps = {
	segment: Segment
	signature?: signature
	showChords: boolean
}

const SegmentElement = ({
	segment,
	signature,
	showChords,
}: SegmentElementProps) => {
	const getWords = () => {
		const arr = segment.text?.split(/(\s+)/) || []
		const chord = segment.chord?.toString(signature)
		const chordLen = chord?.length || 0
		return arr.reduce((acc, item) => {
			if (acc.length !== 1) {
				acc.push(item)
			} else {
				const last = acc[0]
				if (last.replace(/\s/, '').length - 1 < chordLen * 1.2) {
					acc[0] += item
				} else {
					acc.push(item)
				}
			}
			return acc
		}, [] as string[])
	}

	const words = getWords()

	return (
		<>
			{words.map((word, index) => (
				<View key={word + index} style={styles.segmentContainer}>
					{showChords &&
						(index === 0 && segment.chord ? (
							<Text style={styles.chord}>
								{segment.chord?.toString(signature)}
							</Text>
						) : (
							<View style={styles.chordSpacer} />
						))}
					<Text style={styles.text}>{word}</Text>
				</View>
			))}
		</>
	)
}

type SectionComponentProps = {
	section: Section
	signature?: signature
	isLast: boolean
	hideChords: boolean
}

const SectionComponent = ({
	section,
	signature,
	isLast,
	hideChords,
}: SectionComponentProps) => {
	const getSectionName = () => {
		if (section.type === SectionType.UNKNOWN) return section.name

		let text = ''
		switch (section.type) {
			case SectionType.VERSE:
				text = 'S'
				break
			case SectionType.CHORUS:
				text = 'R'
				break
			case SectionType.BRIDGE:
				text = 'B'
				break
			case SectionType.INTRO:
				text = 'I'
				break
		}

		const index = section.index > 0 ? section.index : ''
		return index + text
	}

	const getHasChords = () => {
		if (hideChords) return false
		return section.lines?.some((line) =>
			line.segments.some((segment) => segment.chord)
		)
	}

	const sectionName = getSectionName()
	const hasChords = getHasChords()
	const hasFirstLineText =
		section.lines?.[0]?.text && section.lines?.[0]?.text?.length > 0

	return (
		<View style={[styles.sectionContainer, isLast ? { marginBottom: 0 } : {}]}>
			<View
				style={[
					styles.sectionLabel,
					hasChords && hasFirstLineText ? { paddingTop: 20 } : {},
				]}
			>
				{sectionName && (
					<Text
						style={
							section.type === SectionType.CHORUS
								? styles.sectionLabelChorus
								: {}
						}
					>
						{sectionName}
					</Text>
				)}
			</View>
			<View style={styles.sectionContent}>
				{section.lines &&
					section.lines.map((line, lineIndex) => (
						<View key={lineIndex} style={styles.line}>
							{line.segments.map((segment, segmentIndex) => (
								<SegmentElement
									key={segmentIndex}
									segment={segment}
									signature={signature}
									showChords={hasChords}
								/>
							))}
						</View>
					))}
			</View>
		</View>
	)
}

type Props = {
	title: string
	sheet?: Sheet
	signature?: signature
	hideChords?: boolean
}

export function SheetPage({
	title,
	sheet,
	signature,
	hideChords = false,
}: Props) {
	// Mock sheet pro testování
	const testSheet = sheet || new Sheet('AHojda[C], libovka[Em]')

	const getSections = () => {
		const r = testSheet?.getSections() || []
		if (r.length === 0) {
			r.push(new Section(''))
		}
		return r
	}

	const sections = getSections()

	return (
		<Page size="A4" style={styles.page}>
			{/* Watermark */}
			<View fixed style={styles.watermark}>
				<Image src="public/assets/logo_large.png" />
			</View>
			{/* Title */}
			<Text style={styles.title}>{title}</Text>

			{/* Sections */}
			{sections.map((section, index) => (
				<SectionComponent
					key={section.name + index}
					section={section}
					signature={signature}
					isLast={index === sections.length - 1}
					hideChords={hideChords}
				/>
			))}
		</Page>
	)
}

export default function SheetPDF(props: Props) {
	return (
		<Document title={props.title}>
			<SheetPage {...props} />
		</Document>
	)
}
