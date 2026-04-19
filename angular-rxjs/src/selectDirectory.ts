import { defer, from, Observable, throwError } from "rxjs"
import { catchError } from "rxjs/operators"

export function selectDirectory$(): Observable<FileSystemDirectoryHandle> {
	return defer(() => from(window.showDirectoryPicker())).pipe(
		catchError((error: unknown) => {
			if (isAbortError(error)) {
				return throwError(
					() => new Error("Directory selection cancelled"),
				)
			}

			return throwError(() => error)
		}),
	)
}

function isAbortError(error: unknown): boolean {
	return error instanceof DOMException && error.name === "AbortError"
}
