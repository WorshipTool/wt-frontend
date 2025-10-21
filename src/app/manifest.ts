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
				src: '/favicon.ico',
				sizes: 'any',
				type: 'image/x-icon',
			},
		],
	}
}