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
				...globals.browser,
				...globals.node
			}
		},
		rules: {
			indent: ['error', 'tab', { SwitchCase: 1 }],
			'no-tabs': 'off',
			'brace-style': 'off',
			'comma-dangle': ['error', 'only-multiline'],
			'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
			'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
			'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off'
		}
	}
)
