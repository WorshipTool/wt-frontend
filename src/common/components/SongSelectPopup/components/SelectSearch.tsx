import { Box } from '@/common/ui'
import { TextField } from '@/common/ui/TextField/TextField'
import { Search } from '@mui/icons-material'
import { useTranslations } from 'next-intl'
import './SelectSearch.styles.css'

type SelectSearchProps = {
	value?: string
	onChange?: (value: string) => void
}

/**
 * The song picker's search, sharing the popup's heading row with its title.
 *
 * This one is a plain underlined `TextField` rather than the app's `SearchBar`,
 * and that is on purpose. It was briefly made the bar, for consistency, and on a
 * phone the result was a white pill with a shadow crammed into roughly a hundred
 * pixels beside "Vyberte píseň" — wide enough to clip its own placeholder. The
 * bar is a field you give a row to; this slot is what is left over next to a
 * heading. The right-aligned text belongs to the same problem: in a slot this
 * narrow, it keeps the end you are typing in view.
 *
 * Give the search a row of its own and the bar becomes the right answer again.
 */
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
