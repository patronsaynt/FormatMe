// macOS WKWebView (the Tauri runtime) doesn't implement async iteration of
// ReadableStream. pdf.js's getTextContent() async-iterates the text stream, so
// PDF *import* (text extraction) throws:
//   "TypeError: undefined is not a function (near '...value of readableStream...')"
// (Preview rendering works because it never iterates a text stream.)
//
// This adds the standard `values()` / [Symbol.asyncIterator] implementation,
// only when missing, so it's a no-op on Chromium/WebView2/WebKitGTK.

interface AsyncIterableReadable<R = unknown> {
  values?: (opts?: { preventCancel?: boolean }) => AsyncIterableIterator<R>;
  getReader: () => ReadableStreamDefaultReader<R>;
}

export function installReadableStreamAsyncIterator(): void {
  if (typeof ReadableStream === "undefined") return;
  const proto = ReadableStream.prototype as unknown as Record<symbol | string, unknown>;
  if (proto[Symbol.asyncIterator]) return;

  function values<R>(
    this: AsyncIterableReadable<R>,
    { preventCancel = false }: { preventCancel?: boolean } = {},
  ): AsyncIterableIterator<R> {
    const reader = this.getReader();
    return {
      async next() {
        try {
          const result = await reader.read();
          if (result.done) reader.releaseLock();
          return result as IteratorResult<R>;
        } catch (e) {
          reader.releaseLock();
          throw e;
        }
      },
      async return(value?: unknown) {
        if (!preventCancel) {
          const cancelPromise = reader.cancel(value);
          reader.releaseLock();
          await cancelPromise;
        } else {
          reader.releaseLock();
        }
        return { done: true, value } as IteratorResult<R>;
      },
      [Symbol.asyncIterator]() {
        return this;
      },
    };
  }

  proto["values"] = values;
  proto[Symbol.asyncIterator] = values;
}
