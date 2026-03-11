'use client'
import AppSongSelectSpecifierProvider from '@/app/components/components/AppSongSelectSpecifierProvider'
import { FooterProvider } from '@/common/components/Footer/hooks/useFooter'
import { ToolbarProvider } from '@/common/components/Toolbar/hooks/useToolbar'
import ErrorBoundary from '@/common/components/app/ErrorBoundary'
import ErrorHandlerProvider from '@/common/components/app/providers/ErrorHandlerProvider'
import { EditProposalsProvider } from '@/common/components/admin/EditProposals'
import { AuthProvider } from '@/hooks/auth/useAuth'
import SongDragProvider from '@/hooks/dragsong/SongDragProvider'
import { CurrentPlaylistProvider } from '@/hooks/playlist/useCurrentPlaylist'
import { SnackbarProvider } from 'notistack'

import { BottomPanelProvider } from '@/app/providers/BottomPanelProvider'
import { FeatureFlagsProvider } from '@/common/providers/FeatureFlags/FeatureFlagsProvider'
import { NewsProvider } from '@/common/providers/News'
import dynamic from 'next/dynamic'

const NewsPopup = dynamic(
	() => import('@/common/providers/News/NewsPopup').then((mod) => mod.NewsPopup),
	{ ssr: false }
)
import { OutsideLinkBlockerProvider } from '@/common/ui/Link/useOutsideBlocker'
import { TranslationLikesProvider } from '@/common/ui/SongCard/hooks/useTranslationsLikes'
import { AllCommonData } from '@/hooks/common-data/common-data.types'
import { CommonDataProvider } from '@/hooks/common-data/useCommonData'
import { FavouritesProvider } from '@/hooks/favourites/useFavourites'
import { PermissionsProvider } from '@/hooks/permissions/usePermissions'
import { SubdomainPathnameAliasProvider } from '@/routes/subdomains/SubdomainPathnameAliasProvider'
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
		<ErrorBoundary>
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
																				<EditProposalsProvider>
																					{children}
																					<NewsPopup />
																				</EditProposalsProvider>
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
		</ErrorBoundary>
	)
}
