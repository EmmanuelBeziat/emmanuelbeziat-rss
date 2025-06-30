import { RSS } from './classes/RSS.ts'
import { Post } from './classes/Post.ts'
import { validateConfig } from './utils/validate-config.ts'

// Validate the configuration before running the script
validateConfig()

const post = new Post()
const rss = new RSS(post)

rss.createFile()
