import { Box } from '@/common/ui/Box'
import { Clickable } from '@/common/ui/Clickable'
import { GroupCard, SongRow } from '@/common/ui/GroupList/GroupList'
import { SxProps } from '@/common/ui/mui'
import TranslationsSelectPopup from '@/common/ui/SongCard/components/TranslationsSelectPopup'
import {
	SongVariantCard,
	ToLinkProps,
} from '@/common/ui/SongCard/SongVariantCard'
import { Typography } from '@/common/ui/Typography'
import { BasicVariantPack } from '@/types/song'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

/** How many cards show under the top one in the row variant, however many
 * translations there are — the card variant stacks the same handful. */
const MAX_EDGES = 3
/** The sliver of each card left showing, and how far it is tucked in at each
 * side, so the pile narrows as it goes down. */
const EDGE_HEIGHT = 6
const EDGE_INSET = 8
/** …and how much deeper each card is than the one above it. A card behind is a
 * card in shadow, which the card variant draws by taking the brightness down a
 * step instead. */
const EDGE_SHADES = ['grey.100', 'grey.200', 'grey.300'] as const

type SongGroupCardProps = {
	packs: BasicVariantPack[]
	original?: BasicVariantPack
	flexibleHeight?: boolean
	dense?: boolean
	toLinkProps?: ToLinkProps
	/** What a search matched, lit up in the title of the card on top. */
	highlight?: string
	/**
	 * How the pile is drawn. `card` is the desktop's: the top translation face up
	 * with the others stacked behind it. `row` is the phone's: the same pile with
	 * a list row for a face and the others' edges showing underneath, because a
	 * phone list has no room for a stack.
	 */
	variant?: 'card' | 'row'
	/** Row variant: lyric preview lines, and the leading music icon. */
	previewLines?: number
	withIcon?: boolean
	/** Row variant: the card's own styling — corners, where a list carries on. */
	sx?: SxProps
}

export default function SongGroupCard({
	flexibleHeight = true,
	dense = false,
	packs,
	original,
	variant = 'card',
	previewLines,
	withIcon = true,
	sx,
	...props
}: SongGroupCardProps) {
	const t = useTranslations('song.translations')
	const MAX_PACKS = 4
	const first = packs[0]
	const restSliced = packs.slice(1, MAX_PACKS)

	const [hovered, setHovered] = useState(false)
	const [variantsShown, setVariantsShown] = useState(false)

	const MAX_STACK_OFFSET = hovered ? 40 : 24

	const getYOffset = (index: number, totalCount: number) => {
		return (Math.log(index + 1) / Math.log(totalCount + 1)) * MAX_STACK_OFFSET
	}

	const calculatedHeight = getYOffset(restSliced.length, restSliced.length + 1)

	const BORDER_COLOR = 'grey.300'
	const BORDER_WIDTH = '1px'

	// one chooser, whichever way the pile is drawn
	const chooser = (
		<TranslationsSelectPopup
			open={variantsShown}
			onClose={() => setVariantsShown(false)}
			packs={packs}
			toLinkProps={props.toLinkProps}
		/>
	)

	if (variant === 'row') {
		const edges = Math.min(packs.length - 1, MAX_EDGES)
		return (
			<>
				<Box>
					<GroupCard sx={sx}>
						<SongRow
							song={first}
							previewLines={previewLines}
							withIcon={withIcon}
							highlight={props.highlight}
						/>
					</GroupCard>

					{edges > 0 && (
						<Box
							role="button"
							aria-label={t('selectOther')}
							onClick={() => setVariantsShown(true)}
							// the whole pile is the way to the chooser, the way the card
							// variant's own stack is; the air under it is the list's gap
							sx={{ cursor: 'pointer' }}
						>
							{Array.from({ length: edges }).map((_, i) => (
								<Box
									key={i}
									sx={{
										height: EDGE_HEIGHT,
										// each card a little further under the one above it, and a
										// shade deeper, which is the whole of how a pile reads
										marginX: `${(i + 1) * EDGE_INSET}px`,
										bgcolor: EDGE_SHADES[i],
										borderBottomLeftRadius: 12,
										borderBottomRightRadius: 12,
										...(i === edges - 1 && {
											boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
										}),
									}}
								/>
							))}
						</Box>
					)}
				</Box>
				{chooser}
			</>
		)
	}

	return (
		<>
			<Box
				sx={{
					display: 'flex',
					flexDirection: 'column-reverse',
					position: 'relative',
					zIndex: hovered ? 1 : undefined,
				}}
			>
				<Box
					sx={{
						position: 'relative',
						height: calculatedHeight,
						overflow: 'hidden',
						transition: 'height 0.2s',
					}}
				>
					{restSliced.slice(0, 4).map((d, _i) => {
						const totalCount = restSliced.length
						const index = _i + 1

						const offsetY = getYOffset(index, totalCount)
						const offsetX = index * 4
						const brightness = 1 - index * 0.1
						const rotate = hovered
							? (index == totalCount ? 0 : index % 2 === 0 ? 1 : -1) * 0.5
							: 0
						return (
							<Box
								key={d.packGuid}
								sx={{
									position: 'absolute',
									left: offsetX,
									right: offsetX,
									bottom: MAX_STACK_OFFSET - offsetY,
									filter: `brightness(${brightness}) `,
									transform: `rotate(${rotate}deg)`,
									zIndex: -_i,
									transition: 'bottom 0.2s, transform 0.2s',
								}}
							>
								<SongVariantCard
									data={d}
									flexibleHeight={flexibleHeight}
									dense={dense}
								/>
							</Box>
						)
					})}
				</Box>

				<SongVariantCard
					data={first}
					flexibleHeight={flexibleHeight}
					dense={dense}
					highlight={props.highlight}
					sx={{
						...(original
							? {
									borderTopLeftRadius: 0,
									borderTopRightRadius: 0,
									borderWidth: `0 ${BORDER_WIDTH} ${BORDER_WIDTH} ${BORDER_WIDTH}`,
							  }
							: {
									borderWidth: BORDER_WIDTH,
							  }),
						borderStyle: 'solid',
						borderColor: BORDER_COLOR,
					}}
					properties={['SHOW_PRIVATE_LABEL']}
					toLinkProps={props.toLinkProps}
				/>

				{original && (
					<Box
						sx={{
							bgcolor: 'grey.200',
							borderTopLeftRadius: 8,
							borderTopRightRadius: 8,
							borderWidth: `${BORDER_WIDTH} ${BORDER_WIDTH} 0px ${BORDER_WIDTH}`,
							borderStyle: 'solid',
							borderColor: BORDER_COLOR,

							paddingX: 2,
							paddingY: 0.5,

							display: 'flex',
							flexDirection: 'row',
							gap: 1,
						}}
					>
						<Typography small color="grey.500">
							Originál
						</Typography>
						<Typography small>{original.title}</Typography>
					</Box>
				)}

				{restSliced.length > 0 && (
					<div
						onClick={() => setVariantsShown(true)}
						onMouseEnter={() => setHovered(true)}
						onMouseLeave={() => setHovered(false)}
					>
						<Box
							sx={{
								position: 'absolute',
								bottom: 0,
								left: 0,
								right: 0,
								height: calculatedHeight + 16,
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								opacity: 0,
								transition: 'opacity 0.2s, height 0.2s',
								':hover': {
									opacity: 1,
								},
								cursor: 'pointer',
							}}
						>
							<Clickable>
								<Box
									sx={{
										bgcolor: 'grey.200',
										// bgcolor: 'secondary.main',
										borderRadius: 10,
										paddingX: 1,
										// paddingY: 0.5,
										border: '1px solid',
										borderColor: 'grey.300',
										transform: 'translateY(6px)',
									}}
								>
									<Typography small thin>
										Vyber jiný z {packs.length} překladů
									</Typography>
								</Box>
							</Clickable>
						</Box>
					</div>
				)}
			</Box>

			{chooser}
		</>
	)
}
