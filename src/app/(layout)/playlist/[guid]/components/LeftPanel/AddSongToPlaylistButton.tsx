import useInnerPlaylist from '@/app/(layout)/playlist/[guid]/hooks/useInnerPlaylist'
import SongSelectPopup from '@/common/components/SongSelectPopup/SongSelectPopup'
import { Box, Tooltip } from '@/common/ui'
import { Fab } from '@/common/ui/mui'
import { BasicVariantPack } from '@/types/song'
import { Add } from '@mui/icons-material'
import { useTranslations } from 'next-intl'
import { useCallback, useEffect, useRef, useState } from 'react'

export const OPEN_PLAYLIST_ADD_SONG_POPUP_EVENT_NAME =
	'openPlaylistAddSongPopup'

export default function AddSongToPlaylistButton() {
	const t = useTranslations('playlist')
	const { addItems, items, canUserEdit, ...playlist } = useInnerPlaylist()

	const anchorRef = useRef<HTMLButtonElement>(null)

	const [open, setOpen] = useState(false)
	const onClick = useCallback((e: React.MouseEvent) => {
		setOpen(true)
	}, [])

	useEffect(() => {
		const open = () => {
			setOpen(true)
		}
		document.addEventListener(OPEN_PLAYLIST_ADD_SONG_POPUP_EVENT_NAME, open)

		return () => {
			document.removeEventListener(
				OPEN_PLAYLIST_ADD_SONG_POPUP_EVENT_NAME,
				open
			)
		}
	}, [])

	const onClose = useCallback(() => {
		setOpen(false)
	}, [])

	// one call rather than one per song: looping only ever worked here because
	// this picker is single-select, and the loop kept the trap warm for whoever
	// turned that off next
	const onSubmit = async (packs: BasicVariantPack[]) => {
		await addItems(packs)
	}

	const filterFunc = (pack: BasicVariantPack) => {
		return !items.some((i) => i.pack.packGuid === pack.packGuid)
	}

	// Auto open
	const [thereHasBeenItems, setThereHasBeenItems] = useState(false)
	useEffect(() => {
		if (playlist.loading) return

		// after one second, the popup will open
		const t = setTimeout(() => {
			if (items.length === 0 && thereHasBeenItems === false) {
				setOpen(true)
			} else if (thereHasBeenItems === false) {
				setThereHasBeenItems(true)
			}
		}, 1000)

		return () => {
			clearTimeout(t)
		}
	}, [items, thereHasBeenItems])

	return !canUserEdit ? null : (
		<>
			<Box sx={{}}>
				<Tooltip label={t('addSongToPlaylist')}>
					<Fab onClick={onClick} ref={anchorRef} size="medium" color="primary">
						<Add />
					</Fab>
				</Tooltip>
				{/* <Button
					endIcon={<Add />}
					onClick={onClick}
					ref={anchorRef}
					variant="text"
					color="black"
				>
					Přidat píseň
				</Button> */}
			</Box>
			<SongSelectPopup
				onClose={onClose}
				open={open}
				anchorRef={anchorRef}
				anchorName={'AddToPlaylistBUtton'}
				upDirection
				onSubmit={onSubmit}
				filterFunc={filterFunc}
				disableMultiselect
			/>
		</>
	)
}
