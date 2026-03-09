'use client'
import { Button } from '@/common/ui'
import { Gap } from '@/common/ui/Gap'
import { Lock } from '@mui/icons-material'
import { useSnackbar } from 'notistack'
import React, { useCallback, useEffect } from 'react'
import useAuth from '../../../../hooks/auth/useAuth'
import { useSmartNavigate } from '../../../../routes/useSmartNavigate'
import {
	clientErrorEvent,
	networkErrorEvent,
	norequiredPermissionEvent,
	serviceUnavailableEvent,
	unauthorizedEvent,
} from '../../../../tech/fetch/handleApiCall'

interface ErrorHandlerProviderProps {
	children: React.ReactNode
}

export default function ErrorHandlerProvider(props: ErrorHandlerProviderProps) {
	const { enqueueSnackbar } = useSnackbar()
	const { logout, isAdmin } = useAuth()
	const navigate = useSmartNavigate()

	const ne = useCallback(() => {
		if (!isAdmin()) return
		enqueueSnackbar('Nelze se spojit se serverem.', {
			variant: 'error',
			persist: true,
			preventDuplicate: true,
			action: () => {
				return (
					<Button
						onClick={() => window?.location.reload()}
						color="inherit"
						variant="outlined"
						size="small"
					>
						Zkusit to znovu
					</Button>
				)
			},
		})
	}, [enqueueSnackbar])

	const ue = useCallback(() => {
		logout()
		navigate('login', {
			previousPage: window.location.pathname,
			message: 'Je třeba se znovu přihlásit.',
		})
		enqueueSnackbar('Je třeba se znovu přihlásit.', {
			persist: true,
		})
	}, [enqueueSnackbar, logout, navigate])

	const noPermission = useCallback(() => {
		enqueueSnackbar(
			<>
				<Lock />
				<Gap horizontal />
				Nemáte dostatečná oprávnění.
			</>,
		)
	}, [enqueueSnackbar])

	const serviceUnavailable = useCallback(() => {
		enqueueSnackbar('Služba je dočasně nedostupná. Zkuste to prosím později.', {
			variant: 'error',
			preventDuplicate: true,
		})
	}, [enqueueSnackbar])

	const clientError = useCallback((event: Event) => {
		const detail = (event as CustomEvent<{ error?: Error }>).detail
		const message = detail?.error?.message || 'Nastala neočekávaná chyba.'
		enqueueSnackbar(message, { variant: 'error' })
	}, [enqueueSnackbar])

	useEffect(() => {
		window.addEventListener(networkErrorEvent, ne)
		window.addEventListener(unauthorizedEvent, ue)
		window.addEventListener(norequiredPermissionEvent, noPermission)
		window.addEventListener(serviceUnavailableEvent, serviceUnavailable)
		window.addEventListener(clientErrorEvent, clientError)

		return () => {
			window.removeEventListener(networkErrorEvent, ne)
			window.removeEventListener(unauthorizedEvent, ue)
			window.removeEventListener(norequiredPermissionEvent, noPermission)
			window.removeEventListener(serviceUnavailableEvent, serviceUnavailable)
			window.removeEventListener(clientErrorEvent, clientError)
		}
	}, [ne, ue, noPermission, serviceUnavailable, clientError])
	return <>{props.children}</>
}
