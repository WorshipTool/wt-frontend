'use client'
import {
	AddFileToParseQueueOutDto,
	ParserApiAxiosParamCreator,
	ParserSongDataResult,
} from '@/api/generated'
import { useApi } from '@/api/tech-and-hooks/useApi'
import { getUrl } from '@/api/urls'
import { fixParserJsonString } from '@/app/(layout)/vytvorit/components/tech'
import AdminOption from '@/common/components/admin/AdminOption'
import Popup from '@/common/components/Popup/Popup'
import { Box, Button, Chip, LinearProgress, Typography } from '@/common/ui'
import useAuth from '@/hooks/auth/useAuth'
import { useApiState } from '@/tech/ApiState'
import { handleApiCall } from '@/tech/fetch/handleApiCall'
import { copyToClipboard } from '@/tech/string/copy.tech'
import {
	AutoAwesome,
	CameraEnhance,
	ContentCopy,
	MenuOpen,
} from '@mui/icons-material'
import axios from 'axios'
import { useSnackbar } from 'notistack'
import { useState } from 'react'
import { useTranslations } from 'next-intl'

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

const INPUT_ID = 'parse-image-admin-input'
export default function ParseAdminOption() {
	const t = useTranslations('admin')
	const tCommon = useTranslations('common')
	const tUpload = useTranslations('upload')
	const { isAdmin, user, apiConfiguration } = useAuth()
	const onClick = () => {
		//open file input
		const input = document.getElementById(INPUT_ID)
		if (input) {
			input.click()
		}
	}

	const [progress, setProgress] = useState(0)
	const [status, setStatus] = useState(ParserStatus.Unknown)
	const [result, setResult] = useState<ParserSongDataResult | null>(null)
	const [loading, setLoading] = useState(false)

	const [open, setOpen] = useState(false)
	const [files, setFiles] = useState<File[] | null>(null)

	const { fetchApiState: fetchUploading, apiState: apiStateUploading } =
		useApiState<AddFileToParseQueueOutDto>()
	const { parserApi } = useApi()
	const onChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		if (!isAdmin()) {
			throw new Error('User is not admin')
			return
		}

		const fileList = e.target.files
		if (!fileList) {
			console.log('No files selected')
			return
		}

		reset()

		const files = Array.from(fileList)
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

		// Listener for progress values (e.g. percentages)
		eventSource.addEventListener('progress', (event) => {
			const p: ProgressObject = JSON.parse(fixParserJsonString(event.data))
			setProgress(p.progress)
			setStatus(p.status)
		})

		// Listener for final result
		eventSource.addEventListener('final', (event) => {
			const result: ParserSongDataResult = JSON.parse(
				fixParserJsonString(event.data)
			)
			setResult(result)
			eventSource.close()

			setLoading(false)
		})

		// Listener for error cases
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

		enqueueSnackbar(tUpload('songDataCopied'))
	}

	return (
		<>
			<AdminOption
				title={t('parseFile')}
				subtitle={t('selectFileToProcess')}
				icon={<CameraEnhance />}
				onClick={onClick}
			/>

			<div
				style={{
					display: 'none',
				}}
			>
				<input
					type="file"
					accept="image/*"
					aria-hidden
					multiple
					onChange={onChange}
					id={INPUT_ID}
				/>
			</div>

			<Popup
				open={open}
				onClose={() => setOpen(false)}
				width={400}
				title={
					!result ? (
						<Box display={'flex'} gap={1}>
							{apiStateUploading.loading
								? tUpload('uploading')
								: status === ParserStatus.Queued
								? tUpload('queueing')
								: status === ParserStatus.Started
								? tUpload('processing')
								: status === ParserStatus.Finished
								? tUpload('processed')
								: status === ParserStatus.Failed
								? tUpload('errorOccurred')
								: tUpload('pleaseWait')}
						</Box>
					) : (
						<Box display={'flex'} gap={1}>
							{tUpload('processed')}
							{result.useAi && (
								<>
									<Chip
										label={tUpload('withAI')}
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
								apiStateUploading.loading ? 'indeterminate' : 'determinate'
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
												{tUpload('copy')}
											</Button>
										</Box>
									</Box>
								)
							})}
						</Box>
					</Box>
				)}
			</Popup>

			{apiStateUploading.data && (
				<AdminOption
					icon={<MenuOpen />}
					title={t('openProcessedData')}
					onClick={() => setOpen(true)}
					notify
				/>
			)}
		</>
	)
}
