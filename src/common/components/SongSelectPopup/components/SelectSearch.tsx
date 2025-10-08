import { Box } from '@/common/ui'
import { TextField } from '@/common/ui/TextField/TextField'
import { Search } from '@mui/icons-material'
import { useTranslations } from 'next-intl'
import './SelectSearch.styles.css'

type SelectSearchProps = {
	value?: string
	onChange?: (value: string) => void
}

export const SelectSearch = (props: SelectSearchProps) => {
	const t = useTranslations('search')
	const onChangeHandler = (value: string) => {
		props.onChange?.(value)
	}
	return (
		<Box
			display={'flex'}
			flexDirection={'row'}
			alignItems={'center'}
			flex={1}
			gap={1}
		>
			<TextField
				placeholder={t('searchSong')}
				sx={{
					'& input': {
						textAlign: 'right',
					},
					// width: 110,

					paddingLeft: 0.5,
				}}
				value={props.value}
				onChange={onChangeHandler}
				className="song-select-title-box"
				autoFocus
			/>
			<Box
				color={'grey.700'}
				display={'flex'}
				alignItems={'center'}
				justifyContent={'center'}
			>
				<Search color="inherit" />
			</Box>

			{/* <IconButton size="small">
				<Search />
			</IconButton> */}
		</Box>
	)
}
