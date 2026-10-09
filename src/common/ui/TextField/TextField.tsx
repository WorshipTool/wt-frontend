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
	/** Ref to the underlying input, e.g. to focus it from elsewhere. */
	inputRef?: React.Ref<HTMLInputElement>
	/**
	 * What a screen reader calls this field. It lands on the `<input>`
	 * itself, not on the box around it, which is the only place an
	 * accessible name counts.
	 */
	'aria-label'?: string
}

/**
 * No default placeholder. There used to be one — "Zadejte text" — and it turned
 * up wherever a caller did not think to pass its own: all four fields of the
 * registration form said it at once, under labels that already said Jméno,
 * Příjmení, Email and Heslo. A field with a label above it and nothing in it
 * reads better than four identical instructions, and a field that really wants
 * a hint says its own.
 */
export function TextField({ placeholder, ...props }: TextFieldProps) {
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
			inputRef={props.inputRef}
			inputProps={{ 'aria-label': props['aria-label'] }}
		/>
	)
}
