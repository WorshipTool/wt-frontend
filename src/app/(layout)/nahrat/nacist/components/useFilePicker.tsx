'use client'

import { GENERAL_PARSER_ACCEPT } from '@/api/general-parser/generalParser'
import { Box } from '@/common/ui'
import { useRef } from 'react'

/** PDF or any image — what the general parser reads. */
export const isImportableFile = (file: File) =>
	file.type === 'application/pdf' || file.type.startsWith('image/')

/**
 * The system file picker, opened straight from a click.
 *
 * A browser only opens the picker inside the gesture that asked for it, so
 * `open()` must be called synchronously from a click handler. Render `input`
 * anywhere in the tree; it is hidden. Cancelling the picker calls nothing.
 */
export function useFilePicker(onFile: (file: File) => void) {
	const ref = useRef<HTMLInputElement>(null)

	const input = (
		<Box
			component="input"
			ref={ref}
			type="file"
			accept={GENERAL_PARSER_ACCEPT}
			tabIndex={-1}
			aria-hidden
			sx={{ display: 'none' }}
			onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
				const file = e.target.files?.[0]
				// reset so picking the same file again still fires a change
				e.target.value = ''
				if (file) onFile(file)
			}}
		/>
	)

	const open = () => ref.current?.click()

	return { open, input }
}
