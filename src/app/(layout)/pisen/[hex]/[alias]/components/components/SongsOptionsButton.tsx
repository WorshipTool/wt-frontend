'use client'

import SendToApproval from '@/app/(layout)/pisen/[hex]/[alias]/components/components/SendToApproval'
import Menu, { ABOVE_ANCHOR } from '@/common/components/Menu/Menu'
import { Divider, IconButton, Tooltip } from '@/common/ui'
import ChildrenCounter from '@/tech/portal/ChildrenCounter'
import { ExtendedVariantPack } from '@/types/song'
import { MoreVert } from '@mui/icons-material'
import { Sheet } from '@pepavlin/sheet-api'
import React, { useState } from 'react'
import { SongDto } from '../../../../../../../api/dtos'
import useAuth from '../../../../../../../hooks/auth/useAuth'
import DeleteButton from './DeleteButton'
import { useTranslations } from 'next-intl'

type SongsOptionsButtonProps = {
	reloadSong: () => void
	variant: ExtendedVariantPack
	sheet: Sheet
	song: SongDto
	isInEditMode?: boolean
	onEditClick: (editable: boolean) => Promise<void>
	saving: boolean
	editedTitle: string
	isOwner: boolean
	anyChange: boolean
	/** For the phone's floating dock, where the button sits at the bottom of the
	 * screen: the menu opens upward, onto its button (see ABOVE_ANCHOR). */
	openAbove?: boolean
}

export const SONG_OPTIONS_BUTTON_ID = 'song-options-button'

export default function SongsOptionsButton(props: SongsOptionsButtonProps) {
	const [open, setOpen] = React.useState(false)
	const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
	const tOptions = useTranslations('songPage.optionsMenu')

	const handleClick = (event: React.MouseEvent<HTMLElement>) => {
		setOpen(true)
		setAnchorEl(event.currentTarget)
	}

	const handleClose = () => {
		setOpen(false)
		setAnchorEl(null)
	}

	const { isAdmin, isLoggedIn, isTrustee } = useAuth()
	const [childrenCount, setChildrenCount] = useState(0)

	return (
		<>
			{childrenCount > 0 && (
				<Tooltip title={tOptions('more')}>
					<IconButton onClick={handleClick}>
						<MoreVert />
					</IconButton>
				</Tooltip>
			)}
			<Menu
				id="basic-menu"
				anchor={anchorEl}
				{...(props.openAbove ? ABOVE_ANCHOR : {})}
				open={open}
				onClose={handleClose}
				keepMounted
			>
				<ChildrenCounter onCountChange={setChildrenCount}>
					<div id={SONG_OPTIONS_BUTTON_ID}></div>
				</ChildrenCounter>

				{props.isOwner && [
					<Divider
						key={'div-aunalk'}
						sx={{
							marginBottom: 1,
						}}
					/>,
					<SendToApproval key={'approval'} />,
					<Divider key={'div-aunalk'} />,
					<DeleteButton
						key={'delete-button'}
						reloadSong={props.reloadSong}
						variant={props.variant}
						asMenuItem
					/>,
				]}
			</Menu>

			{/* <SongAdvancedAdminOptions
				key={'sheet-admin-buttons'}
				sheet={props.sheet}
				song={props.song}
				reload={props.reloadSong}
				variant={props.variant}
				onEditClick={props.onEditClick}
				isInEditMode={props.isInEditMode}
				editLoading={props.saving}
				editedTitle={props.editedTitle}
				anyChange={props.anyChange}
			/> */}
		</>
	)
}
