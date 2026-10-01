import { Box } from '@/common/ui'
import { Pagination } from '@/common/ui/mui'
import { useTranslations } from 'next-intl'
import { ReactNode, useEffect, useMemo, useState } from 'react'

export type PagerProps<T> = {
	children: (data: T[], loading: boolean, startIndex: number) => ReactNode
	take?: number
	allCount?: number
	data: T[] | ((page: number) => Promise<T[]>)
	onPageChange?: (page: number) => void
	startPage?: number
}

export default function Pager<T>({
	children,
	take = 10,
	...props
}: PagerProps<T>) {
	const tPager = useTranslations('pager')
	// MUI writes these in English ("Go to previous page") and they are the only
	// name a screen reader has for an arrow; the page numbers get one too.
	const itemLabel = (type: string, page: number, _selected: boolean) =>
		type === 'previous'
			? tPager('previous')
			: type === 'next'
			? tPager('next')
			: tPager('page', { page: String(page) })

	const staticMode = Array.isArray(props.data)

	const [page, _setPage] = useState(props.startPage ?? 1)
	const pagesCount = useMemo(() => {
		if (staticMode) {
			return Math.ceil((props.data as T[]).length / take)
		}
		return Math.ceil((props.allCount || 0) / take)
	}, [props.allCount, props.data, staticMode, take])

	const [loading, setLoading] = useState(false)

	const [pageData, setPageData] = useState<T[]>([])

	useEffect(() => {
		if (staticMode) {
			setPageData((props.data as T[]).slice((page - 1) * take, page * take))
		} else {
			setLoading(true)

			const func = props.data as (page: number) => Promise<T[]>

			func(page - 1)
				.then((data) => {
					setPageData(data)
				})
				.finally(() => {
					setLoading(false)
				})
		}
	}, [page, props.data, staticMode, take])

	const component = useMemo(
		() => children(pageData, loading, (page - 1) * take),
		[children, pageData, loading, take, page]
	)

	const setPage = (p: number) => {
		_setPage(p)
		props.onPageChange?.(p)
	}

	return (
		<Box display={'flex'} flexDirection={'column'} gap={2}>
			{component}

			{/*-------footer-pagination------ */}
			<Box display={'flex'} justifyContent={'center'}>
				<Pagination
					getItemAriaLabel={itemLabel}
					count={pagesCount}
					page={page}
					onChange={(e, p) => setPage(p)}
					color="primary"
				/>
			</Box>
		</Box>
	)
}
