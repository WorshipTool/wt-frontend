'use client'

import { GENERAL_PARSER_ACCEPT } from '@/api/general-parser/generalParser'
import { Box } from '@/common/ui'
import { useRef } from 'react'

/**
 * The system file picker, opened straight from a click.
 *
 * A browser only opens the picker inside the gesture that asked for it, so
 * `open()` must be called synchronously from a click handler. Render `input`
 * anywhere in the tree; it is hidden. Cancelling the picker calls nothing.
 * `accept` only steers the picker; whatever comes back is checked where the
 * import starts (`checkImportFile`).
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
