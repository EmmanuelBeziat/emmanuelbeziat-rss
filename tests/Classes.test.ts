import { describe, it, expect, vi, beforeEach } from 'vitest'
import { RSS } from '../src/classes/RSS.ts'
import { Post } from '../src/classes/Post.ts'
import fs from 'fs/promises'
import { PostData } from '../src/classes/Post.ts'
import path from 'path'

type ReaddirResult = Awaited<ReturnType<typeof fs.readdir>>

function makeDirent (name: string): { name: string; isFile: () => boolean } {
	return { name, isFile: () => true }
}

vi.mock('fs/promises')

describe('Post', () => {
	let post: Post

	beforeEach(() => {
		post = new Post('./posts')
		vi.clearAllMocks()
	})

	it('should return sorted posts with all fields', async () => {
		vi.mocked(fs.readdir).mockResolvedValue([makeDirent('2023-02-01-my-post.md'), makeDirent('2023-01-01-old-post.md')] as unknown as ReaddirResult)
		vi.mocked(fs.readFile)
			.mockResolvedValueOnce('---\ntitle: Test Post 2\ndate: 2023-02-01\ntags: [news, tech]\ndescription: Second post\n---\nContent')
			.mockResolvedValueOnce('---\ntitle: Test Post 1\ndate: 2023-01-01\ntags: [test]\ndescription: First post\n---\nContent')

		const posts = await post.getAllPosts()

		expect(posts).toHaveLength(2)
		expect(posts[0]).toEqual({
			title: 'Test Post 2',
			url: 'my-post',
			description: 'Second post',
			date: expect.any(String),
			category: 'news, tech'
		})
		expect(posts[0]).not.toHaveProperty('rawTimestamp')
		expect(posts[0].date).not.toBe('')
	})

	it('should sort newer posts first', async () => {
		vi.mocked(fs.readdir).mockResolvedValue([makeDirent('2023-01-01-old.md'), makeDirent('2023-06-15-new.md')] as unknown as ReaddirResult)
		vi.mocked(fs.readFile)
			.mockResolvedValueOnce('---\ntitle: Old\ndate: 2023-01-01\n---\n')
			.mockResolvedValueOnce('---\ntitle: New\ndate: 2023-06-15\n---\n')

		const posts = await post.getAllPosts()
		expect(posts[0].title).toBe('New')
		expect(posts[1].title).toBe('Old')
	})

	it('should respect limit option', async () => {
		vi.mocked(fs.readdir).mockResolvedValue([makeDirent('2023-02-01-test.md'), makeDirent('2023-01-01-test.md')] as unknown as ReaddirResult)
		vi.mocked(fs.readFile)
			.mockResolvedValueOnce('---\ntitle: Test Post 2\ndate: 2023-02-01\ntags: [test]\n---\nContent')
			.mockResolvedValueOnce('---\ntitle: Test Post 1\ndate: 2023-01-01\ntags: [test]\n---\nContent')

		const posts = await post.getAllPosts(1)
		expect(posts).toHaveLength(1)
		expect(posts[0].title).toBe('Test Post 2')
	})

	it('generates slug from file name (removes date prefix and extension)', async () => {
		vi.mocked(fs.readdir).mockResolvedValue([makeDirent('2023-05-20-hello-world.md')] as unknown as ReaddirResult)
		vi.mocked(fs.readFile).mockResolvedValueOnce('---\ntitle: Hello World\ndate: 2023-05-20\n---\n')

		const posts = await post.getAllPosts()
		expect(posts[0].url).toBe('hello-world')
	})

	it('uses file slug as title when title is missing in frontmatter', async () => {
		vi.mocked(fs.readdir).mockResolvedValue([makeDirent('2023-05-20-no-title.md')] as unknown as ReaddirResult)
		vi.mocked(fs.readFile).mockResolvedValueOnce('---\ndate: 2023-05-20\n---\n')

		const posts = await post.getAllPosts()
		expect(posts[0].title).toBe('no-title')
	})

	it('handles posts with missing date without crashing', async () => {
		vi.mocked(fs.readdir).mockResolvedValue([makeDirent('no-date-post.md')] as unknown as ReaddirResult)
		vi.mocked(fs.readFile).mockResolvedValueOnce('---\ntitle: No Date\n---\n')

		const posts = await post.getAllPosts()
		expect(posts).toHaveLength(1)
		expect(posts[0].date).toBe('')
	})

	it('throws an error when reading directory fails', async () => {
		vi.mocked(fs.readdir).mockRejectedValue(new Error('Failed to load posts'))
		await expect(post.getAllPosts()).rejects.toThrow('Failed to load posts')
	})

	it('ignores non-markdown files', async () => {
		vi.mocked(fs.readdir).mockResolvedValue([
			makeDirent('2023-01-01-post.md'),
			makeDirent('image.png'),
			makeDirent('README.txt')
		] as unknown as ReaddirResult)
		vi.mocked(fs.readFile).mockResolvedValueOnce('---\ntitle: Only Post\ndate: 2023-01-01\n---\n')

		const posts = await post.getAllPosts()
		expect(posts).toHaveLength(1)
	})
})

describe('RSS', () => {
	let rss: RSS
	let post: Post

	const mockPosts: PostData[] = [{
		title: 'Test Post',
		url: 'test-post',
		description: 'A description',
		date: 'Mon, 01 Jan 2023 00:00:00 GMT',
		category: 'Tech'
	}]

	beforeEach(() => {
		post = new Post()
		rss = new RSS(post)
		vi.clearAllMocks()
	})

	it('buildXmlFromPosts returns valid XML with correct structure', async () => {
		vi.spyOn(post, 'getAllPosts').mockResolvedValue(mockPosts)

		const xml = await rss.buildXmlFromPosts()

		expect(xml).toContain('<?xml')
		expect(xml).toContain('<rss')
		expect(xml).toContain('version="2.0"')
		expect(xml).toContain('<channel>')
		expect(xml).toContain('<title>Test Post</title>')
		expect(xml).toContain('<description>A description</description>')
	})

	it('buildXmlFromPosts respects limit', async () => {
		vi.spyOn(post, 'getAllPosts').mockResolvedValue(mockPosts)

		await rss.buildXmlFromPosts(1)
		expect(vi.mocked(post.getAllPosts)).toHaveBeenCalledWith(1)
	})

	it('creates a RSS feed and writes to the correct output path', async () => {
		vi.spyOn(post, 'getAllPosts').mockResolvedValue(mockPosts)
		vi.mocked(fs.mkdir).mockResolvedValue(undefined)
		vi.mocked(fs.writeFile).mockResolvedValue()

		await rss.createFile({ outputDir: './dist', fileName: 'feed.xml' })

		expect(fs.mkdir).toHaveBeenCalledWith('./dist', { recursive: true })
		expect(fs.writeFile).toHaveBeenCalledWith(
			path.join('./dist', 'feed.xml'),
			expect.any(String),
			'utf-8'
		)
	})

	it('uses default output dir and fileName when not specified', async () => {
		vi.spyOn(post, 'getAllPosts').mockResolvedValue(mockPosts)
		vi.mocked(fs.mkdir).mockResolvedValue(undefined)
		vi.mocked(fs.writeFile).mockResolvedValue()

		await rss.createFile()

		expect(fs.writeFile).toHaveBeenCalledWith(
			expect.stringContaining('blog.xml'),
			expect.any(String),
			'utf-8'
		)
	})

	it('handles file write errors gracefully', async () => {
		vi.spyOn(post, 'getAllPosts').mockResolvedValue([])
		vi.mocked(fs.mkdir).mockResolvedValue(undefined)
		vi.mocked(fs.writeFile).mockRejectedValue(new Error('Failed to write file'))
		await expect(rss.createFile()).rejects.toThrow('Failed to create RSS feed. Failed to write file')
	})
})
