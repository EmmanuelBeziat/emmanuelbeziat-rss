import { describe, it, expect, beforeEach, vi } from 'vitest'
import { validateConfig } from '../src/utils/validate-config.ts'

describe('Configuration validation', () => {
	const originalEnv = { ...process.env }

	beforeEach(() => {
		process.env = { ...originalEnv }
		vi.restoreAllMocks()
	})

	it('throws if SITE is missing', () => {
		delete process.env.SITE
		expect(() => validateConfig()).toThrow('Missing required configuration values: website')
	})

	it('passes when SITE is provided and warns on defaults for missing POSTS/OUTPUT', () => {
		process.env.SITE = 'https://example.com'
		delete process.env.POSTS
		delete process.env.OUTPUT
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
		expect(() => validateConfig()).not.toThrow()
		expect(warn).toHaveBeenCalled()
	})
})
