import RSS from '../src/classes/RSS'
import Post from '../src/classes/Post'
import fs from 'fs/promises'

jest.mock('fs/promises')
jest.mock('../src/classes/Post')

describe('Post', () => {
	/* it ('should return sorted posts', async () => {
		fs.readdir.mockResolvedValue(['2023-01-01-test.md', '2023-02-01-test.md'])
		fs.readFile.mockResolvedValueOnce('---\ntitle: Test Post 1\n---\nContent')
			.mockResolvedValueOnce('---\ntitle: Test Post 2\n---\nContent')

		const posts = await Post.getAllPosts()

		expect(posts).toBeDefined()
		expect(posts.length).toBeGreaterThan(0)
		expect(posts[0].title).toBe('Test Post 2')
	}) */

	/* it ('throws an error when reading files fails', async () => {
		fs.readdir.mockRejectedValue(new Error('Failed to load posts'))
		await expect(Post.getAllPosts()).rejects.toThrow('Failed to load posts')
	}) */
})

describe('RSS', () => {
	it ('creates a RSS feed successfully', async () => {
		Post.getAllPosts.mockResolvedValue([{
			title: 'Test Post',
			url: 'test-post',
			description: 'Description',
			date: 'Mon, 01 Jan 2023 00:00:00 GMT',
			category: 'Test'
		}])
		fs.writeFile.mockResolvedValue()

		await RSS.createFile()
		expect(fs.writeFile).toHaveBeenCalled()
	})

	it ('handles file write errors gracefully', async () => {
		fs.writeFile.mockRejectedValue(new Error('Failed to create RSS feed'))
		await expect(RSS.createFile()).rejects.toThrow('Failed to create RSS feed')
	})
})

