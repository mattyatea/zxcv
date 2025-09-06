import enTranslations from "../../app/i18n/locales/en.json";
import jaTranslations from "../../app/i18n/locales/ja.json";
// Locale型はlocale.tsからインポートして使用
import type { Locale } from "./locale";

interface Translations {
	[key: string]: string | Translations;
}

const translations: Record<Locale, Translations> = {
	ja: jaTranslations,
	en: enTranslations,
};

/**
 * Server-side translation function
 * @param key Translation key (e.g., "auth.login.errors.invalidCredentials")
 * @param locale User's locale
 * @param params Optional parameters for string interpolation
 * @returns Translated string
 */
export function t(
	key: string,
	locale: Locale = "ja",
	params?: Record<string, string | number>,
): string {
	const keys = key.split(".");
	let translation: string | Translations = translations[locale];

	for (const k of keys) {
		if (translation && typeof translation === "object" && k in translation) {
			translation = translation[k] as string | Translations;
		} else {
			// Return key if translation not found
			return key;
		}
	}

	if (typeof translation !== "string") {
		return key;
	}

	// Replace parameters if provided
	if (params) {
		return translation.replace(/\{(\w+)\}/g, (match, param) => {
			return params[param]?.toString() || match;
		});
	}

	return translation;
}

// Locale型も再エクスポート
export type { Locale } from "./locale";
// locale.tsから再エクスポート
export { detectLocaleFromHeader as getLocaleFromHeader } from "./locale";

// Common error messages for auth procedures
export const authErrors = {
	userExists: (locale: Locale) => t("auth.register.errors.emailExists", locale),
	usernameExists: (locale: Locale) => t("auth.register.errors.usernameExists", locale),
	usernameNotAvailable: (locale: Locale) =>
		locale === "ja" ? "このユーザー名は既に使用されています" : "Username is already taken",
	invalidCredentials: (locale: Locale) => t("auth.login.errors.invalidCredentials", locale),
	emailNotVerified: (locale: Locale) => t("auth.login.errors.emailNotVerified", locale),
	generalError: (locale: Locale) => t("auth.login.errors.generalError", locale),
	registrationFailed: (locale: Locale) => t("auth.register.errors.generalError", locale),
	registrationFailedEmail: (locale: Locale) =>
		locale === "ja"
			? "登録に失敗しました。確認メールを送信できませんでした。サポートにお問い合わせください。"
			: "Registration failed to send verification email. Please contact support if you do not receive it.",
	registrationSuccess: (locale: Locale) =>
		locale === "ja"
			? "登録が完了しました。メールアドレスを確認してアカウントを有効化してください。"
			: "Registration successful. Please check your email to verify your account.",
	loginFailed: (locale: Locale) => (locale === "ja" ? "ログインに失敗しました" : "Login failed"),
	rateLimit: (locale: Locale, seconds?: number) =>
		locale === "ja"
			? seconds
				? `リクエストが多すぎます。${seconds}秒後にもう一度お試しください。`
				: "リクエストが多すぎます。しばらくしてからもう一度お試しください。"
			: seconds
				? `Rate limit exceeded. Please try again in ${seconds} seconds.`
				: "Too many requests. Please try again later.",
	invalidToken: (locale: Locale) =>
		locale === "ja" ? "無効または期限切れのトークンです" : "Invalid or expired token",
	invalidState: (locale: Locale) =>
		locale === "ja" ? "無効または期限切れの状態です" : "Invalid or expired state",
	oauthFailed: (locale: Locale, provider: string) =>
		locale === "ja" ? `${provider}認証に失敗しました` : `${provider} authentication failed`,
	userNotFound: (locale: Locale) =>
		locale === "ja" ? "ユーザーが見つかりません" : "User not found",
	emailVerificationSuccess: (locale: Locale) =>
		locale === "ja"
			? "メールアドレスが確認されました。ログインできます。"
			: "Email verified successfully. You can now log in.",
	passwordResetEmailSent: (locale: Locale) =>
		locale === "ja"
			? "このメールアドレスのアカウントが存在する場合、パスワードリセットリンクが送信されました。"
			: "If an account exists with this email, a password reset link has been sent.",
	passwordResetSuccess: (locale: Locale) =>
		locale === "ja" ? "パスワードがリセットされました" : "Password reset successfully",
	loginSuccess: (locale: Locale) =>
		locale === "ja" ? "ログインに成功しました" : "Login successful",
	logoutSuccess: (locale: Locale) =>
		locale === "ja" ? "ログアウトしました" : "Successfully logged out",
	logoutFailed: (locale: Locale) =>
		locale === "ja" ? "ログアウトに失敗しました" : "Logout failed",
	authRequired: (locale: Locale) =>
		locale === "ja" ? "認証が必要です" : "Authentication required",
	emailVerificationRequired: (locale: Locale) =>
		locale === "ja" ? "メールアドレスの確認が必要です" : "Email verification required",
	internalServerError: (locale: Locale) =>
		locale === "ja" ? "内部サーバーエラーが発生しました" : "Internal server error",
	emailResendSuccess: (locale: Locale) =>
		locale === "ja"
			? "このメールアドレスが存在し、まだ確認されていない場合、確認メールが送信されました。"
			: "If this email address exists and is not already verified, a verification email has been sent.",
	emailResendFailed: (locale: Locale) =>
		locale === "ja"
			? "確認メールの送信に失敗しました。もう一度お試しください。"
			: "Failed to send verification email. Please try again.",
	oauthNoEmail: (locale: Locale, provider: string) =>
		locale === "ja"
			? `${provider}アカウントにメールアドレスが見つかりません`
			: `No email address found in ${provider} account`,
	oauthAuthFailed: (locale: Locale, error: string) =>
		locale === "ja" ? `OAuth認証に失敗しました: ${error}` : `OAuth authentication failed: ${error}`,
	tooManyOAuthAttempts: (locale: Locale) =>
		locale === "ja"
			? "OAuth認証の試行回数が多すぎます。しばらく待ってから再度お試しください。"
			: "Too many OAuth authentication attempts. Please try again later.",
	// User management errors
	emailAlreadyInUse: (locale: Locale) =>
		locale === "ja" ? "このメールアドレスは既に使用されています" : "Email already in use",
	usernameAlreadyInUse: (locale: Locale) =>
		locale === "ja" ? "このユーザー名は既に使用されています" : "Username already in use",
	currentPasswordRequired: (locale: Locale) =>
		locale === "ja" ? "現在のパスワードが必要です" : "Current password is required",
	invalidCurrentPassword: (locale: Locale) =>
		locale === "ja" ? "現在のパスワードが正しくありません" : "Invalid current password",
	invalidConfirmation: (locale: Locale) =>
		locale === "ja" ? "確認テキストが正しくありません" : "Invalid confirmation",
	invalidPassword: (locale: Locale) =>
		locale === "ja" ? "パスワードが正しくありません" : "Invalid password",
	passwordChangeNotAvailable: (locale: Locale) =>
		locale === "ja"
			? "OAuthアカウントではパスワード変更はできません"
			: "Password change not available for OAuth accounts",
	transferOwnershipRequired: (locale: Locale) =>
		locale === "ja"
			? "アカウント削除前に組織の所有権を移譲する必要があります"
			: "You must transfer ownership of your organizations before deleting your account",
	useOAuthProviderToDelete: (locale: Locale) =>
		locale === "ja"
			? "OAuthプロバイダーを使用してアカウントを削除してください"
			: "Please use your OAuth provider to delete your account",
	accountDeletedSuccess: (locale: Locale) =>
		locale === "ja" ? "アカウントが正常に削除されました" : "Account deleted successfully",
	settingsUpdatedSuccess: (locale: Locale) =>
		locale === "ja" ? "設定が正常に更新されました" : "Settings updated successfully",
	passwordChangedSuccess: (locale: Locale) =>
		locale === "ja" ? "パスワードが正常に変更されました" : "Password changed successfully",
	// OAuth and device flow errors
	codeVerifierNotGenerated: (locale: Locale) =>
		locale === "ja" ? "コード検証が生成されませんでした" : "Code verifier not generated",
	invalidCode: (locale: Locale) => (locale === "ja" ? "無効なコードです" : "Invalid code"),
	codeExpired: (locale: Locale) =>
		locale === "ja" ? "コードの有効期限が切れています" : "Code has expired",
	tokenExpired: (locale: Locale) =>
		locale === "ja" ? "トークンの有効期限が切れています" : "Token has expired",
	deviceApproved: (locale: Locale) =>
		locale === "ja" ? "デバイスが正常に承認されました" : "Device approved successfully",
	tokenNotFound: (locale: Locale) =>
		locale === "ja" ? "トークンが見つかりません" : "Token not found",
	tokenRevoked: (locale: Locale) =>
		locale === "ja" ? "トークンが取り消されました" : "Token revoked",
	unsupportedProvider: (locale: Locale) =>
		locale === "ja" ? "サポートされていないプロバイダーです" : "Unsupported provider",
};
