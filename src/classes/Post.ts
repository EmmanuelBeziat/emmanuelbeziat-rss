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

export class Post {
	private folder: string
	private dateFormat: string
	private encoding: BufferEncoding

	constructor () {
		this.folder = config.posts ?? './posts'
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
	async getAllPosts (): Promise<PostData[]> {
		try {
			const files = await fs.readdir(path.resolve(this.folder), this.encoding)
			const posts = await Promise.all(files.map(async (file) => {
				const postContent = await fs.readFile(path.resolve(this.folder, file), this.encoding)
				const { data: meta } = matter(postContent)

				return {
					title: meta.title,
					url: this.slugName(file),
					description: meta.description || '',
					date: dayjs(meta.date).format(this.dateFormat) || '',
					category: meta.tags.join(', ') || ''
				}
			}))

			// Sort posts by date
			return posts.sort((a, b) => dayjs(b.date).unix() - dayjs(a.date).unix())
		}
		catch (error) {
			throw new Error(`Failed to load posts. ${error instanceof Error ? error.message : String(error)}`)
		}
	}
}

