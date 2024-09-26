describe('Environment Variables', () => {
  it('should have PORT defined', () => {
    expect(process.env.PORT).toBeDefined()
  })

	it('should have Posts environment path defined', () => {
		expect(process.env.POSTS).toBeDefined()
	})

	it('should have Site environment path defined', () => {
		expect(process.env.SITE).toBeDefined()
	})

	it('should have Output environment path defined', () => {
		expect(process.env.OUTPUT).toBeDefined()
	})
})
