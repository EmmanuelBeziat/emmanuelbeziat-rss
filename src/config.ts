export default {
	posts: process.env.POSTS as string | undefined,
	website: process.env.SITE as string | undefined,
	output: process.env.OUTPUT as string | undefined,
	feedTitle: process.env.FEED_TITLE as string | undefined,
	feedDescription: process.env.FEED_DESCRIPTION as string | undefined
}
