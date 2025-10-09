'use client'
import PresentationLayout from '@/common/components/PresentationLayout/PresentationLayout'
import { useSmartNavigate } from '@/routes/useSmartNavigate'
import { useSmartParams } from '@/routes/useSmartParams'
import { BasicVariantPack } from '@/types/song'

type Props = {
	data: BasicVariantPack
}
export default function SongPresentationContainer(props: Props) {
	const navigate = useSmartNavigate()
	const params = useSmartParams('variantCards')
	// const onClick = useCallback(() => {
	const onBackClick = () => {
		navigate('variant', params)
	}
	return <PresentationLayout items={[props.data]} onBackClick={onBackClick} />
}
