import test from "ava";
import { createClient } from "../lib/index.js";

const BASE_URL = "https://jsonplaceholder.typicode.com";
const client = createClient(BASE_URL);

test("should make a GET request", async (t) => {
  const response = await client.fetch("/todos");
  t.is(response.ok, true);
});

test("should make a POST request", async (t) => {
  const response = await client.fetch("/todos", {
    method: "POST",
    body: JSON.stringify({
      userId: 1,
      id: 1,
      title: "lorem ipsum",
      completed: false,
    }),
  });

  t.is(response.ok, true);
});

test("should make a PUT request", async (t) => {
  const response = await client.fetch("todos/1", {
    method: "PUT",
    body: JSON.stringify({
      completed: true,
    }),
  });

  t.is(response.ok, true);
});

test("should make a DELETE request", async (t) => {
  const response = await client.fetch("/todos/1", {
    method: "DELETE",
  });
  t.is(response.ok, true);
});

test("should make a HEAD request", async (t) => {
  const response = await client.fetch("/todos/1", {
    method: "HEAD",
  });
  t.is(response.ok, true);
});
