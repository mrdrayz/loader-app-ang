import { fromEvent, EMPTY } from "rxjs"
import { exhaustMap, catchError } from "rxjs/operators"
import { selectDirectory$ } from "./selectDirectory"
import { finalize, tap } from "rxjs/operators"
import { downloadImages$ } from "./downloadImages"
import { collectStatistics$ } from "./downloadImages"

function bootstrap(): void {
	const downloadButton = getDownloadButton()

	const click$ = createDownloadClickStream(downloadButton)

	click$
		.pipe(
			exhaustMap(() =>
				selectDirectory$().pipe(
					exhaustMap((directoryHandle) => {
						downloadButton.disabled = true

						const download$ = downloadImages$(directoryHandle).pipe(
							tap((result) => {
								const message = result.success
									? `${result.fileName} saved`
									: `${result.fileName} failed`

								console.log(message)
							}),
						)

						return collectStatistics$(download$).pipe(
							tap((stats) => {
								console.log("--- Download finished ---")
								console.log(`Total: ${stats.total}`)
								console.log(`Success: ${stats.success}`)
								console.log(`Failed: ${stats.failed}`)
							}),
							finalize(() => {
								downloadButton.disabled = false
							}),
						)
					}),
					catchError(() => EMPTY),
				),
			),
		)
		.subscribe()
}

function createDownloadClickStream(button: HTMLButtonElement) {
	return fromEvent(button, "click")
}

function getDownloadButton(): HTMLButtonElement {
	const element = document.getElementById("downloadButton")

	if (!(element instanceof HTMLButtonElement)) {
		throw new Error("Download button not found")
	}

	return element
}

bootstrap()
