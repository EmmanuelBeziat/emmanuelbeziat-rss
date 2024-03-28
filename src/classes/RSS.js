import fs from 'fs/promises'
import jstoxml from 'jstoxml'
import Post from './Post.js'
import config from '../config.js'

class RSS {
	constructor (fileName = 'blog.xml') {
		this.fileName = fileName
		this.encoding = 'utf-8'
	}

	async createFile () {
		try {
			const posts = await Post.getAllPosts()
			const formattedItems = posts.map(post => ({
				item: {
					title: post.title,
					link: `${config.website}/blog/${post.url}`,
					description: post.description,
					pubDate: post.date,
					category: post.category
				}
			}))

			const xmlOptions = {
				header: true,
				indent: '  ',
			}

			const feed = jstoxml.toXML({
				_name: 'rss',
				_attrs: {
					version: '2.0',
				},
				_content: {
					channed: [
						{
							title: 'Emmanuel Béziat',
							link: config.website,
							description: 'Example description'
						},
						formattedItems
					]
				}
			}, xmlOptions)

			await this.writeFile(config.output, feed)
			console.log('RSS feed created successfully')
		}
		catch (error) {
			throw new Error('Failed to create RSS feed')
		}
	}

	/**
	 * Writes content to a file at the specified path
	 * @param {string} path Path to the file to be created
	 * @param {string} content Content injected in the file
	 */
	async writeFile (path, content) {
		try {
			await fs.writeFile(`${path}/${this.fileName}`, content, this.encoding)
		}
		catch (error) {
			throw new Error('Failed to write file')
		}
	}
}

export default new RSS()
