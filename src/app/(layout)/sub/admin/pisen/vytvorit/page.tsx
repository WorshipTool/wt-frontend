'use client'

import { PostCreateVariantOutDto } from '@/api/generated'
import { InnerPackProvider } from '@/app/(layout)/pisen/[hex]/[alias]/hooks/useInnerPack'
import { useAdditionInfoAdminSection } from '@/app/(layout)/sub/admin/pisen/vytvorit/useAdditionInfoAdminSection'
import { useMediaAdminSection } from '@/app/(layout)/sub/admin/pisen/vytvorit/useMediaAdminSection'
import usePublishAdminSection from '@/app/(layout)/sub/admin/pisen/vytvorit/usePublishAdminSection'
import { useTextChordAdminSection } from '@/app/(layout)/sub/admin/pisen/vytvorit/useTextChordAdminSection'
import { useValidationAdminSection } from '@/app/(layout)/sub/admin/pisen/vytvorit/useValidationAdminSection'
import { SmartPage } from '@/common/components/app/SmartPage/SmartPage'
import { Box, Button } from '@/common/ui'
import { Step, StepLabel, Stepper } from '@/common/ui/mui'
import { useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'

export default SmartPage(CreateSongPage, [
	'fullWidth',
	'hideFooter',
	'hideMiddleNavigation',
	'darkToolbar',
])

export type AdminStepperItem = {
	label: string
	component: React.ReactNode
	completed?: boolean
	actions?: (cont: () => void, disabledContinue: boolean) => React.ReactNode
	disabledContinue?: boolean
}

const STEP_COUNT = 3

function CreateSongPage() {
	const t = useTranslations('admin.create')
	const [packData, setPackData] = useState<PostCreateVariantOutDto | null>(null)

	const first = useTextChordAdminSection(packData, (data) => {
		setPackData(data)
	})
	const second = useValidationAdminSection(packData!)
	const third = useAdditionInfoAdminSection(packData!)
	const fourth = useMediaAdminSection(packData!)
	const final = usePublishAdminSection(packData!)

	const items: AdminStepperItem[] = useMemo(() => {
		return [first, second, third, fourth, final]
	}, [first, second])

	const [step, setStep] = useState(0)
	const nextStep = () => {
		setStep((prev) => prev + 1)
	}
	const prevStep = () => {
		setStep((prev) => prev - 1)
	}

	return (
		<Box display={'flex'} flexDirection={'column'} gap={2} minHeight={'100%'}>
			<Stepper activeStep={step}>
				{items.map((item, index) => (
					<Step key={index} completed={item.completed}>
						<StepLabel>{item.label}</StepLabel>
					</Step>
				))}
			</Stepper>
			{step > 0 && packData?.alias ? (
				<InnerPackProvider variantAlias={packData?.alias}>
					{items[step]?.component || <Box>{t('unknownStep')}</Box>}
				</InnerPackProvider>
			) : (
				<>{items[step]?.component || <Box>{t('unknownStep')}</Box>}</>
			)}
			<Box flex={1} />
			<Box display={'flex'} gap={2} justifyContent={'space-between'}>
				<Button onClick={prevStep} disabled={step === 0} outlined>
					{t('previous')}
				</Button>

				{items[step]?.actions ? (
					items[step]?.actions(nextStep, items[step]?.disabledContinue || false)
				) : (
					<>
						<Button onClick={nextStep} disabled={items[step]?.disabledContinue}>
							{t('continue')}
						</Button>
					</>
				)}
			</Box>
		</Box>
	)
}
