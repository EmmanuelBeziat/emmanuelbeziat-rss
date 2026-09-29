#!/usr/bin/env node
import { argv, exit } from 'node:process'
import { buildRss } from './index.js'

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

	// Reads the value following a flag, refusing to silently skip a flag given without one
	const valueFor = (flag: string, i: number): string => {
		const value = args[i + 1]
		if (value === undefined || value.startsWith('--'))
			throw new Error(`${flag} requires a value`)
		return value
	}

	for (let i = 0; i < args.length; i++) {
		const a = args[i]
		if (a === '--posts') {
			opts.posts = valueFor(a, i++)
		}
		else if (a === '--site') {
			// Allow overriding SITE for this run
			process.env.SITE = valueFor(a, i++)
		}
		else if (a === '--output') {
			opts.output = valueFor(a, i++)
		}
		else if (a === '--file-name') {
			opts.fileName = valueFor(a, i++)
		}
		else if (a === '--limit') {
			const raw = valueFor(a, i++)
			const n = Number(raw)
			if (!Number.isInteger(n) || n <= 0)
				throw new Error(`--limit must be a positive integer, got "${raw}"`)
			opts.limit = n
		}
		else if (a === '--stdout') {
			opts.stdout = true
		}
		else if (a === '--help' || a === '-h') {
			printHelp()
			exit(0)
		}
		else {
			throw new Error(`Unknown option: ${a} (see --help)`)
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
		const { Post } = await import('./classes/Post')
		const { RSS } = await import('./classes/RSS')
		const post = new Post(opts.posts)
		const rss = new RSS(post, opts.fileName)
		const xml = await rss.buildXmlFromPosts(opts.limit)
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


