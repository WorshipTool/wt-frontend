import { Box } from '@/common/ui'
import React, { ReactNode, memo, useEffect, useMemo, useState } from 'react'

import TopPlaylistItemPanel from '@/app/(layout)/playlist/[guid]/components/MiddlePanel/TopPlaylistItemPanel'
import useInnerPlaylist from '@/app/(layout)/playlist/[guid]/hooks/useInnerPlaylist'
import SheetDisplay from '@/common/components/SheetDisplay/SheetDisplay'
import DefaultStyle from '@/common/components/SheetDisplay/styles/DefaultStyle'
import { Paper } from '@/common/ui/mui'
import { SURFACE_CARD_SX } from '@/common/constants/surfaces'
import { PlaylistItemGuid } from '@/interfaces/playlist/playlist.types'
import { Sheet } from '@pepavlin/sheet-api'

const PageBreak = () => {
	return (
		<Box
			sx={{
				pageBreakAfter: 'always',
			}}
		></Box>
	)
}

interface PlaylistItemProps {
	itemGuid: PlaylistItemGuid
	openButton?: ReactNode
}

export const PlaylistItem = memo(function A({
	itemGuid,
	...props
}: PlaylistItemProps) {
	const { items, editItem } = useInnerPlaylist()

	const [inEditMode, setInEditMode] = useState(false)

	const [editedSheetData, setEditedSheetData] = useState<string | null>(null)
	const [editedTitle, setEditedTitle] = useState<string | null>(null)

	const onEditSave = async () => {
		await editItem(itemGuid, {
			sheetData: editedSheetData || undefined,
			title: editedTitle || undefined,
		})
		rerender()
		setInEditMode(false)
	}

	const onEditCancel = () => {
		setInEditMode(false)
	}

	const onSheetChange = (sheetData: string, title: string) => {
		setEditedSheetData(sheetData)
		setEditedTitle(title)
	}

	const item = useMemo(() => {
		return items.find((i) => i.guid === itemGuid)!
	}, [items, itemGuid])

	const sheet = useMemo(() => {
		return new Sheet(item.pack.sheetData)
	}, [item.pack.sheetData])
	const title = useMemo(() => {
		return item.pack.title
	}, [item.pack.title])
	const [number, setNumber] = React.useState(0)

	const rerender = () => {
		setNumber((prev) => prev + 1)
	}

	useEffect(() => {
		const note = item.toneKey
		if (!note) return
		sheet.setKey(note)
		rerender()
	}, [item])

	const sheetDefault = useMemo(() => {
		return (
			<DefaultStyle
				sheet={sheet}
				title={title}
				columns={1}
				hideChords={false}
			/>
		)
	}, [sheet, title, number])
	return (
		<>
			<Paper
				elevation={0}
				sx={{
					...SURFACE_CARD_SX,
					padding: 2,
					marginBottom: 1,
					displayPrint: 'none',
				}}
			>
				<Box
					position={'absolute'}
					marginTop={-20}
					id={'playlistItem_' + item.guid}
				></Box>
				<TopPlaylistItemPanel
					itemGuid={item.guid}
					packAlias={item.pack.packAlias}
					sheet={sheet}
					inEditMode={inEditMode}
					setInEditMode={setInEditMode}
					onSave={onEditSave}
					onCancel={onEditCancel}
					openButton={props.openButton}
				/>
				{!inEditMode ? (
					sheetDefault
				) : (
					<>
						<SheetDisplay
							sheet={sheet}
							title={title}
							hideChords={false}
							editMode
							onChange={onSheetChange}
						/>
					</>
				)}
			</Paper>
		</>
	)
})
