import { RSS } from './classes/RSS.ts'
import { Post } from './classes/Post.ts'
import { validateConfig } from './utils/validate-config.ts'

export { RSS } from './classes/RSS.ts'
export { Post } from './classes/Post.ts'
export type { PostData } from './classes/Post.ts'

export async function buildRss ({ limit, outputDir, fileName, postsDir }: { limit?: number; outputDir?: string; fileName?: string; postsDir?: string } = {}): Promise<void> {
	validateConfig()
	const post = new Post(postsDir)
	const rss = new RSS(post, fileName)
	await rss.createFile({ limit, outputDir, fileName })
}
