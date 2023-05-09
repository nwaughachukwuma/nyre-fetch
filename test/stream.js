import { Writable, Transform } from "node:stream";
import test from "ava";
import { Client } from "../lib/index.js";

const BASE_URL = "https://jsonplaceholder.typicode.com";
const client = new Client(BASE_URL);

test("should stream data from a source", async (t) => {
  const stream = await client.stream("/posts/1");
  let data = [];
  const readableStream = stream.readableStream;
  return new Promise((resolve, reject) => {
    readableStream.on("data", (chunk) => {
      data.push(chunk);
    });
    readableStream.on("end", () => {
      const post = JSON.parse(Buffer.concat(data).toString());
      t.truthy(post.id);
      t.truthy(post.userId);
      t.truthy(post.title);
      t.truthy(post.body);
    });
    readableStream.on("error", () => {
      reject();
    });
    readableStream.on("close", () => {
      resolve();
    });
  });
});

test("should stream data from a source [using async iterators]", async (t) => {
  const stream = await client.stream("/posts/1");
  let data = [];
  for await (const chunk of stream.readableStream) {
    data.push(chunk);
  }
  const post = JSON.parse(Buffer.concat(data).toString());
  t.truthy(post.id);
  t.truthy(post.userId);
  t.truthy(post.title);
  t.truthy(post.body);
});

test("should pipe data from a source to a writable stream", async (t) => {
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
  t.truthy(post.id);
  t.truthy(post.userId);
  t.truthy(post.title);
  t.truthy(post.body);
});

test("should pipe data from a source through a transform stream", async (t) => {
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
  t.truthy(post.id);
  t.truthy(post.userId);
  t.truthy(post.title);
  t.truthy(post.body);
});

test("should throw an error when the source is not a readable stream", async (t) => {
  await t.throwsAsync(client.stream("/posts/not-found"));
});

test("should handle error for the stream", async (t) => {
  const error = await t.throwsAsync(client.stream("/posts/404"));
  t.truthy(error);
  t.is(error.message, "Not Found");
});

test("should handle abort signal for the stream", async (t) => {
  t.plan(2);
  const controller = new AbortController();
  const stream = await client.stream("/posts/1", { signal: controller.signal });

  const promise_ = new Promise((resolve, reject) => {
    stream.readableStream.on("error", (err) => {
      reject(err);
    });
    stream.readableStream.on("end", () => {
      resolve();
    });
    controller.signal.addEventListener("abort", () => {
      reject(new Error("The operation was aborted."));
    });
  });

  controller.abort();
  promise_.catch((err) => {
    t.is(err.message, "The operation was aborted.");
  });

  await t.throwsAsync(promise_);
});