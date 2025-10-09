import { LayoutProps, MetadataProps } from '@/common/types'
import { Box } from '@/common/ui'
import { generateSmartMetadata } from '@/tech/metadata/metadata'

export const generateMetadata = generateSmartMetadata(
	'variantCards',
	({ params }: MetadataProps<'variantCards'>) => {
		return {
			// title: '💻',
			icons: {
				icon: '/assets/icons/presentation-favicon.png',
			},
		}
	}
)

export default function layout(props: LayoutProps) {
	return <Box>{props.children}</Box>
}
