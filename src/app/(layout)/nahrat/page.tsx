'use client'
import {
	AddFileToParseQueueOutDto,
	ParserApiAxiosParamCreator,
	ParserSongDataResult,
} from '@/api/generated'
import { useApi } from '@/api/tech-and-hooks/useApi'
import { getUrl } from '@/api/urls'
import { fixParserJsonString } from '@/app/(layout)/vytvorit/components/tech'
import { SmartPage } from '@/common/components/app/SmartPage/SmartPage'
import Popup from '@/common/components/Popup/Popup'
import { Box, Button, Chip, LinearProgress, Typography } from '@/common/ui'
import useAuth from '@/hooks/auth/useAuth'
import { useApiState } from '@/tech/ApiState'
import { handleApiCall } from '@/tech/fetch/handleApiCall'
import { copyToClipboard } from '@/tech/string/copy.tech'
import { AutoAwesome, ContentCopy } from '@mui/icons-material'
import axios from 'axios'
import { useTranslations } from 'next-intl'
import { useSnackbar } from 'notistack'
import { useState } from 'react'
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

	const [open, setOpen] = useState(false)
	const [files, setFiles] = useState<File[] | null>(null)

	const { fetchApiState: fetchUploading, apiState: apiStateUploading } =
		useApiState<AddFileToParseQueueOutDto>()
	const { parserApi } = useApi()

	const t = useTranslations('upload')
	const tCommon = useTranslations('common')

	const parseFiles = async (files: File[]) => {
		if (!user) {
			throw new Error('User is not logged in')
		}

		if (!files) {
			console.log('No files selected')
			return
		}

		reset()

		setFiles(files)
		setOpen(true)

		setLoading(true)

		// Upload
		const res = await fetchUploading(async () => parse(files))

		// Get stream progress
		if (!res) return
		await streamProgress(res.id)
	}

	const reset = () => {
		setProgress(0)
		setStatus(ParserStatus.Unknown)
		setResult(null)
		setLoading(false)
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

		const eventSource = new EventSource(url)

		// Listener pro průběžné hodnoty (např. procenta)
		eventSource.addEventListener('progress', (event) => {
			const p: ProgressObject = JSON.parse(fixParserJsonString(event.data))
			setProgress(p.progress)
			setStatus(p.status)
		})

		// Listener pro finální výsledek
		eventSource.addEventListener('final', (event) => {
			const result: ParserSongDataResult = JSON.parse(
				fixParserJsonString(event.data)
			)
			setResult(result)
			eventSource.close()

			setLoading(false)
		})

		// Listener pro případ chyby
		eventSource.addEventListener('error', (event) => {
			console.error('Stream error:', event)
			eventSource.close()
			setLoading(false)
		})
	}

	const { enqueueSnackbar } = useSnackbar()

	const copy = (sheet: ParserSongDataResult['sheets'][0]) => {
		const data = sheet.data
		copyToClipboard(data)

		enqueueSnackbar(t('songDataCopied'))
	}

	return (
		<>
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

			<Popup
				open={open}
				onClose={() => setOpen(false)}
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
								: status === ParserStatus.Failed
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
				) : (
					<Box>
						<Box
							display={'flex'}
							flexDirection={'column'}
							gap={1}
							maxHeight={500}
							overflow={'auto'}
						>
							{result?.sheets.map((a, index) => {
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
