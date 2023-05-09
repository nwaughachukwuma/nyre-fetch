# Nyre-Fetch

Nyre-Fetch is a simple fetch wrapper with a few extra features ⚡️.

## Installation

```bash
npm install nyre-fetch
```

## Features

- Supports everything from node v18 fetch API
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

// 2. download a file using streams
import fs from "node:fs";

const url = "https://example.com/file.pdf";
const readableStream = await nyreFetch.stream(url);
const writeStream = fs.createWriteStream("./file.pdf");
await readableStream.pipeTo(writeStream);

// 3. set base URL for all requests
import { Client } from "nyre-fetch";

const client = new Client("https://example.com");

client
  .get("/api/users")
  .then((res) => res.json())
  .then((json) => console.log(json));
```