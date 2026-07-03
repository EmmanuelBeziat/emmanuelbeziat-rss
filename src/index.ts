import { RSS } from './classes/RSS.js'
import { Post } from './classes/Post.js'
import { validateConfig } from './utils/validate-config.js'

export { RSS } from './classes/RSS.js'
export { Post } from './classes/Post.js'
export type { PostData } from './classes/Post.js'

export async function buildRss ({ limit, outputDir, fileName, postsDir }: { limit?: number; outputDir?: string; fileName?: string; postsDir?: string } = {}): Promise<void> {
	validateConfig()
	const post = new Post(postsDir)
	const rss = new RSS(post, fileName)
	await rss.createFile({ limit, outputDir, fileName })
}
