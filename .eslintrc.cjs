module.exports = {
	root: true,
	extends: ['eslint:recommended', 'plugin:unicorn/recommended', 'prettier'],
	parserOptions: {
		sourceType: 'module',
		ecmaVersion: 2020
	},
	env: {
		browser: true,
		es2017: true,
		node: true
	},
	rules: {
		'no-var': 'error',
		'prefer-const': 'error',
		quotes: ['error', 'single', { avoidEscape: true }],
		'quote-props': ['error', 'as-needed'],
		'no-constant-condition': ['error', { checkLoops: false }],
		'no-duplicate-imports': 'error',
		'no-inner-declarations': 'off'
	}
}
