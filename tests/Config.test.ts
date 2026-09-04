import { describe, it, expect, beforeEach } from 'vitest'
import config from '../src/config'

describe('config', () => {
	const originalEnv = { ...process.env }

	beforeEach(() => {
		process.env = { ...originalEnv }
	})

	it('reads current process.env values, not a snapshot taken at import time', () => {
		process.env.SITE = 'https://example.com'
		process.env.POSTS = './my-posts'
		process.env.OUTPUT = './my-output'
		process.env.FEED_TITLE = 'My Feed'
		process.env.FEED_DESCRIPTION = 'My Description'

		expect(config.website).toBe('https://example.com')
		expect(config.posts).toBe('./my-posts')
		expect(config.output).toBe('./my-output')
		expect(config.feedTitle).toBe('My Feed')
		expect(config.feedDescription).toBe('My Description')
	})

	it('reflects a value changed after it was already read once', () => {
		process.env.SITE = 'https://first.example.com'
		expect(config.website).toBe('https://first.example.com')

		process.env.SITE = 'https://second.example.com'
		expect(config.website).toBe('https://second.example.com')
	})

	it('returns undefined for variables that are not set', () => {
		delete process.env.SITE
		expect(config.website).toBeUndefined()
	})
})
