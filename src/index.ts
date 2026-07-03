import { RSS } from './classes/RSS'
import { Post } from './classes/Post'
import { validateConfig } from './utils/validate-config'

export { RSS } from './classes/RSS'
export { Post } from './classes/Post'
export type { PostData } from './classes/Post'

export async function buildRss ({ limit, outputDir, fileName, postsDir }: { limit?: number; outputDir?: string; fileName?: string; postsDir?: string } = {}): Promise<void> {
	validateConfig()
	const post = new Post(postsDir)
	const rss = new RSS(post, fileName)
	await rss.createFile({ limit, outputDir, fileName })
}
