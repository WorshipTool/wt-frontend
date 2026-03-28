'use client'

import SearchedSongsList from '@/app/components/components/SearchedSongsList'
import { Box } from '@/common/ui'
import { styled } from '@mui/system'
import { motion } from 'framer-motion'

const ResultsWrapper = styled(Box)({
	width: '100%',
	maxWidth: 1320,
	marginLeft: 'auto',
	marginRight: 'auto',
	padding: '0 24px 48px',
})

type HomeSearchResultsProps = {
	searchString: string
	useSmartSearch: boolean
}

export default function HomeSearchResults({
	searchString,
	useSmartSearch,
}: HomeSearchResultsProps) {
	return (
		<ResultsWrapper>
			<motion.div
				initial={{ opacity: 0, y: 12 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.3 }}
			>
				<SearchedSongsList
					searchString={searchString}
					useSmartSearch={useSmartSearch}
				/>
			</motion.div>
		</ResultsWrapper>
	)
}
