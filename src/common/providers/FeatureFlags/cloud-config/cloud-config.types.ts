export type BasicCloudConfig = {
	APP_TEMPORARILY_UNAVAILABLE: boolean
	SHOW_LOADING_SCREEN: boolean
	USE_WORSHIP_CZ_VERSION: boolean
}

export type CloudConfigs = {
	basic: BasicCloudConfig
	songPage: {
		SHOW_FINANCIAL_SUPPORT_CARD: boolean
		SHOW_RIGHT_PANEL: boolean
	}
}

export const cloudConfigsNames: Record<keyof CloudConfigs, string> = {
	basic: 'basic_config',
	songPage: 'songpage_config',
}
