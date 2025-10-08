'use client'
import { GetVariantDataOutDto } from '@/api/generated'
import AdminSectionCollapsible from '@/app/(layout)/sub/admin/components/AdminSectionCollapsible'
import AddMediaAdminButton from '@/app/(layout)/sub/admin/pisen/[hex]/[alias]/components/AddMediaAdminButton'
import MediaPlayer from '@/common/components/media/MediaPlayer'
import { Gap } from '@/common/ui'
import { Masonry } from '@/common/ui/Masonry'
import { useTranslations } from 'next-intl'

type Props = {
	data: GetVariantDataOutDto
}
export default function AdminMediaSection({ data }: Props) {
	const t = useTranslations('admin')
	return (
		<AdminSectionCollapsible title={t('mediaSection')}>
			<Gap />
			<AddMediaAdminButton />

			<Gap />
			<Masonry columns={3}>
				{data.media.map((media) => (
					<MediaPlayer
						key={media.guid}
						src={media.url}
						type={media.type}
						maxHeight="140px"
					/>
				))}
			</Masonry>
			{/* <MediaSection media={data.media} /> */}
		</AdminSectionCollapsible>
	)
}
