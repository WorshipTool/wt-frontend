import { MetadataRoute } from 'next'
import { getConfigSync } from '@/common/config/getConfig'

export default function manifest(): MetadataRoute.Manifest {
	const config = getConfigSync()
	
	return {
		name: config.branding.appDescription,
		short_name: config.branding.shortName,
		description: config.branding.appDescription,
		start_url: '/',
		display: 'standalone',
		background_color: '#ffffff',
		theme_color: '#0085FF',
		icons: [
			{
				src: '/icons/icon-192.png',
				sizes: '192x192',
				type: 'image/png',
				purpose: 'any',
			},
			{
				src: '/icons/icon-512.png',
				sizes: '512x512',
				type: 'image/png',
				purpose: 'any',
			},
			{
				src: '/icons/icon-maskable-512.png',
				sizes: '512x512',
				type: 'image/png',
				purpose: 'maskable',
			},
		],
	}
}