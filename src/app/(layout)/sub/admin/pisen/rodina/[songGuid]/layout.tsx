import { mapBasicSongApiToDto } from '@/api/dtos'
import { useServerApi } from '@/api/tech-and-hooks/useServerApi'
import { InnerSongProvider } from '@/app/(layout)/pisen/[hex]/[alias]/hooks/useInnerSong'
import AdminBreadItem from '@/app/(layout)/sub/admin/components/AdminBreadItem'
import { LayoutProps } from '@/common/types'
import { SongGuid } from '@/types/song'
import { getTranslations } from 'next-intl/server'

export default async function layout(props: LayoutProps<'adminSong'>) {
	const t = await getTranslations('admin.layout')
	const { songGettingApi } = await useServerApi()
	const data = await songGettingApi.getSongDataByGuid(props.params.songGuid)

	const formatted = mapBasicSongApiToDto(data)

	return (
		<InnerSongProvider
			startData={formatted}
			songGuid={props.params.songGuid as SongGuid}
		>
			<AdminBreadItem label={t('songs')} to="adminSongs" toParams={{}} />
			<AdminBreadItem
				label={data.title}
				to={'adminSong'}
				toParams={props.params}
			/>
			{props.children}
		</InnerSongProvider>
	)
}
