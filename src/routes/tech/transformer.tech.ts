import { FRONTEND_URL } from '@/api/constants'
import { routesPaths } from '@/routes/routes'
import { deriveBasePath } from '@/tech/url/basePath'
import { ParamValueType, RoutesKeys, SmartParams } from '@/routes/routes.types'
import { SubdomainData } from '@/routes/subdomains/SubdomainPathnameAliasProvider'
import { shouldUseSubdomains } from '@/routes/tech/routes.tech'
import {
	changeUrlToSubdomains,
	getUrlWithSubdomainPathnameAliases,
} from '@/routes/tech/subdomains.tech'
import { isUrlAbsolute } from '@/tech/url/url.tech'

/**
 * Get url from pretyped-route with given parameters.
 */
export const getRouteUrlWithParams = <T extends RoutesKeys>(
	page: T,
	params: SmartParams<T>,
	options?: GetReplacedUrlWithParamsOptions
) => {
	const url = routesPaths[page]
	let result = getReplacedUrlWithParams(FRONTEND_URL + url, params, options)

	return result
}

type GetComplexReplacedUrlWithParamsOptions =
	GetReplacedUrlWithParamsOptions & {
		subdomainAliases?: SubdomainData[]
	}

export const getComplexReplacedUrlWithParams = (
	url: string,
	params: { [key: string]: ParamValueType | undefined },
	_options: GetComplexReplacedUrlWithParamsOptions = {}
) => {
	const absoluteUrl = getReplacedUrlWithParams(url, params, {
		..._options,
		returnSubdomains: 'never',
	})

	const urlWithAliases = getUrlWithSubdomainPathnameAliases(
		absoluteUrl,
		_options.subdomainAliases || []
	)

	if (_options.returnSubdomains === 'never') return urlWithAliases

	return getReplacedUrlWithParams(urlWithAliases, {}, _options)
}

/**
 * Options for generating a replaced URL with parameters.
 *
 * @property subdomains - Whether to return url as subdomains.
 */
export type GetReplacedUrlWithParamsOptions = {
	returnSubdomains?: 'auto' | 'never' | 'always'
	returnFormat?: 'absolute' | 'relative'
}

/**
 * Generates a URL with replaced parameters and optional query parameters.
 * It also transform subdomains if needed.
 * If the URL is relative, it will be transformed to relative, if no other options are given.
 * Warning: It does not handle subdomain aliases!
 */
export const getReplacedUrlWithParams = (
	url: string,
	params: { [key: string]: ParamValueType | undefined },
	_options: GetReplacedUrlWithParamsOptions = {}
) => {
	// Defaults
	const options = {
		returnSubdomains: 'auto',
		returnFormat: isUrlAbsolute(url) ? 'absolute' : 'relative',
		..._options,
	}

	const returnAbsolute = options.returnFormat === 'absolute'
	const _subdomains =
		options.returnSubdomains === 'auto' || options.returnSubdomains === 'always'
	const subdomains = _subdomains
		? options.returnSubdomains === 'always' || shouldUseSubdomains()
		: _subdomains // If auto, func transform subdomains

	// Check options
	if (!returnAbsolute && _subdomains)
		throw new Error(`Please set transforming to subdomains or make sure that you return relative url.
                        Cannot use subdomains without absolute url`)

	const queryParams: Record<string, ParamValueType> = {}

	// Process params
	let result = url
	for (const key in params) {
		// Ignore undefined values
		if (params[key] === undefined) continue
		if (typeof params[key] !== 'string' && typeof params[key] !== 'boolean')
			continue

		const initial = result
		result = result.replace(`[${key}]`, params[key] as string)
		if (initial === result) {
			queryParams[key] = params[key] as string
		}
	}

	// When FRONTEND_URL has a non-root basePath (e.g. /pr-55), new URL(relativePath, base)
	// drops the basePath because the path starts with '/'. Prepend it explicitly.
	const basePath = deriveBasePath(FRONTEND_URL)
	if (basePath && result.startsWith('/') && !result.startsWith(basePath)) {
		result = basePath + result
	}

	// Handling query params
	if (Object.keys(queryParams).length > 0) {
		const url = new URL(result, FRONTEND_URL)
		for (const key in queryParams) {
			const val = queryParams[key]
			if (typeof val === 'string') url.searchParams.set(key, val)
			else if (typeof val === 'boolean')
				url.searchParams.set(key, val.toString())
		}
		result = url.toString()
	}

	// Handling subdomains
	if (subdomains) {
		result = changeUrlToSubdomains(result)
	}

	// Make sure its absolute or relative
	const _url = new URL(result, FRONTEND_URL)
	if (returnAbsolute) {
		return _url.toString()
	}
	return _url.pathname
}
