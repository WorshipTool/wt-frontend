'use client'
import { CreatedType, VariantPackAlias } from '@/api/dtos'
import { PostCreateVariantOutDto } from '@/api/generated'
import WrittenPreview from '@/app/(layout)/vytvorit/napsat/components/WrittenPreview'
import { SmartPage } from '@/common/components/app/SmartPage/SmartPage'
import SheetEditor from '@/common/components/SheetEditor/SheetEditor'
import { useDownSize } from '@/common/hooks/useDownSize'
import { Box, Button, Tooltip } from '@/common/ui'
import { styled } from '@/common/ui/mui'
import { parseVariantAlias } from '@/tech/song/variant/variant.utils'
import CircularProgress from '@mui/material/CircularProgress'
import { useTranslations } from 'next-intl'
import { Sheet } from '@pepavlin/sheet-api'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useApi } from '../../../../api/tech-and-hooks/useApi'
import ContainerGrid from '../../../../common/components/ContainerGrid'
import { Gap } from '../../../../common/ui/Gap'
import { useSmartNavigate } from '../../../../routes/useSmartNavigate'
import { useApiState } from '../../../../tech/ApiState'
import { isSheetDataValid } from '../../../../tech/sheet.tech'
import NotValidWarning from './components/NotValidWarning'

const StyledContainer = styled(Box)(({ theme }) => ({
	padding: theme.spacing(3),
	backgroundColor: theme.palette.grey[100],
	boxShadow: `0px 0px 5px ${theme.palette.grey[400]}`,
	display: 'flex',
}))

export default SmartPage(Create)
function Create() {
	const { songAddingApi } = useApi()
	const {
		fetchApiState,
		apiState: { loading: posting, error },
	} = useApiState<PostCreateVariantOutDto>()

	const t = useTranslations('upload')
	const tCommon = useTranslations('common')

	const sheetInputRef: any = useRef(null)
	const titleInputRef: any = useRef(null)

	const [title, setTitle] = useState('')
	const [sheetData, setSheetData] = useState('')

	const cursorRef = useRef<{ start: number; end: number } | null>() // Ref pro uchování pozice kurzoru

	const navigate = useSmartNavigate()

	const [sheet, setSheet] = useState<Sheet>(new Sheet(sheetData))

	const isSheetValid = useMemo(() => {
		return isSheetDataValid(sheetData)
	}, [sheetData])

	useEffect(() => {
		setSheet(new Sheet(sheetData))
	}, [sheetData])

	const onPostClick = () => {
		fetchApiState(
			async () => {
				return songAddingApi.create({
					title,
					sheetData,
					createdType: CreatedType.Manual,
				})
			},
			(result) => {
				const a = parseVariantAlias(result.alias as VariantPackAlias)
				navigate(
					'variant',
					{
						hex: a.hex,
						alias: a.alias,
					},
					{
						replace: false,
					}
				)
			}
		)
	}

	const isSmall = useDownSize('sm')

	return (
		<>
			<Box flex={1} display={'flex'} flexDirection={'row'}>
				<Box
					sx={{
						flex: 1,
						display: 'flex',
						flexDirection: 'column',
						justifyContent: 'start',
						alignItems: 'center',
					}}
				>
					<ContainerGrid
						direction="column"
						sx={{
							marginTop: 4,
						}}
					>
						<StyledContainer
							sx={{
								display: 'flex',
								flexDirection: isSmall ? 'column' : 'row',
								gap: 1,
							}}
						>
							<SheetEditor
								onTitleChange={setTitle}
								onSheetDataChange={setSheetData}
							/>
							<Box
								flex={1}
								sx={{
									bgcolor: 'grey.200',
									padding: 3,
									borderRadius: 2,
								}}
							>
								<WrittenPreview sheet={sheet} title={title} />
							</Box>
						</StyledContainer>

						<Gap />
						<Box display={'flex'} justifyContent={'start'}>
							<Box flex={1}>
								<Box display={'flex'}>
									<Tooltip title={t('createTooltip')}>
										<Button
											variant={'contained'}
											color={'primary'}
											disabled={
												posting ||
												title == '' ||
												sheetData == '' ||
												!isSheetValid
											}
											onClick={onPostClick}
										>
											{t('createPrivately')}
											{posting && (
												<CircularProgress
													color={'inherit'}
													size={16}
													sx={{ marginLeft: 1 }}
												/>
											)}
										</Button>
									</Tooltip>
								</Box>
								{sheetData !== '' && !isSheetValid && <NotValidWarning />}
							</Box>
						</Box>
					</ContainerGrid>
				</Box>
			</Box>
		</>
	)
}
