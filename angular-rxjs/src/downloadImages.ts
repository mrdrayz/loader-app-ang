import { from, Observable, of } from "rxjs"
import { catchError, map, mergeMap } from "rxjs/operators"
import { SOURCE_DATA } from "./SOURCE_DATA"
import { fetchImage } from "./fetchImage"
import { saveFile$ } from "./saveFile"
import { reduce } from "rxjs/operators"

const MAX_CONCURRENT_DOWNLOADS = 3

export interface DownloadResult {
	success: boolean
	fileName: string
}

export interface DownloadStatistics {
	total: number
	success: number
	failed: number
}

export function downloadImages$(
	directoryHandle: FileSystemDirectoryHandle,
): Observable<DownloadResult> {
	return from(SOURCE_DATA).pipe(
		mergeMap(
			(imageSrc: string, index: number) =>
				fetchImage(imageSrc, index).pipe(
					mergeMap((file: File) =>
						saveFile$(directoryHandle, file).pipe(
							map(() => ({
								success: true,
								fileName: file.name,
							})),
						),
					),
					catchError(() =>
						of({
							success: false,
							fileName: `image-${index}`,
						}),
					),
				),
			MAX_CONCURRENT_DOWNLOADS,
		),
	)
}

export function collectStatistics$(
	source$: Observable<DownloadResult>,
): Observable<DownloadStatistics> {
	return source$.pipe(
		reduce(
			(acc: DownloadStatistics, result: DownloadResult) => ({
				total: acc.total + 1,
				success: acc.success + (result.success ? 1 : 0),
				failed: acc.failed + (result.success ? 0 : 1),
			}),
			{
				total: 0,
				success: 0,
				failed: 0,
			},
		),
	)
}
