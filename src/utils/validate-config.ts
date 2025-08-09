/**
 * Checks if all required configuration values are present.
 * If a value is missing, it throws an error.
 * Reads live process.env to be test-friendly and reflect runtime state.
 */
export function validateConfig (): void {
	const website = process.env.SITE
	const posts = process.env.POSTS
	const output = process.env.OUTPUT

	if (!website)
		throw new Error('Missing required configuration values: website')

	if (!posts)
		console.warn('POSTS not set, defaulting to ./posts')

	if (!output)
		console.warn('OUTPUT not set, defaulting to ./output')
}
