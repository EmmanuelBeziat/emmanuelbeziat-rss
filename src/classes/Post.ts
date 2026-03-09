import fs from 'fs/promises'
import path from 'path'
import dayjs from 'dayjs'
import matter from 'gray-matter'
import config from '../config.ts'

export interface PostData {
  title: string
  url: string
  description: string
  date: string
  category: string
}

interface PostWithTimestamp extends PostData {
	rawTimestamp: number
}

export class Post {
	private folder: string
	private dateFormat: string
	private encoding: BufferEncoding

	constructor (folder?: string) {
		this.folder = folder ?? config.posts ?? './posts'
		this.dateFormat = 'ddd, DD MMM YYYY HH:mm:ss ZZ'
		this.encoding = 'utf-8'
	}

	/**
   * Generates a slug from a file name by removing the extension and the date prefix.
   * @param fileName The original file name (e.g., '2023-01-01-my-post.md').
   * @returns {string} The generated slug (e.g., 'my-post').
   */
	private slugName (fileName: string): string {
		return fileName.replace(/\.[^/.]+$/, '').replace(/^\d{4}-\d{2}-\d{2}-/, '')
	}

	/**
   * Asynchronously reads all post files from the configured folder, parses them,
   * and returns their metadata and content in a structured format.
   * @returns {Promise<PostData[]>} A promise that resolves to an array of post objects.
   */
	async getAllPosts (limit?: number): Promise<PostData[]> {
		try {
			const dirPath = path.resolve(this.folder)
			const dirEntries = await fs.readdir(dirPath, { withFileTypes: true })

			const files = dirEntries
				.filter(entry => entry.isFile() && entry.name.toLowerCase().endsWith('.md'))
				.map(entry => entry.name)

			const posts: PostWithTimestamp[] = await Promise.all(files.map(async file => {
				const postContent = await fs.readFile(path.resolve(this.folder, file), this.encoding)
				const { data: meta } = matter(postContent)

				const tags = Array.isArray(meta.tags)
					? meta.tags
					: (typeof meta.tags === 'string' ? [meta.tags] : [])

				const rawDate = dayjs(meta.date)

				return {
					title: meta.title ?? this.slugName(file),
					url: this.slugName(file),
					description: meta.description || '',
					date: rawDate.isValid() ? rawDate.format(this.dateFormat) : '',
					category: tags.join(', '),
					rawTimestamp: rawDate.unix()
				}
			}))

			const sorted: PostData[] = posts
				.sort((a, b) => b.rawTimestamp - a.rawTimestamp)
				.map(({ rawTimestamp: _, ...post }) => post)

			return typeof limit === 'number' && limit > 0 ? sorted.slice(0, limit) : sorted
		}
		catch (error) {
			throw new Error(`Failed to load posts. ${error instanceof Error ? error.message : String(error)}`)
		}
	}
}
