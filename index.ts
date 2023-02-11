import type { PipelineOptions, Transform } from "node:stream";
import { PassThrough, Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import nodeFetch, { type RequestInit, type Response } from "node-fetch";
import type { AbortSignal } from "abort-controller";

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
  post(url: string, body: any, options?: RequestInit) {
    return fetch(url, {
      ...options,
      method: "POST",
      body: JSON.stringify(body),
    });
  },
  get(url: string, options?: RequestInit) {
    return fetch(url, { ...options, method: "GET" });
  },
  put(url: string, body: any, options?: RequestInit) {
    return fetch(url, {
      ...options,
      method: "PUT",
      body: JSON.stringify(body),
    });
  },
  delete(url: string, options?: RequestInit) {
    return fetch(url, { ...options, method: "DELETE" });
  },
  head(url: string, options?: RequestInit) {
    return fetch(url, { ...options, method: "HEAD" });
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

export class Client {
  constructor(private baseUrl: string) {}
  private getURL(baseUrl: string, path: string) {
    baseUrl = baseUrl.replace(/\/$/, "");
    path = path.replace(/^\//, "");
    return `${baseUrl}/${path}`;
  }
  fetch(path: string, options?: RequestInit) {
    return fetch(this.getURL(this.baseUrl, path), options);
  }
  stream(path: string, options?: StreamOptions) {
    return nyreFetch.stream(this.getURL(this.baseUrl, path), options);
  }
  post(path: string, body: any, options?: RequestInit) {
    return nyreFetch.post(this.getURL(this.baseUrl, path), body, options);
  }
  get(path: string, options?: RequestInit) {
    return nyreFetch.get(this.getURL(this.baseUrl, path), options);
  }
  put(path: string, body: any, options?: RequestInit) {
    return nyreFetch.put(this.getURL(this.baseUrl, path), body, options);
  }
  delete(path: string, options?: RequestInit) {
    return nyreFetch.delete(this.getURL(this.baseUrl, path), options);
  }
  head(path: string, options?: RequestInit) {
    return nyreFetch.head(this.getURL(this.baseUrl, path), options);
  }
}

export class ExtendReadableStream extends Readable {
  constructor(protected readableStream: NodeJS.ReadableStream) {
    super(readableStream);
  }
  async pipeTo(
    writableStream: NodeJS.WritableStream,
    options?: PipelineOptions
  ): Promise<void> {
    return options
      ? pipeline(
          this.readableStream,
          new PassThrough(),
          writableStream,
          options
        )
      : pipeline(this.readableStream, new PassThrough(), writableStream);
  }
  async pipeThrough(
    transformStream: Transform,
    options?: PipelineOptions
  ): Promise<void> {
    return options
      ? pipeline(
          this.readableStream,
          new PassThrough(),
          transformStream,
          options
        )
      : pipeline(this.readableStream, new PassThrough(), transformStream);
  }
}

export default nyreFetch;
