'use client'

import { useApi } from '@/api/tech-and-hooks/useApi'
import { SmartPage } from '@/common/components/app/SmartPage/SmartPage'
import { MAIL } from '@/common/constants/contact'
import { Box } from '@/common/ui'
import { Button } from '@/common/ui/Button'
import { StandaloneCard } from '@/common/ui/StandaloneCard'
import { TextInput } from '@/common/ui/TextInput'
import { Typography } from '@/common/ui/Typography'
import { useSmartParams } from '@/routes/useSmartParams'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'

export default SmartPage(ContactPage)

const FEEDBACK_DIV_ID = 'feedback'

function ContactPage() {
	const t = useTranslations('contact')
	const [sent, setSent] = useState(false)
	const [loading, setLoading] = useState(false)

	const { wantToJoin } = useSmartParams('contact')

	const [name, setName] = useState('')
	const [email, setEmail] = useState('')
	const [message, setMessage] = useState('')

	const [first, setFirst] = useState(true)
	useEffect(() => {
		if (!first) return
		if (wantToJoin) {
			document
				.getElementById(FEEDBACK_DIV_ID)
				?.scrollIntoView({ behavior: 'smooth' })

			setMessage(t('form.wantToJoinMessage'))
		}

		setFirst(false)
	}, [wantToJoin, first])

	const { mailApi } = useApi()

	const onSubmitHandle = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()

		setLoading(true)
		mailApi
			.sendFeedbackMail({
				name,
				email,
				message,
			})
			.finally(() => {
				setSent(true)
				setLoading(false)
			})
	}

	const reset = () => {
		setSent(false)
		setName('')
		setEmail('')
		setMessage('')
	}

	return (
		<Box
			display={'flex'}
			alignItems={'center'}
			flexDirection={'column'}
			gap={2}
			marginTop={3}
		>
			<StandaloneCard
				title={t('title')}
				subtitle={t('subtitle')}
			>
				<Box
					display={'flex'}
					flexDirection={'row'}
					gap={1}
					fontSize={'1.1rem'}
					flexWrap={'wrap'}
				>
					<Typography size={'inherit'}>{t('writeToUs')}</Typography>
					<Typography strong size={'inherit'}>
						{MAIL.MAIN}
					</Typography>
				</Box>
			</StandaloneCard>

			<StandaloneCard
				title={wantToJoin ? t('wantToHelp') : t('feedback')}
				variant="secondary"
				subtitle={
					wantToJoin
						? t('wantToJoinDescription')
						: t('feedbackDescription')
				}
			>
				{!sent ? (
					<form
						style={{
							width: '100%',
						}}
						onSubmit={onSubmitHandle}
						id={FEEDBACK_DIV_ID}
					>
						<Box
							sx={{
								display: 'flex',
								flexDirection: 'column',
								gap: 1,
								color: 'grey.800',
							}}
						>
							<Box
								display={'flex'}
								flexDirection={'row'}
								gap={1}
								flexWrap={'wrap'}
							>
								<TextInput
									placeholder={t('form.enterName')}
									required
									title={t('form.yourName')}
									onChange={(e) => setName(e)}
									value={name}
									disabled={loading}
									sx={{
										backgroundColor: 'grey.100',
										minWidth: 140,
										maxWidth: '100%',
									}}
								/>
								<TextInput
									title={t('form.yourEmail')}
									placeholder={t('form.enterEmail')}
									type="email"
									required
									onChange={(e) => setEmail(e)}
									value={email}
									sx={{
										backgroundColor: 'grey.100',
										minWidth: 140,
										maxWidth: '100%',
									}}
									disabled={loading}
								/>
							</Box>
							<TextInput
								title={t('form.message')}
								placeholder={t('form.writeMessage')}
								required
								multiline
								sx={{
									height: '100px',
									overflowY: 'auto',
									backgroundColor: 'grey.100',
									paddingLeft: '10px',
								}}
								onChange={(e) => setMessage(e)}
								value={message}
								disabled={loading}
							/>
							<Box display={'flex'}>
								<Button type="submit" loading={loading}>
									{t('form.sendMessage')}
								</Button>
							</Box>
						</Box>
					</form>
				) : (
					<>
						<Button
							onClick={() => reset()}
							size="small"
							variant="text"
							color="grey.500"
							tooltip={t('form.writeAnother')}
						>
							{t('form.messageSent')}
						</Button>
					</>
				)}
			</StandaloneCard>
		</Box>
	)
}
