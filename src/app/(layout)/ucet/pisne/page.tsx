'use client'
import { useIsPhone } from '@/common/hooks/useIsPhone'
import CreateNewMySongButton from '@/app/(layout)/ucet/pisne/components/CreateNewMySongButton'
import MySongItem from '@/app/(layout)/ucet/pisne/components/MySongItem'
import MySongListOrderSelect, {
	MySongsOrderOptions,
} from '@/app/(layout)/ucet/pisne/components/MySongListOrderSelect'
import MySongsFilterPanel, {
	MySongFilterOption,
} from '@/app/(layout)/ucet/pisne/components/MySongsFilterPanel'
import {
	MobileHeaderPill,
	MobileSongListView,
} from '@/common/components/MobileAppHeader'
import { SmartPage } from '@/common/components/app/SmartPage/SmartPage'
import Pager from '@/common/components/Pager/Pager'
import { Box, LinearProgress } from '@/common/ui'
import { Typography } from '@/common/ui/Typography'
import { useUrlState } from '@/hooks/urlstate/useUrlState'
import { useApiStateEffect } from '@/tech/ApiState'
import { AddRounded } from '@mui/icons-material'
import { useTranslations } from 'next-intl'
import { useMemo, useState } from 'react'
import { mapBasicVariantPackApiToDto } from '../../../../api/dtos'
import { useApi } from '../../../../api/tech-and-hooks/useApi'

export default SmartPage(MySongsList, ['middleWidth'])

function MySongsList() {
	const { songGettingApi } = useApi()
	const t = useTranslations('account.songs')
	const tCommon = useTranslations('common')
	const phoneVersion = useIsPhone()

	const [sortOption, setSortOption] = useUrlState<MySongsOrderOptions>(
		'sortKey',
		'updatedAt'
	)

	const [{ data: allVariants, loading }, reload] = useApiStateEffect(
		async () => {
			const result = await songGettingApi.getSongListOfUser()
			const variants = result.variants.map((variant) => {
				return mapBasicVariantPackApiToDto(variant)
			})
			return variants
		}
	)

	const [filters, setFilters] = useState<MySongFilterOption[]>([])

	const filteredVariants = useMemo(() => {
		return allVariants?.filter((variant) => {
			return filters.length > 0
				? filters.some((filter) => {
						if (filter === 'public') {
							return variant.public
						}
						if (filter === 'private') {
							return !variant.public
						}
						return false
				  })
				: true
		})
	}, [allVariants, filters])

	const variants = useMemo(() => {
		const arr =
			(sortOption === 'updatedAt'
				? filteredVariants?.sort((a, b) => {
						return (
							new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
						)
				  })
				: sortOption === 'createdAt'
				? filteredVariants?.sort((a, b) => {
						return (
							new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
						)
				  })
				: sortOption === 'title'
				? filteredVariants?.sort((a, b) => {
						return a.title.localeCompare(b.title)
				  })
				: filteredVariants) || []

		return [...arr]
	}, [filteredVariants, sortOption])

	if (phoneVersion) {
		return (
			<MobileSongListView
				title={t('title')}
				subtitle={
					loading ? undefined : t('totalSongs', { count: variants.length.toString() })
				}
				backTo="account"
				actions={[
					<MobileHeaderPill
						key="add"
						to="addMenu"
						icon={<AddRounded />}
						alt={tCommon('add')}
					>
						{tCommon('add')}
					</MobileHeaderPill>,
				]}
				items={variants}
				loading={loading}
				emptyText={t('empty')}
				perPage={12}
			/>
		)
	}

	try {
		return (
			<Box paddingTop={7} display={'flex'} flexDirection={'column'} gap={3}>
				<Box display={'flex'} flexDirection={'column'} gap={2}>
					<Box display={'flex'} gap={2} alignItems={'end'} flexWrap={'wrap'}>
						<Typography variant="h4" strong={600}>
							Moje písně
						</Typography>

						{!loading && (
							<Typography thin color="grey.500">
								Celkem {variants?.length} písní
							</Typography>
						)}

						<MySongListOrderSelect
							onChange={setSortOption}
							startValue={sortOption || undefined}
						/>

						{filters.length === 0 && (
							<MySongsFilterPanel
								addedFilters={filters}
								onChange={setFilters}
							/>
						)}

						<Box flex={1} />

						<CreateNewMySongButton />
					</Box>
					{filters.length > 0 && (
						<MySongsFilterPanel addedFilters={filters} onChange={setFilters} />
					)}
				</Box>

				{loading ? (
					<>
						<LinearProgress />
					</>
				) : (
					<>
						{variants.length == 0 ? (
							<>
								<Box
									display={'flex'}
									justifyContent={'center'}
									alignItems={'center'}
									flexDirection={'column'}
									gap={4}
									paddingTop={2}
								>
									<Typography italic>
										Nemáš žádné vytvořené písně{' '}
										{filters.length > 0 ? '(s těmito filtery)' : ''}...{' '}
										{filters.length === 0
											? 'Pro vytvoření klikni na modré tlačítko.'
											: ''}
									</Typography>
									{/* <IconButton to="addMenu">
										<Add />
									</IconButton> */}
								</Box>
							</>
						) : (
							<>
								<Pager data={variants || []} take={5}>
									{(variants, loading, startIndex) => {
										return (
											<Box display={'flex'} flexDirection={'column'} gap={1}>
												{variants.map((variant, index) => {
													return (
														<MySongItem
															variant={variant}
															index={index + startIndex}
															key={`mysong${variant.packGuid}`}
															sortKey={sortOption as MySongsOrderOptions}
															onDelete={reload}
														/>
													)
												})}
											</Box>
										)
									}}
								</Pager>
							</>
						)}
					</>
				)}
			</Box>
		)
	} catch (e) {
		return <Typography>Chyba při načítání písní</Typography>
	}
}
