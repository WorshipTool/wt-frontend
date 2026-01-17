/**
 * News Configuration
 *
 * This file contains definitions of all news items in the application.
 * To add a new news item, simply add a new object to the NEWS_ITEMS array.
 *
 * IMPORTANT:
 * - Each news item must have a unique ID
 * - Must contain featureFlag if its new feature
 * - The ID should not be changed after deployment (used for tracking)
 * - The createdAt date determines display order (older first)
 * - For news with targetComponent, a highlight will also be shown on the component
 * - title, description, icon, and highlightText can be a string or a React element
 */

import { Gap, Typography } from '@/common/ui'
import { AutoAwesome } from '@mui/icons-material'
import { NewsItem } from './news.types'

export const NEWS_ITEMS: NewsItem[] = [
	{
		id: 'smart-search-2026-01',
		title: 'Vyhledávání podle významu',
		description: (
			<>
				Najděte píseň podle toho, <strong>o čem je</strong>, ne jen podle slov v
				textu. Přepněte se do chytrého módu a napište téma nebo pocit – např.{' '}
				<strong>„naděje v těžkých chvílích“</strong>,
				<strong> „chvála uprostřed zkoušek“</strong> nebo
				<strong> „Boží věrnost“</strong>.
				<Gap />
				<Typography small strong={300}>
					💡 Funkce je stále ve vývoji a ladí se.
				</Typography>
			</>
		),
		featureFlag: 'enable_smart_search',
		createdAt: '2024-01-15T00:00:00Z',
		tutorial: {
			targetComponent: 'smart-search-toggle',
			navigateTo: '/',
			steps: [
				{
					text: 'Přepněte na chytré vyhledávání',
					triggerOn: 'click',
					spotlight: { selector: true, radius: 8, padding: 24 },
				},
				{
					text: 'Zadejte téma nebo náladu, kterou hledáte',
					triggerOn: 'confirm',
					spotlight: {
						selector: '[data-testid="main-search-container"]',
						radius: 12,
						padding: 4,
					},
				},
			],
		},
		active: true,
	},
]

export function getActiveNews(): NewsItem[] {
	return NEWS_ITEMS.filter((news) => news.active !== false).sort(
		(a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
	)
}
