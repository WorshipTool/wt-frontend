import { useServerApi } from '@/api/tech-and-hooks/useServerApi'
import DefaultStylePreview from '@/common/components/SheetDisplay/styles/DefaultStylePreview'
import { PageParams } from '@/routes'
import { makeVariantAlias } from '@/tech/song/variant/variant.utils'
import { Sheet } from '@pepavlin/sheet-api'
import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge' // Rychlejší vykreslení na Vercelu

export async function GET(req: NextRequest, { params }: PageParams<'variant'>) {
	const { songGettingApi } = await useServerApi()

	const alias = makeVariantAlias(params.hex, params.alias)

	let data: Awaited<ReturnType<typeof songGettingApi.getVariantDataByAlias>>
	try {
		data = await songGettingApi.getVariantDataByAlias(alias)
	} catch (e: any) {
		const status: number | undefined = e?.response?.status
		if (status && status < 500) {
			return new Response(null, { status: status === 404 ? 404 : 400 })
		}
		// Backend unavailable (already retried and reported to Sentry by the
		// API layer). Crawlers hit this route en masse during an outage — answer
		// 503 instead of throwing (another Sentry event per hit), and tell them
		// to come back instead of caching a broken image.
		return new Response(null, {
			status: 503,
			headers: { 'Retry-After': '120', 'Cache-Control': 'no-store' },
		})
	}

	const sheet = new Sheet(data.main.sheetData)

	return new ImageResponse(
		(
			<div
				style={{
					display: 'flex',
					padding: 24,
				}}
			>
				<DefaultStylePreview
					sheet={sheet}
					title={data.main.title}
					hideChords={false}
					columns={1}
				/>
			</div>
		),
		{
			width: 450,
			height: 550,
		}
	)
}
