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

    if (!response.ok || !response.body) {
      throw new Error(`Failed to read stream path: ${source}`);
    }
    return response.body;
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

export default nyreFetch;
