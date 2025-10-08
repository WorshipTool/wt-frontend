'use client'
import { Box, Button, LinearProgress, Typography } from '@/common/ui'
import { Sync } from '@mui/icons-material'
import { grey } from '@mui/material/colors'
import { useTranslations } from 'next-intl'
import { memo, useCallback, useEffect, useRef, useState } from 'react'
import ContainerGrid from '../../../common/components/ContainerGrid'
import { Gap } from '../../../common/ui/Gap/Gap'
import useSongSearch from '../../../hooks/song/useSongSearch'
import usePagination from '../../../hooks/usePagination'

import { SearchSongDto } from '@/api/dtos/song/song.search.dto'
import SmartSongListCards from '@/common/components/songLists/SongListCards/SmartSongListCards'
import { useChangeDelayer } from '@/hooks/changedelay/useChangeDelayer'
import { useIsInViewport } from '@/hooks/useIsInViewport'
import { SearchKey } from '@/types/song/search.types'

interface SearchedSongsListProps {
	searchString: string
	useSmartSearch?: boolean
}
const controller = new AbortController()

const SearchedSongsList = memo(function S({
	searchString,
	useSmartSearch,
}: SearchedSongsListProps) {
	const loadNextLevelRef = useRef(null)
	const tHome = useTranslations('home')

	const [loading, setLoading] = useState<boolean>(false)
	const [nextLoading, setNextLoading] = useState<boolean>(false)
	const [enableLoadNext, setEnableLoadNext] = useState<boolean>(false)

	const searchSongs = useSongSearch()

	const func = useCallback(
		(
			page: number,
			resolve: (a: SearchSongDto[]) => void,
			arr: SearchSongDto[]
		) => {
			searchSongs(searchString as SearchKey, {
				page,
				signal: controller.signal,
				useSmartSearch,
			})
				.then((data) => {
					setLoading(false)
					setNextLoading(false)
					resolve(data)
				})
				.catch(() => {
					resolve([])
					setNextLoading(false)
				})
		},
		[searchString, searchSongs, useSmartSearch]
	)

	const {
		nextPage: loadNext,
		loadPage,
		data: songs,
		pagedData: pagedSongs,
		nextExists,
	} = usePagination<SearchSongDto>(func)

	useEffect(() => {
		setEnableLoadNext(false)
		setLoading(true)
	}, [searchString])

	useIsInViewport(loadNextLevelRef, '100px', (intersecting) => {
		if (!enableLoadNext) return
		if (!intersecting) return
		if (songs.length > 0 && nextExists) {
			setNextLoading(true)
			loadNext()
		}
	})
	useChangeDelayer(
		searchString,
		(value) => {
			loadPage(0, true).finally(() => {
				setEnableLoadNext(true)
			})
		},
		[]
	)

	useEffect(() => {
		loadPage(0, true).finally(() => {
			setEnableLoadNext(true)
		})
	}, [useSmartSearch])

	const showMoreButton =
		!loading && songs.length > 0 && (nextExists || useSmartSearch)

	return (
		<ContainerGrid direction="column">
			<>
				<Typography strong key={'results'}>
					{tHome('search.resultsTitle')}
				</Typography>

				{!loading && songs.length > 0 && (
					<SmartSongListCards
						data={songs}
						key={'songlistcards'}
						properties={['SHOW_ADDED_BY_LOADER', 'SHOW_PRIVATE_LABEL']}
					></SmartSongListCards>
				)}
			</>

			<div ref={loadNextLevelRef}></div>

			{loading && (
				<>
					<LinearProgress sx={{ color: grey[500] }} color={'inherit'} />
				</>
			)}

			<>
				{showMoreButton && (
					<>
						<Box
							sx={{
								display: 'flex',
								flexDirection: 'row',
								justifyContent: 'center',
								alignItems: 'center',
							}}
						>
							<Button
								loading={nextLoading}
								loadingPosition="start"
								onClick={() => {
									setNextLoading(true)
									loadNext()
								}}
								variant="text"
								startIcon={<Sync />}
							>
								{tHome('search.loadMore')}
							</Button>
						</Box>
					</>
				)}
			</>

			{!loading && songs.length < 1 && (
				<>
					<Typography>{tHome('search.noResults')}</Typography>
				</>
			)}

			<Gap />
		</ContainerGrid>
	)
})

export default SearchedSongsList
