'use client'
import PopupContainer from '@/common/components/Popup/PopupContainer'
import { POPUP_DIV_CONTAINER_ID } from '@/common/components/Popup/PopupProvider'
import { Box } from '@/common/ui'
import { Gap } from '@/common/ui/Gap'
import { alpha, SxProps } from '@/common/ui/mui'
import { Typography } from '@/common/ui/Typography'
import { AnimatePresence, motion } from 'framer-motion'
import { FormEvent, ReactNode, useEffect, useRef, useState } from 'react'

const POPUP_CONTENT_ID = 'popup-content'

type PopupProps = {
	open: boolean
	onClose?: () => void
	children?: React.ReactNode

	icon?: React.ReactNode
	title?: ReactNode
	subtitle?: string
	actions?: React.ReactNode

	onSubmit?: () => void
	onReset?: () => void

	sx?: SxProps

	width?: number
}
export default function Popup({
	children,
	open = true,
	onClose,
	...props
}: PopupProps) {
	const ref = useRef<HTMLDivElement | null>(null)

	const [mounted, setMounted] = useState(false)

	useEffect(() => {
		ref.current = document.querySelector(`#${POPUP_DIV_CONTAINER_ID}`)
		setMounted(true)
		return () => setMounted(false)
	}, [])

	const onCloseHandle = (e: React.MouseEvent) => {
		if (onClose) {
			onClose()
		}

		e.stopPropagation()
	}
	const onSubmitHandle = (e: FormEvent) => {
		if (props.onSubmit) {
			props.onSubmit()
		}

		e.preventDefault()
	}

	const onResetHandle = (e: FormEvent) => {
		if (props.onReset) {
			props.onReset()
		}

		onClose?.()

		e.preventDefault()
	}

	// On esc key press, close the popup
	useEffect(() => {
		const handleEsc = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				onClose?.()
			}
		}
		document.addEventListener('keydown', handleEsc)
		return () => {
			document.removeEventListener('keydown', handleEsc)
		}
	}, [onClose])

	useEffect(() => {
		if (open) {
			const c: any = document.querySelector(`#${POPUP_CONTENT_ID}`)
			c?.focus()
		}

		document.body.style.overflow = open ? 'hidden' : 'auto'
		document.body.style.paddingRight = open ? '15px' : '0px'

		return () => {
			document.body.style.overflow = 'auto'
		}
	}, [open])

	return ref.current && mounted ? (
		<PopupContainer>
			<AnimatePresence>
				{open && (
					<motion.div
						style={{
							width: '100%',
							height: '100%',
							display: 'flex',
							justifyContent: 'center',
							alignItems: 'center',
							backdropFilter: 'blur(2px)',
							backgroundColor: alpha('#000', 0.5),
							pointerEvents: 'auto',
						}}
						id={POPUP_CONTENT_ID}
						tabIndex={0}
						onKeyDown={(e) => e.stopPropagation()}
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.2 }}
						onClick={onCloseHandle}
					>
						<form onSubmit={onSubmitHandle} onReset={onResetHandle}>
							<Box
								sx={{
									pointerEvents: 'auto',
									padding: 3,
									borderRadius: 3,
									bgcolor: 'white',
									boxShadow: '0px 0px 2px  rgba(0,0,0,0.1)',
									position: 'relative',
									...props.sx,
								}}
								onClick={(e) => e.stopPropagation()}
								display={'flex'}
								flexDirection={'column'}
								gap={1}
								width={props.width}
								maxWidth={`calc(100vw - 4rem)`}
							>
								{(props.title || props.subtitle) && (
									<Box display={'flex'} flexDirection={'column'}>
										{props.title && (
											<Box
												display={'flex'}
												flexDirection={'row'}
												gap={1}
												alignItems={'center'}
											>
												{props.icon}
												<Typography
													variant="h5"
													strong
													sx={{
														display: 'flex',
														flexDirection: 'row',
													}}
												>
													{props.title}
												</Typography>
											</Box>
										)}
										{props.subtitle && (
											<>
												<Typography
													variant="subtitle1"
													strong={500}
													color="grey.600"
												>
													{props.subtitle}
												</Typography>
											</>
										)}
									</Box>
								)}
								{children}

								{props.actions && (
									<Box>
										<Gap value={1} />
										<Box
											display={'flex'}
											flexDirection={'row'}
											justifyContent={'space-between'}
											gap={1}
										>
											{props.actions}
										</Box>
									</Box>
								)}
							</Box>
						</form>
					</motion.div>
				)}
			</AnimatePresence>
		</PopupContainer>
	) : null
}
