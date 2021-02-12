import fs from 'fs'
import path from 'path'
import metaMarked from 'meta-marked'
import config from '../config.js'

class Post {
	constructor () {
		this.folder = config.posts
	}

	slugName (fileName) {
		return fileName.replace(/\.[^/.]+$/, '').slice(11)
	}

	/**
	 * Get all posts in a single JSON String
	 */
	getAllPosts () {
		const fileContent = []

		return new Promise((resolve, reject) => {
			fs.readdir(path.resolve(this.folder), 'utf-8', (error, files) => {
				if (error) {
					reject('No folder found')
					return
				}

				files.forEach(file => {
					const post = fs.readFileSync(path.resolve(this.folder, file), 'utf-8')
					const marked = metaMarked(post)

					fileContent.unshift({
						title: marked.meta.title,
						url: this.slugName(file),
						description: marked.meta.description || '',
						date: marked.meta.date || '',
						category: marked.meta.tags.join(', ') || ''
					})
				})

				resolve(fileContent)
			})
		})
	}
}

export default new Post()
