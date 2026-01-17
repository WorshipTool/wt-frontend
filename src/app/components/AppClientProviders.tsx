'use client'
import AppSongSelectSpecifierProvider from '@/app/components/components/AppSongSelectSpecifierProvider'
import { FooterProvider } from '@/common/components/Footer/hooks/useFooter'
import { ToolbarProvider } from '@/common/components/Toolbar/hooks/useToolbar'
import ErrorHandlerProvider from '@/common/components/app/providers/ErrorHandlerProvider'
import { AuthProvider } from '@/hooks/auth/useAuth'
import SongDragProvider from '@/hooks/dragsong/SongDragProvider'
import { CurrentPlaylistProvider } from '@/hooks/playlist/useCurrentPlaylist'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { SnackbarProvider } from 'notistack'

import { BottomPanelProvider } from '@/app/providers/BottomPanelProvider'
import { FeatureFlagsProvider } from '@/common/providers/FeatureFlags/FeatureFlagsProvider'
import { NewsProvider, NewsPopup } from '@/common/providers/News'
import { OutsideLinkBlockerProvider } from '@/common/ui/Link/useOutsideBlocker'
import { TranslationLikesProvider } from '@/common/ui/SongCard/hooks/useTranslationsLikes'
import { AllCommonData } from '@/hooks/common-data/common-data.types'
import { CommonDataProvider } from '@/hooks/common-data/useCommonData'
import { FavouritesProvider } from '@/hooks/favourites/useFavourites'
import { PermissionsProvider } from '@/hooks/permissions/usePermissions'
import { SubdomainPathnameAliasProvider } from '@/routes/subdomains/SubdomainPathnameAliasProvider'
import 'dayjs/locale/cs'
type AppClientProvidersProps = {
	initialCommonData: AllCommonData
	test: string
	children?: React.ReactNode
}
export default function AppClientProviders({
	children,
	initialCommonData,
	test,
}: AppClientProvidersProps) {
	return (
		<LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="cs">
			<SnackbarProvider
				maxSnack={1}
				anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
				autoHideDuration={3000}
				preventDuplicate
			>
				{/* <BrowserRouter> */}
				<CommonDataProvider initialData={initialCommonData}>
					<SubdomainPathnameAliasProvider>
						<AuthProvider>
							<FeatureFlagsProvider>
								<NewsProvider>
									<PermissionsProvider>
										<ErrorHandlerProvider>
											<TranslationLikesProvider>
												<BottomPanelProvider>
													<FavouritesProvider>
														<ToolbarProvider>
															<FooterProvider>
																<OutsideLinkBlockerProvider>
																	<AppSongSelectSpecifierProvider>
																		<CurrentPlaylistProvider>
																			<SongDragProvider>
																				{children}
																				<NewsPopup />
																			</SongDragProvider>
																		</CurrentPlaylistProvider>
																	</AppSongSelectSpecifierProvider>
																</OutsideLinkBlockerProvider>
															</FooterProvider>
														</ToolbarProvider>
													</FavouritesProvider>
												</BottomPanelProvider>
											</TranslationLikesProvider>
										</ErrorHandlerProvider>
									</PermissionsProvider>
								</NewsProvider>
							</FeatureFlagsProvider>
						</AuthProvider>
					</SubdomainPathnameAliasProvider>
				</CommonDataProvider>
				{/* </BrowserRouter> */}
			</SnackbarProvider>
		</LocalizationProvider>
	)
}
