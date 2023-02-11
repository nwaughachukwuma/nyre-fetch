import test from "ava";
import { Writable, Transform } from "node:stream";
import { Client } from "../lib/index.js";

const BASE_URL = "https://jsonplaceholder.typicode.com";
const client = new Client(BASE_URL);

test("should stream data from a source", async (t) => {
  const stream = await client.stream("/posts/1");
  let data = "";
  const readableStream = stream.readableStream;
  return new Promise((resolve, reject) => {
    readableStream.on("data", (chunk) => {
      data += chunk.toString();
    });
    readableStream.on("end", () => {
      const post = JSON.parse(data);
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
  let data = "";
  for await (const chunk of stream.readableStream) {
    data += chunk.toString();
  }
  const post = JSON.parse(data);
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
