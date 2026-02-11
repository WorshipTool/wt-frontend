import useInnerPlaylist from '@/app/(layout)/playlist/[guid]/hooks/useInnerPlaylist'
import { Box, Divider, Typography } from '@/common/ui'
import { Skeleton } from '@/common/ui/mui/Skeleton'
import { parseVariantAlias } from '@/tech/song/variant/variant.utils'
import { styled } from '@mui/system'
import { Sheet } from '@pepavlin/sheet-api'
import { useState } from 'react'
import { SongVariantDto } from '../../../../../../api/dtos'
import { Button } from '../../../../../../common/ui/Button'
import { Link } from '../../../../../../common/ui/Link/Link'
import useAuth from '../../../../../../hooks/auth/useAuth'
import { useApiState } from '../../../../../../tech/ApiState'

const StyledContainer = styled(Box)(({ theme }) => ({
	backgroundColor: theme.palette.grey[100],

	borderRadius: '0.5rem',
	'&:hover': {
		backgroundColor: theme.palette.grey[200],
		boxShadow: `0px 0px 10px ${theme.palette.grey[400]}`,
	},
	cursor: 'pointer',
	borderWidth: 1.4,
	borderStyle: 'solid',
}))

const StyledBox = styled(Typography)(({ theme }) => ({
	maxWidth: 'calc(100vw - 3rem)',
	overflow: 'hidden',
}))

interface SearchItemProps {
	variant: SongVariantDto
	onClick?: (variant: SongVariantDto) => void
}
export default function SearchItem({
	variant,
	onClick: onClickCallback,
}: SearchItemProps) {
	const [bottomPanelOpen, setBottomPanelOpen] = useState(false)

	const { addItemWithGuid } = useInnerPlaylist()

	const sheet = new Sheet(variant.sheetData)

	const {
		fetchApiState,
		apiState: { loading },
	} = useApiState()

	const onSongClick = () => {
		onClickCallback?.(variant)
		setBottomPanelOpen(true)
	}

	const addToPlaylist = async () => {
		fetchApiState(async () => {
			return await addItemWithGuid(variant.packGuid)
		})
	}

	const { user } = useAuth()

	const variantParams = {
		...parseVariantAlias(variant.packAlias),
		title: variant.preferredTitle,
	}

	return (
		<Link to="variant" params={variantParams} onlyWithShift>
			<Box>
				{false ? (
					<Box
						justifyContent={'center'}
						display={'flex'}
						flexDirection={'column'}
					>
						<Skeleton variant="text" width={'100%'}></Skeleton>
						{Array(2)
							.fill(1)
							.map((a, index) => {
								return (
									<Skeleton
										variant="text"
										width={Math.round(Math.random() * 80) + '%'}
										key={variant.guid + 's' + index}
									></Skeleton>
								)
							})}
					</Box>
				) : (
					<StyledContainer
						onClick={onSongClick}
						sx={{
							borderColor:
								variant.verified || variant.createdByLoader
									? 'transparent'
									: 'grey',
						}}
					>
						<Box padding={'0.625rem'}>
							{variant.createdBy == user?.guid && (
								<Typography>Vytvořeno vámi.</Typography>
							)}

							<Box display={'flex'}>
								<Typography
									strong
									sx={{
										flex: 1,
									}}
								>
									{variant.preferredTitle}
								</Typography>
								{!variant.verified ? (
									<>
										{variant.createdByLoader ? (
											<Typography>Nahráno programem</Typography>
										) : (
											<>
												<Typography>Neověřeno</Typography>
											</>
										)}
									</>
								) : (
									<></>
								)}
							</Box>

							<StyledBox>
								{sheet
									.getSections()[0]
									?.text?.split('\n')
									.slice(0, 3)
									.map((line, index) => {
										return (
											<Typography noWrap key={'SearchItemText' + line}>
												{line}
											</Typography>
										)
									})}
							</StyledBox>
						</Box>

						{bottomPanelOpen && (
							<Box display={'flex'} flexDirection={'column'}>
								<Divider />
								<Button
									variant="text"
									to="variant"
									toParams={variantParams}
									sx={{
										width: '100%',
									}}
								>
									Otevřít
								</Button>
								<Button
									variant="contained"
									onClick={addToPlaylist}
									loading={loading}
								>
									Přidat do playlistu
								</Button>
							</Box>
						)}
					</StyledContainer>
				)}
			</Box>
		</Link>
	)
}
