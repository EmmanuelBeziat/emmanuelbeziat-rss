import RSS from './classes/RSS.ts'
import { validateConfig } from './utils/validate-config.ts'

// Validate the configuration before running the script
validateConfig()

RSS.createFile()
