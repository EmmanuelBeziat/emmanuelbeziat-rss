import fs from 'fs/promises'
import jstoxml from 'jstoxml'
import Post from './Post.ts'
import config from '../config.ts'

interface RSSItem {
  item: {
    title: string
    link: string
    description: string
    pubDate: string
    category: string
  }
}

interface XMLOptions {
  header: boolean
  indent: string
}

class RSS {
  private fileName: string
  private encoding: BufferEncoding

  constructor (fileName = 'blog.xml') {
    this.fileName = fileName
    this.encoding = 'utf-8'
  }

  async createFile (): Promise<void> {
    try {
      const posts = await Post.getAllPosts()
      const formattedItems: RSSItem[] = posts.map(post => ({
        item: {
          title: post.title,
          link: `${config.website}/blog/${post.url}`,
          description: post.description,
          pubDate: post.date,
          category: post.category
        }
      }))

      const xmlOptions: XMLOptions = {
        header: true,
        indent: '  '
      }

      const feed = jstoxml.toXML({
        _name: 'rss',
        _attrs: {
          version: '2.0'
        },
        _content: {
          channel: [
            {
              title: 'Emmanuel Béziat',
              link: config.website,
              description: 'Example description'
            },
            formattedItems
          ]
        }
      }, xmlOptions)

      await this.writeFile(config.output ?? './output', feed)
      console.log('RSS feed created successfully')
    }
    catch (error) {
      throw new Error(`Failed to create RSS feed. ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  /**
   * Writes content to a file at the specified path
   * @param path Path to the file to be created
   * @param content Content injected in the file
   */
  private async writeFile (path: string, content: string): Promise<void> {
    try {
      await fs.writeFile(`${path}/${this.fileName}`, content, this.encoding)
    }
    catch (error) {
      throw new Error(`Failed to write file. ${error instanceof Error ? error.message : String(error)}`)
    }
  }
}

export default new RSS()
