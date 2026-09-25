import { VariantPackAlias, VariantPackGuid } from '@/api/dtos'
import { GetListSongData } from '@/api/generated'
import { Box, Divider, Typography } from '@/common/ui'
import { Paper, styled } from '@/common/ui/mui'
import { heartColor } from '@/common/ui/SongCard/components/HeartLikeButton'
import DraggableSong from '@/hooks/dragsong/DraggableSong'
import useFavourite from '@/hooks/favourites/useFavourite'
import { useSmartNavigate } from '@/routes/useSmartNavigate'
import { parseVariantAlias } from '@/tech/song/variant/variant.utils'
import { Favorite } from '@mui/icons-material'

const StyledPaper = styled(Paper)(({ theme }) => ({
	backgroundColor: theme.palette.grey[100],

	padding: '0.6rem',
	'&:hover': {
		backgroundColor: theme.palette.grey[200],
		boxShadow: `0px 0px 7px ${theme.palette.grey[600]}`,
	},
	cursor: 'pointer',
}))

export type AllSongItemProps = {
	data: GetListSongData
	index: number
}
export default function AllSongItem({ data: s, index }: AllSongItemProps) {
	const navigate = useSmartNavigate()
	const isFavorite = useFavourite(s.main.packGuid as VariantPackGuid)

	return (
		<DraggableSong
			data={{
				packGuid: s.main.packGuid as VariantPackGuid,
				title: s.main.title,
				alias: s.main.packAlias as VariantPackAlias,
			}}
		>
			<StyledPaper
				onClick={() => {
					navigate('variant', {
						...parseVariantAlias(s.main.packAlias as VariantPackAlias),
					})
				}}
			>
				<Box display={'flex'} gap={1} alignItems={'center'}>
					<Typography
						strong
						sx={{
							alignItems: 'center',
							display: 'flex',
						}}
					>
						{index}
					</Typography>
					<Divider orientation="vertical" flexItem />
					<Box
						display={'flex'}
						flexDirection={'column'}
						height={'2rem'}
						justifyContent={'center'}
						gap={0.1}
						flex={1}
					>
						{s.original && (
							<Typography
								color={'grey.500'}
								small
								thin
								noWrap
								sx={{
									flex: 1,
									lineHeight: '1.2rem',
								}}
							>
								{s.original.title}
							</Typography>
						)}
						<Typography
							strong={300}
							noWrap
							sx={{
								flex: 1,
								lineHeight: '1.2rem',
								alignItems: 'center',
								display: 'flex',
							}}
						>
							{s.main.title}{' '}
						</Typography>
					</Box>

					{isFavorite && (
						<Favorite
							color={'inherit'}
							sx={{
								color: heartColor,
							}}
						/>
					)}
				</Box>
			</StyledPaper>
		</DraggableSong>
	)
}
