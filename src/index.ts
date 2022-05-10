export * from './strategies/discord';
export * from './strategies/google';
export * from './strategies/github';
export * from './strategies/facebook';
export * from './strategies/microsoft';
export * from './strategies/tiktok';

export enum SocialsProvider {
    GOOGLE = 'google',
    DISCORD = 'discord',
    GITHUB = 'github',
    FACEBOOK = 'facebook',
    MICROSOFT = 'microsoft',
    TIKTOK = 'tiktok'
}