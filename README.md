# Nyre-Fetch

Nyre-Fetch is a simple fetch wrapper with a few extra features ⚡️.

## 📦 Installation

```bash
npm install nyre-fetch
```

## 🌟 Features

- Supports everything from Node.js v18 fetch API
- Simplified API for HTTP methods (`get`, `post`, `put`, `delete`, & `head`)
- Supports `stream.pipeTo` and `stream.pipeThrough`
- Allows setting base URL for all requests

## 🛠️ Usage

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
import { createClient } from "nyre-fetch";

const client = createClient("https://example.com");

client
  .get("/api/users")
  .then((res) => res.json())
  .then((json) => console.log(json));
```

## 📚 API

### nyreFetch

An object that exposes HTTP methods (GET, POST, PUT, DELETE, HEAD, and stream) as property references.

### fetch

Same global fetch API from node v18, exposed for convenience.

### Client

A class that allows setting a base URL for all requests.

```js
import { Client } from "nyre-fetch";

const client = new Client("https://example.com");
```

### createClient

A utility function to create a new Client instance.

```ts
const client = createClient("https://example.com");

client
  .get("/api/users")
  .then((res) => res.json())
  .then((json) => console.log(json));
```

### 📡 Stream API

The "Node.js way" is to use streams when possible, piping `response.body` to other streams. It's built on the node:stream module and exposes `pipeTo` and `pipeThrough` methods.

#### 🚰 pipeTo(writableStream: NodeJS.WritableStream, options?: PipelineOptions)

```js
const BASE_URL = "https://jsonplaceholder.typicode.com";
const client = createClient(BASE_URL);

const stream = await client.stream("/posts/1");
const data = [];
const writeStream = new Writable({
  write(chunk, _, done) {
    data.push(chunk);
    done();
  },
});

await stream.pipeTo(writeStream);
const post = JSON.parse(Buffer.concat(data).toString());
assert(post.id, 1); // => true;
```

#### 🔀 pipeThrough(transformStream: Transform, options?: PipelineOptions)

```js
const BASE_URL = "https://jsonplaceholder.typicode.com";
const client = createClient(BASE_URL);

const stream = await client.stream("/posts/1");
const transform = new Transform({
  transform(chunk, _, cb) {
    this.push(chunk);
    cb();
  },
});
const data = [];
transform.on("data", (chunk) => {
  data.push(chunk);
});
await stream.pipeThrough(transform);
const post = JSON.parse(Buffer.concat(data).toString());
assert(post.id, 1); // => true;
```
