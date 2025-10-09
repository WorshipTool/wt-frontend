'use client'
import useInnerPlaylist from '@/app/(layout)/playlist/[guid]/hooks/useInnerPlaylist'
import PresentationLayout from '@/common/components/PresentationLayout/PresentationLayout'
import { useSmartNavigate } from '@/routes/useSmartNavigate'
import { useSmartParams } from '@/routes/useSmartParams'
import { BasicVariantPack } from '@/types/song'
import { Sheet } from '@pepavlin/sheet-api'
import { useCallback, useMemo } from 'react'

export function PresentationPlaylistCards() {
	const { items: playlistItems, guid, data: playlist } = useInnerPlaylist()

	const items: BasicVariantPack[] = useMemo(() => {
		return playlistItems.map((i) => {
			const pack = i.pack
			const sheet = new Sheet(pack.sheetData)
			if (i.toneKey) sheet.setKey(i.toneKey)
			pack.sheetData = sheet.toString()
			return pack
		})
	}, [playlistItems])

	const navigate = useSmartNavigate()
	const params = useSmartParams('playlistCards')

	const onClick = useCallback(() => {
		const teamAlias = playlist?.teamAlias
		if (teamAlias) {
			navigate('teamPlaylist', {
				alias: teamAlias,
				...params,
			})
		} else {
			navigate('playlist', params)
		}
	}, [navigate, params, playlist])
	return <PresentationLayout items={items} onBackClick={onClick} />
}
