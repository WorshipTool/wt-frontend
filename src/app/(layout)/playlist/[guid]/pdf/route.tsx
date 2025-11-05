import { SheetPage } from '@/app/components/pdf-renderer/SheetPDF'
import { PageParams } from '@/routes'
import { note, Sheet } from '@pepavlin/sheet-api'
import { Document, renderToStream } from '@react-pdf/renderer'
import { PlaylistGettingApi } from '../../../../../api/generated/api'

export async function GET(req: Request, { params }: PageParams<'playlistPdf'>) {
	const { searchParams } = new URL(req.url)
	const hideChords = searchParams.get('hideChords') === 'true'

	const playlistGettingApi = new PlaylistGettingApi()
	const response = await playlistGettingApi.getPlaylistDataByGuid(params.guid)
	const data = response.data

	const items = data.items
		.sort((a: any, b: any) => a.order - b.order)
		.map((item: any) => {
			const sheet = new Sheet(item.pack.sheetData)
			if (item.toneKey) sheet.setKey(item.toneKey as note)
			const title = `${item.order + 1}.  ${item.pack.title}`
			return {
				sheet,
				title,
			}
		})

	const playlistTitle = data.title || 'Playlist'

	const stream = await renderToStream(
		<Document title={playlistTitle}>
			{items.map((item: any, index: number) => (
				<SheetPage
					key={index}
					title={item.title}
					sheet={item.sheet}
					hideChords={hideChords}
				/>
			))}
		</Document>
	)
	const pdfBuffer = await streamToBuffer(stream)

	return new Response(pdfBuffer, {
		headers: {
			'Content-Type': 'application/pdf',
			'Content-Disposition': `inline; filename="${encodeURIComponent(
				playlistTitle
			)}.pdf"`,
		},
	})
}

async function streamToBuffer(stream: any) {
	const chunks: Uint8Array[] = []
	for await (const chunk of stream) chunks.push(chunk)
	return Buffer.concat(chunks)
}
