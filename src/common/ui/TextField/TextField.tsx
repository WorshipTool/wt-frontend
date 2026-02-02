import { FormHelperText, InputBase, SxProps } from '@mui/material'
import { Box } from '@/common/ui/Box'

// Get props of input element
type TextFieldType = 'text' | 'password' | 'email'

type TextFieldProps = {
	value?: string
	startValue?: string
	onChange?: (value: string) => void
	placeholder?: string
	sx?: SxProps<{}>
	className?: string
	type?: TextFieldType
	required?: boolean
	multiline?: boolean
	disabled?: boolean
	helperText?: string
	error?: boolean
	autoFocus?: boolean
}

export function TextField({
	placeholder = 'Zadejte text',
	...props
}: TextFieldProps) {
	const onChangeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
		props.onChange?.(event.target.value)
	}
	return (
		<Box>
			<InputBase
				placeholder={placeholder}
				value={props.value}
				defaultValue={props.startValue}
				onChange={onChangeHandler}
				className={props.className}
				sx={props.sx}
				type={props.type}
				fullWidth
				required={props.required}
				multiline={props.multiline}
				disabled={props.disabled}
				autoFocus={props.autoFocus}
				error={props.error}
			/>
			{props.helperText && (
				<FormHelperText error={props.error} sx={{ marginLeft: 0 }}>
					{props.helperText}
				</FormHelperText>
			)}
		</Box>
	)
}
