import fs from 'fs/promises'
import path from 'path'
import dayjs from 'dayjs'
import metaMarked from 'meta-marked'
import config from '../config.js'

class Post {
	constructor () {
		this.folder = config.posts
		this.dateFormat = 'ddd, DD MMM YYYY HH:mm:ss ZZ'
		this.encoding = 'utf-8'
	}

	slugName (fileName) {
		return fileName.replace(/\.[^/.]+$/, '').slice(11)
	}

	/**
   * Asynchronously reads all post files from the configured folder, parses them,
   * and returns their metadata and content in a structured format.
   * @returns {Promise<Array>} A promise that resolves to an array of post objects.
   */
	async getAllPosts () {
		try {
			const files = await fs.readdir(path.resolve(this.folder), this.encoding)
			const posts = await Promise.all(files.map(async (file) => {
				const postContent = await fs.readFile(path.resolve(this.folder, file), this.encoding)
				const marked = metaMarked(postContent)

				return {
					title: marked.meta.title,
					url: this.slugName(file),
					description: marked.meta.description || '',
					date: dayjs(marked.meta.date).format(this.dateFormat) || '',
					category: marked.meta.tags.join(', ') || ''
				}
			}))

			// Sort posts by date
			return posts.sort((a, b) => dayjs(b.date).unix() - dayjs(a.date).unix())
		}
		catch (error) {
			throw new Error(`Failed to load posts. ${error.message}`)
		}
	}
}

export default new Post()
