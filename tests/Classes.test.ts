import { describe, it, expect, vi, beforeEach } from 'vitest'
import { RSS } from '../src/classes/RSS'
import { Post } from '../src/classes/Post'
import fs from 'fs/promises'
import { PostData } from '../src/classes/Post'

vi.mock('fs/promises')

describe('Post', () => {
  let post: Post

  beforeEach(() => {
    post = new Post()
    vi.clearAllMocks()
  })

  it('should return sorted posts', async () => {
    vi.mocked(fs.readdir).mockResolvedValue(['2023-02-01-test.md', '2023-01-01-test.md'] as any)
    vi.mocked(fs.readFile)
      .mockResolvedValueOnce('---\ntitle: Test Post 2\ndate: 2023-02-01\ntags: [test]\n---\nContent')
      .mockResolvedValueOnce('---\ntitle: Test Post 1\ndate: 2023-01-01\ntags: [test]\n---\nContent')

    const posts = await post.getAllPosts()

    expect(posts).toBeDefined()
    expect(posts.length).toBeGreaterThan(0)
    expect(posts[0].title).toBe('Test Post 2')
  })

  it('throws an error when reading files fails', async () => {
    vi.mocked(fs.readdir).mockRejectedValue(new Error('Failed to load posts'))
    await expect(post.getAllPosts()).rejects.toThrow('Failed to load posts')
  })
})

describe('RSS', () => {
  let rss: RSS
  let post: Post

  beforeEach(() => {
    post = new Post()
    rss = new RSS(post)
    vi.clearAllMocks()
  })

  it('creates a RSS feed successfully', async () => {
    const mockPosts: PostData[] = [{
      title: 'Test Post',
      url: 'test-post',
      description: 'Description',
      date: 'Mon, 01 Jan 2023 00:00:00 GMT',
      category: 'Test'
    }]
    vi.spyOn(post, 'getAllPosts').mockResolvedValue(mockPosts)
    vi.mocked(fs.writeFile).mockResolvedValue()

    await rss.createFile()
    expect(fs.writeFile).toHaveBeenCalled()
  })

  it('handles file write errors gracefully', async () => {
    vi.spyOn(post, 'getAllPosts').mockResolvedValue([])
    vi.mocked(fs.writeFile).mockRejectedValue(new Error('Failed to write file'))
    await expect(rss.createFile()).rejects.toThrow('Failed to create RSS feed. Failed to write file')
  })
})
