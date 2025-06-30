import { test, expect } from 'vitest'

describe('Environment Variables', () => {
	test('should have PORT defined', () => {
		expect(process.env.PORT).toBeDefined()
	})

	test('should have Posts environment path defined', () => {
		expect(process.env.POSTS).toBeDefined()
	})

	test('should have Site environment path defined', () => {
		expect(process.env.SITE).toBeDefined()
	})

	test('should have Output environment path defined', () => {
		expect(process.env.OUTPUT).toBeDefined()
	})
})
