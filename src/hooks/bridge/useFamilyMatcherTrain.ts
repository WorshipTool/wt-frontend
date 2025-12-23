import { VariantPackGuid } from '@/api/dtos'
import { useApi } from '@/api/tech-and-hooks/useApi'

export interface TrainFamilyMatcherParams {
	packGuid1: VariantPackGuid
	packGuid2: VariantPackGuid
	label: 0 | 1 // 0 = not family, 1 = family
	skipTraining?: boolean // If true, only add to dataset without training
}

export default function useFamilyMatcherTrain() {
	const { bridgeApi, packEmbeddingApi } = useApi()

	const trainFamilyMatcher = async (params: TrainFamilyMatcherParams) => {
		await bridgeApi.trainFamilyMatch({
			packGuid1: params.packGuid1,
			packGuid2: params.packGuid2,
			match: params.label === 1,
			skip_training: params.skipTraining,
		})
	}

	return {
		trainFamilyMatcher,
	}
}
