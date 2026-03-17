'use client'
import { CredentialResponse, GoogleLogin } from '@react-oauth/google'
import { GoogleOAuthScope } from '@/app/components/LazyGoogleOAuthProvider'
import useAuth from '../../../../../hooks/auth/useAuth'
import { useSmartNavigate } from '../../../../../routes/useSmartNavigate'

type GoogleLoginButtonProps = {
	afterLogin?: () => void
}

export default function GoogleLoginButton(props: GoogleLoginButtonProps) {
	const { loginWithGoogle } = useAuth()
	const navigate = useSmartNavigate()
	const onSuccess = (credentialResponse: CredentialResponse) => {
		loginWithGoogle(
			credentialResponse,
			props.afterLogin ||
				(() =>
					navigate('home', {
						hledat: undefined,
					})),
		)
	}

	const onFailure = () => {}

	return (
		<GoogleOAuthScope>
			<GoogleLogin
				onSuccess={onSuccess}
				onError={onFailure}
				useOneTap
				auto_select
				width={300}
			/>
		</GoogleOAuthScope>
	)
}
