import config from '../config.ts'

/**
 * Checks if all required configuration values are present.
 * If a value is missing, it throws an error.
 */
export function validateConfig (): void {
  const requiredConfig = ['posts', 'website', 'output']
  const missingConfig = requiredConfig.filter(key => !config[key as keyof typeof config])

  if (missingConfig.length > 0) {
    throw new Error(`Missing required configuration values: ${missingConfig.join(', ')}`)
  }
}
