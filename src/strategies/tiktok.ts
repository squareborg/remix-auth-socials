import type { StrategyVerifyCallback } from 'remix-auth';
import {
	OAuth2Profile,
	OAuth2StrategyVerifyParams,
	OAuth2Strategy,
} from 'remix-auth-oauth2';
import { SocialsProvider } from '..';

/**
 * @see https://developers.Tiktok.com/docs/permissions/reference
 */
export type TiktokScope =
	| 'ads_management'
	| 'ads_read'
	| 'attribution_read'
	| 'catalog_management'
	| 'business_management'
	| 'email'
	| 'gaming_user_locale'
	| 'groups_access_member_info'
	| 'instagram_basic'
	| 'instagram_content_publish'
	| 'instagram_manage_comments'
	| 'instagram_manage_insights'
	| 'instagram_manage_messages'
	| 'leads_retrieval'
	| 'manage_pages'
	| 'page_events'
	| 'pages_manage_ads'
	| 'pages_manage_cta'
	| 'pages_manage_engagement'
	| 'pages_manage_instant_articles'
	| 'pages_manage_metadata'
	| 'pages_manage_posts'
	| 'pages_messaging'
	| 'pages_read_engagement'
	| 'pages_read_user_content'
	| 'pages_show_list'
	| 'pages_user_gender'
	| 'pages_user_locale'
	| 'pages_user_timezone'
	| 'publish_pages'
	| 'public_profile'
	| 'publish_to_groups'
	| 'publish_video'
	| 'read_insights'
	| 'research_apis'
	| 'user_age_range'
	| 'user_birthday'
	| 'user_friends'
	| 'user_gender'
	| 'user_hometown'
	| 'user_likes'
	| 'user_link'
	| 'user_location'
	| 'user_messenger_contact'
	| 'user_photos'
	| 'user_posts'
	| 'user_videos';

export type AdditionalTiktokProfileField =
	| 'about'
	| 'birthday'
	| 'id'
	| 'age_range'
	| 'education'
	| 'email'
	| 'favorite_athletes'
	| 'favorite_teams'
	| 'first_name'
	| 'gender'
	| 'hometown'
	| 'inspirational_people'
	| 'install_type'
	| 'installed'
	| 'is_guest_user'
	| 'languages'
	| 'last_name'
	| 'link'
	| 'location'
	| 'meeting_for'
	| 'middle_name'
	| 'name'
	| 'name_format'
	| 'payment_pricepoints'
	| 'political'
	| 'profile_pic'
	| 'quotes'
	| 'relationship_status'
	| 'shared_login_upgrade_required_by'
	| 'short_name'
	| 'significant_other'
	| 'sports'
	| 'supports_donate_button_in_live_video'
	| 'token_for_business'
	| 'video_upload_limits'
	| 'website';

const baseProfileFields = [
	'id',
	'email',
	'name',
	'first_name',
	'middle_name',
	'last_name',
];

export const TiktokDefaultScopes: TiktokScope[] = ['public_profile', 'email'];
export const TiktokScopeSeperator = ',';

export type TiktokStrategyOptions = {
	clientID: string;
	clientSecret: string;
	callbackURL: string;
	/**
	 * @default ["public_profile", "email"]
	 *
	 * See all the possible scopes:
	 * @see https://developers.Tiktok.com/docs/permissions/reference
	 */
	scope?: TiktokScope[];
	/**
	 * Additional fields that will show up in the profile._json object
	 *
	 * The following fields are included as part of the Oauth2 basic profile
	 * ['id', 'email', 'name', 'first_name', 'middle_name', 'last_name']
	 *
	 * Note: some fields require additional scopes
	 */
	extraProfileFields?: Array<AdditionalTiktokProfileField>;
};

//TODO: Each field has a specific return type which we can map eventually
export type TiktokProfile = {
	id: string;
	displayName: string;
	_json: Record<AdditionalTiktokProfileField, any>;
} & OAuth2Profile;

export type TiktokExtraParams = {
	expires_in: 5183998;
	token_type: 'bearer';
} & Record<string, string | number>;



export class TiktokStrategy<User> extends OAuth2Strategy<
	User,
	TiktokProfile,
	TiktokExtraParams
> {
	public name = SocialsProvider.TIKTOK;
	private readonly scope: TiktokScope[];
	private readonly profileFields: string[];

	private readonly userInfoURL = 'https://graph.Tiktok.com/me';

	constructor(
		{
			clientID,
			clientSecret,
			callbackURL,
			scope,
			extraProfileFields,
		}: TiktokStrategyOptions,
		verify: StrategyVerifyCallback<
			User,
			OAuth2StrategyVerifyParams<TiktokProfile, TiktokExtraParams>
		>,
	) {
		super(
			{
				clientID,
				clientSecret,
				callbackURL,
				authorizationURL: `https://open-api.tiktok.com/platform/oauth/connect/`,
				tokenURL: `https://open-api.tiktok.com/oauth/access_token/`,
			},
			verify,
		);
		this.scope = scope || TiktokDefaultScopes;
		//Ensure unique entries in case they include the base fields
		this.profileFields = Array.from(
			new Set([...baseProfileFields, ...(extraProfileFields || [])]),
		);
	}

	protected authorizationParams(): URLSearchParams {
		const params = new URLSearchParams({
			scope: this.scope.join(TiktokScopeSeperator),
		});

		return params;
	}

	protected async userProfile(accessToken: string): Promise<TiktokProfile> {
		const response = await fetch(
			`${this.userInfoURL}?fields=${this.profileFields.join(',')}`,
			{
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			},
		);
		const raw: TiktokProfile['_json'] = await response.json();
		const profile: TiktokProfile = {
			provider: SocialsProvider.TIKTOK,
			displayName: raw.name,
			id: raw.id,
			name: {
				givenName: raw.first_name,
				middleName: raw.middle_name,
				familyName: raw.last_name,
			},
			emails: [{ value: raw.email }],
			_json: raw,
		};
		return profile;
	}
}
