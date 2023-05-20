declare const fetch: typeof import("undici").fetch;
import type { PipelineOptions, Transform } from "node:stream";
import type { RequestInit, Response } from "undici";
import type { AbortSignal } from "abort-controller";
import { PassThrough, Readable } from "node:stream";
import { pipeline } from "node:stream/promises";

type StreamOptions = RequestInit & {
  signal?: AbortSignal;
  highWaterMark?: number;
};

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
      keepalive: true,
    });
    if (!response.ok) {
      throw new Error(response.statusText);
    }
    if (!response.body) {
      throw new Error(`No readable stream at source: ${source}`);
    }
    return new ExtendReadableStream(Readable.from(response.body));
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
    if (!options) {
      return pipeline(this.readableStream, new PassThrough(), writableStream);
    }
    return pipeline(
      this.readableStream,
      new PassThrough(),
      writableStream,
      options
    );
  }
  async pipeThrough(
    transformStream: Transform,
    options?: PipelineOptions
  ): Promise<void> {
    if (!options) {
      return pipeline(this.readableStream, new PassThrough(), transformStream);
    }
    return pipeline(
      this.readableStream,
      new PassThrough(),
      transformStream,
      options
    );
  }
}

export function createClient(baseUrl: string) {
  return new Client(baseUrl);
}

export function handleInternalError(r: Response) {
  class InternalError extends Error {
    private cause: Response;
    constructor(message: string) {
      super(message);
      this.name = "InternalError";
      this.cause = r;
    }
    toString() {
      return { cause: this.cause, message: this.message };
    }
  }
  if (r.ok) return r;
  throw new InternalError(r.statusText);
}

export default nyreFetch;
