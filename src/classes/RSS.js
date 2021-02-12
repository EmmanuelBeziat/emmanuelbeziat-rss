import fs from 'fs'
import jstoxml from 'jstoxml'
import Post from './Post.js'
import config from '../config.js'

class RSS {
	constructor (fileName = 'blog.xml') {
		this.fileName = fileName
	}

	createFile () {
		Post.getAllPosts().then(posts => {
			const formatedItems = []

			posts.forEach(post => {
				formatedItems.push({
					item: {
						title: post.title,
						link: `${config.website}/${post.url}`,
						description: post.description,
						pubDate: post.date,
						category: post.category
					}
				})
			})

			const xmlOptions = {
				header: true,
				indent: '	',
			}

			const feed = jstoxml.toXML({
				_name: 'rss',
				_attrs: {
					version: '2.0',
				},
				_content: {
					channel: [
						{
							title: 'Emmanuel Béziat',
							link: config.website,
							description: 'Example description'
						},

						formatedItems,
					],
				},
			}, xmlOptions)

			this.writeFile(config.output, feed)
		})
	}

	/**
	 * Create a file
	 * @param {string} path Path to the file to be created
	 * @param {string} content Content injected in the file
	 */
	writeFile (path, content) {
		fs.writeFile(`${path}/${this.fileName}`, content, 'utf8', err => {
			if (err) return console.log(err)
		})
	}
}

export default new RSS()
