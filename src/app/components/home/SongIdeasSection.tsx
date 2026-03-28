'use client'

import useRecommendedSongs from '@/app/components/components/RecommendedSongsList/hooks/useRecommendedSongs'
import { Link } from '@/common/ui/Link/Link'
import { parseVariantAlias } from '@/tech/song/variant/variant.utils'
import { BasicVariantPack } from '@/types/song'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import styles from './HomeDesktop.module.css'

function extractPreviewLines(sheetData: string): string {
	if (!sheetData) return ''
	const lines = sheetData
		.split('\n')
		.filter((l) => l.trim() && !l.trim().startsWith('[') && !l.trim().startsWith('{'))
		.slice(0, 2)
	return lines.join(' ').substring(0, 100)
}

function SongIdeaCard({
	song,
	index,
}: {
	song: BasicVariantPack
	index: number
}) {
	const t = useTranslations('home')
	const preview = extractPreviewLines(song.sheetData)

	return (
		<motion.div
			initial={{ opacity: 0, y: 16 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: index * 0.08, duration: 0.4, ease: 'easeOut' }}
		>
			<Link to="variant" params={parseVariantAlias(song.packAlias)}>
				<div className={styles.ideaCard}>
					<div className={styles.ideaCardMeta}>
						{song.verified && (
							<span className={styles.ideaCardBadge}>
								{t('songIdeas.verified')}
							</span>
						)}
					</div>
					<h3 className={styles.ideaCardTitle}>{song.title}</h3>
					{preview && (
						<p className={styles.ideaCardPreview}>{preview}</p>
					)}
				</div>
			</Link>
		</motion.div>
	)
}

function IdeaCardSkeleton() {
	return (
		<div className={styles.skeletonCard} style={{ padding: '1.25rem' }}>
			<div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
				<div className={styles.skeletonLineShort} />
				<div className={styles.skeletonLineMedium} />
				<div className={styles.skeletonLine} />
			</div>
		</div>
	)
}

export default function SongIdeasSection() {
	const t = useTranslations('home')
	const { data, isLoading } = useRecommendedSongs()

	const [init, setInit] = useState(false)
	useEffect(() => {
		setInit(true)
	}, [])

	return (
		<section>
			<div className={styles.sectionHeader}>
				<h2 className={styles.sectionTitle}>{t('songIdeas.title')}</h2>
			</div>
			<div className={styles.ideasGrid}>
				{!init || isLoading
					? Array.from({ length: 4 }).map((_, i) => (
							<IdeaCardSkeleton key={i} />
						))
					: data
							.slice(0, 4)
							.map((song, i) => (
								<SongIdeaCard key={song.packAlias} song={song} index={i} />
							))}
			</div>
		</section>
	)
}
