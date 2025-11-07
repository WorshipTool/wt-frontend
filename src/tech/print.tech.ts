export const openNewPrintWindow = (url: string) => {
	const width = 800
	const height = 600
	const left = (window.screen.width - width) / 2
	const top = (window.screen.height - height) / 4

	return window.open(
		url,
		'_blank',
		`width=${width},height=${height},left=${left},top=${top}`
	)
}

export const printDocumentByUrl = (url: string) => {
	const win = openNewPrintWindow(url)
	if (win) {
		setTimeout(() => win.print(), 1000)
	}
}
