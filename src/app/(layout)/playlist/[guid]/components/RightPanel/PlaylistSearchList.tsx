import { useTheme } from '@/common/ui'
import { Masonry } from '@/common/ui/Masonry'
import { SongVariantDto } from '../../../../../../api/dtos'
import SearchItem from './SearchItem'

interface PlaylistSearchListProps {
	variants: SongVariantDto[]
}

export default function PlaylistSearchList({
	variants,
}: PlaylistSearchListProps) {
	const theme = useTheme()
	const spacing = 0.75

	return variants.length == 0 ? (
		<></>
	) : (
		<Masonry
			columns={1}
			sx={{
				marginLeft: -(spacing / 2),
				width: `calc(100% + ${theme.spacing(spacing)})`,
			}}
			spacing={spacing}
		>
			{variants.map((v) => {
				return <SearchItem variant={v} key={v.guid}></SearchItem>
			})}
		</Masonry>
	)
}
