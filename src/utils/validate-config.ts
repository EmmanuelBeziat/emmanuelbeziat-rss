import config from '../config.ts'

/**
 * Checks if all required configuration values are present.
 * If a value is missing, it throws an error.
 */
export function validateConfig (): void {
	const requiredConfig = ['website'] as const
	const missingConfig = requiredConfig.filter(key => !config[key as keyof typeof config])

	if (missingConfig.length > 0)
		throw new Error(`Missing required configuration values: ${missingConfig.join(', ')}`)

	if (!config.posts)
		console.warn('POSTS not set, defaulting to ./posts')

	if (!config.output)
		console.warn('OUTPUT not set, defaulting to ./output')
}
