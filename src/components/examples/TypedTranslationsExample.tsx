import { useTranslations } from 'next-intl'

// Example of typed translations with next-intl's createMessagesDeclaration
export function TypedTranslationsExample() {
	// TypeScript provides autocomplete for namespaces and keys
	const commonT = useTranslations('common')
	const accountT = useTranslations('account')
	const songT = useTranslations('song')

	return (
		<div>
			{/* TypeScript provides strict typing for translation keys */}
			<h1>{commonT('yes')}</h1>
			<p>{accountT('title')}</p>

			{/* Nested keys with autocomplete */}
			<button>{accountT('favourites.title')}</button>

			{/* Type-safe parameters - TypeScript will enforce required arguments */}
			<p>{accountT('favourites.totalSongs', { count: '5' })}</p>

			{/* TypeScript will error if required parameter is missing */}
			<span>{songT('deleted.restored', { title: 'Amazing Grace' })}</span>

			{/* ✖️ This would cause TypeScript error - missing 'count' parameter: */}
			{/* <p>{accountT('favourites.totalSongs')}</p> */}

			{/* ✖️ This would cause TypeScript error - missing 'title' parameter: */}
			{/* <span>{songT('deleted.restored')}</span> */}
		</div>
	)
}

export default TypedTranslationsExample
