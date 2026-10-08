import fs from 'fs/promises'
import path from 'path'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc.js'
import matter from 'gray-matter'
import config from '../config.js'

dayjs.extend(utc)

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
	 * Returns a frontmatter field that must be a string when present.
	 * Throws on other types (e.g. an unquoted YAML number) instead of passing them through untyped.
	 */
	private optionalString (file: string, field: string, value: unknown): string | undefined {
		if (value === undefined || value === null) return undefined
		if (typeof value !== 'string')
			throw new Error(`${file}: "${field}" must be a string, got ${typeof value}`)
		return value
	}

	/**
	 * Normalizes the `tags` frontmatter field to a list of strings.
	 */
	private tagList (file: string, value: unknown): string[] {
		if (value === undefined || value === null) return []
		const tags: unknown[] = Array.isArray(value) ? value : [value]
		for (const tag of tags) {
			if (typeof tag !== 'string')
				throw new Error(`${file}: every tag must be a string, got ${JSON.stringify(tag)}`)
		}
		return tags as string[]
	}

	/**
	 * Throws if two files map to the same slug, since they would share one feed URL.
	 */
	private assertUniqueSlugs (posts: PostData[], files: string[]): void {
		const seen = new Map<string, string>()
		posts.forEach((post, index) => {
			const previous = seen.get(post.url)
			if (previous)
				throw new Error(`${files[index]}: slug "${post.url}" already used by ${previous}`)
			seen.set(post.url, files[index])
		})
	}

	/**
	 * Asynchronously reads all post files from the configured folder, parses them,
	 * and returns their metadata and content in a structured format.
	 * @returns {Promise<PostData[]>} A promise that resolves to an array of post objects.
	 */
	async getAllPosts (limit?: number): Promise<PostData[]> {
		if (limit !== undefined && !(Number.isInteger(limit) && limit > 0))
			throw new Error(`limit must be a positive integer, got ${limit}`)

		try {
			const dirPath = path.resolve(this.folder)
			const dirEntries = await fs.readdir(dirPath, { withFileTypes: true })

			const files = dirEntries
				.filter(entry => entry.isFile() && entry.name.toLowerCase().endsWith('.md'))
				.map(entry => entry.name)

			const posts: PostWithTimestamp[] = await Promise.all(files.map(async file => {
				const postContent = await fs.readFile(path.resolve(this.folder, file), this.encoding)
				const { data: meta } = matter(postContent)

				const slug = this.slugName(file)
				if (!slug)
					throw new Error(`${file}: file name produces an empty slug`)

				const title = this.optionalString(file, 'title', meta.title) ?? slug
				const description = this.optionalString(file, 'description', meta.description) ?? ''
				const tags = this.tagList(file, meta.tags)

				let rawDate: dayjs.Dayjs | null = null
				if (meta.date === undefined || meta.date === null) {
					console.warn(`${file}: no date in frontmatter, pubDate will be empty`)
				}
				else {
					rawDate = dayjs.utc(meta.date)
					if (!rawDate.isValid())
						throw new Error(`${file}: invalid date "${String(meta.date)}"`)
				}

				return {
					title,
					url: slug,
					description,
					date: rawDate ? rawDate.format(this.dateFormat) : '',
					category: tags.join(', '),
					rawTimestamp: rawDate ? rawDate.unix() : 0
				}
			}))

			this.assertUniqueSlugs(posts, files)

			const sorted: PostData[] = posts
				.sort((a, b) => b.rawTimestamp - a.rawTimestamp)
				.map(({ rawTimestamp: _, ...post }) => post)

			return limit === undefined ? sorted : sorted.slice(0, limit)
		}
		catch (error) {
			throw new Error(`Failed to load posts. ${error instanceof Error ? error.message : String(error)}`, { cause: error })
		}
	}
}
