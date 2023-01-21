import type { Transform } from "node:stream";
import { pipeline, PassThrough, Readable } from "node:stream";
import { promisify } from "node:util";
import nodeFetch, { type RequestInit, type Response } from "node-fetch";
import type { AbortSignal } from "abort-controller";

const streamPipeline = promisify(pipeline);
const TEN_MEGABYTES = 1000 * 1000 * 10;
type StreamOptions = RequestInit & {
  signal?: AbortSignal;
  highWaterMark?: number;
};

export async function fetch(
  url: string,
  options?: RequestInit
): Promise<Response> {
  return nodeFetch(url, { highWaterMark: TEN_MEGABYTES, ...options });
}

const nyreFetch = {
  post(path: string, body: any, options?: RequestInit) {
    return fetch(path, {
      ...options,
      method: "POST",
      body: JSON.stringify(body),
    });
  },
  get(path: string, options?: RequestInit) {
    return fetch(path, { ...options, method: "GET" });
  },
  put(path: string, body: any, options?: RequestInit) {
    return fetch(path, {
      ...options,
      method: "PUT",
      body: JSON.stringify(body),
    });
  },
  delete(path: string, options?: RequestInit) {
    return fetch(path, { ...options, method: "DELETE" });
  },
  head(path: string, options?: RequestInit) {
    return fetch(path, { ...options, method: "HEAD" });
  },
  async stream(source: string, options?: StreamOptions) {
    const response = await fetch(source, {
      ...options,
      signal: options?.signal,
      highWaterMark: options?.highWaterMark ?? TEN_MEGABYTES,
    });
    if (!response.ok) {
      throw new Error(response.statusText);
    }
    if (!response.body) {
      throw new Error(`No readble stream at source: ${source}`);
    }
    return new ExtendReadableStream(response.body);
  },
};

function getFullURL(baseUrl: string, path: string) {
  baseUrl = baseUrl.replace(/\/$/, "");
  path = path.replace(/^\//, "");
  return `${baseUrl}/${path}`;
}

export class Client {
  constructor(private baseUrl: string) {}
  fetch(path: string, options?: RequestInit) {
    return fetch(getFullURL(this.baseUrl, path), options);
  }
  async stream(path: string, options?: StreamOptions) {
    return nyreFetch.stream(getFullURL(this.baseUrl, path), options);
  }
}

export class ExtendReadableStream extends Readable {
  constructor(private readableStream: NodeJS.ReadableStream) {
    super(readableStream);
  }
  async pipeTo(writableStream: NodeJS.WritableStream): Promise<void> {
    return streamPipeline(
      this.readableStream,
      new PassThrough(),
      writableStream
    );
  }
  async pipeThrough(transformStream: Transform): Promise<void> {
    return streamPipeline(
      this.readableStream,
      new PassThrough(),
      transformStream
    );
  }
}

export default nyreFetch;
