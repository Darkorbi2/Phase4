/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#0a7ea4';
const tintColorDark = '#76DFFF';

export const Colors = {
	light: {
		text: '#11181C',
		background: '#F5F5F7',
		tint: tintColorLight,
		icon: '#687076',
		tabIconDefault: '#687076',
		tabIconSelected: tintColorLight,
		card: '#FFFFFF',
		muted: '#6B7280',
		divider: '#E5E7EB',
		filterBg: '#EBEBED',
		artBg: '#EFF6FF',
		accent: '#0a7ea4',
		accent2: '#7C3AED'
	},
	dark: {
		text: '#FFFBFB',
		background: '#252323',
		tint: tintColorDark,
		icon: '#FFFBFB',
		tabIconDefault: '#FFFBFB',
		tabIconSelected: tintColorDark,
		card: 'rgba(46,46,46,0.40)',
		muted: '#6E7681',
		divider: '#21262D',
		filterBg: '#0D1117',
		artBg: '#1F2937',
		accent: '#76DFFF',
		accent2: '#F472B6'
	}
};

export const Fonts = {
	regular: 'Montserrat_400Regular',
	medium: 'Montserrat_500Medium',
	semiBold: 'Montserrat_600SemiBold',
	bold: 'Montserrat_700Bold'
};
