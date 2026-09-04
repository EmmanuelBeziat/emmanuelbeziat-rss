export default {
	get posts (): string | undefined {
		return process.env.POSTS
	},
	get website (): string | undefined {
		return process.env.SITE
	},
	get output (): string | undefined {
		return process.env.OUTPUT
	},
	get feedTitle (): string | undefined {
		return process.env.FEED_TITLE
	},
	get feedDescription (): string | undefined {
		return process.env.FEED_DESCRIPTION
	}
}
