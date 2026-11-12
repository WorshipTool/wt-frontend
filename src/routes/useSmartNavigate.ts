'use client'
// import { useNavigate } from "react-router-dom";
import { useIsStandalonePwa } from '@/hooks/pwa/useIsStandalonePwa'
import useSubdomainPathnameAlias from '@/routes/subdomains/SubdomainPathnameAliasProvider'
import { getComplexReplacedUrlWithParams } from '@/routes/tech/transformer.tech'
import { NavigateOptions as NO } from 'next/dist/shared/lib/app-router-context.shared-runtime'
import { useRouter } from 'next/navigation'
import { RouteLiteral } from 'nextjs-routes'
import { routesPaths } from './routes'
import { RoutesKeys, SmartAllParams } from './routes.types'

type NavigateOptions = NO & {
	replace?: boolean
}

export const useSmartNavigate = () => {
	const router = useRouter()
	const { aliases } = useSubdomainPathnameAlias()
	// Same as in Link: an installed app must not leave its own origin.
	const standalone = useIsStandalonePwa()
	const navigate = <T extends RoutesKeys>(
		to:
			| T
			| {
					url: string
			  },
		params: SmartAllParams<T>,
		options: NavigateOptions = {}
	) => {
		const toUrl = typeof to === 'string' ? routesPaths[to] : to.url
		const urlWithAliases =
			Object.keys(params).length > 0
				? getComplexReplacedUrlWithParams(
						toUrl,
						params,
						standalone
							? { returnFormat: 'absolute', returnSubdomains: 'never' }
							: { returnFormat: 'absolute', subdomainAliases: aliases }
				  )
				: toUrl

		if (options.replace) {
			router.replace(urlWithAliases as RouteLiteral)
		} else {
			router.push(urlWithAliases as RouteLiteral)
		}
	}

	return navigate
}
