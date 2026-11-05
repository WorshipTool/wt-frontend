import {
	GENERAL_PARSER_MAX_FILE_BYTES,
	isGeneralParserFile,
} from '@/api/general-parser/generalParser'

/** Why a file is turned away before it is uploaded. */
export type FileProblem = 'unsupportedFile' | 'tooLarge'

/**
 * The one check every file goes through before an import starts, however it
 * arrived — the picker (whose `accept` is only a hint), a drop, or the create
 * menu's tile. Null when the file can go.
 */
export function checkImportFile(
	file: Pick<File, 'name' | 'type' | 'size'>,
): FileProblem | null {
	if (!isGeneralParserFile(file)) return 'unsupportedFile'
	if (file.size > GENERAL_PARSER_MAX_FILE_BYTES) return 'tooLarge'
	return null
}
