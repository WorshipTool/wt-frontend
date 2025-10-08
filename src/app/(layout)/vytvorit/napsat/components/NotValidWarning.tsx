import { ListItemText } from '@/common/ui/mui'
import { useTranslations } from 'next-intl'

export default function NotValidWarning() {
	const t = useTranslations('create.validation')
	return (
		<ListItemText
			primary={t('invalidContent')}
			secondary={t('contentRequirements')}
		/>
	)
}
