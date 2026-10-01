'use client'
import { useIsPhone } from '@/common/hooks/useIsPhone'
import {
	AddFileToParseQueueOutDto,
	ParserApiAxiosParamCreator,
	ParserSongDataResult,
} from '@/api/generated'
import { useApi } from '@/api/tech-and-hooks/useApi'
import { getUrl } from '@/api/urls'
import { fixParserJsonString } from '@/app/(layout)/vytvorit/components/tech'
import { useBlockAppReload } from '@/app/components/appReloadGuard'
import { MobileAppHeader } from '@/common/components/MobileAppHeader'
import { SmartPage } from '@/common/components/app/SmartPage/SmartPage'
import Popup from '@/common/components/Popup/Popup'
import { Box, Button, Chip, LinearProgress, Typography } from '@/common/ui'
import useAuth from '@/hooks/auth/useAuth'
import { useApiState } from '@/tech/ApiState'
import { handleApiCall } from '@/tech/fetch/handleApiCall'
import { copyToClipboard } from '@/tech/string/copy.tech'
import { AutoAwesome, ContentCopy, ErrorOutlineRounded } from '@mui/icons-material'
import axios from 'axios'
import { useTranslations } from 'next-intl'
import { useSnackbar } from 'notistack'
import { useCallback, useEffect, useRef, useState } from 'react'
import UploadPanel from './components/UploadPanel/UploadPanel'

enum ParserStatus {
	Queued = 0,
	Started = 1,
	Finished = 2,
	Failed = 3,
	Unknown = 4,
}

type ProgressObject = {
	status: ParserStatus
	progress: number
}
export default SmartPage(Upload)
function Upload() {
	const { user, apiConfiguration } = useAuth()

	const [progress, setProgress] = useState(0)
	const [status, setStatus] = useState(ParserStatus.Unknown)
	const [result, setResult] = useState<ParserSongDataResult | null>(null)
	const [loading, setLoading] = useState(false)
	const [failed, setFailed] = useState(false)

	const [open, setOpen] = useState(false)
	const [files, setFiles] = useState<File[] | null>(null)

	// The live progress stream. Kept in a ref so it can be closed when the popup
	// is dismissed, when another upload starts, and on unmount — otherwise two
	// parses write to the same state and whichever finishes last wins.
	const eventSourceRef = useRef<EventSource | null>(null)

	const { fetchApiState: fetchUploading, apiState: apiStateUploading } =
		useApiState<AddFileToParseQueueOutDto>()
	const { parserApi } = useApi()

	const t = useTranslations('upload')
	const tCommon = useTranslations('common')
	const { enqueueSnackbar } = useSnackbar()

	const phoneVersion = useIsPhone()

	const busy = loading || apiStateUploading.loading

	// a reload mid-parse loses the job — the result is only delivered over the stream
	useBlockAppReload(busy, 'parsing an uploaded file')

	const closeStream = useCallback(() => {
		eventSourceRef.current?.close()
		eventSourceRef.current = null
	}, [])

	useEffect(() => closeStream, [closeStream])

	const reset = () => {
		closeStream()
		setProgress(0)
		setStatus(ParserStatus.Unknown)
		setResult(null)
		setLoading(false)
		setFailed(false)
	}

	const parse = async (files: File[]) => {
		const a = await ParserApiAxiosParamCreator(apiConfiguration)
		const parse = await a.parse()
		const url = getUrl(parse.url)

		const form = new FormData()

		for (let i = 0; i < files.length; i++) {
			form.append('file', files[i], files[i].name)
		}

		const result: AddFileToParseQueueOutDto = await handleApiCall(
			axios(url, {
				...parse.options,
				method: 'POST',
				data: form,
			})
		)

		return result
	}

	const streamProgress = async (jobId: string) => {
		// 1. Get url

		const a = await ParserApiAxiosParamCreator(apiConfiguration)
		const parse = await a.getJobStatus(jobId)
		const url = getUrl(parse.url)

		closeStream()
		const eventSource = new EventSource(url)
		eventSourceRef.current = eventSource

		/** Ignore events from a stream that has since been superseded or closed. */
		const isCurrent = () => eventSourceRef.current === eventSource

		// Listener pro průběžné hodnoty (např. procenta)
		eventSource.addEventListener('progress', (event) => {
			if (!isCurrent()) return
			const p: ProgressObject = JSON.parse(fixParserJsonString(event.data))
			setProgress(p.progress)
			setStatus(p.status)
		})

		// Listener pro finální výsledek
		eventSource.addEventListener('final', (event) => {
			if (!isCurrent()) return
			const result: ParserSongDataResult = JSON.parse(
				fixParserJsonString(event.data)
			)
			setResult(result)
			closeStream()
			setLoading(false)
		})

		// Listener pro případ chyby
		eventSource.addEventListener('error', (event) => {
			if (!isCurrent()) return
			console.error('Stream error:', event)
			closeStream()
			setLoading(false)
			setFailed(true)
		})
	}

	const parseFiles = async (files: File[]) => {
		if (!user) {
			enqueueSnackbar(t('loginRequired'), { variant: 'error' })
			return
		}

		if (!files || files.length === 0) {
			return
		}

		// a fast double-tap on the mobile upload button would otherwise start two jobs
		if (busy) return

		reset()

		setFiles(files)
		setOpen(true)

		setLoading(true)

		// Upload
		const res = await fetchUploading(async () => parse(files))

		// Get stream progress
		if (!res) {
			setLoading(false)
			setFailed(true)
			return
		}
		await streamProgress(res.id)
	}

	const closePopup = () => {
		closeStream()
		setLoading(false)
		setOpen(false)
	}

	const retry = () => {
		if (files) parseFiles(files)
	}

	const copy = (sheet: ParserSongDataResult['sheets'][0]) => {
		const data = sheet.data
		copyToClipboard(data)

		enqueueSnackbar(t('songDataCopied'))
	}

	const panel = (
		<Box
			sx={{
				width: '100%',
				height: 500,
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				paddingTop: 5,
			}}
		>
			<Box
				sx={{
					width: '100%',
					height: '100%',
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
				}}
			>
				<UploadPanel onUpload={parseFiles} />
			</Box>
		</Box>
	)

	return (
		<>
			{/* Same panel on both. A phone has no top bar of its own in the app
			    shell, so it gets the mobile header around it. */}
			{phoneVersion ? (
				<MobileAppHeader title={t('uploadFile')} backTo="addMenu">
					{panel}
				</MobileAppHeader>
			) : (
				panel
			)}

			<Popup
				open={open}
				onClose={closePopup}
				width={400}
				title={
					!result ? (
						<Box display={'flex'} gap={1}>
							{apiStateUploading.loading
								? t('uploading')
								: status === ParserStatus.Queued
								? t('queueing')
								: status === ParserStatus.Started
								? t('processing')
								: status === ParserStatus.Finished
								? t('processed')
								: failed || status === ParserStatus.Failed
								? t('errorOccurred')
								: t('pleaseWait')}
						</Box>
					) : (
						<Box display={'flex'} gap={1}>
							{t('processed')}
							{result.useAi && (
								<>
									<Chip
										label={t('withAI')}
										size="small"
										color="success"
										icon={<AutoAwesome />}
									/>
								</>
							)}
						</Box>
					)
				}
			>
				{loading ? (
					<>
						<LinearProgress
							value={progress}
							variant={
								apiStateUploading.loading || progress < 1
									? 'indeterminate'
									: 'determinate'
							}
						/>
					</>
				) : failed || (!result && !busy) ? (
					// a failed parse used to render nothing — an empty white dialog
					<Box
						sx={{
							display: 'flex',
							flexDirection: 'column',
							alignItems: 'center',
							gap: 1,
							paddingY: 3,
						}}
					>
						<ErrorOutlineRounded sx={{ fontSize: 48, color: 'grey.400' }} />
						<Typography color="grey.600">{t('errorOccurred')}</Typography>
						{files && (
							<Button variant="outlined" onClick={retry}>
								{tCommon('tryAgain')}
							</Button>
						)}
					</Box>
				) : (
					<Box>
						<Box
							display={'flex'}
							flexDirection={'column'}
							gap={1}
							maxHeight={500}
							overflow={'auto'}
						>
							{Array.isArray(result?.sheets) && result.sheets.map((a, index) => {
								return (
									<Box
										key={index}
										sx={{
											bgcolor: 'grey.100',
											padding: 2,
											borderRadius: 2,
											border: '1px solid',
											borderColor: 'grey.200',
											display: 'flex',
											flexDirection: 'column',
											gap: 1,
										}}
									>
										<Typography strong>{a.title}</Typography>

										<Box>
											{a.data.split('\n').map((line, index) => {
												return (
													<Typography
														key={index}
														sx={{
															minHeight: '1.2rem',
														}}
													>
														{line}
													</Typography>
												)
											})}
										</Box>
										<Box display={'flex'} justifyContent={'flex-end'}>
											<Button
												size="small"
												variant="text"
												color="grey.700"
												startIcon={<ContentCopy />}
												onClick={() => copy(a)}
											>
												{t('copy')}
											</Button>
										</Box>
									</Box>
								)
							})}
						</Box>
					</Box>
				)}
			</Popup>
		</>
	)
}
