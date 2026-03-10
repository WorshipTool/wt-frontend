import { Box } from '@/common/ui/Box'
import { Clickable } from '@/common/ui/Clickable'
import TranslationsSelectPopup from '@/common/ui/SongCard/components/TranslationsSelectPopup'
import {
	SongVariantCard,
	ToLinkProps,
} from '@/common/ui/SongCard/SongVariantCard'
import { Typography } from '@/common/ui/Typography'
import { BasicVariantPack } from '@/types/song'
import { useState } from 'react'

type SongGroupCardProps = {
	packs: BasicVariantPack[]
	original?: BasicVariantPack
	flexibleHeight?: boolean
	toLinkProps?: ToLinkProps
}

export default function SongGroupCard({
	flexibleHeight = true,
	packs,
	original,
	...props
}: SongGroupCardProps) {
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
								<SongVariantCard data={d} flexibleHeight={flexibleHeight} />
							</Box>
						)
					})}
				</Box>

				<SongVariantCard
					data={first}
					flexibleHeight={flexibleHeight}
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

			<TranslationsSelectPopup
				open={variantsShown}
				onClose={() => setVariantsShown(false)}
				packs={packs}
				toLinkProps={props.toLinkProps}
			/>
		</>
	)
}
