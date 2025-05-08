export default {
	port: process.env.PORT as number | undefined,
	posts: process.env.POSTS as string | undefined,
	website: process.env.SITE as string | undefined,
	output: process.env.OUTPUT as string | undefined
}