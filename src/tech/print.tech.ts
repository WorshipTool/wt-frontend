export const openNewPrintWindow = (url: string) => {
	console.log('openNewPrintWindow', url)
	const width = 800
	const height = 600
	const left = (window.screen.width - width) / 2
	const top = (window.screen.height - height) / 4

	window.open(
		url,
		'_blank',
		`width=${width},height=${height},left=${left},top=${top}`
	)
}
