import { Observable, throwError } from "rxjs"
import { fromFetch } from "rxjs/fetch"

const IMAGE_EXTENSIONS = new Map<string, string>()
	.set("image/png", "png")
	.set("image/jpeg", "jpg")
	.set("image/jpg", "jpg")
	.set("image/gif", "gif")
	.set("image/webp", "webp")

function generateFileName(index: number, fileType: string): string {
	const name = String(index).padStart(4, "0")
	const ext = IMAGE_EXTENSIONS.get(fileType) ?? "png"

	return `${name}.${ext}`
}

export function fetchImage(imageSrc: string, index: number): Observable<File> {
	return fromFetch(imageSrc, {
		selector: (response: Response) => {
			const contentType = response.headers.get("content-type") ?? ""
			const lastModified = response.headers.get("last-modified")

			if (/^image\//.test(contentType)) {
				return response.blob().then(
					(blob: Blob) =>
						new File([blob], generateFileName(index, contentType), {
							lastModified: lastModified
								? new Date(lastModified).getTime()
								: Date.now(),
						}),
				)
			}

			return throwError(() => new Error("Not an image"))
		},
	})
}
