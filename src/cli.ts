#!/usr/bin/env node
import { argv, exit } from 'node:process'
import { buildRss } from './index.ts'

type CliOptions = {
	posts?: string
	site?: string
	output?: string
	fileName?: string
	limit?: number
	stdout?: boolean
}

function parseArgs (): CliOptions {
	const args = argv.slice(2)
	const opts: CliOptions = {}
	for (let i = 0; i < args.length; i++) {
		const a = args[i]
		if (a === '--posts' && args[i + 1]) {
			opts.posts = args[++i]
		}
		else if (a === '--site' && args[i + 1]) {
			// Allow overriding SITE for this run
			process.env.SITE = args[++i]
		}
		else if (a === '--output' && args[i + 1]) {
			opts.output = args[++i]
		}
		else if (a === '--file-name' && args[i + 1]) {
			opts.fileName = args[++i]
		}
		else if (a === '--limit' && args[i + 1]) {
			const n = Number(args[++i])
			if (!Number.isNaN(n) && n > 0) opts.limit = n
		}
		else if (a === '--stdout') {
			opts.stdout = true
		}
		else if (a === '--help' || a === '-h') {
			printHelp()
			exit(0)
		}
	}
	return opts
}

function printHelp () {
	console.log(`Usage: rss-build [options]
Options:
  --posts <dir>       Posts directory (overrides POSTS)
  --site <url>        Website URL (overrides SITE)
  --output <dir>      Output directory (overrides OUTPUT)
  --file-name <name>  Output file name (default: blog.xml)
  --limit <n>         Limit number of posts
  --stdout            Print XML to stdout instead of writing file
  -h, --help          Show help`)
}

async function main () {
	const opts = parseArgs()

	if (opts.stdout) {
		// Build XML to stdout: use internal API pieces
		const { Post } = await import('./classes/Post.ts')
		const { RSS } = await import('./classes/RSS.ts')
		const post = new Post(opts.posts)
		const rss = new RSS(post, opts.fileName)

		const posts = await post.getAllPosts(opts.limit)
		const website = (process.env.SITE ?? '').replace(/\/+$/, '')
		const items = posts.map(p => ({
			item: {
				title: p.title,
				link: `${website}/blog/${p.url}`,
				description: p.description,
				pubDate: p.date,
				category: p.category
			}
		}))
		const xml = rss.buildXml(items)
		console.log(xml)
		return
	}

	await buildRss({
		postsDir: opts.posts,
		outputDir: opts.output,
		fileName: opts.fileName,
		limit: opts.limit
	})
}

main().catch(err => {
	console.error(err instanceof Error ? err.message : String(err))
	exit(1)
})


