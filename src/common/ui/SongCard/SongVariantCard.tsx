'use client'

import { Box } from '@/common/ui/Box'
import { IconButton } from '@/common/ui/IconButton'
import { SxProps } from '@/common/ui/mui'
import SongCardAdditional from '@/common/ui/SongCard/components/SongCardAdditional'
import VariantCardColorPoint from '@/common/ui/SongCard/components/VariantCardColorPoint'
import useTranslationLike from '@/common/ui/SongCard/hooks/useTranslationLike'
import { useTranslationLikesCount } from '@/common/ui/SongCard/hooks/useTranslationLikesCount'
import { Typography } from '@/common/ui/Typography'
import DraggableSong from '@/hooks/dragsong/DraggableSong'
import { useApiState } from '@/tech/ApiState'
import { splitByMatch } from '@/tech/string/highlight.string.tech'
import { parseVariantAlias } from '@/tech/song/variant/variant.utils'
import { Lock, Public, ThumbUpAlt, ThumbUpOffAlt } from '@mui/icons-material'
import { alpha, styled, useTheme } from '@mui/material'
import { Sheet } from '@pepavlin/sheet-api'
import { useTranslations } from 'next-intl'
import { memo, ReactNode, useEffect, useMemo, useState } from 'react'
import { BasicVariantPack } from '../../../api/dtos'
import useAuth from '../../../hooks/auth/useAuth'
import { CustomChip } from '../CustomChip/CustomChip'
import { CommonLinkProps, Link } from '../Link/Link'

const StyledContainer = styled(Box)(({ theme }) => ({
	backgroundColor: theme.palette.grey[100],

	borderRadius: '0.5rem',
	'&:hover': {
		backgroundColor: theme.palette.grey[200],
		boxShadow: `0px 0px 10px ${theme.palette.grey[400]}`,
		'& .songcardgradient': {
			background: `linear-gradient(0deg, ${theme.palette.grey[200]} 50%, transparent)`,
		},
	},
	cursor: 'pointer',
	outlineWidth: 1.4,
	outlineStyle: 'solid',
	position: 'relative',
}))

const SONG_CARD_PROPERTIES = [
	'SHOW_PRIVATE_LABEL',
	'SHOW_YOUR_PUBLIC_LABEL',
	'SHOW_ADDED_BY_LOADER',
	'ENABLE_TRANSLATION_LIKE',
	'SHOW_PUBLISHED_DATE',
] as const
type SongCardProperty = (typeof SONG_CARD_PROPERTIES)[number]

export type ToLinkProps = (data: BasicVariantPack) => {
	to: CommonLinkProps['to']
	params: CommonLinkProps['params']
} | null

type SongCardIconData = (
	data: BasicVariantPack,
	isOver: boolean
) => {
	icon: JSX.Element
}[]

type SongCardProps = {
	data: BasicVariantPack
	flexibleHeight?: boolean
	/** Compact list-row look: single preview line, tighter padding (mobile lists) */
	dense?: boolean
	/** Override how many lyric preview lines to show (defaults: dense=1, else 4) */
	previewLines?: number
	properties?: SongCardProperty[]
	toLinkProps?: ToLinkProps
	selected?: boolean
	selectable?: boolean
	onClick?: () => void
	onSelect?: (selected: boolean) => void
	onDeselect?: (selected: boolean) => void
	icons?: SongCardIconData
	/** Optional decorative icon rendered in a leading slot (mobile list rows) */
	leadingIcon?: ReactNode
	/** Optional icon rendered in a trailing slot, e.g. a disclosure chevron */
	trailingIcon?: ReactNode
	/** Marks this text inside the title — what a search matched. */
	highlight?: string
	sx?: SxProps
}
export const SongVariantCard = memo(function S({
	data,
	flexibleHeight: flexibleHeght = true,
	dense = false,
	...props
}: SongCardProps) {
	const t = useTranslations('common')
	const { user, isAdmin } = useAuth()
	const theme = useTheme()

	const [isOver, setIsOver] = useState(false)

	const [selected, setSelected] = useState<boolean>(props.selected || false)
	useEffect(() => {
		setSelected(props.selected || false)
	}, [props.selected])

	const createdByYou = user && data.createdByGuid === user.guid

	// Generate object from array properties
	const properties: Record<SongCardProperty, boolean> = useMemo(() => {
		const result: Record<SongCardProperty, boolean> = {} as any
		SONG_CARD_PROPERTIES.forEach((property) => {
			result[property] = props.properties?.includes(property) ?? false
		})
		return result
	}, [])

	const createdByLoaderEnabled = properties.SHOW_ADDED_BY_LOADER
	const privateLabelEnabled = properties.SHOW_PRIVATE_LABEL
	const yourPublicLabelEnabled = properties.SHOW_YOUR_PUBLIC_LABEL
	const publishedDateEnabled = properties.SHOW_PUBLISHED_DATE

	// What display
	const showPrivate = !data.public && createdByYou && privateLabelEnabled
	const showYourPublic = data.public && createdByYou && yourPublicLabelEnabled

	// Title and sheet data to display
	const title = data.title
	const sheet = new Sheet(data.sheetData)
	const previewLineCount = props.previewLines ?? (dense ? 1 : 4)
	const dataLines = sheet
		.getSections()[0]
		?.text?.split('\n')
		.slice(0, previewLineCount)

	const linkProps = useMemo(() => {
		if (props.toLinkProps) {
			return props.toLinkProps(data)
		}
		return null
	}, [data])

	const onClick = () => {
		props.onClick?.()

		if (props.selectable) {
			const newValue = !selected
			setSelected(newValue)

			if (newValue) {
				props.onSelect?.(newValue)
			} else {
				props.onDeselect?.(newValue)
			}
		}
	}

	const draggable = useMemo(() => {
		return !props.selectable
	}, [props.selectable])

	const translationLikeEnabled = properties.ENABLE_TRANSLATION_LIKE
	const translationLike = useTranslationLike(data.packGuid)
	const { fetchApiState, apiState } = useApiState()

	const translationLikes = useTranslationLikesCount(
		data.packGuid,
		data.translationLikes
	)

	const additionalIcons = useMemo(() => {
		if (!translationLikeEnabled) return props.icons

		return (data: BasicVariantPack, isOver: boolean) => {
			const base = props.icons?.(data, isOver) || []
			const isLiked = translationLike.isLiked
			return [
				...base,
				{
					icon: (
						<Box
							display={'flex'}
							flexDirection={'row'}
							alignItems={'center'}
							gap={0.5}
						>
							{user && (
								<IconButton
									tooltip={t('preferThisTranslation')}
									small
									sx={{
										opacity: isLiked || isOver ? 1 : 0,
										transition: 'opacity 0.2s',
									}}
									disabled={apiState.loading}
									onClick={(e) => {
										e.stopPropagation()
										e.preventDefault()

										fetchApiState(async () => {
											isLiked
												? translationLike.removeLike()
												: translationLike.addLike()
										})
									}}
								>
									{isLiked ? (
										<ThumbUpAlt fontSize="small" />
									) : (
										<ThumbUpOffAlt fontSize="small" />
									)}
								</IconButton>
							)}
							{translationLikes > 0 && (
								<Typography
									size={'small'}
									sx={{
										display: 'flex',
										justifyContent: 'center',
									}}
								>
									+ {translationLikes}
								</Typography>
							)}
						</Box>
					),
				},
			]
		}
	}, [
		translationLike,
		isOver,
		props.icons,
		translationLikeEnabled,
		user,
		translationLikes,
	])

	return (
		<DraggableSong
			data={{
				packGuid: data.packGuid,
				alias: data.packAlias,
				title: title,
			}}
			draggable={draggable}
		>
			<Link
				to={linkProps?.to || 'variant'}
				params={
					linkProps?.params || {
						...parseVariantAlias(data.packAlias),
					}
				}
				disabled={(props.toLinkProps && !linkProps) || props.selectable}
			>
				<StyledContainer
					sx={{
						outlineColor: showPrivate ? theme.palette.grey[300] : 'transparent',

						height: flexibleHeght || dense ? 'auto' : '11rem',
						overflowY: 'hidden',

						...(selected && {
							outlineColor: 'primary.main',
							outlineWidth: 2,
							outlineStyle: 'solid',
						}),
						userSelect: 'none',
						...(props.sx || {}),
					}}
					onClick={onClick}
					onMouseEnter={() => setIsOver(true)}
					onMouseLeave={() => setIsOver(false)}
				>
					{props.leadingIcon || props.trailingIcon ? (
						<Box
							sx={{
								display: 'flex',
								flexDirection: 'row',
								alignItems: 'center',
								gap: 1.5,
								paddingLeft: props.leadingIcon ? '1rem' : 0,
								paddingRight: props.trailingIcon ? '1rem' : 0,
							}}
						>
							{props.leadingIcon && (
								<Box sx={{ flexShrink: 0, display: 'flex' }}>
									{props.leadingIcon}
								</Box>
							)}
							<Box sx={{ flex: 1, minWidth: 0 }}>
								{renderContent({
									noLeftPad: !!props.leadingIcon,
									noRightPad: !!props.trailingIcon,
								})}
							</Box>
							{props.trailingIcon && (
								<Box sx={{ flexShrink: 0, display: 'flex' }}>
									{props.trailingIcon}
								</Box>
							)}
						</Box>
					) : (
						renderContent()
					)}
				</StyledContainer>
			</Link>
		</DraggableSong>
	)

	function renderContent(opts?: { noLeftPad?: boolean; noRightPad?: boolean }) {
		const py = dense ? '0.6rem' : '1rem'
		const px = '1rem'
		const padding = `${py} ${opts?.noRightPad ? '0' : px} ${py} ${
			opts?.noLeftPad ? '0' : px
		}`
		return (
					<Box
						sx={{
							position: 'relative',
							padding,
							...(selected && {
								borderColor: 'primary.main',
								borderWidth: 2,
								bgcolor: alpha(theme.palette.primary.main, 0.1),

								'&:hover': {
									bgcolor: alpha(theme.palette.primary.main, 0.2),
								},
							}),
							height: dense ? 'auto' : 'calc(100% - 2rem)',
							display: 'flex',
							flexDirection: 'column',
							overflow: 'hidden',
						}}
					>
						<Box display={'flex'} flexDirection={'row'} gap={1}>
							<Typography
								strong
								noWrap={dense}
								sx={{
									flex: 1,
									...(!data.ggValidated &&
										isAdmin() && {
											color: 'error.main',
										}),
								}}
							>
								<VariantCardColorPoint
									language={data.language}
									translationType={data.translationType}
								/>
								{props.highlight
									? splitByMatch(title, props.highlight).map((part, i) =>
											part.match ? (
												<Box
													key={i}
													component="mark"
													sx={{
														bgcolor: (theme) =>
															alpha(theme.palette.primary.main, 0.18),
														color: 'inherit',
														borderRadius: 0.5,
														paddingX: 0.25,
													}}
												>
													{part.text}
												</Box>
											) : (
												<span key={i}>{part.text}</span>
											)
									  )
									: title}
							</Typography>
							<Box>
								{showPrivate || showYourPublic ? (
									<CustomChip
										icon={showPrivate ? <Lock /> : <Public />}
										label={showPrivate ? t('private') : t('createdByYou')}
										color={
											showPrivate
												? theme.palette.grey[600]
												: theme.palette.primary.main
										}
										borderColor={
											showPrivate
												? theme.palette.grey[400]
												: theme.palette.primary.main
										}
									/>
								) : null}
								{createdByLoaderEnabled && data.createdByLoader ? (
									<Typography size={'small'}>{t('uploadedByProgram')}</Typography>
								) : null}

								{publishedDateEnabled && data.publishedAt ? (
									<Typography size={'small'}>
										{t('addedOn')} {data.publishedAt.toLocaleDateString('cs-CZ')}
									</Typography>
								) : null}
							</Box>
						</Box>

						<Box
							sx={{
								maxWidth: 'calc(100vw - 3rem)',
								display: 'flex',
								flexDirection: 'row',
								justifyContent: 'space-between',
								flex: 1,
							}}
						>
							<Box
								sx={{
									overflow: 'hidden',
								}}
							>
								{dataLines.map((line, index) => {
									return (
										<Box
											display={'flex'}
											flexDirection={'row'}
											key={line + index}
										>
											<Typography
												key={'SearchItemText' + index}
												small={dense}
												noWrap={dense}
												sx={{
													flex: 1,
												}}
											>
												{line}
											</Typography>
										</Box>
									)
								})}
							</Box>
							<SongCardAdditional
								isOver={isOver}
								data={data}
								icons={additionalIcons}
							/>
						</Box>
					</Box>
		)
	}
})
