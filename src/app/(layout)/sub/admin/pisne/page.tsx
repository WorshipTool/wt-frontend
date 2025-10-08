'use client'
import AdminBreadItem from '@/app/(layout)/sub/admin/components/AdminBreadItem'
import { SmartPage } from '@/common/components/app/SmartPage/SmartPage'
import SongSearchBarBase from '@/common/components/SearchBar/SongSearchBarBase'
import { Box, Button } from '@/common/ui'
import { Masonry } from '@/common/ui/Masonry'
import SongGroupCard from '@/common/ui/SongCard/SongGroupCard'
import useSongSearchPaginated from '@/hooks/song/useSongSearchPaginated'
import { useUrlState } from '@/hooks/urlstate/useUrlState'
import { parseVariantAlias } from '@/tech/song/variant/variant.utils'
import { Add } from '@mui/icons-material'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
export default SmartPage(Page, [
	'fullWidth',
	'hideFooter',
	'hideMiddleNavigation',
	'darkToolbar',
])

function Page() {
	const [searchString, setSearchString] = useUrlState('hledat', '')
	const [useSmartSearch, setUseSmartSearch] = useState(false)

	const { search, loadNext, songs } = useSongSearchPaginated()

	const t = useTranslations('navigation')
	const tButtons = useTranslations('buttons')

	useEffect(() => {
		search(searchString || '', useSmartSearch)
		console.log('searched')
	}, [searchString, useSmartSearch])

	return (
		<Box
			sx={{
				width: '100%',
				display: 'flex',
				flexDirection: 'column',
				gap: 2,
			}}
		>
			<AdminBreadItem label={t('songs')} to="adminSongs" toParams={{}} />

			{/* <Typography strong>Písně</Typography> */}

			<Box maxWidth={450}>
				<SongSearchBarBase
					onSearchStringChange={setSearchString}
					onSmartSearchChange={setUseSmartSearch}
					startSearchString={searchString || undefined}
				/>
			</Box>

			{songs && songs.length > 0 ? (
				<Masonry columns={4}>
					{songs.map((song) => (
						<SongGroupCard
							key={song.found[0].packGuid}
							packs={song.found}
							original={song.original}
							toLinkProps={(v) => ({
								to: 'adminPack',
								params: {
									...parseVariantAlias(v.packAlias),
								},
							})}
						/>
					))}
				</Masonry>
			) : (
				<Box display={'flex'}>
					<Button to="adminCreateSong" startIcon={<Add />}>
						{tButtons('addNewSong')}
					</Button>
				</Box>
			)}
		</Box>
	)
}
