import { InputBase, SxProps } from '@mui/material'

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

	autoFocus?: boolean
}

export function TextField({
	placeholder,
	...props
}: TextFieldProps) {
	const onChangeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
		props.onChange?.(event.target.value)
	}
	return (
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
		/>
	)
}
