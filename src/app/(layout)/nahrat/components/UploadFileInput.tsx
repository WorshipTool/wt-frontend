import React from 'react'

export interface UploadFileInputProps {
	inputRef?: React.RefObject<HTMLInputElement>
	onUpload?: (files: File[]) => void
}

export default function UploadFileInput(props: UploadFileInputProps) {
	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const input = event.currentTarget
		const files = input.files

		if (files && files.length > 0) {
			props.onUpload?.(Array.from(files))
		}

		// Clear the value so picking the *same* file again still fires `change`.
		// Without this a failed upload can't be retried with the same photo — the
		// input still holds it, so re-picking it does nothing at all.
		input.value = ''
	}

	return (
		<>
			<input
				style={{ display: 'none' }}
				ref={props.inputRef}
				type="file"
				name="file"
				onChange={handleFileChange}
				multiple
				accept="image/*, .pdf"
			/>
		</>
	)
}
