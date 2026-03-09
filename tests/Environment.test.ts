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

	it('warns about missing POSTS when SITE is provided', () => {
		process.env.SITE = 'https://example.com'
		delete process.env.POSTS
		process.env.OUTPUT = './output'
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
		expect(() => validateConfig()).not.toThrow()
		expect(warn).toHaveBeenCalledWith(expect.stringContaining('POSTS'))
	})

	it('warns about missing OUTPUT when SITE is provided', () => {
		process.env.SITE = 'https://example.com'
		process.env.POSTS = './posts'
		delete process.env.OUTPUT
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
		expect(() => validateConfig()).not.toThrow()
		expect(warn).toHaveBeenCalledWith(expect.stringContaining('OUTPUT'))
	})

	it('warns about both POSTS and OUTPUT when only SITE is provided', () => {
		process.env.SITE = 'https://example.com'
		delete process.env.POSTS
		delete process.env.OUTPUT
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
		expect(() => validateConfig()).not.toThrow()
		expect(warn).toHaveBeenCalledTimes(2)
		expect(warn).toHaveBeenCalledWith(expect.stringContaining('POSTS'))
		expect(warn).toHaveBeenCalledWith(expect.stringContaining('OUTPUT'))
	})

	it('does not warn when all env variables are set', () => {
		process.env.SITE = 'https://example.com'
		process.env.POSTS = './posts'
		process.env.OUTPUT = './output'
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
		expect(() => validateConfig()).not.toThrow()
		expect(warn).not.toHaveBeenCalled()
	})
})
