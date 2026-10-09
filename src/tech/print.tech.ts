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
 * Takes the file out of the app by downloading it instead of displaying it.
 *
 * An installed app cannot send an address to the browser when that address is
 * its own. Scope — everything under `start_url`, which for us is the whole site
 * — is what the platform uses to decide, and the printable PDF lives at
 * `/pisen/…/pdf`, inside it. So `target="_blank"` does not mean "the browser
 * takes this"; it means "open another window of yourself", and on a phone that
 * window has no address bar, no share sheet and no print button. Which was the
 * bug, in a second costume.
 *
 * A download is not a navigation, so there is nothing for the app to display:
 * the file goes to the system, and from there it opens in whatever reads PDFs —
 * on an iPhone, the share sheet, where printing actually lives.
 *
 * The name is passed in rather than left to the response's own
 * Content-Disposition: an empty `download` does not fall back to the header the
 * way the spec reads, and Chromium saves the file as `download`. A caller that
 * has no title gets the route's header instead, which is at least correct.
 */
const downloadOutOfApp = (url: string, fileName?: string) => {
	const link = document.createElement('a')
	link.href = url
	link.download = fileName ?? ''
	// Safari counts a synthesised click only on a node that is in the document
	document.body.appendChild(link)
	link.click()
	link.remove()
}

/**
 * Opens what is to be printed — a PDF the server renders — and, in a browser,
 * raises the print dialog over it.
 *
 * Installed, it hands the file to the system instead. `print()` has nothing to
 * act on there, and the app has nothing worth showing the file in.
 *
 * `fileName` is what the saved file should be called — the song's or playlist's
 * title. It only matters on the download path, but every caller that knows the
 * title should pass it: it is the name the person will be looking at in Files.
 */
export const printDocumentByUrl = (url: string, fileName?: string) => {
	if (isStandalonePwa()) {
		downloadOutOfApp(url, fileName)
		return
	}

	const win = openNewPrintWindow(url)
	if (win) {
		setTimeout(() => win.print(), 1000)
	}
}
