'use client'
import { BasicVariantPack } from '@/api/dtos'
import PopupContainer from '@/common/components/Popup/PopupContainer'
import PopupSongList from '@/common/components/SongSelectPopup/components/PopupSongList'
import SelectedPanel from '@/common/components/SongSelectPopup/components/SelectedPanel'
import SelectFromOptions from '@/common/components/SongSelectPopup/components/SelectFromOptions'
import { SelectSearch } from '@/common/components/SongSelectPopup/components/SelectSearch'
import { useSongSelectSpecifier } from '@/common/components/SongSelectPopup/hooks/useSongSelectSpecifier'
import { Box } from '@/common/ui'
import { Button } from '@/common/ui/Button'
import { Typography } from '@/common/ui/Typography'
import { useChangeDelayer } from '@/hooks/changedelay/useChangeDelayer'
import { useApiStateEffect } from '@/tech/ApiState'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { VariantPackGuid } from '../../../interfaces/variant/songVariant.types'
import './styles.css'

type PopupProps = {
	onClose?: () => void
	open: boolean
	onSubmit?: (packs: BasicVariantPack[]) => void

	upDirection?: boolean

	anchorRef: React.RefObject<HTMLElement>
	anchorName?: string

	// Filter function, for example to filter out previously selected songs
	filterFunc?: (pack: BasicVariantPack) => boolean

	disableMultiselect?: boolean
	submitLabel?: string
}

export type ChosenSong = {
	guid: VariantPackGuid
	data: BasicVariantPack
}

export default function SongSelectPopup({ ...props }: PopupProps) {
	const selectSpecifier = useSongSelectSpecifier()

	const [chosen, setChosen] = useState<ChosenSong[]>([])

	const [optionSelected, setOptionSelected] = useState(0)
	const options = useMemo(() => {
		return [
			...selectSpecifier.custom.map((c) => {
				return {
					label: c.label,
				}
			}),
		]
	}, [selectSpecifier])

	const [searchStringRaw, setSearchStringRaw] = useState('')
	const [searchString, setSearchString] = useState('')

	useChangeDelayer(
		searchStringRaw.length === 0 ? '' : searchStringRaw,
		setSearchString,
		[]
	)

	useEffect(() => {
		selectSpecifier.custom.forEach((c) => {
			c.onSearch?.(searchString)
		})
	}, [searchString])

	const [customApiState, reinvalidate] = useApiStateEffect<
		BasicVariantPack[]
	>(async () => {
		const variants = (
			await Promise.all(
				selectSpecifier.custom
					.filter((i) => {
						return i.label === options[optionSelected].label
					})
					.map((c) => {
						if (c.apiState || !c.getData) return []
						return c.getData(searchString)
					})
			)
		)
			.flat()
			// make it unique
			.filter((v, i, a) => a.findIndex((t) => t.packGuid === v.packGuid) === i)

		const filteredVariants = variants.filter((v) => {
			return props.filterFunc?.(v) ?? true
		})

		return filteredVariants
	}, [searchString, props.filterFunc, selectSpecifier, optionSelected, options])

	const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		props.onSubmit?.(chosen.map((c) => c.data))
		onClose()
		e.preventDefault()
		// reinvalidate()
	}

	// Positioning
	const popupRef = useRef(null)
	const [position, setPosition] = useState<{
		top?: number
		bottom?: number
		left?: number
		right?: number
	}>({ top: 0, left: 0 })

	const MAX_WIDTH = 600
	const OFFSET = 8

	const updatePopupPosition = useCallback(() => {
		if (props.anchorRef?.current) {
			const rect = props.anchorRef.current.getBoundingClientRect()
			const toRightMode = rect.left < window.innerWidth / 2
			const t = props.upDirection ? undefined : rect.top + OFFSET
			const b = props.upDirection
				? window.innerHeight - rect.bottom + OFFSET
				: undefined

			if (toRightMode) {
				const l = rect.left + OFFSET
				setPosition({
					top: t,
					bottom: b,
					left: Math.min(l, window.innerWidth - MAX_WIDTH - OFFSET),
				})
			} else {
				const r = window.innerWidth - rect.right + OFFSET

				setPosition({
					top: t,
					bottom: b,
					right: Math.max(r, OFFSET),
				})
			}
		}
	}, [props.anchorRef, props.anchorName, props.upDirection])

	useEffect(() => {
		updatePopupPosition() // Initial position

		window.addEventListener('scroll', updatePopupPosition)
		window.addEventListener('resize', updatePopupPosition)

		return () => {
			window.removeEventListener('scroll', updatePopupPosition)
			window.removeEventListener('resize', updatePopupPosition)
		}
	}, [updatePopupPosition])

	useEffect(() => {
		updatePopupPosition()
	}, [props.open, updatePopupPosition])

	const onClose = () => {
		props.onClose?.()
		setChosen([])
		setSearchStringRaw('')
	}

	const onSongSelect = (pack: BasicVariantPack) => {
		const g = pack.packGuid
		const t = pack.title
		if (chosen.find((c) => c.guid === g)) return
		if (!props.disableMultiselect) {
			setChosen([...chosen, { guid: g, data: pack }])
		} else {
			setChosen([{ guid: g, data: pack }])
		}
	}

	const onSongDeselect = (pack: BasicVariantPack) => {
		setChosen(chosen.filter((c) => c.guid !== pack.packGuid))
	}

	const multiselect = useMemo(
		() => !props.disableMultiselect,
		[props.disableMultiselect]
	)

	return !props.open ? null : (
		<PopupContainer>
			<div
				style={{
					position: 'absolute',
					left: 0,
					top: 0,
					bottom: 0,
					right: 0,
					pointerEvents: 'auto',
					zIndex: 1,
				}}
				onClick={onClose}
			>
				<form
					onSubmit={onSubmit}
					onReset={onClose}
					onDragEnter={(e) => e.stopPropagation()}
					onDragOver={(e) => e.stopPropagation()}
					onDragLeave={(e) => e.stopPropagation()}
				>
					<Box
						ref={popupRef}
						// className={'song-select-popup '}
						sx={{
							bgcolor: 'grey.200',
							maxWidth: `min(${MAX_WIDTH}px, calc(100% - ${OFFSET * 2}px))`,
							width: MAX_WIDTH,
							borderRadius: 3,
							boxShadow: '0px 0px 15px rgba(0,0,0,0.25)',
							position: 'fixed',
							left: position.left,
							right: position.right,
							top: position.top,
							bottom: position.bottom,
							transition: 'all 0.2s',
						}}
						onClick={(e) => e.stopPropagation()}
					>
						<Box padding={4} display={'flex'} flexDirection={'column'} gap={3}>
							<Box display={'flex'} flexDirection={'column'} gap={1}>
								<Box
									display={'flex'}
									flexDirection={'row'}
									justifyContent={'space-between'}
									gap={2}
								>
									<Typography variant="h4" strong>
										Vyberte píseň
									</Typography>
									<SelectSearch
										value={searchStringRaw}
										onChange={setSearchStringRaw}
									/>
								</Box>

								<SelectFromOptions
									options={[
										...selectSpecifier.custom.map((c) => {
											return {
												label: c.label,
												count: !c.showCount
													? undefined
													: searchString.length === 0
													? undefined
													: c.apiState?.data?.length || 0,
												optionsComponent: c.optionsComponent,
											}
										}),
									]}
									initialSelected={optionSelected}
									onSelect={(item, i) => setOptionSelected(i)}
								/>
							</Box>

							<Box>
								{options[optionSelected] && (
									<>
										{selectSpecifier.custom.map((c, i) => {
											if (options[optionSelected].label === c.label) {
												return (
													<PopupSongList
														key={c.label}
														onSongSelect={onSongSelect}
														onSongDeselect={onSongDeselect}
														selectedSongs={chosen.map((v) => v.guid)}
														apiState={c.apiState || customApiState}
														multiselect={multiselect}
														items={
															(c.apiState || customApiState)?.data
																?.filter((a) => {
																	return props.filterFunc?.(a) ?? true
																})
																.filter((a, i, arr) => {
																	// Make unique
																	return (
																		arr.findIndex(
																			(t) => t.packGuid === a.packGuid
																		) === i
																	)
																}) || []
														}
													/>
												)
											}

											return null
										})}
									</>
								)}
							</Box>

							<Box display={'flex'} flexDirection={'column'} gap={3}>
								<SelectedPanel
									selected={chosen}
									onDeselect={(g) => {
										setChosen(chosen.filter((c) => c.guid !== g))
									}}
									multiselect={multiselect}
								/>

								<Box display={'flex'} justifyContent={'end'} gap={2}>
									<Button color="grey.700" type="reset" variant="text">
										Zrušit
									</Button>
									<Button
										color={'primarygradient'}
										type="submit"
										disabled={chosen.length === 0}
									>
										{props.submitLabel ||
											(multiselect ? 'Přidat vybrané' : 'Přidat píseň')}
									</Button>
								</Box>
							</Box>
						</Box>
					</Box>
				</form>
			</div>
		</PopupContainer>
	)
}
