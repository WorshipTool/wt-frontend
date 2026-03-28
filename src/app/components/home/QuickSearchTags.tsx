'use client'

import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import styles from './HomeDesktop.module.css'

type QuickSearchTagsProps = {
	onTagClick: (tag: string) => void
}

export default function QuickSearchTags({ onTagClick }: QuickSearchTagsProps) {
	const t = useTranslations('home')

	const tags: string[] = [
		t('quickTags.worship'),
		t('quickTags.praise'),
		t('quickTags.psalms'),
		t('quickTags.christmas'),
		t('quickTags.easter'),
		t('quickTags.wedding'),
	]

	return (
		<div className={styles.quickTags}>
			{tags.map((tag, i) => (
				<motion.button
					key={tag}
					className={styles.quickTag}
					onClick={() => onTagClick(tag)}
					initial={{ opacity: 0, y: 8 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.3 + i * 0.05, duration: 0.3 }}
					type="button"
				>
					{tag}
				</motion.button>
			))}
		</div>
	)
}
