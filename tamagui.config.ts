import { createTamagui, getConfig } from '@tamagui/core'

export const config = createTamagui({
    tokens: {
        size: { sm: 8, md: 12, lg: 20 },
        space: { 0: 0, 1: 4, 2: 8, 3: 12, 4: 16 },
        radius: { none: 0, sm: 3, md: 6, lg: 12 },
        color: {
            white: '#ffffff',
            black: '#000000',
            primary: '#815BF5',
            primaryForeground: '#DDE1EB',
            secondary: '#37384B',
            secondaryForeground: '#DDE1EB',
            muted: '#2B2F3A',
            mutedForeground: '#9FA7C0',
            accent: '#2B2F3A',
            accentForeground: '#DDE1EB',
            destructive: '#8F2323',
            destructiveForeground: '#DDE1EB',
            border: '#2B2F3A',
            input: '#2B2F3A',
            ring: '#7D42FA',
            background: '#0B0F19',
            foreground: '#DDE1EB',
        },
    },

    themes: {
        light: {
            bg: '#0B0F19',
            color: '#DDE1EB',
            primary: '#815BF5',
            primaryForeground: '#DDE1EB',
            secondary: '#2B2F3A',
            secondaryForeground: '#DDE1EB',
            muted: '#2B2F3A',
            mutedForeground: '#9FA7C0',
            accent: '#2B2F3A',
            accentForeground: '#DDE1EB',
            destructive: '#8F2323',
            destructiveForeground: '#DDE1EB',
            border: '#2B2F3A',
            input: '#2B2F3A',
            ring: '#7D42FA',
        },
        dark: {
            bg: '#0B0F19',
            color: '#DDE1EB',
            primary: '#815BF5',
            primaryForeground: '#DDE1EB',
            secondary: '#2B2F3A',
            secondaryForeground: '#DDE1EB',
            muted: '#2B2F3A',
            mutedForeground: '#9FA7C0',
            accent: '#2B2F3A',
            accentForeground: '#DDE1EB',
            destructive: '#8F2323',
            destructiveForeground: '#DDE1EB',
            border: '#2B2F3A',
            input: '#2B2F3A',
            ring: '#7D42FA',
        },
    },

    settings: {
        disableSSR: true,
        allowedStyleValues: 'somewhat-strict-web',
    },
})

console.log(`config is`, getConfig())
export default config

type AppConfig = typeof config
declare module '@tamagui/core' {
    interface TamaguiCustomConfig extends AppConfig { }
}
