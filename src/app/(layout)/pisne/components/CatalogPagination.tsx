'use client'

import ColumnHeading from '@/app/(layout)/pisne/components/ColumnHeading'
import { Box, Typography } from '@/common/ui'
import { Pagination } from '@/common/ui/mui'
import { useTranslations } from 'next-intl'

/**
 * Where you are in the songbook, in the panel beside it.
 *
 * It used to sit under the list, which on a page of twenty-one songs meant
 * scrolling past all of them to reach it. Here it is in the column beside the
 * list, which travels with the page, so the next page is one click away from
 * anywhere in the current one.
 *
 * Compact on purpose — the column is 260px wide, so the ends and the current
 * page are shown and the rest is ellipsis.
 */
export default function CatalogPagination({
	page,
	pagesCount,
	onChange,
}: {
	/** 1-indexed, as the paginator shows it. */
	page: number
	pagesCount: number
	onChange: (page: number) => void
}) {
	const t = useTranslations('songsList')

	if (pagesCount <= 1) return null

	const current = Math.min(page, pagesCount)

	return (
		<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, minWidth: 0 }}>
			<ColumnHeading label={t('page')}>
				<Typography small color="grey.600">
					{t('pageOf', {
						page: String(current),
						total: String(pagesCount),
					})}
				</Typography>
			</ColumnHeading>

			<Pagination
				count={pagesCount}
				page={current}
				onChange={(_, next) => onChange(next)}
				siblingCount={0}
				boundaryCount={1}
				size="small"
				color="primary"
				sx={{ '& .MuiPagination-ul': { flexWrap: 'nowrap' } }}
			/>
		</Box>
	)
}
