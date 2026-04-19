import { defer, from, Observable } from "rxjs"

export function saveFile$(
	directoryHandle: FileSystemDirectoryHandle,
	file: File,
): Observable<void> {
	return defer(async () => {
		const fileHandle = await directoryHandle.getFileHandle(file.name, {
			create: true,
		})

		const writable = await fileHandle.createWritable()

		await writable.write(file)
		await writable.close()
	}).pipe()
}
