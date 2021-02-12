module.exports = {
	root: true,
	env: {
		node: true
	},
	parserOptions: {
		parser: 'babel-eslint'
	},
	rules: {
		indent: ['error', 'tab', { SwitchCase: 1 }],
		'brace-style': 0,
		'no-tabs': 0,
		'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
		'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off'
	}
}
