// Minimal service worker — exists ONLY to satisfy the browser's PWA
// installability criteria so Android/Chrome offers its native "Install app"
// prompt. It deliberately does NO caching and NO offline handling: every
// request goes straight to the network (the fetch handler is a no-op).
// App version updates are handled separately by AppUpdater (a reload on new
// deploys), so this worker never serves stale content.

self.addEventListener('install', () => {
	self.skipWaiting()
})

self.addEventListener('activate', (event) => {
	event.waitUntil(self.clients.claim())
})

self.addEventListener('fetch', () => {
	// no-op: do not call respondWith → the browser handles the request normally
})
