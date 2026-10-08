import globals from 'globals'
import pluginJs from '@eslint/js'
import tseslint from 'typescript-eslint'

export default tseslint.config(
	{
		ignores: [
			'**/node_modules/**',
			'**/dist/**',
			'**/vendors/**'
		]
	},
	{
		files: ['**/*.{js,mjs,cjs,ts}'],
		extends: [
			pluginJs.configs.recommended,
			...tseslint.configs.recommended
		],
		languageOptions: {
			globals: {
				...globals.node
			}
		},
		rules: {
			indent: ['error', 'tab', { SwitchCase: 1 }],
			'no-tabs': 'off',
			'linebreak-style': ['error', 'unix'],
			quotes: ['error', 'single', { avoidEscape: true }],
			semi: ['error', 'never'],
			'brace-style': ['error', 'stroustrup'],
			'comma-dangle': ['error', 'only-multiline'],
			'no-unused-vars': 'off',
			'@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
			'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
			'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off'
		}
	}
)
