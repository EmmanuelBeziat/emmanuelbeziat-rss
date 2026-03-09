declare module 'jstoxml' {
	interface XmlOptions {
		header?: boolean
		indent?: string
		[key: string]: unknown
	}
	function toXML(_obj: unknown, _options?: XmlOptions): string
	export { toXML }
}
