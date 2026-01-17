/**
 * News Configuration
 *
 * This file contains definitions of all news items in the application.
 * To add a new news item, simply add a new object to the getNewsItems function.
 *
 * IMPORTANT:
 * - Each news item must have a unique ID
 * - Must contain featureFlag if its new feature
 * - The ID should not be changed after deployment (used for tracking)
 * - The createdAt date determines display order (older first)
 * - For news with targetComponent, a highlight will also be shown on the component
 * - Translations are passed via the t parameter from useTranslations('news')
 */

import { Gap, Typography } from '@/common/ui'
import { useTranslations } from 'next-intl'
import { ReactNode } from 'react'
import { NewsItem } from './news.types'

export type NewsTranslations = ReturnType<typeof useTranslations<'news'>>

export function getNewsItems(t: NewsTranslations): NewsItem[] {
	return [
		{
			id: 'smart-search-2026-01',
			title: t('smartSearchTitle'),
			description: (
				<>
					{t.rich('smartSearchDescription', {
						strong: (chunks) => <strong>{chunks}</strong>,
					})}
					<Gap />
					<Typography small strong={300}>
						{t('smartSearchNote')}
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
						text: t('smartSearchStep1'),
						triggerOn: 'click',
						spotlight: { selector: true, radius: 8, padding: 24 },
					},
					{
						text: t('smartSearchStep2'),
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
}

export function getActiveNews(t: NewsTranslations): NewsItem[] {
	return getNewsItems(t)
		.filter((news) => news.active !== false)
		.sort(
			(a, b) =>
				new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
		)
}
