declare module "*.jpg" {
	const src: string

	export default src
}

interface Window {
	showDirectoryPicker(): Promise<FileSystemDirectoryHandle>
}
