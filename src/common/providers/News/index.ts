/**
 * News System
 *
 * Systém pro zobrazování novinek a nových funkcí uživatelům.
 *
 * ## Použití:
 *
 * 1. Přidej NewsProvider do stromu komponent (už je v AppClientProviders)
 *
 * 2. Pro přidání nové novinky uprav soubor news.config.tsx
 *
 * 3. Pro zvýraznění komponenty použij NewsHighlightWrapper:
 *    ```tsx
 *    import { NewsHighlightWrapper } from '@/common/providers/News'
 *
 *    <NewsHighlightWrapper targetComponent="smart-search-toggle">
 *      <IconButton onClick={handleClick}>
 *        <AutoAwesome />
 *      </IconButton>
 *    </NewsHighlightWrapper>
 *    ```
 *
 * 4. Pro přístup k news kontextu použij useNews hook:
 *    ```tsx
 *    import { useNews } from '@/common/providers/News'
 *
 *    const { unseenNews, openPopup } = useNews()
 *    ```
 */

// Types
export type {
	NewsHighlightStep,
	NewsHighlightTrigger,
	NewsId,
	NewsItem,
	NewsTargetComponent,
	NewsUserState,
	NewsUserStateMap,
} from './news.types'

// Config
export { getActiveNews } from './news.config'

// Context & Hooks
export { NewsProvider, useNews, useNewsHighlight } from './NewsContext'

// Components
export {
	NewsBadge,
	NewsHighlightWrapper,
	SimpleNewsHighlight,
} from './NewsHighlight'
export { NewsPopup } from './NewsPopup'
export { SpotlightOverlay } from './SpotlightOverlay'
