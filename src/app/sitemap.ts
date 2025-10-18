import { VariantPackAlias } from '@/api/dtos'

import { getRouteUrlWithParams } from '@/routes/tech/transformer.tech'
import { parseVariantAlias } from '@/tech/song/variant/variant.utils'
import type { MetadataRoute } from 'next'
import { GetListSongData, SongGettingApi } from '../api/generated'
import { routesPaths } from '../routes/routes'
import { handleApiCall } from '../tech/fetch/handleApiCall'

export const revalidate = 60 * 60 // 1 hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const BASE_URL = process.env.NEXT_PUBLIC_FRONTEND_URL

	const api = new SongGettingApi()
	let songs: GetListSongData[] = []
	try {
		songs = await handleApiCall(api.getSitemapList())
	} catch (e) {
		console.warn('Failed to fetch songs for sitemap -> ignoring songs')
	}

	const today = new Date()

	const songsMap = songs.map((s) => {
		const date = new Date(s.main.updatedAt)
		return {
			url: getRouteUrlWithParams(
				'variant',
				parseVariantAlias(s.main.packAlias as VariantPackAlias)
			),
			lastModified: date,
			changeFrequency: 'monthly',
			priority: 0.8,
		}
	})
	return [
		{
			url: `${BASE_URL}/`,
			lastModified: today,
			changeFrequency: 'yearly',
			priority: 1,
		},
		{
			url: `${BASE_URL}${routesPaths['songsList']}`,
			lastModified: today,
			changeFrequency: 'weekly',
			priority: 0.7,
		},
		{
			url: `${BASE_URL}${routesPaths['about']}`,
			lastModified: today,
			changeFrequency: 'monthly',
			priority: 0.2,
		},
		{
			url: `${BASE_URL}${routesPaths['teams']}`,
			lastModified: today,
			changeFrequency: 'monthly',
			priority: 0.2,
		},
		{
			url: `${BASE_URL}${routesPaths['login']}`,
			lastModified: today,
			changeFrequency: 'yearly',
			priority: 0.3,
		},
		{
			url: `${BASE_URL}${routesPaths['signup']}`,
			lastModified: today,
			changeFrequency: 'yearly',
			priority: 0.4,
		},
		{
			url: `${BASE_URL}${routesPaths['addMenu']}`,
			lastModified: today,
			changeFrequency: 'yearly',
			priority: 0.6,
		},
		// {
		// 	url: `${BASE_URL}${routesPaths['upload']}`,
		// 	lastModified: date,
		// 	changeFrequency: 'yearly',
		// 	priority: 0.6,
		// },

		...(songsMap as any),
	]
}
