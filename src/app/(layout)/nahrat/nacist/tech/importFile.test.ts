import { GENERAL_PARSER_MAX_FILE_BYTES } from '@/api/general-parser/generalParser'
import { checkImportFile } from './importFile'

const file = (name: string, type: string, size = 1000) => ({ name, type, size })

describe('checkImportFile', () => {
	it.each([
		file('noty.pdf', 'application/pdf'),
		file('fotka.png', 'image/png'),
		file('IMG_0001.heic', ''),
		file('noty.pdf', ''),
	])('lets $name ($type) through', (f) => {
		expect(checkImportFile(f)).toBeNull()
	})

	it.each([
		file('zpevnik.docx', 'application/vnd.openxmlformats'),
		file('zpevnik.docx', ''),
	])('turns $name away as unsupported', (f) => {
		expect(checkImportFile(f)).toBe('unsupportedFile')
	})

	it('turns a readable file over the limit away as too large', () => {
		const big = file(
			'noty.pdf',
			'application/pdf',
			GENERAL_PARSER_MAX_FILE_BYTES + 1,
		)
		expect(checkImportFile(big)).toBe('tooLarge')
	})

	it('an unsupported file says so even when it is also too large', () => {
		const big = file(
			'film.mov',
			'video/quicktime',
			GENERAL_PARSER_MAX_FILE_BYTES + 1,
		)
		expect(checkImportFile(big)).toBe('unsupportedFile')
	})
})
