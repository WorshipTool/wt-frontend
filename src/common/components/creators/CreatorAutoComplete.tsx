import { CreatorAutocompleteDto } from '@/api/dtos/creator/CreatorDto'
import { useApi } from '@/api/tech-and-hooks/useApi'
import TextField from '@mui/material/TextField'

import { useChangeDelayer } from '@/hooks/changedelay/useChangeDelayer'
import { useApiState } from '@/tech/ApiState'
import Autocomplete from '@mui/material/Autocomplete'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

type Props = {
	onChange?: (values: string[]) => void
}
export default function CreatorAutoComplete(props: Props) {
	const t = useTranslations('common')
	const api = useApi('songCreatorsApi')
	const { fetchApiState, apiState } = useApiState<CreatorAutocompleteDto>()
	const [input, setInput] = useState<string>('')

	useChangeDelayer(
		input,
		(value) => {
			fetchApiState(async () => {
				return await api.autoComplete(value)
			})
		},
		[]
	)

	return (
		<Autocomplete
			multiple
			id="creators-autocomplete"
			options={apiState?.data?.items.map((item) => item.name) ?? []}
			defaultValue={[]}
			filterOptions={(x) => x}
			// getOptionLabel={(option) => option.name}
			onChange={(e, v) => {
				props.onChange?.(v)
			}}
			freeSolo
			renderInput={(params) => (
				<TextField
					{...params}
					variant="standard"
					label={t('authors')}
					placeholder={t('authorName')}
					value={input}
					onChange={(e) => setInput(e.target.value)}

					// inputProps={{
					// 	input: {
					// 		...params.InputProps,
					// 		endAdornment: (
					// 			<React.Fragment>
					// 				{apiState.loading ? (
					// 					<CircularProgress color="inherit" size={20} />
					// 				) : null}
					// 				{params.InputProps.endAdornment}
					// 			</React.Fragment>
					// 		),
					// 	},
					// }}
				/>
			)}
		/>
	)
}
