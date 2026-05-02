'use client'

import useLastAddedSongs from '@/app/components/components/LastAddedSongsList/hooks/useLastAddedSongs'
import { Link } from '@/common/ui/Link/Link'
import { parseVariantAlias } from '@/tech/song/variant/variant.utils'
import { getSmartDateAgoString } from '@/tech/date/date.tech'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import styles from './HomeDesktop.module.css'

function RecentItemSkeleton() {
	return (
		<div className={styles.skeletonRecentItem}>
			<div className={styles.skeletonCircle} />
			<div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
				<div className={styles.skeletonLineMedium} />
				<div className={styles.skeletonLineShort} style={{ height: 10 }} />
			</div>
		</div>
	)
}

export default function RecentlyAddedSection() {
	const t = useTranslations('home')
	const { data, isLoading } = useLastAddedSongs()

	const [init, setInit] = useState(false)
	useEffect(() => {
		setInit(true)
	}, [])

	const displayCount = 8

	return (
		<section>
			<div className={styles.sectionHeader}>
				<h2 className={styles.sectionTitle}>{t('recentlyAdded.title')}</h2>
			</div>
			<div className={styles.recentList}>
				{!init || isLoading
					? Array.from({ length: displayCount }).map((_, i) => (
							<RecentItemSkeleton key={i} />
						))
					: data.slice(0, displayCount).map((song, i) => (
							<motion.div
								key={song.packAlias}
								initial={{ opacity: 0, x: -12 }}
								animate={{ opacity: 1, x: 0 }}
								transition={{
									delay: i * 0.05,
									duration: 0.35,
									ease: 'easeOut',
								}}
							>
								<Link
									to="variant"
									params={parseVariantAlias(song.packAlias)}
								>
									<div className={styles.recentItem}>
										<span className={styles.recentIndex}>
											{String(i + 1).padStart(2, '0')}
										</span>
										<div className={styles.recentInfo}>
											<p className={styles.recentTitle}>{song.title}</p>
											{song.publishedAt && (
												<p className={styles.recentDate}>
													{getSmartDateAgoString(song.publishedAt)}
												</p>
											)}
										</div>
									</div>
								</Link>
								{i < Math.min(data.length, displayCount) - 1 && (
									<div className={styles.recentDivider} />
								)}
							</motion.div>
						))}
			</div>
		</section>
	)
}
