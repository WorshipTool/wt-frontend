import { isStandalonePwa } from '@/tech/device.tech'

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

/**
 * Hands the url to the browser the way a link would, rather than opening a
 * window of our own.
 *
 * The difference matters only in the installed app, and there it is the whole
 * point: `window.open` with a size asks for a popup, and an installed app has
 * nowhere to put one but inside itself — a chromeless panel over the song with
 * no address bar, no share sheet, no print button and no obvious way back. A
 * plain `target="_blank"` is the one thing the platforms agree means "this
 * belongs to the browser", so that is what this builds.
 *
 * It goes through a real anchor rather than `window.open(url, '_blank')`
 * because Safari treats a synthesised link click as the navigation it is and a
 * bare `window.open` as a popup to be blocked; the node has to be in the
 * document for the click to count.
 */
const openInBrowserTab = (url: string) => {
	const link = document.createElement('a')
	link.href = url
	link.target = '_blank'
	link.rel = 'noopener noreferrer'
	document.body.appendChild(link)
	link.click()
	link.remove()
}

/**
 * Opens what is to be printed — a PDF the server renders — and, in a browser,
 * raises the print dialog over it.
 *
 * Installed, it only opens it, in the browser: the window is the browser's now,
 * not ours to call `print()` on, and the viewer it lands in has a print button
 * of its own along with save and share, which is more than the popup offered.
 */
export const printDocumentByUrl = (url: string) => {
	if (isStandalonePwa()) {
		openInBrowserTab(url)
		return
	}

	const win = openNewPrintWindow(url)
	if (win) {
		setTimeout(() => win.print(), 1000)
	}
}
