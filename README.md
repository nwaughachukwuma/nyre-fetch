# Nyre-Fetch

Nyre-Fetch is a simple Node.js wrapper built on top of node-fetch with a few extra features.

## Installation

```bash
npm install nyre-fetch
```

## Features

- Supports everything [node-fetch](https://github.com/node-fetch/node-fetch) supports
- Simplified API for HTTP methods (`get`, `post`, `put`, `delete`, & `head`)
- Supports `stream.pipeTo` and `stream.pipeThrough`
- Allows setting base URL for all requests

## Usage

```js
import nyreFetch from "nyre-fetch";

// 1. basic get request
nyreFetch
  .get("https://example.com")
  .then((res) => res.json())
  .then((json) => console.log(json));

// 2. download a file using a stream
import fs from "node:fs";

const url = "https://example.com/file.pdf";
const readableStream = await nyreFetch.stream(url);
const writeStream = fs.createWriteStream("./file.pdf");
await readableStream.pipeTo(writeStream);
```
