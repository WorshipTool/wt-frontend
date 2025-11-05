import { mapBasicVariantPackApiToDto } from '@/api/dtos'
import {
	getVariantAliasFromParams,
	getVariantByAlias,
} from '@/app/(layout)/pisen/[hex]/[alias]/tech'
import SheetPDF from '@/app/components/pdf-renderer/SheetPDF'
import { PageParams } from '@/routes'
import { note, Sheet } from '@pepavlin/sheet-api'
import { renderToStream } from '@react-pdf/renderer'

export async function GET(req: Request, { params }: PageParams<'variantPdf'>) {
	const { searchParams } = new URL(req.url)
	const key = searchParams.get('key') as note | null
	const hideChords = searchParams.get('hideChords') === 'true'

	const alias = getVariantAliasFromParams(params.hex, params.alias)
	const v = await getVariantByAlias(alias)
	const variant = v.main

	const variantData = mapBasicVariantPackApiToDto(variant)

	const sheet = new Sheet(variant.sheetData)
	if (key) sheet.setKey(key)

	const stream = await renderToStream(
		<SheetPDF title={variantData.title} sheet={sheet} hideChords={hideChords} />
	)
	const pdfBuffer = await streamToBuffer(stream)

	return new Response(pdfBuffer, {
		headers: {
			'Content-Type': 'application/pdf',
			'Content-Disposition': `inline; filename="${encodeURIComponent(
				variantData.title
			)}.pdf"`,
		},
	})
}

async function streamToBuffer(stream: any) {
	const chunks: Uint8Array[] = []
	for await (const chunk of stream) chunks.push(chunk)
	return Buffer.concat(chunks)
}
