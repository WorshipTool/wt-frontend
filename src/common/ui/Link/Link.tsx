'use client'
import { Box } from '@/common/ui/Box'
import BlockLinkPopup from '@/common/ui/Link/BlockLinkPopup'
import {
	LinkBlockerPopupData,
	useOutsideBlockerLinkCheck,
} from '@/common/ui/Link/useOutsideBlocker'
import useSubdomainPathnameAlias from '@/routes/subdomains/SubdomainPathnameAliasProvider'
import { getComplexReplacedUrlWithParams } from '@/routes/tech/transformer.tech'
import { styled, SxProps } from '@mui/material'
import NextLink from 'next/link'
import { useRouter } from 'next/navigation'
import { RouteLiteral } from 'nextjs-routes'
import React, { ComponentProps, useEffect, useMemo } from 'react'
import { routesPaths } from '../../../routes'
import { RoutesKeys, SmartAllParams } from '../../../routes/routes.types'

export type CommonLinkProps<T extends RoutesKeys = RoutesKeys> = {
	to: T
	params: SmartAllParams<T>
	external?: false
}

export type ExternalLinkProps = {
	href: string
	external: true
}

type CommonProps<T extends RoutesKeys> = CommonLinkProps<T> | ExternalLinkProps

export type LinkProps<T extends RoutesKeys> = CommonProps<T> & {
	children: React.ReactNode
	onlyWithShift?: boolean
	sx?: SxProps<{}>
	newTab?: boolean
	disabled?: boolean
} & Omit<ComponentProps<typeof NextLink>, 'href'>

const StyledLink = styled(NextLink)({})

export function Link<T extends RoutesKeys>(props: LinkProps<T>) {
	const { aliases } = useSubdomainPathnameAlias()

	const { url, relativeUrl } = useMemo(() => {
		if (props.external) {
			return {
				url: props.href,
				relativeUrl: props.href,
			}
		}

		const absoluteUrl = getComplexReplacedUrlWithParams(
			routesPaths[props.to] || '/',
			(props.params as Record<string, string>) || {},
			{
				returnFormat: 'absolute',
				subdomainAliases: aliases,
			}
		)
		const relativeUrl = getComplexReplacedUrlWithParams(
			routesPaths[props.to] || '/',
			(props.params as Record<string, string>) || {},
			{
				returnFormat: 'relative',
				returnSubdomains: 'never',
				// Dont use subdomain aliases for relative urls!
				// because this is used for link blockers
			}
		)

		return {
			url: absoluteUrl,
			relativeUrl,
		}
	}, [
		(props as CommonLinkProps<T>).to,
		(props as CommonLinkProps<T>).params,
		aliases,
	])

	const [shiftOn, setShiftOn] = React.useState(false)

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (
				e.key === 'Control' ||
				e.key === 'Shift' ||
				e.key === 'Alt' ||
				e.key === 'Meta'
			) {
				setShiftOn(true)
			}
		}

		const handleKeyUp = (e: KeyboardEvent) => {
			if (
				e.key === 'Control' ||
				e.key === 'Shift' ||
				e.key === 'Alt' ||
				e.key === 'Meta'
			) {
				setShiftOn(false)
			}
		}

		document.addEventListener('keydown', handleKeyDown)
		document.addEventListener('keyup', handleKeyUp)

		return () => {
			document.removeEventListener('keydown', handleKeyDown)
			document.removeEventListener('keyup', handleKeyUp)
		}
	}, [])

	const result = useOutsideBlockerLinkCheck(
		{
			to: (props as CommonLinkProps<T>).to,
			params: (props as CommonLinkProps<T>).params,
			url: relativeUrl,
		},
		props.external // Disable blocker for external links
	)

	const openingOnNew = shiftOn || props.newTab
	const shouldBeBlocked = result !== false && !openingOnNew
	const message = result as LinkBlockerPopupData

	const [popupOpen, setPopupOpen] = React.useState(false)
	const [redirecting, setRedirecting] = React.useState(false)

	const router = useRouter()
	const goWithNavigate = () => {
		setRedirecting(true)
		router.push(url as RouteLiteral)
	}

	return (props.onlyWithShift && !shiftOn) || props.disabled ? (
		<>{props.children}</>
	) : (
		<>
			{!shouldBeBlocked ? (
				<StyledLink
					// @ts-ignore
					href={url}
					passHref
					sx={{
						...props.sx,
					}}
					style={{
						color: 'inherit',
						textDecoration: 'none',
						...props.style,
					}}
					target={props.newTab ? '_blank' : props.target}
				>
					{props.children}
				</StyledLink>
			) : (
				// Carries the same styling contract as the link above. Dropping it
				// here meant a blocked link silently lost every layout style its
				// caller gave it: the bottom tab bar collapsed to content width on
				// exactly the screens that happen to register a blocker, because each
				// tab's `flex: 1` went with it.
				<Box
					onClick={() => setPopupOpen(true)}
					className={props.className}
					sx={{ cursor: 'pointer', ...props.sx }}
					style={{
						color: 'inherit',
						textDecoration: 'none',
						...props.style,
					}}
				>
					{props.children}
				</Box>
			)}
			<BlockLinkPopup
				open={popupOpen}
				onClose={() => setPopupOpen(false)}
				data={message}
				redirecting={redirecting}
				onSubmit={goWithNavigate}
			/>
		</>
	)
}
