/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			colors: {
				primary: {
					50: '#f2f8f0',
					100: '#e0eeda',
					200: '#c2ddb7',
					300: '#9cc78a',
					400: '#75ad61',
					500: '#578f45',
					600: '#427236',
					700: '#365b2c',
					800: '#2e4a26',
					900: '#273e21'
				},
				earth: {
					50: '#faf7f2',
					100: '#f1e9db',
					200: '#e2d1b3',
					300: '#cdb285',
					400: '#b6935f',
					500: '#a17b48',
					600: '#87623b',
					700: '#6c4d32',
					800: '#5a402d',
					900: '#4c3628'
				}
			}
		}
	},
	plugins: []
};
