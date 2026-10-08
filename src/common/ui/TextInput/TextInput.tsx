import { Box } from '@/common/ui/Box'
import { TextField } from '@/common/ui/TextField/TextField'
import { Typography } from '@/common/ui/Typography'
import './textinput.styles.css'

type TextInputProps = {
	title?: string
	label?: string
	error?: boolean
} & React.ComponentProps<typeof TextField>

export function TextInput({ title, ...props }: TextInputProps) {
	title = title || props.label
	return (
		<Box display={'flex'} flexDirection={'column'} flex={1}>
			{title && <Typography strong>{title}</Typography>}
			<TextField
				{...props}
				/* The title above the field is a Typography, not a <label>, so it
				   names the field for the eye and not for a screen reader, which
				   reads an unnamed box. A placeholder used to stand in for the name
				   by accident; the generic "Zadejte text" is gone now — all four
				   fields of the registration form said it at once — and that left
				   those four with no name at all. So the title is the name when
				   nothing else is, and a caller that passes its own keeps it. */
				aria-label={
					props['aria-label'] ?? (props.placeholder ? undefined : title)
				}
				className="custom-text-input"
			/>
		</Box>
	)
}
