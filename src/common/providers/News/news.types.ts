/**
 * News/Features System Types
 *
 * System for displaying news and new features to users.
 * News are displayed to logged-in users in popup window or near specific components.
 */

import { FeatureFlag } from '@/common/providers/FeatureFlags/flags.types'
import { ReactNode } from 'react'

/**
 * Unique identifier for a news item.
 * Used for tracking which news items user has seen/tried.
 */
export type NewsId = string

/**
 * Identifier of a component where news can be displayed.
 * Maps to specific components in the application.
 */
export type NewsTargetComponent =
	| 'smart-search-toggle' // Button for switching to smart search
	| 'playlist-create' // Button for creating playlist
	| 'song-favorite' // Button for adding to favorites
// Add more components here as needed

/**
 * Type of trigger for highlight step.
 * - 'click': Step is completed by clicking on the component
 * - 'confirm': Step is completed by clicking "OK" button
 */
export type NewsHighlightTrigger = 'click' | 'confirm'

/**
 * Single step in highlight sequence.
 */
export type NewsHighlightStep = {
	/** Text displayed near the component */
	text: ReactNode
	/** How the step is completed */
	triggerOn: NewsHighlightTrigger
	/**
	 * Whether to show spotlight (page dimming except for element).
	 * true = spotlight around targetComponent
	 * string = CSS selector of element for spotlight (e.g. '[data-testid="search-input"]')
	 */
	spotlight?: {
		selector: string | true
		radius: number
		padding: number
	}
}

/**
 * Definition of a single news item/feature.
 */
export type NewsItem = {
	/** Unique news ID */
	id: NewsId
	/** News title (string or React element) */
	title: ReactNode
	/** News description (string or React element) */
	description: ReactNode
	/** Date when news was added (ISO string) - used for sorting */
	createdAt: string

	tutorial?: {
		navigateTo: string
		targetComponent: NewsTargetComponent
		steps: NewsHighlightStep[]
	}
	featureFlag?: FeatureFlag
	/** Whether news is active (inactive are not displayed) */
	active?: boolean
}

/**
 * State of a news item for a specific user.
 */
export type NewsUserState = {
	/** News ID */
	newsId: NewsId
	/** Whether user has seen news in popup */
	seen: boolean
	/** Whether user clicked on component associated with news (if exists) */
	tried: boolean
	/** Date when user first saw the news */
	seenAt?: string
	/** Date when user tried the feature */
	triedAt?: string
}

/**
 * Map of news states for user.
 * Key is NewsId, value is state.
 */
export type NewsUserStateMap = Record<NewsId, NewsUserState>
