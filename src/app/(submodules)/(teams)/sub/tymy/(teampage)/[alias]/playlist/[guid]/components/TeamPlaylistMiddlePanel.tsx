import { PlaylistItem } from '@/app/(layout)/playlist/[guid]/components/MiddlePanel/PlaylistItem'
import useInnerPlaylist from '@/app/(layout)/playlist/[guid]/hooks/useInnerPlaylist'
import CannotEditOnPhone from '@/app/(submodules)/(teams)/sub/tymy/(teampage)/[alias]/playlist/[guid]/components/CannotEditOnPhone'
import useInnerTeam from '@/app/(submodules)/(teams)/sub/tymy/(teampage)/hooks/useInnerTeam'
import { Box } from '@/common/ui'
import { Button } from '@/common/ui/Button'
import { parseVariantAlias } from '@/tech/song/variant/variant.utils'
import { useTranslations } from 'next-intl'
import { useMemo } from 'react'

export default function TeamPlaylistMiddlePanel() {
	const t = useTranslations('teams.playlist')
	const { items, loading } = useInnerPlaylist()
	const { alias } = useInnerTeam()

	const itemsArr = useMemo(
		() =>
			items
				?.sort((a, b) => {
					return a.order - b.order
				})
				.map((item, index) => {
					const parsedAlias = parseVariantAlias(item.pack.packAlias)
					return (
						<PlaylistItem
							key={item.guid}
							itemGuid={item.guid}
							openButton={
								<Button
									size="small"
									variant="text"
									to="teamSong"
									toParams={{
										hex: parsedAlias.hex,
										alias,
										'title-alias': parsedAlias.alias,
									}}
									tooltip={t('openSongTooltip')}
								>
									{t('open')}
								</Button>
							}
						/>
					)
				}),
		[items]
	)

	return (
		<Box
			flex={1}
			position={'relative'}
			padding={2}
			// paddingRight={4}
			paddingBottom={0}
			display={'flex'}
			flexDirection={'column'}
			// gap={2}
		>
			<CannotEditOnPhone />
			{loading || !items ? <>Načítání...</> : <>{itemsArr}</>}
		</Box>
	)
}
