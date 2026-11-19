import * as Sentry from '@sentry/nextjs'
import { sentryBeforeSend } from './src/tech/error/sentryFilter'

if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
	Sentry.init({
		dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
		environment:
			process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT ?? process.env.NODE_ENV,
		beforeSend: sentryBeforeSend,
	})
}
