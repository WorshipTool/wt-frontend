'use client'

import { Link } from '@/common/ui/Link/Link'
import ArrowForward from '@mui/icons-material/ArrowForward'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import styles from './HomeDesktop.module.css'

export default function BrowseAllBanner() {
	const t = useTranslations('home')

	return (
		<motion.section
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: 0.4, duration: 0.5 }}
		>
			<div className={styles.browseBanner}>
				<div className={styles.browseBannerText}>
					<h3 className={styles.browseBannerTitle}>
						{t('browseBanner.title')}
					</h3>
					<p className={styles.browseBannerSubtitle}>
						{t('browseBanner.subtitle')}
					</p>
				</div>
				<Link to="songsList" params={{ s: undefined }}>
					<span className={styles.browseBannerBtn}>
						{t('browseBanner.button')}
						<ArrowForward fontSize="small" />
					</span>
				</Link>
			</div>
		</motion.section>
	)
}
