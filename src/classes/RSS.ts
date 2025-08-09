import fs from 'fs/promises'
import path from 'path'
import jstoxml from 'jstoxml'
import { type Post } from './Post.ts'
import config from '../config.ts'

interface RSSItem {
  item: {
    title: string
    link: string
    description: string
    pubDate: string
    category: string
  }
}

interface XMLOptions {
  header: boolean
  indent: string
}

export class RSS {
	private fileName: string
	private encoding: BufferEncoding
	private post: Post

	constructor (post: Post, fileName = 'blog.xml') {
		this.fileName = fileName
		this.encoding = 'utf-8'
		this.post = post
	}

	buildXml (items: RSSItem[]): string {
		const website = (config.website ?? '').replace(/\/+$/, '')
		const xmlOptions: XMLOptions = {
			header: true,
			indent: '  '
		}

		return jstoxml.toXML({
			_name: 'rss',
			_attrs: { version: '2.0' },
			_content: {
				channel: [
					{ title: 'Emmanuel Béziat' },
					{ link: website },
					{ description: 'Blog' },
					...items
				]
			}
		}, xmlOptions)
	}

	async createFile (options?: { limit?: number; outputDir?: string; fileName?: string }): Promise<void> {
		try {
			const limit = options?.limit
			const posts = await this.post.getAllPosts(limit)
			const website = (config.website ?? '').replace(/\/+$/, '')
			const formattedItems: RSSItem[] = posts.map(post => ({
				item: {
					title: post.title,
					link: `${website}/blog/${post.url}`,
					description: post.description,
					pubDate: post.date,
					category: post.category
				}
			}))

			const feed = this.buildXml(formattedItems)

			const outputDir = options?.outputDir ?? config.output ?? './output'
			const fileName = options?.fileName ?? this.fileName

			await this.writeFile(outputDir, fileName, feed)
			console.log('RSS feed created successfully')
		}
		catch (error) {
			throw new Error(`Failed to create RSS feed. ${error instanceof Error ? error.message : String(error)}`)
		}
	}

	/**
	 * Writes content to a file at the specified path.
	 * @param dir Path to the directory where the file will be created.
	 * @param name File name to write.
	 * @param content Content to be injected in the file.
	 */
	private async writeFile (dir: string, name: string, content: string): Promise<void> {
		try {
			await fs.mkdir(dir, { recursive: true })
			await fs.writeFile(path.join(dir, name), content, this.encoding)
		}
		catch (error) {
			throw new Error(`Failed to write file. ${error instanceof Error ? error.message : String(error)}`)
		}
	}
}

