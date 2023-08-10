import { CacheFirst, NetworkFirst, StaleWhileRevalidate } from 'workbox-strategies'
import { matchPrecache, precacheAndRoute } from 'workbox-precaching'
import { registerRoute, setCatchHandler } from 'workbox-routing'

import { CacheableResponsePlugin } from 'workbox-cacheable-response'
import { ExpirationPlugin } from 'workbox-expiration'

/* Ensure the build step is configured to include /offline.html as part of the precache manifest. */
precacheAndRoute((self as any).__WB_MANIFEST)

/* Catch routing errors, like if the user is offline */
setCatchHandler(({ event }) => {
	if (event.request.destination === 'document')
		return matchPrecache('/offline.html') as Promise<Response>

	return Promise.resolve(Response.error())
})

/* Cache page navigations (html) with a Network First strategy */
registerRoute(
	({ request }) => request.mode === 'navigate',
	new NetworkFirst({
		/* Put all cached files in a cache named 'pages' */
		cacheName: 'pages',
		plugins: [
			/* Ensure that only request that result in a 200 status are cached */
			new CacheableResponsePlugin({
				statuses: [200]
			})
		]
	})
)

/* Cache CSS, JS, and Web Worker requests with a Stale While Revalidating strategy */
registerRoute(
	({ request }) =>
		request.destination === 'style' ||
		request.destination === 'script' ||
		request.destination === 'worker',
	new StaleWhileRevalidate({
		/* Put all cached files in a cache named 'assets' */
		cacheName: 'assets',
		plugins: [
			/* Ensure that only request that result in a 200 status are cached */
			new CacheableResponsePlugin({
				statuses: [200]
			})
		]
	})
)

/* Cache images with a Cache First strategy */
registerRoute(
	({ request }) => request.destination === 'image',
	new CacheFirst({
		/* Put all cached files in a cache named 'images' */
		cacheName: 'images',
		plugins: [
			/* Ensure that only request that result in a 200 status are cached */
			new CacheableResponsePlugin({
				statuses: [200]
			}),
			/* Don't cache more than 50 items, and expire them after 30 days */
			new ExpirationPlugin({
				maxEntries: 50,
				maxAgeSeconds: 60 * 60 * 25 * 30 // 30 Days
			})
		]
	})
)