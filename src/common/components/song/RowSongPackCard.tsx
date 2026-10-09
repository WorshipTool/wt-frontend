import { Box, Chip, Clickable, Typography } from '@/common/ui'
import { Link } from '@/common/ui/Link/Link'
import { getSmartDateAgoString } from '@/tech/date/date.tech'
import { parseVariantAlias } from '@/tech/song/variant/variant.utils'
import { BasicVariantPack } from '@/types/song'

type Props = {
	data: BasicVariantPack
}

export default function RowSongPackCard({ data: s }: Props) {
	return (
		<Clickable key={s.packAlias}>
			<Link to="variant" params={parseVariantAlias(s.packAlias)}>
				<Box
					sx={{
						padding: 1,
						paddingX: 1.5,
						// a tile inside the "last added" card
						bgcolor: 'surface.sunken',
						borderRadius: 2,
						border: '2px solid',
						borderColor: 'surface.border',
						display: 'flex',
						justifyContent: 'space-between',
					}}
				>
					<Typography>{s.title}</Typography>

					{s.publishedAt && (
						<Chip
							label={getSmartDateAgoString(s.publishedAt)}
							size="small"
							variant="filled"
						/>
					)}
				</Box>
			</Link>
		</Clickable>
	)
}
